module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    fecha: { type: DataTypes.STRING, allowNull: false }, // Format: YYYY-MM-DD
    horaInicio: { type: DataTypes.STRING, allowNull: false }, // Format: HH:MM
    horaFin: { type: DataTypes.STRING, allowNull: false }, // Format: HH:MM
    // userId y canchaId se agregan automáticamente
  });

  return Reserva;
};
