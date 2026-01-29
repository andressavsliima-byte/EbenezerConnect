import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Produtos (Públicos) — se autenticado, inclui partnerPrice
router.get('/', authenticate, productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', authenticate, productController.getProductById);

// Produtos (Admin only)
router.post('/', authenticate, adminOnly, productController.createProduct);
router.post('/recalculate-metals', authenticate, adminOnly, productController.recalculateAllMetalPrices);
router.put('/:id', authenticate, adminOnly, productController.updateProduct);
router.delete('/:id', authenticate, adminOnly, productController.deleteProduct);

export default router;
