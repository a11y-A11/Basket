import "dotenv/config";
import { prisma } from "./config/prisma.js";
import bcrypt from "bcrypt";

async function testPrismaCreate() {
  try {
    console.log("Testing Prisma user.create()...");

    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = await prisma.user.create({
      data: {
        name: "Prisma Test",
        email: "prismatest9000@gmail.com",
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log("PRISMA CREATE SUCCESS:", user);

    await prisma.$disconnect();
  } catch (error) {
    console.error("PRISMA CREATE ERROR:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testPrismaCreate();