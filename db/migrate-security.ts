import mysql from "mysql2/promise";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const url = process.env.DATABASE_URL!;
const conn = await mysql.createConnection(url);

async function tryExec(sql: string) {
  try {
    await conn.execute(sql);
    console.log("OK:", sql.slice(0, 70));
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === "ER_TABLE_EXISTS_ERROR" || err.code === "ER_DUP_KEYNAME") {
      console.log("SKIP (exists):", sql.slice(0, 70));
    } else {
      console.log("WARN:", err.message);
    }
  }
}

// 1. Create sessions table
await tryExec(`CREATE TABLE sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(128) NOT NULL,
  role VARCHAR(10) NOT NULL,
  ref_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
await tryExec("ALTER TABLE sessions ADD UNIQUE KEY sessions_token_unique (token)");

// 2. Re-hash existing worker passwords (currently plain text)
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

const [workerRows] = await conn.execute("SELECT id, name, password FROM workers");
const workersList = workerRows as Array<{ id: number; name: string; password: string }>;

for (const w of workersList) {
  // Skip if already hashed (contains colon and is long)
  if (w.password.includes(":") && w.password.length > 64) {
    console.log(`Worker ${w.name}: already hashed, skipping`);
    continue;
  }
  const hashed = await hashPassword(w.password);
  await conn.execute("UPDATE workers SET password = ? WHERE id = ?", [hashed, w.id]);
  console.log(`Worker ${w.name}: password hashed`);
}

// 3. Re-hash any existing user passwords
const [userRows] = await conn.execute("SELECT id, email, password, provider FROM users");
const usersList = userRows as Array<{ id: number; email: string; password: string; provider: string }>;

for (const u of usersList) {
  if (u.provider === "google" || !u.password) continue;
  if (u.password.includes(":") && u.password.length > 64) {
    console.log(`User ${u.email}: already hashed, skipping`);
    continue;
  }
  const hashed = await hashPassword(u.password);
  await conn.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, u.id]);
  console.log(`User ${u.email}: password hashed`);
}

console.log("Security migration complete!");
await conn.end();
process.exit(0);
