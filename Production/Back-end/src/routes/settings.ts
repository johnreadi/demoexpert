import express from 'express';
import { SettingsController } from '../controllers/auth.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Routes pour tous les utilisateurs authentifiés
router.get('/', authenticateToken, SettingsController.getAllSettings);
router.get('/:key', authenticateToken, SettingsController.getSetting);

// Routes admin uniquement
router.put('/:key', authenticateToken, requireAdmin, SettingsController.updateSetting);

export default router;
