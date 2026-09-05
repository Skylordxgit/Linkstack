import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SETTINGS } from "../src/controllers/settings.controller";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment before seeding.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Admin" },
  });
  console.log(`Admin account ready: ${admin.email}`);

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as any },
    });
  }
  console.log("Default settings ensured.");

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
