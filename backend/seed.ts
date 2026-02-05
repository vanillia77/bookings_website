import db from './src/database/db';
import bcrypt from 'bcryptjs';

const seed = async () => {
    console.log('Seeding database...');

    try {
        const passwordHash = await bcrypt.hash('123456', 10);

        // Create Users
        db.run(`INSERT INTO users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)`,
            ['Safaa', 'safaa@test.com', passwordHash, 'User'], (err) => {
                if (!err) {
                    // Create Bookings
                    const bookings = [
                        { userId: 1, date: '2023-10-25', status: 'confirmed', details: 'Meeting Room A' },
                        { userId: 1, date: '2023-10-26', status: 'pending', details: 'Conference Call' },
                    ];

                    bookings.forEach(b => {
                        db.run(`INSERT INTO bookings (userId, date, status, details) VALUES (?, ?, ?, ?)`,
                            [b.userId, b.date, b.status, b.details]);
                    });
                    console.log('Seeding complete.');
                } else {
                    console.log('Database likely already seeded or error:', err.message);
                }
            });
    } catch (err) {
        console.error('Error during seeding:', err);
    }
};

setTimeout(seed, 1000); // Wait for DB init
