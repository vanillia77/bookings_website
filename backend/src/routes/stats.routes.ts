import express from 'express';
import { getGeneralStats, getCalendarEvents } from '../controllers/stats.controller';

const router = express.Router();

router.get('/summary', getGeneralStats);
router.get('/calendar', getCalendarEvents);

export default router;
