import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { verifySession, tokenFromRequest } from "./lib/security";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// Requires a valid session (staff OR user)
export const authedQuery = t.procedure.use(async ({ ctx, next }) => {
  const session = await verifySession(tokenFromRequest(ctx.req));
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }
  return next({ ctx: { ...ctx, session } });
});

// Requires a STAFF session only — confidential actions
export const staffQuery = t.procedure.use(async ({ ctx, next }) => {
  const session = await verifySession(tokenFromRequest(ctx.req));
  if (!session || session.role !== "staff") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Staff access required" });
  }
  return next({ ctx: { ...ctx, session } });
});
