import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

const dbPath = './bookings.db';

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
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user'
        )`);

        // Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            date TEXT,
            status TEXT DEFAULT 'pending', 
            details TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);
    });
}

export default db;
