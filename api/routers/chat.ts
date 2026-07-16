import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { memoryDB } from "../memory-db";

export const chatRouter = createRouter({
  list: publicQuery
    .input(z.object({ room: z.enum(["mothers", "fathers", "public"]) }))
    .query(async ({ input }) => {
      return memoryDB.chatMessages
        .filter((m) => m.room === input.room)
        .slice(-50);
    }),

  send: publicQuery
    .input(
      z.object({
        userName: z.string(),
        avatar: z.string(),
        content: z.string(),
        room: z.enum(["mothers", "fathers", "public"]),
      })
    )
    .mutation(async ({ input }) => {
      const msg = {
        id: memoryDB.chatMessages.length + 1,
        userName: input.userName,
        avatar: input.avatar,
        content: input.content,
        room: input.room,
        createdAt: new Date(),
      };
      memoryDB.chatMessages.push(msg);
      return { success: true, message: msg };
    }),
});
