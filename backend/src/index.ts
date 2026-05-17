import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import './models/Usuario';
import './models/Reporte';
import authRoutes from './routes/auth.routes';
import reporteRoutes from './routes/reporte.routes';

// 1. Importamos el seeder
import { seedAdmin } from './seeders/adminSeeder';

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reportes', reporteRoutes);

const arrancarServidor = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a PostgreSQL establecida correctamente.');
    
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');

    // 2. Ejecutamos el seeder después de asegurar que las tablas existen
    await seedAdmin();

    app.listen(port, () => {
      console.log(`Servidor de Ventanilla de Reportes en ejecucion en el puerto ${port}`);
    });
  } catch (error) {
    console.error('Error critico: No se pudo conectar a la base de datos.', error);
    process.exit(1);
  }
};

arrancarServidor();