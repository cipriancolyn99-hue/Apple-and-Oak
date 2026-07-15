import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { chatMessages } from "@db/schema";
import { desc } from "drizzle-orm";

export const chatRouter = createRouter({
  // Get messages for a room
  list: publicQuery
    .input(z.object({ room: z.enum(["mothers", "fathers", "public"]) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(chatMessages)
        .where(
          input.room === "public"
            ? undefined
            : undefined // We'll filter in memory for now
        )
        .orderBy(desc(chatMessages.createdAt))
        .limit(50);
    }),

  // Send a message
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
      const db = getDb();
      const result = await db.insert(chatMessages).values({
        userName: input.userName,
        avatar: input.avatar,
        content: input.content,
        room: input.room,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),
});
