import express from 'express';
import * as promoController from '../controllers/promoController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer localmente para este route (mesma configuração do uploadRoutes)
const uploadsDir = process.env.UPLOAD_DIR
	? path.resolve(process.env.UPLOAD_DIR)
	: path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadsDir),
	filename: (req, file, cb) => {
		const timestamp = Date.now();
		const random = Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const name = path.basename(file.originalname, ext);
		cb(null, `${name}-${timestamp}-${random}${ext}`);
	}
});

const fileFilter = (req, file, cb) => {
	const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	if (allowedMimes.includes(file.mimetype)) cb(null, true);
	else cb(new Error('Apenas imagens JPEG, PNG, GIF e WebP são permitidas'), false);
};

const MAX_FILE_SIZE = process.env.MAX_UPLOAD_SIZE ? parseInt(process.env.MAX_UPLOAD_SIZE, 10) : 20 * 1024 * 1024;
const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

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
