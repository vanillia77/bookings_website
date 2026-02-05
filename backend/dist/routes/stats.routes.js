"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stats_controller_1 = require("../controllers/stats.controller");
const router = express_1.default.Router();
router.get('/summary', stats_controller_1.getGeneralStats);
router.get('/calendar', stats_controller_1.getCalendarEvents);
exports.default = router;
