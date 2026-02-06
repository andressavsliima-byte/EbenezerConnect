import express from 'express';
import upload from '../middleware/upload.js';
import * as uploadController from '../controllers/uploadController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Upload de imagem (admin)
router.post(
  '/upload',
  authenticate,
  adminOnly,
  upload.single('image'),
  uploadController.uploadImage
);

// Upload de avatar (usuário logado)
router.post(
  '/upload/avatar',
  authenticate,
  upload.single('image'),
  uploadController.uploadImage
);

export default router;
