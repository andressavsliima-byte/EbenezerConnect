import express from 'express';
import { getAdminStats } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, admin, getAdminStats);

export default router;
