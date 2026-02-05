import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.get('/users', authMiddleware, adminMiddleware, authController.getUsers);
router.put('/profile', authMiddleware, authController.updateProfile);

export default router;
