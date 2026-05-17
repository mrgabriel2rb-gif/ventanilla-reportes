import bcrypt from 'bcrypt';
import { Usuario } from '../models/Usuario';

export const seedAdmin = async (): Promise<void> => {
  try {
    // Definimos las credenciales del super administrador
    const adminEmail = 'admin@ventanilla.campeche.gob.mx';
    const adminPassword = 'AdminSeguro2026';

    // 1. Verificamos si el administrador ya existe para no duplicarlo
    const existeAdmin = await Usuario.findOne({ where: { email: adminEmail } });

    if (!existeAdmin) {
      // 2. Encriptamos su contraseña
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // 3. Lo inyectamos en la base de datos con el rol forzado de 'admin'
      await Usuario.create({
        email: adminEmail,
        password: hashedPassword,
        rol: 'admin',
        telefono: '9810000000' // Teléfono institucional de contacto
      });

      console.log('✅ Seeder: Usuario Administrador inyectado exitosamente.');
    } else {
      console.log('⚡ Seeder: El Administrador ya se encontraba registrado.');
    }
  } catch (error) {
    console.error('❌ Error crítico al ejecutar el seeder del administrador:', error);
  }
};