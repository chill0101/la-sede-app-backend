module.exports = (sequelize, DataTypes) => {
  const Partido = sequelize.define('Partido', {
    torneo: { type: DataTypes.STRING, allowNull: false },
    rival: { type: DataTypes.STRING, allowNull: false },
    fechaHora: { type: DataTypes.DATE, allowNull: false }, 
    estadio: { type: DataTypes.STRING, allowNull: false },
    stockEntradas: { type: DataTypes.INTEGER, allowNull: false },
  });
  return Partido;
};
