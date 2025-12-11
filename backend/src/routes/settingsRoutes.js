import express from 'express';
import { getMetalPricingConfig, updateMetalPricingConfig } from '../controllers/settingsController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/metal-pricing', protect, adminOnly, getMetalPricingConfig);
router.put('/metal-pricing', protect, adminOnly, updateMetalPricingConfig);

export default router;
