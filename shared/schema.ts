import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sqlgen_random_uuid()),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  hwid: text("hwid"),
  ipAddress: text("ip_address"),
  isAdmin: boolean("is_admin").default(false),
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").default(sqlnow()),
  lastLogin: timestamp("last_login"),
});

// Access Keys Table
export const accessKeys = pgTable("access_keys", {
  id: varchar("id").primaryKey().default(sqlgen_random_uuid()),
  keyValue: text("key_value").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").default(sqlnow()),
  usedAt: timestamp("used_at"),
  prefix: text("prefix"),
  notes: text("notes"),
});

// Login Attempts Table
export const loginAttempts = pgTable("login_attempts", {
  id: varchar("id").primaryKey().default(sqlgen_random_uuid()),
  username: text("username"),
  ipAddress: text("ip_address").notNull(),
  success: boolean("success").default(false),
  timestamp: timestamp("timestamp").default(sqlnow()),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  accessKeys: many(accessKeys),
}));

export const accessKeyRelations = relations(accessKeys, ({ one }) => ({
  user: one(users, {
    fields: [accessKeys.userId],
    references: [users.id],
  }),
}));

// Insert Schemas
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

// Validation Schemas
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAccessKey = z.infer<typeof insertAccessKeySchema>;
export type AccessKey = typeof accessKeys.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
