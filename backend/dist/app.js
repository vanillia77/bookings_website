"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Routes
const bookings_routes_1 = __importDefault(require("./routes/bookings.routes"));
app.use('/api', auth_routes_1.default); // Auth routes at /api/login, etc.
app.use('/api/bookings', bookings_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running TS ✅' });
});
exports.default = app;
