"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "DWFS_SECRET_KEY_CHANGE_ME";
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
    if (!token)
        return res.status(401).json({ message: "Token manquant" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded; // {id, email, role}
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
}
function adminMiddleware(req, res, next) {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "Admin") {
        return res.status(403).json({ message: "Accès admin requis" });
    }
    next();
}
