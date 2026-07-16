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

  // Subscribe (dummy - returns current data)
  subscribe: publicQuery.query(async () => {
    return { workers: memoryDB.workers, timestamp: Date.now() };
  }),
});
