import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database/db';

const JWT_SECRET = "DWFS_SECRET_KEY_CHANGE_ME";

function generateToken(user: any) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "2h" }
    );
}

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, role } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Champs manquants" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userRole = role === "Admin" ? "Admin" : "User";

        db.run(
            "INSERT INTO users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)",
            [fullName, email, passwordHash, userRole],
            function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE")) {
                        return res.status(409).json({ message: "Email déjà utilisé" });
                    }
                    return res.status(500).json({ message: "Erreur serveur", error: err.message });
                }

                const user = { id: this.lastID, fullName, email, role: userRole };
                const token = generateToken(user);

                return res.status(201).json({
                    message: "Inscription réussie",
                    token,
                    user,
                });
            }
        );
    } catch (e: any) {
        return res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
};

export const login = (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "Champs manquants" });

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row: any) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        if (!row) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

        const ok = await bcrypt.compare(password, row.passwordHash);
        if (!ok) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

        const user = { id: row.id, fullName: row.fullName, email: row.email, role: row.role };
        const token = generateToken(user);

        return res.json({ message: "Connexion réussie", token, user });
    });
};

export const getMe = (req: any, res: Response) => {
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
