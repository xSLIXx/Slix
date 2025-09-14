import { users, accessKeys, loginAttempts, type User, type InsertUser, type AccessKey, type InsertAccessKey } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, isNull, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLogin(userId: string, ipAddress: string): Promise<void>;
  updateUserProfile(userId: string, data: Partial<User>): Promise<User>;
  blockUser(userId: string, blocked: boolean): Promise<void>;
  
  // Access Keys
  createAccessKey(key: InsertAccessKey): Promise<AccessKey>;
  getAccessKeysByUserId(userId: string): Promise<AccessKey[]>;
  getAccessKeyByValue(keyValue: string): Promise<AccessKey | undefined>;
  updateAccessKey(keyId: string, data: Partial<AccessKey>): Promise<void>;
  deleteAccessKey(keyId: string): Promise<void>;
  
  // Admin functions
  getAllUsers(limit?: number, offset?: number): Promise<{ users: User[], total: number }>;
  getRecentAccessKeys(limit?: number): Promise<AccessKey[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalKeys: number;
  }>;
  
  // Desktop app authentication
  validateDesktopAuth(username: string, password: string, key: string, hwid: string): Promise<{ success: boolean; user?: User; message?: string }>;
  logLoginAttempt(username: string, ipAddress: string, success: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLogin(userId: string, ipAddress: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        lastLogin: new Date(),
        ipAddress 
      })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async blockUser(userId: string, blocked: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isBlocked: blocked })
      .where(eq(users.id, userId));
  }

  async createAccessKey(key: InsertAccessKey): Promise<AccessKey> {
    const [accessKey] = await db
      .insert(accessKeys)
      .values(key)
      .returning();
    return accessKey;
  }

  async getAccessKeysByUserId(userId: string): Promise<AccessKey[]> {
    return await db
      .select()
      .from(accessKeys)
      .where(eq(accessKeys.userId, userId))
      .orderBy(desc(accessKeys.createdAt));
  }

  async getAccessKeyByValue(keyValue: string): Promise<AccessKey | undefined> {
    const [key] = await db
      .select()
      .from(accessKeys)
      .where(eq(accessKeys.keyValue, keyValue));
    return key || undefined;
  }

  async updateAccessKey(keyId: string, data: Partial<AccessKey>): Promise<void> {
    await db
      .update(accessKeys)
      .set(data)
      .where(eq(accessKeys.id, keyId));
  }

  async deleteAccessKey(keyId: string): Promise<void> {
    await db.delete(accessKeys).where(eq(accessKeys.id, keyId));
  }

  async getAllUsers(limit = 50, offset = 0): Promise<{ users: User[], total: number }> {
    const usersList = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users);

    return { users: usersList, total: count };
  }

  async getRecentAccessKeys(limit = 20): Promise<AccessKey[]> {
    return await db
      .select()
      .from(accessKeys)
      .limit(limit)
      .orderBy(desc(accessKeys.createdAt));
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalKeys: number;
  }> {
    const [totalUsersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users);

    const [activeUsersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users)
      .where(eq(users.isBlocked, false));

    const [blockedUsersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users)
      .where(eq(users.isBlocked, true));

    const [totalKeysResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(accessKeys);

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      blockedUsers: blockedUsersResult.count,
      totalKeys: totalKeysResult.count,
    };
  }

  async validateDesktopAuth(username: string, password: string, key: string, hwid: string): Promise<{ success: boolean; user?: User; message?: string }> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    if (user.isBlocked) {
      return { success: false, message: "Account is blocked" };
    }

    // Validate access key
    const accessKey = await this.getAccessKeyByValue(key);
    if (!accessKey || !accessKey.isActive) {
      return { success: false, message: "Invalid or inactive key" };
    }

    if (accessKey.userId !== user.id) {
      return { success: false, message: "Key not associated with this user" };
    }

    if (accessKey.expiresAt && accessKey.expiresAt < new Date()) {
      return { success: false, message: "Key has expired" };
    }

    // Check HWID if it exists
    if (user.hwid && user.hwid !== hwid) {
      return { success: false, message: "Hardware ID mismatch" };
    }

    // Update HWID if not set
    if (!user.hwid) {
      await this.updateUserProfile(user.id, { hwid });
    }

    // Update key usage
    await this.updateAccessKey(accessKey.id, { usedAt: new Date() });

    return { success: true, user };
  }

  async logLoginAttempt(username: string, ipAddress: string, success: boolean): Promise<void> {
    await db
      .insert(loginAttempts)
      .values({
        username,
        ipAddress,
        success,
      });
  }
}

export const storage = new DatabaseStorage();
