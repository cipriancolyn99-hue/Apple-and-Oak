import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { visitors } from "@db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { broadcast } from "./worker";

// Heartbeat timeout: users inactive for 2 minutes are marked offline
const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000;

export const visitorRouter = createRouter({
  // Register a new visitor (called when page loads)
  register: publicQuery
    .input(z.object({ sessionId: z.string(), userName: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if session already exists
      const existing = await db
        .select()
        .from(visitors)
        .where(eq(visitors.sessionId, input.sessionId));

      if (existing.length > 0) {
        // Update last seen and mark online
        await db
          .update(visitors)
          .set({
            lastSeen: new Date(),
            isOnline: true,
            userName: input.userName || existing[0].userName,
          })
          .where(eq(visitors.sessionId, input.sessionId));
      } else {
        // Create new visitor
        await db.insert(visitors).values({
          sessionId: input.sessionId,
          userName: input.userName || "Guest",
          lastSeen: new Date(),
          isOnline: true,
          currentRoom: "none",
        });
      }

      // Clean up old visitors (inactive for 10 minutes)
      await db
        .delete(visitors)
        .where(gte(visitors.lastSeen, new Date(Date.now() - 10 * 60 * 1000)));

      // Get real online count
      const onlineCount = await getOnlineCount(db);

      // Broadcast update
      broadcast({ type: "visitorsUpdated", count: onlineCount });

      return { success: true, count: onlineCount };
    }),

  // Heartbeat - keep visitor alive (called every 30 seconds)
  heartbeat: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(visitors)
        .set({ lastSeen: new Date() })
        .where(eq(visitors.sessionId, input.sessionId));

      const onlineCount = await getOnlineCount(db);
      return { success: true, count: onlineCount };
    }),

  // Get current online visitor count
  onlineCount: publicQuery.query(async () => {
    const db = getDb();
    return getOnlineCount(db);
  }),

  // Update visitor name (when they join chat)
  updateName: publicQuery
    .input(z.object({ sessionId: z.string(), userName: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(visitors)
        .set({ userName: input.userName })
        .where(eq(visitors.sessionId, input.sessionId));
      return { success: true };
    }),

  // Mark visitor as in a room
  joinRoom: publicQuery
    .input(z.object({ sessionId: z.string(), room: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(visitors)
        .set({ currentRoom: input.room, lastSeen: new Date() })
        .where(eq(visitors.sessionId, input.sessionId));
      return { success: true };
    }),

  // Visitor disconnects (page unload)
  disconnect: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(visitors)
        .set({ isOnline: false })
        .where(eq(visitors.sessionId, input.sessionId));

      const onlineCount = await getOnlineCount(db);
      broadcast({ type: "visitorsUpdated", count: onlineCount });
      return { success: true };
    }),
});

// Helper: count online visitors
async function getOnlineCount(db: ReturnType<typeof getDb>) {
  const cutoff = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS);
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(visitors)
    .where(
      and(
        eq(visitors.isOnline, true),
        gte(visitors.lastSeen, cutoff)
      )
    );
  return result[0]?.count || 0;
}
