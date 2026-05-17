import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Creamos la conexión dependiendo de si estamos en la nube o en local
const db = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true, // Render exige SSL
          rejectUnauthorized: false // Evita errores de certificados autofirmados
        }
      },
      logging: false // Para que no llene la consola de Render con mensajes de SQL
    })
  : new Sequelize(
      process.env.DB_NAME || 'ventanilla',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'tu_contraseña_local',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false
      }
    );

export default db;