import type { Role, UserStatus } from "@prisma/client";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export type ValidatedRequestData = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      validated?: ValidatedRequestData;
    }
  }
}
