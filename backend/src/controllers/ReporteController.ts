import { Request, Response } from 'express';
import Reporte from '../models/Reporte';
import Usuario from '../models/Usuario';
import { CustomRequest } from '../middlewares/auth.middleware';

export class ReporteController {
  
  // 1. Crear un nuevo reporte (Ciudadano)
  public static async crearReporte(req: CustomRequest, res: Response): Promise<void> {
    try {
      // 1. Ya NO extraemos el usuarioId del req.body
      const { titulo, descripcion } = req.body;
      
      // 2. Lo extraemos de forma segura del token decodificado por el middleware
      const usuarioId = req.usuario.id; 

      const nuevoReporte = await Reporte.create({
        titulo,
        descripcion,
        usuarioId, // Se asigna automáticamente con el ID real del token
      });

      res.status(201).json({
        mensaje: 'Reporte levantado exitosamente',
        reporte: nuevoReporte
      });
    } catch (error) {
      console.error('Error al crear el reporte:', error);
      res.status(500).json({ mensaje: 'Error interno al generar el reporte.' });
    }
  }

  // 2. Obtener todos los reportes (Administrador)
  public static async obtenerReportes(req: CustomRequest, res: Response): Promise<void> {
    try {
      // Usamos findAll y le decimos que 'incluya' los datos del ciudadano que lo creó
      const reportes = await Reporte.findAll({
        include: [
          {
            model: Usuario,
            as: 'ciudadano',
            attributes: ['id', 'nombre', 'email', 'telefono'] // Ocultamos la contraseña por seguridad
          }
        ],
        order: [['createdAt', 'DESC']] // Los más recientes primero
      });

      res.status(200).json({ reportes });
    } catch (error) {
      console.error('Error al obtener los reportes:', error);
      res.status(500).json({ mensaje: 'Error interno al consultar los reportes.' });
    }
  }

  // 3. Actualizar un reporte (Solo Administrador)
  public static async actualizarReporte(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado, prioridad, dependencia } = req.body;

      // Convertimos el ID de la URL (string) a un número entero (base 10)
      const idNumero = parseInt(id as string, 10);

      // Si el usuario pone letras en la URL (ej. /actualizar/hola), parseInt devuelve NaN
      if (isNaN(idNumero)) {
        res.status(400).json({ mensaje: 'El ID proporcionado no es válido.' });
        return;
      }

      // Ahora pasamos el número seguro a Sequelize
      const reporte = await Reporte.findByPk(idNumero);

      if (!reporte) {
        res.status(404).json({ mensaje: 'Reporte no encontrado.' });
        return;
      }

      await reporte.update({
        estado: estado || reporte.estado,
        prioridad: prioridad || reporte.prioridad,
        dependencia: dependencia || reporte.dependencia
      });

      res.status(200).json({
        mensaje: 'Reporte actualizado correctamente.',
        reporte
      });
    } catch (error) {
      console.error('Error al actualizar:', error);
      res.status(500).json({ mensaje: 'Error interno al actualizar el reporte.' });
    }
  }

  // 4. Eliminar un reporte (Solo Administrador)
  public static async eliminarReporte(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Aplicamos la misma conversión y validación
      const idNumero = parseInt(id as string, 10);

      if (isNaN(idNumero)) {
        res.status(400).json({ mensaje: 'El ID proporcionado no es válido.' });
        return;
      }

      const reporte = await Reporte.findByPk(idNumero);

      if (!reporte) {
        res.status(404).json({ mensaje: 'Reporte no encontrado.' });
        return;
      }

      await reporte.destroy();

      res.status(200).json({ mensaje: 'Reporte eliminado correctamente.' });
    } catch (error) {
      console.error('Error al eliminar:', error);
      res.status(500).json({ mensaje: 'Error interno al eliminar el reporte.' });
    }
  }
}