"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../bookings.db');
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    }
    else {
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
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);
        // Migrations: Try to add columns if they don't exist (for existing DBs)
        const migrations = [
            "ALTER TABLE bookings ADD COLUMN endDate TEXT",
            "ALTER TABLE bookings ADD COLUMN phone TEXT",
            "ALTER TABLE bookings ADD COLUMN persons INTEGER"
        ];
        migrations.forEach(query => {
            db.run(query, (err) => {
                // Ignore error if column already exists
            });
        });
    });
}
exports.default = db;
