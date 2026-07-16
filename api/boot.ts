import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

const app = new Hono<{ Bindings: HttpBindings }>();

// API routes first
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.get("/ping", (c) => c.json({ ok: true }));
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Static files - explicit path resolution
const publicPath = path.resolve(process.cwd(), "dist/public");
console.log("Static files path:", publicPath);
console.log("Exists:", fs.existsSync(publicPath));
if (fs.existsSync(publicPath)) {
  console.log("Files:", fs.readdirSync(publicPath).join(", "));
}

// Serve static files
app.use("/assets/*", serveStatic({ root: "./dist/public" }));
app.use("/*", serveStatic({ root: "./dist/public" }));

// Fallback to index.html for SPA routes
app.notFound((c) => {
  const accept = c.req.header("accept") ?? "";
  if (!accept.includes("text/html")) {
    return c.json({ error: "Not Found" }, 404);
  }
  const indexPath = path.resolve(publicPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return c.html(fs.readFileSync(indexPath, "utf-8"));
  }
  return c.json({ error: "index.html not found" }, 500);
});

export default app;

if (process.env.NODE_ENV === "production") {
  const { serve } = await import("@hono/node-server");
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on port ${port}`);
  });
}
