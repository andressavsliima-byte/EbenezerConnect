import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate, adminOnly, partnerOnly } from '../middleware/auth.js';

const router = express.Router();

// Pedidos
router.post('/', authenticate, partnerOnly, orderController.createOrder);
router.get('/user/my-orders', authenticate, partnerOnly, orderController.getUserOrders);
router.get('/:id', authenticate, orderController.getOrderById);

// Admin
router.get('/', authenticate, adminOnly, orderController.getAllOrders);
router.get('/trash/list', authenticate, adminOnly, orderController.getTrashedOrders);
router.put('/:id', authenticate, adminOnly, orderController.updateOrderStatus);
router.put('/:id/trash', authenticate, adminOnly, orderController.moveToTrash);
router.put('/:id/restore', authenticate, adminOnly, orderController.restoreOrder);
router.delete('/:id', authenticate, adminOnly, orderController.hardDeleteOrder);

export default router;
