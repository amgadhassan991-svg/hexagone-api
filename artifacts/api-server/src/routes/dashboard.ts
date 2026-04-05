import { Router, type IRouter } from "express";
import { eq, lt, and, sql } from "drizzle-orm";
import { db, projectsTable, tasksTable, membersTable, activityTable } from "@workspace/db";
import { GetRecentActivityQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [{ totalProjects }] = await db
    .select({ totalProjects: sql<number>`count(*)::int` })
    .from(projectsTable);

  const [{ activeProjects }] = await db
    .select({ activeProjects: sql<number>`count(*)::int` })
    .from(projectsTable)
    .where(eq(projectsTable.status, "active"));

  const [{ completedProjects }] = await db
    .select({ completedProjects: sql<number>`count(*)::int` })
    .from(projectsTable)
    .where(eq(projectsTable.status, "completed"));

  const [{ totalTasks }] = await db
    .select({ totalTasks: sql<number>`count(*)::int` })
    .from(tasksTable);

  const [{ completedTasks }] = await db
    .select({ completedTasks: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(eq(tasksTable.status, "done"));

  const [{ inProgressTasks }] = await db
    .select({ inProgressTasks: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(eq(tasksTable.status, "in_progress"));

  const today = new Date().toISOString().split("T")[0];
  const [{ overdueTasks }] = await db
    .select({ overdueTasks: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(
      and(
        lt(tasksTable.dueDate, today),
        sql`${tasksTable.status} != 'done'`
      )
    );

  const [{ totalMembers }] = await db
    .select({ totalMembers: sql<number>`count(*)::int` })
    .from(membersTable);

  const statusCounts = await db
    .select({ status: tasksTable.status, count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .groupBy(tasksTable.status);

  const tasksByStatus = { todo: 0, in_progress: 0, in_review: 0, done: 0 };
  for (const row of statusCounts) {
    const s = row.status as keyof typeof tasksByStatus;
    if (s in tasksByStatus) tasksByStatus[s] = row.count;
  }

  const priorityCounts = await db
    .select({ priority: tasksTable.priority, count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .groupBy(tasksTable.priority);

  const tasksByPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
  for (const row of priorityCounts) {
    const p = row.priority as keyof typeof tasksByPriority;
    if (p in tasksByPriority) tasksByPriority[p] = row.count;
  }

  res.json({
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    totalMembers,
    tasksByStatus,
    tasksByPriority,
  });
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const queryParams = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = queryParams.success ? (queryParams.data.limit ?? 20) : 20;

  const activity = await db
    .select()
    .from(activityTable)
    .orderBy(sql`${activityTable.createdAt} desc`)
    .limit(limit);

  res.json(activity);
});

router.get("/dashboard/overdue-tasks", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        lt(tasksTable.dueDate, today),
        sql`${tasksTable.status} != 'done'`
      )
    )
    .orderBy(tasksTable.dueDate);

  const enriched = await Promise.all(
    tasks.map(async (task) => {
      let projectName: string | null = null;
      let assigneeName: string | null = null;
      let assigneeAvatar: string | null = null;

      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, task.projectId));
      if (project) projectName = project.name;

      if (task.assigneeId) {
        const [assignee] = await db.select().from(membersTable).where(eq(membersTable.id, task.assigneeId));
        if (assignee) {
          assigneeName = assignee.name;
          assigneeAvatar = assignee.avatarUrl ?? null;
        }
      }
      return { ...task, projectName, assigneeName, assigneeAvatar };
    })
  );

  res.json(enriched);
});

router.get("/dashboard/project-progress", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.name);

  const progress = await Promise.all(
    projects.map(async (project) => {
      const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.projectId, project.id));
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter((t) => t.status === "done").length;
      const inProgressTasks = allTasks.filter((t) => t.status === "in_progress").length;
      const todoTasks = allTasks.filter((t) => t.status === "todo").length;
      const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      return {
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color ?? null,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionPercentage,
      };
    })
  );

  res.json(progress);
});

export default router;
