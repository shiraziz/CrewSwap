import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "../../config/database";

export const auditService = {
  log: (
    action: string,
    entity: string,
    options: { actorId?: string; entityId?: string; metadata?: Prisma.InputJsonValue; tx?: PrismaClient | Prisma.TransactionClient } = {},
  ) => {
    const client = options.tx ?? prisma;
    return client.auditLog.create({
      data: {
        action,
        entity,
        actorId: options.actorId,
        entityId: options.entityId,
        metadata: options.metadata ?? Prisma.JsonNull,
      },
    });
  },
};
