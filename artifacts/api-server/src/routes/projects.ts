import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, projectsTable, tasksTable } from "@workspace/db";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  GetProjectResponse,
  UpdateProjectParams,
  UpdateProjectResponse,
  DeleteProjectParams,
  ListProjectsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (req, res): Promise<void> => {
  const queryParams = ListProjectsQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const projects = await db.select().from(projectsTable)
    .where(queryParams.data.status ? eq(projectsTable.status, queryParams.data.status) : undefined)
    .orderBy(projectsTable.createdAt);

  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(tasksTable)
        .where(eq(tasksTable.projectId, project.id));
      const [{ completed }] = await db
        .select({ completed: sql<number>`count(*)::int` })
        .from(tasksTable)
        .where(and(eq(tasksTable.projectId, project.id), eq(tasksTable.status, "done")));
      return { ...project, taskCount: total, completedTaskCount: completed };
    })
  );

  res.json(projectsWithCounts);
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db.insert(projectsTable).values(parsed.data).returning();
  res.status(201).json({ ...project, taskCount: 0, completedTaskCount: 0 });
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(eq(tasksTable.projectId, project.id));
  const [{ completed }] = await db
    .select({ completed: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(and(eq(tasksTable.projectId, project.id), eq(tasksTable.status, "done")));
  res.json(GetProjectResponse.parse({ ...project, taskCount: total, completedTaskCount: completed }));
});

router.put("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db
    .update(projectsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projectsTable.id, params.data.id))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(eq(tasksTable.projectId, project.id));
  const [{ completed }] = await db
    .select({ completed: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(and(eq(tasksTable.projectId, project.id), eq(tasksTable.status, "done")));
  res.json(UpdateProjectResponse.parse({ ...project, taskCount: total, completedTaskCount: completed }));
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, params.data.id))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
