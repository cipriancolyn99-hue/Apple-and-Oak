import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL!;
const conn = await mysql.createConnection(url);

// Update Laura
await conn.execute(
  "UPDATE workers SET email=?, title=?, bio=?, specialties=? WHERE name='Laura'",
  [
    "lauraappleandoak@gmail.com",
    "Family Counselor",
    "Laura supports families through challenging times. She specializes in creating safe spaces for open communication and growth.",
    "Family Counseling, Child Support, Parenting Guidance",
  ]
);
console.log("Laura updated");

// Update John
await conn.execute(
  "UPDATE workers SET email=?, title=?, bio=?, specialties=? WHERE name='John'",
  [
    "johnappleandoak@gmail.com",
    "Mental Health Specialist",
    "John provides accessible mental health support with evidence-based practices and genuine compassion.",
    "Mental Health, Community Support, Crisis Intervention",
  ]
);
console.log("John updated");

// Update site content for contact
await conn.execute(
  "INSERT INTO site_content (`key`, `value`) VALUES ('contactEmail', 'helloappleandoak@gmail.com') ON DUPLICATE KEY UPDATE `value`='helloappleandoak@gmail.com'"
);
await conn.execute(
  "INSERT INTO site_content (`key`, `value`) VALUES ('contactWebsite', 'helloappleandoak.com') ON DUPLICATE KEY UPDATE `value`='helloappleandoak.com'"
);
await conn.execute(
  "INSERT INTO site_content (`key`, `value`) VALUES ('contactAddress', 'United Kingdom') ON DUPLICATE KEY UPDATE `value`='United Kingdom'"
);
await conn.execute(
  "UPDATE site_content SET `value`='' WHERE `key`='contactPhone'"
);
console.log("Site content updated");

// Show workers
const [rows] = await conn.execute("SELECT id, name, email, title FROM workers");
console.log("Workers:", rows);

await conn.end();
process.exit(0);
