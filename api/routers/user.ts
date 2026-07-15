import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createSession, verifySession, deleteSession } from "../lib/security";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export const userRouter = createRouter({
  // Register — password is hashed before storage
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(4),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase()));

      if (existing.length > 0) {
        return { success: false, error: "An account with this email already exists. Try logging in instead." };
      }

      const hashed = await hashPassword(input.password);
      const result = await db.insert(users).values({
        name: input.name.trim(),
        email: input.email.toLowerCase(),
        password: hashed,
        provider: "email",
      });

      const userId = Number(result[0].insertId);
      const token = await createSession("user", userId, input.name.trim(), input.email.toLowerCase());

      return {
        success: true,
        token,
        user: { id: userId, name: input.name.trim(), email: input.email.toLowerCase() },
      };
    }),

  // Login — verifies hashed password
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const found = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase()));

      if (found.length === 0) {
        return { success: false, error: "No account found with this email. Create one first." };
      }

      if (found[0].provider === "google") {
        return { success: false, error: "This account uses Google sign-in. Click the Google button instead." };
      }

      const passwordOk = await verifyPassword(input.password, found[0].password);
      if (!passwordOk) {
        return { success: false, error: "Wrong password. Please try again." };
      }

      const token = await createSession("user", found[0].id, found[0].name, found[0].email);

      return {
        success: true,
        token,
        user: { id: found[0].id, name: found[0].name, email: found[0].email },
      };
    }),

  // Real Google sign-in — verifies the JWT credential from Google Identity Services
  googleLogin: publicQuery
    .input(z.object({ credential: z.string().min(1) }))
    .mutation(async ({ input }) => {
      if (!googleClient || !GOOGLE_CLIENT_ID) {
        return { success: false, error: "Google sign-in is not configured. Ask the admin to set up GOOGLE_CLIENT_ID." };
      }

      try {
        // Verify the Google JWT credential
        const ticket = await googleClient.verifyIdToken({
          idToken: input.credential,
          audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          return { success: false, error: "Invalid Google credential." };
        }

        const email = payload.email.toLowerCase();
        const name = payload.name || payload.email.split("@")[0];

        const db = getDb();
        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (found.length > 0) {
          const token = await createSession("user", found[0].id, found[0].name, found[0].email);
          return { success: true, token, user: { id: found[0].id, name: found[0].name, email: found[0].email } };
        }

        // Create new user from Google account
        const result = await db.insert(users).values({
          name: name.trim(),
          email,
          password: "",
          provider: "google",
        });

        const userId = Number(result[0].insertId);
        const token = await createSession("user", userId, name.trim(), email);
        return { success: true, token, user: { id: userId, name: name.trim(), email } };
      } catch {
        return { success: false, error: "Google sign-in verification failed. Please try again." };
      }
    }),

  // Verify an existing session token (restores login on page refresh)
  verifyToken: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await verifySession(input.token);
      if (!session) return { valid: false };
      return { valid: true, session };
    }),

  // Logout — destroys session
  logout: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      await deleteSession(input.token);
      return { success: true };
    }),
});
