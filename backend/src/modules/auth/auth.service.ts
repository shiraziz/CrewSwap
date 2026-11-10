import { prisma } from "../../config/database";
import { comparePassword, hashPassword } from "../../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { conflict, forbidden, unauthorized } from "../../utils/errors";
import { auditService } from "../common/audit.service";

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rank?: Rank;
};

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw conflict("Email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: "CREW",
        status: "ACTIVE",
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            rank: input.rank,
          },
        },
      },
      include: { profile: true },
    });

    const authUser = { id: user.id, email: user.email, role: user.role, status: user.status };
    await auditService.log("REGISTER", "User", { actorId: user.id, entityId: user.id });

    return {
      user: authUser,
      profile: user.profile,
      accessToken: signAccessToken(authUser),
      refreshToken: signRefreshToken(authUser),
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user) {
      throw unauthorized("Invalid email or password");
    }
    if (user.status !== "ACTIVE") {
      throw forbidden("Account is disabled or blocked");
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw unauthorized("Invalid email or password");
    }

    const authUser = { id: user.id, email: user.email, role: user.role, status: user.status };
    await auditService.log("LOGIN", "User", { actorId: user.id, entityId: user.id });
    return {
      user: authUser,
      profile: user.profile,
      accessToken: signAccessToken(authUser),
      refreshToken: signRefreshToken(authUser),
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { profile: true, qualifications: true },
    });
    return {
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
      profile: user.profile,
      qualifications: user.qualifications,
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw unauthorized("Invalid session");
    }
    if (user.status !== "ACTIVE") {
      throw forbidden("Account is disabled or blocked");
    }
    const authUser = { id: user.id, email: user.email, role: user.role, status: user.status };
    return {
      accessToken: signAccessToken(authUser),
      refreshToken: signRefreshToken(authUser),
      user: authUser,
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await comparePassword(currentPassword, user.passwordHash))) {
      throw unauthorized("Current password is incorrect");
    }

    await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
    await auditService.log("CHANGE_PASSWORD", "User", { actorId: userId, entityId: userId });
    return { changed: true };
  },
};
import type { Rank } from "@prisma/client";
