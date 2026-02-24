import { Request, Response } from 'express';
import db from '../database/db';

export const getAllBookings = (req: Request, res: Response) => {
    db.all("SELECT * FROM bookings ORDER BY date DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(rows);
    });
};

export const createBooking = (req: Request & { user?: any }, res: Response) => {
    const { userId, date, endDate, details, status, phone, persons, time } = req.body;

    if (!date) {
        return res.status(400).json({ message: "Date requise" });
    }

    const uId = req.user ? req.user.id : (userId || 1);
    const initialStatus = status || 'pending';

    db.run(
        "INSERT INTO bookings (userId, date, endDate, details, status, phone, persons, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [uId, date, endDate, details || 'Reservation', initialStatus, phone, persons, time],
        function (err) {
            if (err) {
                console.error(`Error creating booking: ${err.message}`);
                return res.status(500).json({ message: "Erreur creation", error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: "Reservation créée" });
        }
    );
};

export const updateBooking = (req: Request, res: Response) => {
    const { id } = req.params;
    const { date, endDate, details, status, phone, persons, time } = req.body;

    db.run(
        "UPDATE bookings SET date = COALESCE(?, date), endDate = COALESCE(?, endDate), details = COALESCE(?, details), status = COALESCE(?, status), phone = COALESCE(?, phone), persons = COALESCE(?, persons), time = COALESCE(?, time) WHERE id = ?",
        [date, endDate, details, status, phone, persons, time, id],
        function (err) {
            if (err) {
                return res.status(500).json({ message: "Erreur mise à jour" });
            }
            res.json({ message: "Modification réussie" });
        }
    );
};

export const deleteBooking = (req: Request, res: Response) => {
    const { id } = req.params;
    db.run("DELETE FROM bookings WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Erreur suppression" });
        }
        res.json({ message: "Suppression réussie" });
    });
};

export const confirmBooking = (req: Request, res: Response) => {
    const { id } = req.params;
    db.run("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Erreur confirmation" });
        }
        res.json({ message: "Confirmation réussie" });
    });
};
