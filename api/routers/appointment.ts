import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { appointments } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const appointmentRouter = createRouter({
  // List all appointments
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(appointments).orderBy(asc(appointments.date));
  }),

  // List appointments for a worker
  listByWorker: publicQuery
    .input(z.object({ workerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(appointments)
        .where(eq(appointments.workerId, input.workerId))
        .orderBy(asc(appointments.date));
    }),

  // Add appointment
  add: publicQuery
    .input(
      z.object({
        clientName: z.string(),
        clientEmail: z.string(),
        workerId: z.number(),
        date: z.string(),
        time: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(appointments).values({
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        workerId: input.workerId,
        date: input.date,
        time: input.time,
        status: "pending",
        notes: input.notes || "",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update status
  updateStatus: publicQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "completed"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(appointments)
        .set({ status: input.status })
        .where(eq(appointments.id, input.id));
      return { success: true };
    }),

  // Remove appointment
  remove: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(appointments).where(eq(appointments.id, input.id));
      return { success: true };
    }),
});
