import { z } from "zod";
import { createRouter, publicQuery, staffQuery } from "../middleware";
import { memoryDB } from "../memory-db";

export const contentRouter = createRouter({
  getAll: publicQuery.query(async () => {
    return memoryDB.siteContent;
  }),

  update: staffQuery
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const existing = memoryDB.siteContent.find((c) => c.key === input.key);
      if (existing) {
        existing.value = input.value;
      } else {
        memoryDB.siteContent.push({
          id: memoryDB.siteContent.length + 1,
          key: input.key,
          value: input.value,
          updatedAt: new Date(),
        });
      }
      return { success: true };
    }),

  listAnnouncements: publicQuery.query(async () => {
    return memoryDB.announcements;
  }),

  addAnnouncement: staffQuery
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      const ann = {
        id: memoryDB.announcements.length + 1,
        title: input.title,
        content: input.content,
        date: new Date().toLocaleDateString(),
        active: true,
        createdAt: new Date(),
      };
      memoryDB.announcements.push(ann);
      return { success: true, announcement: ann };
    }),

  toggleAnnouncement: staffQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const ann = memoryDB.announcements.find((a) => a.id === input.id);
      if (ann) ann.active = !ann.active;
      return { success: true };
    }),

  deleteAnnouncement: staffQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      memoryDB.announcements = memoryDB.announcements.filter(
        (a) => a.id !== input.id
      );
      return { success: true };
    }),

  listFiles: publicQuery.query(async () => {
    return memoryDB.siteFiles;
  }),

  addFile: staffQuery
    .input(z.object({ name: z.string(), size: z.string(), type: z.string(), url: z.string() }))
    .mutation(async ({ input }) => {
      const file = {
        id: memoryDB.siteFiles.length + 1,
        name: input.name,
        size: input.size,
        type: input.type,
        url: input.url,
        uploadedAt: new Date(),
      };
      memoryDB.siteFiles.push(file);
      return { success: true, file };
    }),

  deleteFile: staffQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      memoryDB.siteFiles = memoryDB.siteFiles.filter((f) => f.id !== input.id);
      return { success: true };
    }),
});
