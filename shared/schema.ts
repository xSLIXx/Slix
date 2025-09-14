import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const accessKeys = pgTable("access_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyValue: text("key_value").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  usedAt: timestamp("used_at"),
  prefix: text("prefix"),
  notes: text("notes"),
});

export const loginAttempts = pgTable("login_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  ipAddress: text("ip_address").notNull(),
  success: boolean("success").default(false),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const userRelations = relations(users, ({ many }) => ({
  accessKeys: many(accessKeys),
}));

export const accessKeyRelations = relations(accessKeys, ({ one }) => ({
  user: one(users, {
    fields: [accessKeys.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  isAdmin: true,
  isBlocked: true,
});

export const insertAccessKeySchema = createInsertSchema(accessKeys).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const desktopAuthSchema = z.object({
  username: z.string(),
  password: z.string(),
  key: z.string(),
  hwid: z.string(),
});

export const keyGenerationSchema = z.object({
  quantity: z.number().min(1).max(100),
  expirationDays: z.number().min(0),
  prefix: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAccessKey = z.infer<typeof insertAccessKeySchema>;
export type AccessKey = typeof accessKeys.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
