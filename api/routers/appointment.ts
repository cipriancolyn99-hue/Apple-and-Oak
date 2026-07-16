import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { memoryDB } from "../memory-db";

export const appointmentRouter = createRouter({
  list: publicQuery.query(async () => {
    return memoryDB.appointments;
  }),

  listByWorker: publicQuery
    .input(z.object({ workerId: z.number() }))
    .query(async ({ input }) => {
      return memoryDB.appointments.filter((a) => a.workerId === input.workerId);
    }),

  add: publicQuery
    .input(
      z.object({
        clientName: z.string(),
        clientEmail: z.string(),
        workerId: z.number(),
        workerName: z.string(),
        date: z.string(),
        time: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const appt = {
        id: memoryDB.appointments.length + 1,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        workerId: input.workerId,
        workerName: input.workerName,
        date: input.date,
        time: input.time,
        notes: input.notes || "",
        status: "pending",
        createdAt: new Date(),
      };
      memoryDB.appointments.push(appt);
      return { success: true, appointment: appt };
    }),

  updateStatus: publicQuery
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      const appt = memoryDB.appointments.find((a) => a.id === input.id);
      if (appt) appt.status = input.status;
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      memoryDB.appointments = memoryDB.appointments.filter(
        (a) => a.id !== input.id
      );
      return { success: true };
    }),
});
