import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL!;
const conn = await mysql.createConnection(url);

async function tryExec(sql: string) {
  try {
    await conn.execute(sql);
    console.log("OK:", sql.slice(0, 60));
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === "ER_TABLE_EXISTS_ERROR" || err.code === "ER_DUP_KEYNAME") {
      console.log("SKIP (exists):", sql.slice(0, 60));
    } else {
      console.log("WARN:", err.message);
    }
  }
}

await tryExec(`CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  provider VARCHAR(20) NOT NULL DEFAULT 'email',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

await tryExec("ALTER TABLE users ADD UNIQUE KEY users_email_unique (email)");

console.log("Users table ready!");
await conn.end();
process.exit(0);
