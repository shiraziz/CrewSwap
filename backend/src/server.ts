import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { logger } from "./utils/logger";

const server = app.listen(env.port, () => {
  logger.info(`CrewSwap API listening on http://localhost:${env.port}`);
});

const shutdown = async () => {
  logger.info("Shutting down server");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
