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
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT,
            email TEXT UNIQUE,
            passwordHash TEXT,
            role TEXT DEFAULT 'User',
            createdAt TEXT DEFAULT (datetime('now'))
        )`);

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

        // Check columns and add if missing
        const columnsToAdd = [
            { name: 'endDate', type: 'TEXT' },
            { name: 'phone', type: 'TEXT' },
            { name: 'persons', type: 'INTEGER' },
            { name: 'time', type: 'TEXT' }
        ];

        db.all("PRAGMA table_info(bookings)", (err, rows: any) => {
            if (err) return;
            const existingColumns = rows.map((r: any) => r.name);
            columnsToAdd.forEach(col => {
                if (!existingColumns.includes(col.name)) {
                    db.run(`ALTER TABLE bookings ADD COLUMN ${col.name} ${col.type}`, (err) => {
                        if (err) {
                            // Suppress already exists error if any, but log others
                            if (!err.message.includes('duplicate column name')) {
                                console.error(`Error adding column ${col.name}:`, err.message);
                            }
                        }
                    });
                }
            });
        });
    });
}

export default db;
