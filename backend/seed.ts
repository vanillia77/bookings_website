import db from './src/database/db';

const seed = () => {
    console.log('Seeding database...');

    // Create Users
    db.run(`INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@example.com', 'hash123', 'admin')`, (err) => {
        if (!err) {
            // Create Bookings
            const bookings = [
                { userId: 1, date: '2023-10-25', status: 'confirmed', details: 'Meeting Room A' },
                { userId: 1, date: '2023-10-26', status: 'pending', details: 'Conference Call' },
                { userId: 1, date: '2023-10-27', status: 'cancelled', details: 'Lunch with Client' },
                { userId: 1, date: '2023-10-28', status: 'confirmed', details: 'Project Review' }
            ];

            bookings.forEach(b => {
                db.run(`INSERT INTO bookings (userId, date, status, details) VALUES (?, ?, ?, ?)`,
                    [b.userId, b.date, b.status, b.details]);
            });
            console.log('Seeding complete.');
        } else {
            // check if unique constraint failed (already seeded)
            console.log('Database likely already seeded or error:', err.message);
        }
    });
};

setTimeout(seed, 1000); // Wait for DB init
