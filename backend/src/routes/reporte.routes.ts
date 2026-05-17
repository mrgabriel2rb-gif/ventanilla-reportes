import { Router } from 'express';
import { ReporteController } from '../controllers/ReporteController';
import { verificarToken, requerirRol } from '../middlewares/auth.middleware'; // Importamos el supervisor

const router = Router();

// --- Rutas del Ciudadano ---
router.post('/crear', verificarToken, ReporteController.crearReporte);

// --- Rutas Generales (Opcionalmente podrías restringir esto también) ---
router.get('/todos', verificarToken, ReporteController.obtenerReportes);

// --- Rutas Exclusivas del Administrador ---
// Usamos PUT para actualizar y DELETE para borrar. 
// Nota la cadena de seguridad: Primero verificamos el token, LUEGO exigimos el rol 'admin'.
router.put('/actualizar/:id', verificarToken, requerirRol('admin'), ReporteController.actualizarReporte);
router.delete('/eliminar/:id', verificarToken, requerirRol('admin'), ReporteController.eliminarReporte);

export default router;