module.exports = (sequelize, DataTypes) => {
  const Clase = sequelize.define('Clase', {
    disciplina: { type: DataTypes.STRING, allowNull: false },
    diaSemana: { type: DataTypes.STRING, allowNull: false },
    hora: { type: DataTypes.STRING, allowNull: false },
    cupo: { type: DataTypes.INTEGER, allowNull: false },
  });
  return Clase;
};
