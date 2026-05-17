import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos la interfaz Request de Express para poder inyectarle nuestro usuario
export interface CustomRequest extends Request {
  usuario?: any;
}

export const verificarToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    // 1. Extraer el token de los headers (formato: "Bearer eyJhbGci...")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar que el token sea válido y no haya sido alterado
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // 3. Pegar los datos decodificados (id, rol) a la petición para que el controlador los use
    req.usuario = decoded;

    // 4. Dejarlo pasar al siguiente proceso (el controlador)
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};

export const requerirRol = (rolRequerido: 'ciudadano' | 'admin') => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    // Verificamos que exista el usuario en la petición y que su rol coincida
    if (!req.usuario || req.usuario.rol !== rolRequerido) {
      res.status(403).json({ mensaje: 'Acceso denegado. No tienes los permisos necesarios para esta acción.' });
      return;
    }
    
    // Si tiene el rol correcto, lo dejamos pasar
    next();
  };
};