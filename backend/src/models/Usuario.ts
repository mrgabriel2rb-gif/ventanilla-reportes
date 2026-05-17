import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Usuario extends Model {
  public declare id: number;
  public declare nombre: string | null;
  public declare email: string;
  public declare password: string;
  public declare telefono: string | null;
  public declare rol: 'ciudadano' | 'admin';
  
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true, // Lo dejamos en 'true' para no romper los usuarios de prueba que ya creaste
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true, // Es opcional, como lo definimos en el alcance
    },
    rol: {
      type: DataTypes.ENUM('ciudadano', 'admin'),
      allowNull: false,
      defaultValue: 'ciudadano',
    },
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: true, // Crea las columnas createdAt y updatedAt
  }
);

export default Usuario;