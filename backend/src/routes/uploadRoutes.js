import express from 'express';
import upload from '../middleware/upload.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Upload de imagem (admin)
router.post(
  '/upload',
  authenticate,
  adminOnly,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    res.json({
      url: req.file.path,       // URL pública do Cloudinary
      public_id: req.file.filename,
    });
  }
);

// Upload de avatar (usuário logado)
router.post(
  '/upload/avatar',
  authenticate,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    res.json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  }
);

export default router;
