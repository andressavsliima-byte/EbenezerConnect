import express from 'express';
import upload, { getUploadedFileUrl } from '../middleware/upload.js';
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

    const url = getUploadedFileUrl(req, req.file);

    res.json({
      url,
      imageUrl: url,
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

    const url = getUploadedFileUrl(req, req.file);

    res.json({
      url,
      imageUrl: url,
      public_id: req.file.filename,
    });
  }
);

export default router;
