import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthUser } from "../types";
import { jwtConfig } from "../config/jwt";

export const signAccessToken = (user: AuthUser) =>
  jwt.sign(user, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiresIn } as SignOptions);

export const signRefreshToken = (user: AuthUser) =>
  jwt.sign(user, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions);

export const verifyAccessToken = (token: string) => jwt.verify(token, jwtConfig.accessSecret) as AuthUser;

export const verifyRefreshToken = (token: string) => jwt.verify(token, jwtConfig.refreshSecret) as AuthUser;
