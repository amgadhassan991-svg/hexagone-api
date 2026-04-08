import { Router, type IRouter } from "express";
import healthRouter from "./health";
import membersRouter from "./members";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";
import intelRouter from "./intel";
import campaignsRouter from "./campaigns";
import sellersRouter from "./sellers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(membersRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use(dashboardRouter);
router.use(intelRouter);
router.use(campaignsRouter);
router.use(sellersRouter);

export default router;
