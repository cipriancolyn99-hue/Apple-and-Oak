import { z } from "zod";
import { createRouter, publicQuery, staffQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { workers, sessions } from "@db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword, verifyPassword, createSession, deleteSession } from "../lib/security";

// In-memory connected clients for WebSocket broadcasting
const connectedClients = new Set<ReadableStreamDefaultController>();

export function broadcast(data: unknown) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  connectedClients.forEach((client) => {
    try {
      client.enqueue(new TextEncoder().encode(message));
    } catch {
      connectedClients.delete(client);
    }
  });
}

export const workerRouter = createRouter({
  // List all workers
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(workers);
  }),

  // Login worker — verifies hashed password, issues session token
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const found = await db
        .select()
        .from(workers)
        .where(eq(workers.email, input.email.toLowerCase()));

      if (found.length === 0) {
        return { success: false, error: "Invalid credentials" };
      }

      const passwordOk = await verifyPassword(input.password, found[0].password);
      if (!passwordOk) {
        return { success: false, error: "Invalid credentials" };
      }

      // Mark as online
      await db
        .update(workers)
        .set({ isOnline: true })
        .where(eq(workers.id, found[0].id));

      // Create secure session token
      const token = await createSession("staff", found[0].id, found[0].name, found[0].email);

      // Broadcast to all clients
      broadcast({
        type: "workerOnline",
        worker: { ...found[0], isOnline: true },
      });

      return {
        success: true,
        token,
        worker: {
          id: found[0].id,
          name: found[0].name,
          email: found[0].email,
          role: found[0].role,
          avatar: found[0].avatar,
        },
      };
    }),

  // Logout worker — destroys session, marks offline
  logout: publicQuery
    .input(z.object({ email: z.string().email(), token: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const found = await db
        .select()
        .from(workers)
        .where(eq(workers.email, input.email.toLowerCase()));

      if (found.length > 0) {
        await db
          .update(workers)
          .set({ isOnline: false, isLive: false })
          .where(eq(workers.id, found[0].id));

        broadcast({
          type: "workerOffline",
          workerId: found[0].id,
        });
      }

      if (input.token) {
        await deleteSession(input.token);
      }

      return { success: true };
    }),

  // Toggle live status
  toggleLive: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const found = await db
        .select()
        .from(workers)
        .where(eq(workers.id, input.id));

      if (found.length === 0) return { success: false };

      const newLive = !found[0].isLive;
      await db
        .update(workers)
        .set({ isLive: newLive })
        .where(eq(workers.id, input.id));

      broadcast({
        type: "workerLiveToggle",
        workerId: input.id,
        isLive: newLive,
      });

      return { success: true, isLive: newLive };
    }),

  // Update own profile (title, bio, specialties) — STAFF ONLY
  updateProfile: staffQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        bio: z.string().optional(),
        specialties: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: Record<string, string> = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.bio !== undefined) updates.bio = input.bio;
      if (input.specialties !== undefined) updates.specialties = input.specialties;
      await db.update(workers).set(updates).where(eq(workers.id, input.id));
      broadcast({ type: "workerProfileUpdated", workerId: input.id });
      return { success: true };
    }),

  // Add worker — STAFF ONLY, password hashed before storage
  add: staffQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(1),
        role: z.string().default("Staff"),
        avatar: z.string().default("?"),
        specialties: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const hashed = await hashPassword(input.password);
      const result = await db.insert(workers).values({
        name: input.name,
        email: input.email.toLowerCase(),
        password: hashed,
        role: input.role,
        avatar: input.avatar || input.name.charAt(0).toUpperCase(),
        specialties: input.specialties || "",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Remove worker — STAFF ONLY
  remove: staffQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(workers).where(eq(workers.id, input.id));
      return { success: true };
    }),

  // Check which staff workers have ACTIVE login sessions (real online status)
  checkSessions: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();

    // Find all non-expired staff sessions
    const activeSessions = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.role, "staff"), gt(sessions.expiresAt, now)));

    // Get unique staff emails from active sessions
    const onlineEmails = new Set(activeSessions.map((s) => s.email.toLowerCase()));

    return { onlineEmails: Array.from(onlineEmails) };
  }),

  // SSE endpoint for real-time updates
  subscribe: publicQuery.query(async () => {
    const stream = new ReadableStream({
      start(controller) {
        connectedClients.add(controller);
        // Send initial keepalive
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
        );
      },
      cancel(controller) {
        connectedClients.delete(controller);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }),
});
