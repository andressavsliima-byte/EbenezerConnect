import express from 'express';
import * as messageController from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, messageController.getAdminMessages);
router.get('/user/messages', authenticate, messageController.getUserMessages);
router.get('/unread/count', authenticate, messageController.getUnreadCount);
router.get('/trash', authenticate, messageController.getTrashMessages);
router.put('/:id/read', authenticate, messageController.markAsRead);
router.put('/:id/restore', authenticate, messageController.restoreMessage);
router.delete('/:id/hard', authenticate, messageController.hardDeleteMessage);
router.delete('/:id', authenticate, messageController.deleteMessage);

export default router;
