import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  hwid: text("hwid"),
  ipAddress: text("ip_address"),
  isAdmin: boolean("is_admin").default(false),
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  lastLogin: timestamp("last_login"),
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
