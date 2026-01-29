import express from 'express';
import * as messageController from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, messageController.getAdminMessages);
router.get('/user/messages', authenticate, messageController.getUserMessages);
router.get('/unread/count', authenticate, messageController.getUnreadCount);
router.put('/:id/read', authenticate, messageController.markAsRead);
router.delete('/:id', authenticate, messageController.deleteMessage);

export default router;
