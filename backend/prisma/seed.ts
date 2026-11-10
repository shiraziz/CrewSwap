import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/hash";

const prisma = new PrismaClient();

async function main() {
  await prisma.accommodation.createMany({
    data: [
      { name: "Etihad Plaza", location: "Abu Dhabi" },
      { name: "Al Raha", location: "Abu Dhabi" },
      { name: "Yas Island", location: "Abu Dhabi" },
    ],
    skipDuplicates: true,
  });

  const passwordHash = await hashPassword("Admin123!");
  await prisma.user.upsert({
    where: { email: "admin@crewswap.local" },
    update: {},
    create: {
      email: "admin@crewswap.local",
      passwordHash,
      role: Role.ADMIN,
      profile: { create: { firstName: "CrewSwap", lastName: "Admin" } },
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
