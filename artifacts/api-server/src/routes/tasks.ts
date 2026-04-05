import { Router, type IRouter } from "express";
import { eq, and, lt } from "drizzle-orm";
import { db, tasksTable, projectsTable, membersTable, activityTable } from "@workspace/db";
import {
  CreateTaskBody,
  UpdateTaskBody,
  GetTaskParams,
  GetTaskResponse,
  UpdateTaskParams,
  UpdateTaskResponse,
  DeleteTaskParams,
  ListTasksQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichTask(task: typeof tasksTable.$inferSelect) {
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
}

router.get("/tasks", async (req, res): Promise<void> => {
  const queryParams = ListTasksQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const conditions = [];
  if (queryParams.data.projectId) conditions.push(eq(tasksTable.projectId, queryParams.data.projectId));
  if (queryParams.data.assigneeId) conditions.push(eq(tasksTable.assigneeId, queryParams.data.assigneeId));
  if (queryParams.data.status) conditions.push(eq(tasksTable.status, queryParams.data.status));
  if (queryParams.data.priority) conditions.push(eq(tasksTable.priority, queryParams.data.priority));

  const tasks = await db
    .select()
    .from(tasksTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(tasksTable.createdAt);

  const enriched = await Promise.all(tasks.map(enrichTask));
  res.json(enriched);
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db.insert(tasksTable).values(parsed.data).returning();

  await db.insert(activityTable).values({
    type: "task_created",
    description: `Task "${task.title}" was created`,
    entityId: task.id,
    entityType: "task",
  });

  const enriched = await enrichTask(task);
  res.status(201).json(enriched);
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const enriched = await enrichTask(task);
  res.json(GetTaskResponse.parse(enriched));
});

router.put("/tasks/:id", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [oldTask] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));

  const [task] = await db
    .update(tasksTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(tasksTable.id, params.data.id))
    .returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  if (oldTask && oldTask.status !== task.status) {
    const type = task.status === "done" ? "task_completed" : "task_updated";
    await db.insert(activityTable).values({
      type,
      description: task.status === "done"
        ? `Task "${task.title}" was completed`
        : `Task "${task.title}" moved to ${task.status.replace("_", " ")}`,
      entityId: task.id,
      entityType: "task",
    });
  }

  const enriched = await enrichTask(task);
  res.json(UpdateTaskResponse.parse(enriched));
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [task] = await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, params.data.id))
    .returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
