"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getUsers = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../database/db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "DWFS_SECRET_KEY_DEVELOPMENT_ONLY";
function generateToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "2h" });
}
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, email, password, role } = req.body;
        console.log(`[AUTH] Registration attempt for: ${email}`);
        if (!fullName || !email || !password) {
            console.warn('[AUTH] Registration failed: Missing fields');
            return res.status(400).json({ message: "Champs manquants" });
        }
        console.log('[AUTH] Hashing password...');
        const passwordHash = yield bcryptjs_1.default.hash(password, 10);
        const userRole = role === "Admin" ? "Admin" : "User";
        console.log('[AUTH] Inserting user into DB...');
        db_1.default.run("INSERT INTO users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)", [fullName, email, passwordHash, userRole], function (err) {
            if (err) {
                console.error('[AUTH] DB Error during registration:', err.message);
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({ message: "Email déjà utilisé" });
                }
                return res.status(500).json({ message: "Erreur serveur", error: err.message });
            }
            console.log(`[AUTH] User registered successfully: ${email} (ID: ${this.lastID})`);
            const user = { id: this.lastID, fullName, email, role: userRole };
            const token = generateToken(user);
            return res.status(201).json({
                message: "Inscription réussie",
                token,
                user,
            });
        });
    }
    catch (e) {
        console.error('[AUTH] Catch error during registration:', e.message);
        return res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
});
exports.register = register;
const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Champs manquants" });
    db_1.default.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error('DB Error during login:', err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        if (!row) {
            console.warn(`Login failed: User not found (${email})`);
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
        const ok = yield bcryptjs_1.default.compare(password, row.passwordHash);
        if (!ok) {
            console.warn(`Login failed: Invalid password for ${email}`);
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
        const user = { id: row.id, fullName: row.fullName, email: row.email, role: row.role };
        const token = generateToken(user);
        console.log(`Login successful: ${email}`);
        return res.json({ message: "Connexion réussie", token, user });
    }));
};
exports.login = login;
const getMe = (req, res) => {
    res.json({ message: "OK", user: req.user });
};
exports.getMe = getMe;
const getUsers = (req, res) => {
    db_1.default.all("SELECT id, fullName, email, role, createdAt FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(rows);
    });
};
exports.getUsers = getUsers;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: "Non autorisé" });
    }
    const { fullName, password } = req.body;
    try {
        let query = "UPDATE users SET fullName = COALESCE(?, fullName)";
        const params = [fullName];
        if (password) {
            const hash = yield bcryptjs_1.default.hash(password, 10);
            query += ", passwordHash = ?";
            params.push(hash);
        }
        query += " WHERE id = ?";
        params.push(userId);
        db_1.default.run(query, params, function (err) {
            if (err)
                return res.status(500).json({ message: "Erreur serveur" });
            res.json({ message: "Profil mis à jour" });
        });
    }
    catch (e) {
        res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
});
exports.updateProfile = updateProfile;
