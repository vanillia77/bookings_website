"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarEvents = exports.getGeneralStats = void 0;
const db_1 = __importDefault(require("../database/db"));
const getGeneralStats = (req, res) => {
    const { startDate, endDate, status } = req.query;
    let whereClauses = [];
    let params = [];
    // Filter by Date Range (using overlap logic if endDate exists in bookings, or simple comparison)
    // For Dashboard Stats, we usually want bookings that are "active" during this range
    if (startDate) {
        whereClauses.push(`(date >= ? OR endDate >= ?)`);
        params.push(startDate, startDate);
    }
    if (endDate) {
        // Ensure inclusive end date matching by adding the end of the day
        const endOfDay = `${endDate}T23:59:59`;
        whereClauses.push(`date <= ?`);
        params.push(endOfDay);
    }
    if (status && status !== 'all') {
        whereClauses.push(`status = ?`);
        params.push(status);
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sqlTotal = `SELECT COUNT(*) as total FROM bookings ${whereSql}`;
    db_1.default.get(sqlTotal, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const total = row ? row.total : 0;
        // Breakdown by status for the CURRENT selection
        // However, if we filter by Confirmed, the chart only shows Confirmed. 
        // If the user wants to see the OVERALL distribution while the KPI is filtered, 
        // they should remove the status filter. 
        // We stay consistent with the query above.
        const sqlByStatus = `SELECT status, COUNT(*) as count FROM bookings ${whereSql} GROUP BY status`;
        db_1.default.all(sqlByStatus, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                totalReservations: total,
                reservationsByStatus: rows
            });
        });
    });
};
exports.getGeneralStats = getGeneralStats;
const getCalendarEvents = (req, res) => {
    const { startDate, endDate, status } = req.query;
    let whereClauses = [];
    let params = [];
    if (startDate) {
        whereClauses.push(`(date >= ? OR endDate >= ?)`);
        params.push(startDate, startDate);
    }
    if (endDate) {
        const endOfDay = `${endDate}T23:59:59`;
        whereClauses.push(`date <= ?`);
        params.push(endOfDay);
    }
    if (status && status !== 'all') {
        whereClauses.push(`status = ?`);
        params.push(status);
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `SELECT id, date, endDate, details, status FROM bookings ${whereSql}`;
    db_1.default.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const events = rows.map(booking => ({
            id: booking.id,
            title: `${booking.details} (${booking.status})`,
            start: booking.date,
            end: booking.endDate || booking.date, // Include end date for fullcalendar
            backgroundColor: getColorForStatus(booking.status)
        }));
        res.json(events);
    });
};
exports.getCalendarEvents = getCalendarEvents;
const getColorForStatus = (status) => {
    switch (status) {
        case 'confirmed': return '#28a745'; // Green
        case 'pending': return '#ffc107'; // Yellow
        case 'cancelled': return '#dc3545'; // Red
        default: return '#007bff'; // Blue
    }
};
