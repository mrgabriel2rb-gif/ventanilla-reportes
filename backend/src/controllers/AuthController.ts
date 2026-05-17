import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import jwt from 'jsonwebtoken';

export class AuthController {
  
  // Función para registrar un nuevo ciudadano
  public static async registro(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extraemos los datos que envía el usuario (desde Postman o el Frontend)
      const { nombre, email, password, telefono } = req.body;

      // 2. Verificamos si el correo ya existe en la base de datos
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
        return;
      }

      // 3. Encriptamos la contraseña (nunca se guarda en texto plano)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 4. Creamos el nuevo usuario en PostgreSQL
      const nuevoUsuario = await Usuario.create({
        nombre,
        email,
        password: hashedPassword,
        telefono: telefono || null,
        rol: 'ciudadano' // Por defecto, todo registro público es ciudadano
      });

      // 5. Respondemos al cliente con éxito (sin devolver la contraseña)
      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol
        }
      });

    } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al registrar.' });
    }
  }

  // Función para iniciar sesión
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 1. Buscar si el usuario existe en la base de datos
      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario) {
        // Retornamos 401 Unauthorized
        res.status(401).json({ mensaje: 'Credenciales inválidas.' });
        return;
      }

      //console.log("Datos de Postman (req.body):", req.body);
      //console.log("Contraseña de Postman:", password);                //Debuggers
      //console.log("Hash de la Base de Datos:", usuario.password);

      // 2. Verificar que la contraseña coincida
      // bcrypt.compare toma la contraseña plana y el hash de la BD y los evalúa
      const passwordValida = await bcrypt.compare(password, usuario.password);
      
      if (!passwordValida) {
        res.status(401).json({ mensaje: 'Credenciales inválidas.' });
        return;
      }

      // 3. Generar el Token JWT
      // Definimos qué datos viajarán dentro del gafete (Payload)
      const payload = {
        id: usuario.id,
        rol: usuario.rol
      };

      // Firmamos el token con nuestra llave secreta. Expirará en 8 horas.
      const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET as string, 
        { expiresIn: '8h' }
      );

      // 4. Respuesta exitosa entregando el Token
      res.status(200).json({
        mensaje: 'Inicio de sesión exitoso',
        usuario: {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol
        },
        token // <-- Entregamos el token al cliente
      });

    } catch (error) {
      console.error('Error en el login:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al iniciar sesión.' });
    }
  }
}