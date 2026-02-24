import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "DWFS_SECRET_KEY_DEVELOPMENT_ONLY";


interface User {
    id: number;
    email: string;
    role: string;
    fullName: string;
}

function generateToken(user: Partial<User>) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "2h" }
    );
}

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, role } = req.body;
        console.log(`[AUTH] Registration attempt for: ${email}`);

        if (!fullName || !email || !password) {
            console.warn('[AUTH] Registration failed: Missing fields');
            return res.status(400).json({ message: "Champs manquants" });
        }

        console.log('[AUTH] Hashing password...');
        const passwordHash = await bcrypt.hash(password, 10);
        const userRole = role === "Admin" ? "Admin" : "User";

        console.log('[AUTH] Inserting user into DB...');
        db.run(
            "INSERT INTO users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)",
            [fullName, email, passwordHash, userRole],
            function (err) {
                if (err) {
                    console.error('[AUTH] DB Error during registration:', err.message);
                    if (err.message.includes("UNIQUE")) {
                        return res.status(409).json({ message: "Email déjà utilisé" });
                    }
                    return res.status(500).json({ message: "Erreur serveur", error: err.message });
                }

                console.log(`[AUTH] User registered successfully: ${email} (ID: ${this.lastID})`);
                const user: User = { id: this.lastID, fullName, email, role: userRole };
                const token = generateToken(user);

                return res.status(201).json({
                    message: "Inscription réussie",
                    token,
                    user,
                });
            }
        );
    } catch (e: any) {
        console.error('[AUTH] Catch error during registration:', e.message);
        return res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
};

export const login = (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "Champs manquants" });

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row: any) => {
        if (err) {
            console.error('DB Error during login:', err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        if (!row) {
            console.warn(`Login failed: User not found (${email})`);
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const ok = await bcrypt.compare(password, row.passwordHash);
        if (!ok) {
            console.warn(`Login failed: Invalid password for ${email}`);
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const user: User = { id: row.id, fullName: row.fullName, email: row.email, role: row.role };
        const token = generateToken(user);
        console.log(`Login successful: ${email}`);

        return res.json({ message: "Connexion réussie", token, user });
    });
};

export const getMe = (req: Request & { user?: any }, res: Response) => {
    res.json({ message: "OK", user: req.user });
};

export const getUsers = (req: Request, res: Response) => {
    db.all("SELECT id, fullName, email, role, createdAt FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(rows);
    });
};

export const updateProfile = async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Non autorisé" });
    }
    const { fullName, password } = req.body;

    try {
        let query = "UPDATE users SET fullName = COALESCE(?, fullName)";
        const params: any[] = [fullName];

        if (password) {
            const hash = await bcrypt.hash(password, 10);
            query += ", passwordHash = ?";
            params.push(hash);
        }

        query += " WHERE id = ?";
        params.push(userId);

        db.run(query, params, function (err) {
            if (err) return res.status(500).json({ message: "Erreur serveur" });
            res.json({ message: "Profil mis à jour" });
        });
    } catch (e: any) {
        res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
};
