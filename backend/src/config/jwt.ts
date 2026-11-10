import { env } from "./env";

export const jwtConfig = {
  accessSecret: env.jwtAccessSecret,
  refreshSecret: env.jwtRefreshSecret,
  accessExpiresIn: env.jwtAccessExpiresIn,
  refreshExpiresIn: env.jwtRefreshExpiresIn,
};
