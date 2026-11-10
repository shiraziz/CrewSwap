import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
};
