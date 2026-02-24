import { Router } from 'express';
import * as bookingsController from '../controllers/bookings.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', bookingsController.getAllBookings);
router.post('/', bookingsController.createBooking);
router.put('/:id', bookingsController.updateBooking);
router.delete('/:id', bookingsController.deleteBooking);
router.patch('/:id/confirm', bookingsController.confirmBooking);

export default router;
