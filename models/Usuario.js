const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    dni: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    rol: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    foto: { type: DataTypes.STRING, allowNull: true },
    
    // Simplificación: Datos de cuota integrados
    cuota_mes: { type: DataTypes.INTEGER, allowNull: true },
    cuota_anio: { type: DataTypes.INTEGER, allowNull: true },
    cuota_estado: { type: DataTypes.ENUM('paga', 'pendiente', 'vencida'), defaultValue: 'pendiente' },
    cuota_medio: { type: DataTypes.STRING, allowNull: true } // 'efectivo', 'debito', etc.
  }, {
    hooks: {
      // Hook: hashea contraseña antes de crear usuario
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          // Solo hashea si no está ya hasheada (bcrypt)
          if (!usuario.password.startsWith('$2a$') && !usuario.password.startsWith('$2b$')) {
            usuario.password = await bcrypt.hash(usuario.password, 10);
          }
        }
      },
      // Hook: hashea contraseña antes de actualizar (solo si cambió)
      beforeUpdate: async (usuario) => {
        if (usuario.changed('password') && usuario.password) {
          // Solo hashea si no está ya hasheada
          if (!usuario.password.startsWith('$2a$') && !usuario.password.startsWith('$2b$')) {
            usuario.password = await bcrypt.hash(usuario.password, 10);
          }
        }
      }
    }
  });

  return Usuario;
};
