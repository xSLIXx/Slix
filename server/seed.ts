import { db } from "./db";
import { users, accessKeys, loginAttempts } from "./schema";

async function main() {
  // -------- Users einfügen --------
  await db.insert(users).values({
    id: "bb216b03-1153-4ce5-b974-adb56c6bcd3a",
    username: "ADMIN",
    email: "admin@primeui.com",
    password: "ebeb52353990c09c1e7af75813df276aa5939e20cb038ddaa4dbb1afdeb19a91dd814defdf0eecd985bced253b15910551ed02603aa42ce91305e1b830e09e8d.c5d0619d54efd760c9182371a6f92b16",
    hwid: null,
    ipAddress: "10.82.3.250",
    isAdmin: true,
    isBlocked: false,
    createdAt: new Date(),
    lastLogin: new Date(),
  });

  // -------- Access Keys einfügen --------
  await db.insert(accessKeys).values({
    id: "11111111-1111-1111-1111-111111111111",
    keyValue: "key123",
    userId: "bb216b03-1153-4ce5-b974-adb56c6bcd3a",
    isActive: true,
    createdAt: new Date(),
    prefix: "ADM",
    notes: "Admin key",
  });

  // -------- Login Attempts einfügen --------
  await db.insert(loginAttempts).values({
    id: "22222222-2222-2222-2222-222222222222",
    username: "ADMIN",
    ipAddress: "10.82.3.250",
    success: true,
    timestamp: new Date(),
  });

  console.log("Seed abgeschlossen!");
}

main().catch(console.error).finally(() => process.exit());
