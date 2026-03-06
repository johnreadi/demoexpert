import express from 'express';
import { AuthController } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Routes protégées
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword);

export default router;
