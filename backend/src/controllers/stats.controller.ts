import { Request, Response } from 'express';
import db from '../database/db';

export const getGeneralStats = (req: Request, res: Response) => {
    const { startDate, endDate, status } = req.query;

    let whereClauses: string[] = [];
    let params: any[] = [];

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

    db.get(sqlTotal, params, (err, row: any) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const filteredTotal = row ? row.total : 0;

        // NEW: Get absolute total (unfiltered)
        db.get('SELECT COUNT(*) as absoluteTotal FROM bookings', [], (err, absRow: any) => {
            if (err) return res.status(500).json({ error: err.message });
            const absoluteTotal = absRow ? absRow.absoluteTotal : 0;

            const sqlByStatus = `SELECT status, COUNT(*) as count FROM bookings ${whereSql} GROUP BY status`;

            db.all(sqlByStatus, params, (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    totalReservations: absoluteTotal, // Now returns the absolute total
                    filteredTotal: filteredTotal,     // Keep filtered total just in case
                    reservationsByStatus: rows
                });
            });
        });
    });
};

export const getCalendarEvents = (req: Request, res: Response) => {
    const { startDate, endDate, status } = req.query;
    let whereClauses: string[] = [];
    let params: any[] = [];

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

    db.all(sql, params, (err, rows: any[]) => {
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

const getColorForStatus = (status: string) => {
    switch (status) {
        case 'confirmed': return '#28a745'; // Green
        case 'pending': return '#ffc107'; // Yellow
        case 'cancelled': return '#dc3545'; // Red
        default: return '#007bff'; // Blue
    }
};
