import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import path from 'path';
import fs from 'fs';

const resolveUploadsDir = () => {
  if (process.env.UPLOAD_DIR) return path.resolve(process.env.UPLOAD_DIR);
  if (process.env.NODE_ENV === 'production') return '/tmp/uploads';
  return path.resolve(process.cwd(), 'uploads');
};

const uploadsDir = resolveUploadsDir();
fs.mkdirSync(uploadsDir, { recursive: true });

const cloudinaryEnabled =
  Boolean(process.env.CLOUDINARY_URL) ||
  (Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET));

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ebenezer/uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = path.basename(file.originalname || 'image', ext).replace(/[^a-zA-Z0-9-_]/g, '-');
    cb(null, `${base || 'image'}-${timestamp}-${random}${ext || '.jpg'}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Apenas imagens JPEG, PNG e WebP são permitidas'), false);
};

const MAX_FILE_SIZE = process.env.MAX_UPLOAD_SIZE
  ? parseInt(process.env.MAX_UPLOAD_SIZE, 10)
  : 20 * 1024 * 1024;

const upload = multer({
  storage: cloudinaryEnabled ? cloudinaryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: Number.isFinite(MAX_FILE_SIZE) ? MAX_FILE_SIZE : 20 * 1024 * 1024 }
});

export const getUploadedFileUrl = (req, file) => {
  if (!file) return '';

  // Cloudinary retorna URL HTTPS pronta em file.path
  if (cloudinaryEnabled && file.path && /^https?:\/\//i.test(file.path)) {
    return file.path;
  }

  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${file.filename}`;
};

export default upload;
