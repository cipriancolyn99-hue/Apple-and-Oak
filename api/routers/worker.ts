import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { memoryDB } from "../memory-db";
import { verifyPassword, createSession, deleteSession } from "../lib/security";

// Dummy broadcast function for compatibility
export function broadcast(_data: any) {}

export const workerRouter = createRouter({
  // Worker/staff login
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const worker = memoryDB.workers.find((w) => w.email.toLowerCase() === input.email.toLowerCase());
      if (!worker) return { success: false, error: "Invalid credentials" };

      const valid = await verifyPassword(input.password, worker.password);
      if (!valid) return { success: false, error: "Invalid credentials" };

      const token = await createSession("staff", worker.id, worker.name, worker.email);
      return {
        success: true,
        token,
        worker: { id: worker.id, name: worker.name, email: worker.email, role: worker.role },
      };
    }),

  // List workers
  list: publicQuery.query(async () => {
    return memoryDB.workers.map((w) => ({
      id: w.id,
      name: w.name,
      email: w.email,
      role: w.role,
      avatar: w.avatar,
      title: w.title,
      isOnline: w.isOnline,
    }));
  }),

  // Check active sessions (real online status)
  checkSessions: publicQuery.query(async () => {
    const now = new Date();
    const activeEmails = memoryDB.sessions
      .filter((s) => s.expiresAt > now)
      .map((s) => s.email.toLowerCase());
    return { onlineEmails: [...new Set(activeEmails)] };
  }),

  // Logout
  logout: publicQuery
    .input(z.object({ email: z.string(), token: z.string().optional() }))
    .mutation(async ({ input }) => {
      if (input.token) await deleteSession(input.token);
      return { success: true };
    }),

  // Toggle live status
  toggleLive: publicQuery
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      const worker = memoryDB.workers.find((w) => w.email.toLowerCase() === input.email.toLowerCase());
      if (worker) {
        worker.isOnline = !worker.isOnline;
      }
      return { success: true, isOnline: worker?.isOnline ?? false };
    }),

  // Update profile
  updateProfile: publicQuery
    .input(z.object({ email: z.string(), title: z.string().optional(), bio: z.string().optional(), specialties: z.array(z.string()).optional() }))
    .mutation(async ({ input }) => {
      const worker = memoryDB.workers.find((w) => w.email.toLowerCase() === input.email.toLowerCase());
      if (worker) {
        if (input.title) worker.title = input.title;
        if (input.bio) worker.bio = input.bio;
        if (input.specialties) worker.specialties = input.specialties;
      }
      return { success: true };
    }),

  // Add worker
  add: publicQuery
    .input(z.object({ name: z.string(), email: z.string(), password: z.string(), role: z.string(), avatar: z.string() }))
    .mutation(async ({ input }) => {
      const hashed = input.password.startsWith("plain:") ? input.password : "plain:" + input.password;
      const worker = {
        id: memoryDB.workers.length + 1,
        name: input.name,
        email: input.email,
        password: hashed,
        role: input.role,
        avatar: input.avatar,
        isOnline: false,
        title: input.role,
        bio: "",
        specialties: [],
      };
      memoryDB.workers.push(worker);
      return { success: true, worker: { id: worker.id, name: worker.name, email: worker.email, role: worker.role } };
    }),

  // Remove worker
  remove: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      memoryDB.workers = memoryDB.workers.filter((w) => w.id !== input.id);
      return { success: true };
    }),

  // Subscribe (dummy - returns current data)
  subscribe: publicQuery.query(async () => {
    return { workers: memoryDB.workers, timestamp: Date.now() };
  }),
});
