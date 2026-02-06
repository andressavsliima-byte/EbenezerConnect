import express from 'express';
import upload from '../middleware/upload.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Upload de imagem de produto (admin)
router.post(
  '/upload',
  authenticate,
  adminOnly,
  upload.single('image'),
  (req, res) => {
    res.json({
      url: req.file.path,        // URL pública Cloudinary
      public_id: req.file.filename
    });
  }
);

// Upload de avatar (qualquer usuário autenticado)
router.post(
  '/upload/avatar',
  authenticate,
  upload.single('image'),
  (req, res) => {
    res.json({
      url: req.file.path,
      public_id: req.file.filename
    });
  }
);

// ❌ DELETE LOCAL NÃO EXISTE MAIS
// Cloudinary exige API própria para delete
// (implementamos depois se quiser)

export default router;

