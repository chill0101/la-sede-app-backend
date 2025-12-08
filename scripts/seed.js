const { sequelize, Usuario, Cancha, Reserva, Clase, Partido, Entrada } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: true }); // Reinicia la base de datos
    console.log('Base de datos reiniciada.');

    // 1. Usuarios
    await Usuario.bulkCreate([
      {
        nombre: 'Admin',
        apellido: 'Club',
        dni: '11111111',
        email: 'admin@aj.com',
        password: 'admin', // TODO: Meter bcrypt para seguridad
        rol: 'admin',
        activo: true,
        cuota_mes: 11,
        cuota_anio: 2025,
        cuota_estado: 'paga',
        cuota_medio: 'efectivo'
      },
      {
        nombre: 'Lucas',
        apellido: 'Socio',
        dni: '22222222',
        email: 'socio@aj.com',
        password: 'socio', // TODO: Meter bcrypt para seguridad
        rol: 'user',
        activo: true,
        cuota_mes: 10,
        cuota_anio: 2025,
        cuota_estado: 'pendiente',
        cuota_medio: null
      }
    ]);
    console.log('Usuarios creados.');

    // 2. Canchas
    await Cancha.bulkCreate([
      { nombre: 'La Paternal 1', tipo: '5', estado: 'ok' },
      { nombre: 'La Paternal 2', tipo: '5', estado: 'ok' },
      { nombre: 'La Paternal 3', tipo: '5', estado: 'ok' }
    ]);
    console.log('Canchas creadas.');

    // 3. Clases
    const clases = await Clase.bulkCreate([
      { disciplina: 'boxeo', diaSemana: 'Lunes', hora: '19:00', cupo: 15 },
      { disciplina: 'natacion', diaSemana: 'Miércoles', hora: '18:00', cupo: 12 }
    ]);
    console.log('Clases creadas.');

    // 4. Partidos
    await Partido.create({
      torneo: 'Liga',
      rival: 'Racing',
      fechaHora: '2025-11-15T19:00:00',
      estadio: 'Diego A. Maradona',
      stockEntradas: 200
    });
    console.log('Partidos creados.');

    console.log('Seed completado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

seed();
