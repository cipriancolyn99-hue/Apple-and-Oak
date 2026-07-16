import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL!;
const conn = await mysql.createConnection(url);

// Add admin account if not exists
await conn.execute(
  `INSERT INTO workers (name, email, password, role, title, bio, avatar, is_online, is_live, specialties)
   VALUES ('Admin', 'helloappleandoak@gmail.com', 'daria32T', 'Admin', 'Administrator', 'Site administrator', 'A', FALSE, FALSE, '')
   ON DUPLICATE KEY UPDATE password='daria32T', role='Admin'`
);
console.log("Admin account ready");

const [rows] = await conn.execute("SELECT id, name, email, role FROM workers");
console.log("All workers:", rows);

await conn.end();
process.exit(0);
