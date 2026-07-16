import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { memoryDB } from "../memory-db";

const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000;

function getOnlineCount() {
  const cutoff = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS);
  return memoryDB.visitors.filter(
    (v) => v.isOnline && v.lastSeen > cutoff
  ).length;
}

export const visitorRouter = createRouter({
  register: publicQuery
    .input(z.object({ sessionId: z.string(), userName: z.string().optional() }))
    .mutation(async ({ input }) => {
      const existing = memoryDB.visitors.find(
        (v) => v.sessionId === input.sessionId
      );

      if (existing) {
        existing.lastSeen = new Date();
        existing.isOnline = true;
        if (input.userName) existing.userName = input.userName;
      } else {
        memoryDB.visitors.push({
          id: memoryDB.visitors.length + 1,
          sessionId: input.sessionId,
          userName: input.userName || "Guest",
          lastSeen: new Date(),
          isOnline: true,
          currentRoom: "none",
        });
      }

      // Clean old visitors
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
      memoryDB.visitors = memoryDB.visitors.filter(
        (v) => v.lastSeen > tenMinAgo
      );

      const count = getOnlineCount();
      return { success: true, count };
    }),

  heartbeat: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const v = memoryDB.visitors.find(
        (v) => v.sessionId === input.sessionId
      );
      if (v) {
        v.lastSeen = new Date();
        v.isOnline = true;
      }
      return { success: true, count: getOnlineCount() };
    }),

  onlineCount: publicQuery.query(async () => {
    return getOnlineCount();
  }),

  disconnect: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const v = memoryDB.visitors.find(
        (v) => v.sessionId === input.sessionId
      );
      if (v) v.isOnline = false;
      return { success: true, count: getOnlineCount() };
    }),

  // Join a chat room
  joinRoom: publicQuery
    .input(z.object({ sessionId: z.string(), room: z.enum(["mothers", "fathers", "public"]) }))
    .mutation(async ({ input }) => {
      const v = memoryDB.visitors.find((v) => v.sessionId === input.sessionId);
      if (v) {
        v.currentRoom = input.room;
      }
      return { success: true, count: getOnlineCount() };
    }),

  // Update visitor name
  updateName: publicQuery
    .input(z.object({ sessionId: z.string(), userName: z.string() }))
    .mutation(async ({ input }) => {
      const v = memoryDB.visitors.find((v) => v.sessionId === input.sessionId);
      if (v) {
        v.userName = input.userName;
      }
      return { success: true };
    }),
});
