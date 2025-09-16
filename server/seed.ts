// server/seed.ts
import { db } from "./db"; 
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await db.insert(users).values({
    username: "ADMIN",
    email: "admin@example.com",
    password: hashedPassword,
    isAdmin: true,
  });

  console.log("✅ Admin User wurde erfolgreich angelegt!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Fehler beim Seed:", err);
  process.exit(1);
});
