import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL!;
const conn = await mysql.createConnection(url);

async function tryExec(sql: string) {
  try {
    await conn.execute(sql);
    console.log("OK:", sql.slice(0, 60));
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === "ER_DUP_FIELDNAME" || err.code === "ER_DUP_KEYNAME" || err.code === "ER_TABLE_EXISTS_ERROR" || err.code === "ER_DUP_ENTRY") {
      console.log("SKIP (already exists):", sql.slice(0, 60));
    } else {
      console.log("WARN:", sql.slice(0, 60), "->", err.message);
    }
  }
}

// Add new columns to workers
await tryExec("ALTER TABLE workers ADD COLUMN title VARCHAR(100) NOT NULL DEFAULT ''");
await tryExec("ALTER TABLE workers ADD COLUMN bio TEXT NULL");

// Create visitors table
await tryExec(`CREATE TABLE visitors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100) NOT NULL DEFAULT 'Guest',
  last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  current_room VARCHAR(20) DEFAULT 'none'
)`);

// Unique constraint on session_id
await tryExec("ALTER TABLE visitors ADD UNIQUE KEY visitors_session_id_unique (session_id)");

// Unique constraint on site_content.key
await tryExec("ALTER TABLE site_content ADD UNIQUE KEY site_content_key_unique (`key`)");

console.log("Migration complete!");
await conn.end();
process.exit(0);
