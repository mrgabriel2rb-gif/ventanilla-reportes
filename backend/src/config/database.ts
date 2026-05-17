import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: Number(process.env.DB_PORT),
    logging: false, // Cambiar a true si deseas ver las consultas SQL en la terminal
  }
);

export default sequelize;