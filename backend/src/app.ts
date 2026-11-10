import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { corsOptions } from "./config/cors";
import { apiRoutes } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";

export const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, _res, next) => {
  req.url = req.url.replace(/\/{2,}/g, "/");
  next();
});

app.use("/api", apiRoutes);
app.use(apiRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
