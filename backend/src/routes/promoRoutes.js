import express from 'express';
import * as promoController from '../controllers/promoController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Público
router.get('/', promoController.listPublic);

// Admin
router.get('/all', authenticate, adminOnly, promoController.listAll);
router.post('/', authenticate, adminOnly, promoController.create);
router.put('/:id', authenticate, adminOnly, promoController.update);
router.delete('/:id', authenticate, adminOnly, promoController.remove);

// Upload de imagem associado a um banner (atualiza o registro)
router.post('/:id/upload', authenticate, adminOnly, upload.single('image'), promoController.uploadImageForPromo);

export default router;
