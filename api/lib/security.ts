import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getDb } from "../queries/connection";
import { sessions } from "@db/schema";
import { eq, lt } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// ============ PASSWORD HASHING (scrypt + salt — industry standard) ============

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Support legacy plain-text passwords during migration (marked "plain:")
  if (stored.startsWith("plain:")) {
    return stored === `plain:${password}`;
  }
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  if (storedBuf.length !== derived.length) return false;
  return timingSafeEqual(storedBuf, derived);
}

// ============ SESSION TOKENS ============

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(role: "staff" | "user", refId: number, name: string, email: string): Promise<string> {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  await db.insert(sessions).values({
    token,
    role,
    refId,
    name,
    email,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export interface SessionInfo {
  role: "staff" | "user";
  refId: number;
  name: string;
  email: string;
}

export async function verifySession(token: string | null | undefined): Promise<SessionInfo | null> {
  if (!token) return null;
  const db = getDb();
  const found = await db.select().from(sessions).where(eq(sessions.token, token));
  if (found.length === 0) return null;
  const s = found[0];
  if (s.expiresAt < new Date()) {
    // Expired — clean up
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }
  return { role: s.role as "staff" | "user", refId: s.refId, name: s.name, email: s.email };
}

export async function deleteSession(token: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function cleanExpiredSessions(): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

// Extract token from request Authorization header ("Bearer <token>")
export function tokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}
