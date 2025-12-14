/*
  Elegimos usar sequelize para la base de datos porque es una librería sencillita que nos facilita el manejo de la base de datos
*/
const { Sequelize } = require('sequelize');

// Configuración de conexión a MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'la_sede_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importa todos los modelos
db.Usuario = require('./Usuario')(sequelize, Sequelize);
db.Cancha = require('./Cancha')(sequelize, Sequelize);
db.Reserva = require('./Reserva')(sequelize, Sequelize);
db.Clase = require('./Clase')(sequelize, Sequelize);
db.Partido = require('./Partido')(sequelize, Sequelize);
db.Entrada = require('./Entrada')(sequelize, Sequelize);

// Define relaciones entre modelos

// Usuario tiene muchas reservas
db.Usuario.hasMany(db.Reserva, { foreignKey: 'userId' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'userId' });

// Cancha tiene muchas reservas
db.Cancha.hasMany(db.Reserva, { foreignKey: 'canchaId' });
db.Reserva.belongsTo(db.Cancha, { foreignKey: 'canchaId' });

// Usuario y Clase: relación muchos a muchos (tabla intermedia: Inscripciones)
db.Usuario.belongsToMany(db.Clase, { through: 'Inscripciones', foreignKey: 'userId' });
db.Clase.belongsToMany(db.Usuario, { through: 'Inscripciones', foreignKey: 'claseId' });

// Partido tiene muchas entradas
db.Partido.hasMany(db.Entrada, { foreignKey: 'partidoId' });
db.Entrada.belongsTo(db.Partido, { foreignKey: 'partidoId' });

// Usuario compra muchas entradas
db.Usuario.hasMany(db.Entrada, { foreignKey: 'userId' });
db.Entrada.belongsTo(db.Usuario, { foreignKey: 'userId' });

module.exports = db;
