import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate, adminOnly, optionalAuth } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Produtos (Públicos) — se autenticado, inclui partnerPrice; público sem token
router.get('/', optionalAuth, productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/sku/:sku', optionalAuth, productController.getProductBySku);
router.get('/price-sheet', authenticate, adminOnly, productController.downloadPriceSheet);
router.post('/price-sheet/import', authenticate, adminOnly, upload.single('file'), productController.importPriceSheet);
router.get('/:id', optionalAuth, productController.getProductById);

// Produtos (Admin only)
router.post('/', authenticate, adminOnly, productController.createProduct);
router.post('/recalculate-metals', authenticate, adminOnly, productController.recalculateAllMetalPrices);
router.put('/:id', authenticate, adminOnly, productController.updateProduct);
router.delete('/:id', authenticate, adminOnly, productController.deleteProduct);

export default router;
