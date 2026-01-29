import express from 'express';
import multer from 'multer';
import * as productController from '../controllers/productController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Configurar multer para upload de Excel em memória
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  ];
  const allowedExts = ['.xls', '.xlsx'];
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  
  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos Excel (.xls, .xlsx) são permitidos'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Produtos (Públicos) — se autenticado, inclui partnerPrice
router.get('/', authenticate, productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', authenticate, productController.getProductById);

// Produtos (Admin only)
router.post('/', authenticate, adminOnly, productController.createProduct);
router.post('/recalculate-metals', authenticate, adminOnly, productController.recalculateAllMetalPrices);
router.post('/import-prices', authenticate, adminOnly, upload.single('file'), productController.importPricesFromSpreadsheet);
router.put('/:id', authenticate, adminOnly, productController.updateProduct);
router.delete('/:id', authenticate, adminOnly, productController.deleteProduct);

export default router;
