import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      // Added explicit types for better IDE support
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          // Fallback to 'unknown' or empty string if url is missing
          url: (req.url || "").split("?")[0],
        };
      },
      res(res: Response) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", router);

// Recommendation: Add a basic 404 or Error Handler here
// app.use((err, req, res, next) => { ... });

export default app;
