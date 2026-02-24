"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmBooking = exports.deleteBooking = exports.updateBooking = exports.createBooking = exports.getAllBookings = void 0;
const db_1 = __importDefault(require("../database/db"));
const getAllBookings = (req, res) => {
    db_1.default.all("SELECT * FROM bookings ORDER BY date DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(rows);
    });
};
exports.getAllBookings = getAllBookings;
const createBooking = (req, res) => {
    const { userId, date, endDate, details, status, phone, persons, time } = req.body;
    if (!date) {
        return res.status(400).json({ message: "Date requise" });
    }
    const uId = req.user ? req.user.id : (userId || 1);
    const initialStatus = status || 'pending';
    db_1.default.run("INSERT INTO bookings (userId, date, endDate, details, status, phone, persons, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [uId, date, endDate, details || 'Reservation', initialStatus, phone, persons, time], function (err) {
        if (err) {
            console.error(`Error creating booking: ${err.message}`);
            return res.status(500).json({ message: "Erreur creation", error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: "Reservation créée" });
    });
};
exports.createBooking = createBooking;
const updateBooking = (req, res) => {
    const { id } = req.params;
    const { date, endDate, details, status, phone, persons, time } = req.body;
    db_1.default.run("UPDATE bookings SET date = COALESCE(?, date), endDate = COALESCE(?, endDate), details = COALESCE(?, details), status = COALESCE(?, status), phone = COALESCE(?, phone), persons = COALESCE(?, persons), time = COALESCE(?, time) WHERE id = ?", [date, endDate, details, status, phone, persons, time, id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Erreur mise à jour" });
        }
        res.json({ message: "Modification réussie" });
    });
};
exports.updateBooking = updateBooking;
const deleteBooking = (req, res) => {
    const { id } = req.params;
    db_1.default.run("DELETE FROM bookings WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Erreur suppression" });
        }
        res.json({ message: "Suppression réussie" });
    });
};
exports.deleteBooking = deleteBooking;
const confirmBooking = (req, res) => {
    const { id } = req.params;
    db_1.default.run("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Erreur confirmation" });
        }
        res.json({ message: "Confirmation réussie" });
    });
};
exports.confirmBooking = confirmBooking;
