import { Request, Response } from 'express';
import db from '../database/db';

export const getGeneralStats = (req: Request, res: Response) => {
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
    const sqlTotal = `SELECT COUNT(*) as total FROM bookings ${whereSql}`;

    db.get(sqlTotal, params, (err, row: any) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const filteredTotal = row ? row.total : 0;

        db.get('SELECT COUNT(*) as absoluteTotal FROM bookings', [], (err, absRow: any) => {
            if (err) return res.status(500).json({ error: err.message });
            const absoluteTotal = absRow ? absRow.absoluteTotal : 0;

            const sqlByStatus = `SELECT status, COUNT(*) as count FROM bookings ${whereSql} GROUP BY status`;

            db.all(sqlByStatus, params, (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    totalReservations: absoluteTotal,
                    filteredTotal: filteredTotal,
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
            end: booking.endDate || booking.date,
            backgroundColor: getColorForStatus(booking.status)
        }));

        res.json(events);
    });
};

const getColorForStatus = (status: string) => {
    switch (status) {
        case 'confirmed': return '#28a745';
        case 'pending': return '#ffc107';
        case 'cancelled': return '#dc3545';
        default: return '#007bff';
    }
};
