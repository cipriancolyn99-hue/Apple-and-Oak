import { z } from "zod";
import { createRouter, publicQuery, staffQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { siteContent, announcements, files } from "@db/schema";
import { eq } from "drizzle-orm";

export const contentRouter = createRouter({
  // Get all site content — public (everyone can read the pages)
  getAll: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(siteContent);
  }),

  // Update site content — STAFF ONLY
  update: staffQuery
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .insert(siteContent)
        .values({ key: input.key, value: input.value })
        .onDuplicateKeyUpdate({ set: { value: input.value } });
      return { success: true };
    }),

  // List announcements — public (everyone can read)
  listAnnouncements: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(announcements);
  }),

  // Add announcement — STAFF ONLY
  addAnnouncement: staffQuery
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        date: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(announcements).values({
        title: input.title,
        content: input.content,
        date: input.date,
        active: true,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Toggle announcement — STAFF ONLY
  toggleAnnouncement: staffQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const found = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, input.id));
      if (found.length > 0) {
        await db
          .update(announcements)
          .set({ active: !found[0].active })
          .where(eq(announcements.id, input.id));
      }
      return { success: true };
    }),

  // Remove announcement — STAFF ONLY
  removeAnnouncement: staffQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),

  // List files — STAFF ONLY (confidential documents)
  listFiles: staffQuery.query(async () => {
    const db = getDb();
    return db.select().from(files);
  }),

  // Add file — STAFF ONLY
  addFile: staffQuery
    .input(
      z.object({
        name: z.string(),
        size: z.string(),
        type: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(files).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Remove file — STAFF ONLY
  removeFile: staffQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(files).where(eq(files.id, input.id));
      return { success: true };
    }),
});
