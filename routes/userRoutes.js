import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Autenticação
router.post('/register', userController.register);
router.post('/login', userController.login);

// Perfil do usuário autenticado
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Usuários (Admin only)
router.get('/', authenticate, adminOnly, userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.put('/:id/active', authenticate, adminOnly, userController.setActiveStatus);
router.delete('/:id', authenticate, adminOnly, userController.deactivateUser);

export default router;
