import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { Usuario } from './Usuario'; // Importamos el modelo de Usuario para la relación

export class Reporte extends Model {
  public declare id: number;
  public declare titulo: string;
  public declare descripcion: string;
  public declare estado: 'pendiente' | 'en_proceso' | 'resuelto';
  public declare prioridad: 'baja' | 'media' | 'alta';
  public declare dependencia: string;
  public declare usuarioId: number; // La llave foránea (Foreign Key)

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Reporte.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT, // Usamos TEXT porque las descripciones pueden ser largas
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en_proceso', 'resuelto'),
      defaultValue: 'pendiente', // Todo reporte nace como pendiente
      allowNull: false,
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'media', 'alta'),
      defaultValue: 'media',
      allowNull: false,
    },
    dependencia: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Por asignar',
    },
    // Definimos explícitamente la columna de la llave foránea
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios', // El nombre de la tabla a la que apunta
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'reportes',
    timestamps: true,
  }
);

// --- DEFINICIÓN DE RELACIONES ---
// Un Usuario tiene muchos Reportes
Usuario.hasMany(Reporte, { foreignKey: 'usuarioId', as: 'reportes' });
// Un Reporte pertenece a un Usuario
Reporte.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'ciudadano' });

export default Reporte;