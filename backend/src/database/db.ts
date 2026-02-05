import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../bookings.db');

const db: Database = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT,
            email TEXT UNIQUE,
            passwordHash TEXT,
            role TEXT DEFAULT 'User',
            createdAt TEXT DEFAULT (datetime('now'))
        )`);

        // Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            date TEXT,
            endDate TEXT,
            status TEXT DEFAULT 'pending', 
            details TEXT,
            phone TEXT,
            persons INTEGER,
            time TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        // Migrations: Try to add columns if they don't exist (for existing DBs)
        const migrations = [
            "ALTER TABLE bookings ADD COLUMN endDate TEXT",
            "ALTER TABLE bookings ADD COLUMN phone TEXT",
            "ALTER TABLE bookings ADD COLUMN persons INTEGER",
            "ALTER TABLE bookings ADD COLUMN time TEXT"
        ];

        migrations.forEach(query => {
            db.run(query, (err) => {
                // Ignore error if column already exists
            });
        });
    });
}

export default db;
