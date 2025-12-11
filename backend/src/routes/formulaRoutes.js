import { Router } from 'express';
import { getFormulas, updateFormulas } from '../controllers/formulaController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, adminOnly, getFormulas);
router.put('/', authenticate, adminOnly, updateFormulas);

export default router;
