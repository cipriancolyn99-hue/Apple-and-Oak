import { createRouter, publicQuery } from "./middleware";
import { workerRouter } from "./routers/worker";
import { contentRouter } from "./routers/content";
import { chatRouter } from "./routers/chat";
import { appointmentRouter } from "./routers/appointment";
import { visitorRouter } from "./routers/visitor";
import { userRouter } from "./routers/user";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  worker: workerRouter,
  content: contentRouter,
  chat: chatRouter,
  appointment: appointmentRouter,
  visitor: visitorRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
