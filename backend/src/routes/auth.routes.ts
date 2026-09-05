import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

/**
 * Rutas de Autenticacion
 * Base: /api/auth
 */

// POST /api/auth/register -> Crea un usuario nuevo
router.post('/register', AuthController.register);

// POST /api/auth/login -> Inicia sesion 
router.post('/login', AuthController.login);

// POST /api/auth/logout -> Cierra sesion (borra cookie)
router.post('/logout', AuthController.logout);

// GET /api/auth/me -> Devuelve el usuario autenticado (requiere token)
router.get('/me', authenticateToken, AuthController.me);

export default router;
