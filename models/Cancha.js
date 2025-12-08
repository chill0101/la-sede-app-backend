module.exports = (sequelize, DataTypes) => {
  const Cancha = sequelize.define('Cancha', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.STRING, allowNull: false }, // '5', '7', '11'
    estado: { type: DataTypes.STRING, defaultValue: 'ok' } // 'ok', 'mantenimiento'
  });

  return Cancha;
};
