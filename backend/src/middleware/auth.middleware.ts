import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "DWFS_SECRET_KEY_CHANGE_ME";

export function authMiddleware(req: any, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) return res.status(401).json({ message: "Token manquant" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
}

export function adminMiddleware(req: any, res: Response, next: NextFunction) {
    if (req.user?.role !== "Admin") {
        return res.status(403).json({ message: "Accès admin requis" });
    }
    next();
}
