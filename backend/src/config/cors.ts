import type { CorsOptions } from "cors";
import { env } from "./env";

export const corsOptions: CorsOptions = {
  origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((origin) => origin.trim()),
  credentials: true,
};
