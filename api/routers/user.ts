import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { memoryDB, getNextId } from "../memory-db";
import { hashPassword, verifyPassword, createSession, verifySession, deleteSession } from "../lib/security";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export const userRouter = createRouter({
  // Visitor account registration
  register: publicQuery
    .input(z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(4) }))
    .mutation(async ({ input }) => {
      const existing = memoryDB.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
      if (existing) return { success: false, error: "An account with this email already exists" };

      const hashed = await hashPassword(input.password);
      const user = {
        id: getNextId(),
        name: input.name.trim(),
        email: input.email.toLowerCase(),
        password: hashed,
        provider: "email",
        createdAt: new Date(),
      };
      memoryDB.users.push(user);

      const token = await createSession("user", user.id, user.name, user.email);
      return { success: true, token, user: { id: user.id, name: user.name, email: user.email } };
    }),

  // Visitor account login
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = memoryDB.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
      if (!user) return { success: false, error: "Invalid email or password" };

      const valid = await verifyPassword(input.password, user.password);
      if (!valid) return { success: false, error: "Invalid email or password" };

      const token = await createSession("user", user.id, user.name, user.email);
      return { success: true, token, user: { id: user.id, name: user.name, email: user.email } };
    }),

  // Real Google sign-in
  googleLogin: publicQuery
    .input(z.object({ credential: z.string().min(1) }))
    .mutation(async ({ input }) => {
      if (!googleClient || !GOOGLE_CLIENT_ID) {
        return { success: false, error: "Google sign-in is not configured" };
      }
      try {
        const ticket = await googleClient.verifyIdToken({ idToken: input.credential, audience: GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) return { success: false, error: "Invalid Google credential" };

        const email = payload.email.toLowerCase();
        const name = payload.name || payload.email.split("@")[0];

        const existing = memoryDB.users.find((u) => u.email === email);
        if (existing) {
          const token = await createSession("user", existing.id, existing.name, existing.email);
          return { success: true, token, user: { id: existing.id, name: existing.name, email: existing.email } };
        }

        const user = { id: getNextId(), name: name.trim(), email, password: "", provider: "google", createdAt: new Date() };
        memoryDB.users.push(user);
        const token = await createSession("user", user.id, user.name, user.email);
        return { success: true, token, user: { id: user.id, name: user.name, email: user.email } };
      } catch {
        return { success: false, error: "Google sign-in verification failed" };
      }
    }),

  // Verify token
  verifyToken: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await verifySession(input.token);
      if (!session) return { valid: false };
      return { valid: true, user: { name: session.name, email: session.email } };
    }),

  // Logout
  logout: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      await deleteSession(input.token);
      return { success: true };
    }),
});
