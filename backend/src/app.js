import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import formulaRoutes from './routes/formulaRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import partnerLevelRoutes from './routes/partnerLevelRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pasta de uploads configurável (usa /tmp em ambientes serverless)
const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ebenezer-connect')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Erro ao conectar MongoDB:', err));

// Rotas API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', uploadRoutes);
app.use('/api/formulas', formulaRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/partner-levels', partnerLevelRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Servir frontend build (SPA) se existir
const primaryDist = path.join(__dirname, '../../frontend/dist');
const altDist = '/frontend/dist';
const frontendDist = fs.existsSync(primaryDist)
  ? primaryDist
  : (fs.existsSync(altDist) ? altDist : null);

if (frontendDist) {
  app.use(express.static(frontendDist));
  // Fallback para rotas não-API
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handler for uploads and other errors
app.use((err, req, res, next) => {
  // Multer file size limit
  if (err && (err.code === 'LIMIT_FILE_SIZE' || err.message?.includes('File too large'))) {
    return res.status(413).json({ message: 'Arquivo muito grande. Tamanho máximo permitido: ' + (process.env.MAX_UPLOAD_SIZE ? `${process.env.MAX_UPLOAD_SIZE} bytes` : '20 MB') });
  }

  // Multer generic errors
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: err.message || 'Erro interno do servidor' });
  }

  next();
});

export default app;
