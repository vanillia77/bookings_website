import { Request, Response } from 'express';
import db from '../database/db';

export const getGeneralStats = (req: Request, res: Response) => {
    const { startDate, endDate, status } = req.query;

    let whereClauses: string[] = [];
    let params: any[] = [];

    // Filter by Date Range (using 'date' column)
    if (startDate) {
        whereClauses.push(`date >= ?`);
        params.push(startDate);
    }
    if (endDate) {
        whereClauses.push(`date <= ?`);
        params.push(endDate);
    }

    // Capture filters for SQLTotal
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sqlTotal = `SELECT COUNT(*) as total FROM bookings ${whereSql}`;

    // For Group By Status, we might also want to filter by Date, BUT if 'status' filter is provided, 
    // it's slightly redundant to ask for breakdown by status if we only fetch one status. 
    // However, usually "Reservations by Status" chart should show distribution. 
    // If a USER filters by 'Confirmed', the chart will likely show 100% Confirmed. This is expected behavior.

    // We append the status filter logic specifically for the WHERE clause if present
    const statusWhereClauses = [...whereClauses];
    const statusParams = [...params];

    if (status) {
        // If the user specifically filters by a status, we add it to the general total count
        // Note: Re-building sqlTotal params if status is included for the top-level count
        if (status !== 'all') {
            // We need to re-construct the total query to include status if it wasn't just for the breakdown
            const totalWhereClauses = [...whereClauses];
            const totalParams = [...params];
            totalWhereClauses.push(`status = ?`);
            totalParams.push(status);

            const totalWhereSql = totalWhereClauses.length > 0 ? `WHERE ${totalWhereClauses.join(' AND ')}` : '';
            // Overwrite sqlTotal with status filter
            db.get(`SELECT COUNT(*) as total FROM bookings ${totalWhereSql}`, totalParams, (err, row: any) => {
                handleStatsResponse(err, row, whereClauses, params, res);
            });
            return;
        }
    }

    // Default case (no status filter or status=all)
    db.get(sqlTotal, params, (err, row: any) => {
        handleStatsResponse(err, row, whereClauses, params, res);
    });
};

const handleStatsResponse = (err: any, row: any, whereClauses: string[], params: any[], res: Response) => {
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    const total = row ? row.total : 0;

    // For the status breakdown, we still respect the DATE filters, but usually we don't filter by status 
    // itself in the GROUP BY (unless we want to see only that bar).
    // Let's apply the DATE filters to the group by query.
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sqlByStatus = `SELECT status, COUNT(*) as count FROM bookings ${whereSql} GROUP BY status`;

    db.all(sqlByStatus, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            totalReservations: total,
            reservationsByStatus: rows
        });
    });
}

export const getCalendarEvents = (req: Request, res: Response) => {
    const { startDate, endDate, status } = req.query;
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (startDate) {
        whereClauses.push(`date >= ?`);
        params.push(startDate);
    }
    if (endDate) {
        whereClauses.push(`date <= ?`);
        params.push(endDate);
    }
    if (status && status !== 'all') {
        whereClauses.push(`status = ?`);
        params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `SELECT id, date, details, status FROM bookings ${whereSql}`;

    db.all(sql, params, (err, rows: any[]) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Transform for Frontend Calendar (e.g., FullCalendar)
        const events = rows.map(booking => ({
            id: booking.id,
            title: `${booking.details} (${booking.status})`,
            start: booking.date,
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
