import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { memoryDB } from "../memory-db";

const scryptAsync = promisify(scrypt);
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith("plain:")) return stored === `plain:${password}`;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  if (storedBuf.length !== derived.length) return false;
  return timingSafeEqual(storedBuf, derived);
}

export async function createSession(role: "staff" | "user", refId: number, name: string, email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  memoryDB.sessions.push({
    id: memoryDB.sessions.length + 1,
    token,
    role,
    refId,
    name,
    email,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    createdAt: new Date(),
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
  const s = memoryDB.sessions.find((s) => s.token === token);
  if (!s) return null;
  if (s.expiresAt < new Date()) {
    memoryDB.sessions = memoryDB.sessions.filter((x) => x.token !== token);
    return null;
  }
  return { role: s.role as "staff" | "user", refId: s.refId, name: s.name, email: s.email };
}

export async function deleteSession(token: string): Promise<void> {
  memoryDB.sessions = memoryDB.sessions.filter((s) => s.token !== token);
}

export async function cleanExpiredSessions(): Promise<void> {
  const now = new Date();
  memoryDB.sessions = memoryDB.sessions.filter((s) => s.expiresAt > now);
}

export function tokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
  return null;
}
