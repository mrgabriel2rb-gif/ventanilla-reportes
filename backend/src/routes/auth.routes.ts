import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Definimos la ruta POST para el registro
router.post('/registro', AuthController.registro);

// Definimos la ruta POST para el inicio de sesión
router.post('/login', AuthController.login);

export default router;