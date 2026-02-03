import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { listLevels, createLevel, updateLevel, deleteLevel } from '../controllers/partnerLevelController.js';

const router = express.Router();

router.get('/', authenticate, adminOnly, listLevels);
router.post('/', authenticate, adminOnly, createLevel);
router.put('/:id', authenticate, adminOnly, updateLevel);
router.delete('/:id', authenticate, adminOnly, deleteLevel);

export default router;
