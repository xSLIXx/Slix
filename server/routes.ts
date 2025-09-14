import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { randomBytes } from "crypto";
import { keyGenerationSchema, desktopAuthSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Desktop app authentication endpoint
  app.post("/api/desktop-auth", async (req, res) => {
    try {
      const { username, password, key, hwid } = desktopAuthSchema.parse(req.body);
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      
      const result = await storage.validateDesktopAuth(username, password, key, hwid);
      await storage.logLoginAttempt(username, ipAddress, result.success);
      
      if (result.success) {
        res.json({ success: true, message: "Authentication successful" });
      } else {
        res.status(401).json({ success: false, message: result.message });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: "Invalid request" });
    }
  });

  // User profile routes
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = await storage.getUser(req.user.id);
    if (!user) return res.sendStatus(404);
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      hwid: user.hwid,
      ipAddress: user.ipAddress,
      lastLogin: user.lastLogin,
    });
  });

  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { username, email } = req.body;
      const updatedUser = await storage.updateUserProfile(req.user.id, {
        username,
        email,
      });
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Access keys routes
  app.get("/api/keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const keys = await storage.getAccessKeysByUserId(req.user.id);
    res.json(keys);
  });

  app.delete("/api/keys/:keyId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      await storage.deleteAccessKey(req.params.keyId);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete key" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(403);
    
    const stats = await storage.getUserStats();
    res.json(stats);
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(403);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    
    const result = await storage.getAllUsers(limit, offset);
    res.json(result);
  });

  app.post("/api/admin/users/:userId/block", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(403);
    
    try {
      const { blocked } = req.body;
      await storage.blockUser(req.params.userId, blocked);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  app.post("/api/admin/generate-keys", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(403);
    
    try {
      const { quantity, expirationDays, prefix, notes } = keyGenerationSchema.parse(req.body);
      
      const keys = [];
      for (let i = 0; i < quantity; i++) {
        const keyValue = `${prefix ? prefix + '-' : 'PUI-'}${randomBytes(8).toString('hex').toUpperCase()}-${randomBytes(8).toString('hex').toUpperCase()}`;
        const expiresAt = expirationDays > 0 ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000) : null;
        
        const key = await storage.createAccessKey({
          keyValue,
          expiresAt,
          prefix,
          notes,
          isActive: true,
        });
        
        keys.push(key);
      }
      
      res.json(keys);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate keys" });
    }
  });

  app.get("/api/admin/recent-keys", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(403);
    
    const keys = await storage.getRecentAccessKeys();
    res.json(keys);
  });

  app.delete("/api/admin/keys/:keyId", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(403);
    
    try {
      await storage.deleteAccessKey(req.params.keyId);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete key" });
    }
  });

  // Check if admin credentials match
  app.post("/api/check-admin", async (req, res) => {
    const { username, password } = req.body;
    if (username === "ADMIN" && password === "1a2b3d4C.00") {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
