module.exports = (sequelize, DataTypes) => {
  const Entrada = sequelize.define('Entrada', {
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  });
  return Entrada;
};
