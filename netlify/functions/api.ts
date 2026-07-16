import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Hono } from "hono";
import { trpcServer } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../api/router";
import { createContext } from "../../api/context";

// Create Hono app
const app = new Hono();

// Mount tRPC
app.use("/trpc/*", async (c) => {
  return trpcServer({
    router: appRouter,
    createContext,
    req: c.req.raw,
  });
});

// Health check
app.get("/ping", (c) => c.json({ ok: true, ts: Date.now() }));

// Netlify handler
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Create a Request from the event
  const url = new URL(event.rawUrl);
  const request = new Request(url.toString(), {
    method: event.httpMethod,
    headers: new Headers(event.headers as Record<string, string>),
    body: event.body,
  });

  const response = await app.fetch(request, {
    ...context,
    waitUntil: () => {},
  });

  // Convert Response to Netlify response
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const body = await response.text();

  return {
    statusCode: response.status,
    headers,
    body,
    isBase64Encoded: false,
  };
};

export { handler };
