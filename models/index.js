/*
  Elegimos usar sequelize para la base de datos porque es una librería sencillita que nos facilita el manejo de la base de datos
*/
const { Sequelize } = require('sequelize');

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

// Importar modelos
db.Usuario = require('./Usuario')(sequelize, Sequelize);
db.Cancha = require('./Cancha')(sequelize, Sequelize);
db.Reserva = require('./Reserva')(sequelize, Sequelize);
db.Clase = require('./Clase')(sequelize, Sequelize);
db.Partido = require('./Partido')(sequelize, Sequelize);
db.Entrada = require('./Entrada')(sequelize, Sequelize);

// Relaciones

// 1. Usuario - Reserva (Un usuario tiene muchas reservas)
db.Usuario.hasMany(db.Reserva, { foreignKey: 'userId' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'userId' });

// 2. Cancha - Reserva (Una cancha tiene muchas reservas)
db.Cancha.hasMany(db.Reserva, { foreignKey: 'canchaId' });
db.Reserva.belongsTo(db.Cancha, { foreignKey: 'canchaId' });

// 3. Usuario - Clase (Muchos a Muchos: Inscripciones)
db.Usuario.belongsToMany(db.Clase, { through: 'Inscripciones', foreignKey: 'userId' });
db.Clase.belongsToMany(db.Usuario, { through: 'Inscripciones', foreignKey: 'claseId' });

// 4. Partido - Entrada (Un partido tiene muchas entradas vendidas)
db.Partido.hasMany(db.Entrada, { foreignKey: 'partidoId' });
db.Entrada.belongsTo(db.Partido, { foreignKey: 'partidoId' });

// 5. Usuario - Entrada (Un usuario compra muchas entradas)
db.Usuario.hasMany(db.Entrada, { foreignKey: 'userId' });
db.Entrada.belongsTo(db.Usuario, { foreignKey: 'userId' });

module.exports = db;
