const db = require("./db");


db.run(`DROP TABLE IF EXISTS bookings`);

db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending','confirmed')) DEFAULT 'pending'
  )
`);

console.log("✅ bookings table ready");
