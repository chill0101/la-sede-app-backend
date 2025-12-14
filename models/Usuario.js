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
      // Hashear contraseña antes de crear
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          // Solo hashear si no está ya hasheada (no empieza con $2a$ o $2b$)
          if (!usuario.password.startsWith('$2a$') && !usuario.password.startsWith('$2b$')) {
            usuario.password = await bcrypt.hash(usuario.password, 10);
          }
        }
      },
      // Hashear contraseña antes de actualizar (solo si se cambió)
      beforeUpdate: async (usuario) => {
        if (usuario.changed('password') && usuario.password) {
          // Solo hashear si no está ya hasheada
          if (!usuario.password.startsWith('$2a$') && !usuario.password.startsWith('$2b$')) {
            usuario.password = await bcrypt.hash(usuario.password, 10);
          }
        }
      }
    }
  });

  return Usuario;
};
