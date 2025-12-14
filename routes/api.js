const express = require('express');
const router = express.Router();
const { Usuario, Cancha, Reserva, Clase, Partido, Entrada } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Op } = require('sequelize');

// Endpoint inicial: carga todos los datos para el frontend
router.get('/init', async (req, res) => {
  try {
    // Carga todas las entidades con sus relaciones
    const usuarios = await Usuario.findAll({ include: [Reserva, Entrada] });
    const canchas = await Cancha.findAll({ include: Reserva });
    const clases = await Clase.findAll({ include: Usuario });
    const partidos = await Partido.findAll();
    const reservas = await Reserva.findAll();
    const entradas = await Entrada.findAll();

    // Retorna todos los datos en un solo objeto
    res.json({
      usuarios,
      canchas,
      reservas,
      clases,
      partidos,
      entradas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /canchas
router.get('/canchas', async (req, res) => {
  const canchas = await Cancha.findAll();
  res.json(canchas);
});

// Endpoint admin: cambia estado de disponibilidad de cancha
router.put('/canchas/:id/toggle', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Requiere admin' });
  const cancha = await Cancha.findByPk(req.params.id);
  // Alterna entre disponible/no disponible
  cancha.estado = cancha.estado === 'disponible' ? 'no disponible' : 'disponible';
  await cancha.save();
  res.json(cancha);
});

// --- RESERVAS ---
router.get('/reservas', async (req, res) => {
  const reservas = await Reserva.findAll();
  res.json(reservas);
});

// Crea nueva reserva de cancha
router.post('/reservas', authenticateToken, async (req, res) => {
  const { canchaId, fecha, horaInicio, horaFin } = req.body;
  try {
    // Valida que no haya solapamiento de horarios
     const solapa = await Reserva.findOne({
      where: {
        canchaId,
        fecha,
        [Op.or]: [
          { horaInicio: { [Op.between]: [horaInicio, horaFin] } },
          { horaFin: { [Op.between]: [horaInicio, horaFin] } }
        ]
      }
    });

    if (solapa) return res.status(400).json({ message: 'Horario no disponible' });

    // Crea la reserva asociada al usuario autenticado
    const reserva = await Reserva.create({
      canchaId,
      userId: req.user.id,
      fecha,
      horaInicio,
      horaFin
    });
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CLASES ---
router.get('/clases', async (req, res) => {
  const clases = await Clase.findAll({ include: Usuario });
  // Devolvemos la estructura completa para que el front pueda mostrar nombres si quiere
  res.json(clases);
});

// Inscribe usuario a una clase
router.post('/clases/:id/inscribir', authenticateToken, async (req, res) => {
  try {
    const clase = await Clase.findByPk(req.params.id, { include: Usuario });
    if (!clase) return res.status(404).json({ message: 'Clase no encontrada' });
    
    // Verifica que haya cupo disponible
    if (clase.Usuarios.length >= clase.cupo) return res.status(400).json({ message: 'Cupo completo' });

    // Agrega usuario a la clase (relación muchos a muchos)
    await clase.addUsuario(req.user.id);
    res.json({ message: 'Inscripto correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/clases/:id/baja', authenticateToken, async (req, res) => {
  try {
    const clase = await Clase.findByPk(req.params.id);
    await clase.removeUsuario(req.user.id);
    res.json({ message: 'Baja exitosa' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PARTIDOS Y ENTRADAS ---
router.get('/partidos', async (req, res) => {
  const partidos = await Partido.findAll();
  res.json(partidos);
});

// Compra entradas para un partido
router.post('/entradas', authenticateToken, async (req, res) => {
  const { partidoId, cantidad } = req.body;
  try {
    const partido = await Partido.findByPk(partidoId);
    // Valida stock disponible
    if (partido.stockEntradas < cantidad) return res.status(400).json({ message: 'Stock insuficiente' });

    // Actualiza stock del partido
    partido.stockEntradas -= cantidad;
    await partido.save();

    // Crea registro de entrada
    const entrada = await Entrada.create({
      partidoId,
      userId: req.user.id,
      cantidad
    });
    res.json(entrada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registra pago de cuota del usuario
router.post('/pagos', authenticateToken, async (req, res) => {
  const { mes, anio, medio } = req.body;
  try {
    const usuario = await Usuario.findByPk(req.user.id);
    // Actualiza estado de cuota
    usuario.cuota_mes = mes;
    usuario.cuota_anio = anio;
    usuario.cuota_estado = 'paga';
    usuario.cuota_medio = medio;
    await usuario.save();
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: sube imagen a Cloudinary y retorna URL
router.post('/upload', authenticateToken, upload.single('foto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }
  // Cloudinary retorna la URL pública en req.file.path
  res.json({ url: req.file.path });
});

// Endpoint: actualiza perfil del usuario (solo su propio perfil)
router.put('/usuarios/:id', authenticateToken, async (req, res) => {
  // Valida que solo pueda editar su propio perfil
  if (parseInt(req.params.id) !== req.user.id) {
    return res.status(403).json({ message: 'No puedes editar otro usuario' });
  }
  try {
    const { nombre, apellido, dni, foto } = req.body;
    const usuario = await Usuario.findByPk(req.user.id);
    
    // Actualiza solo los campos proporcionados
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (dni) usuario.dni = dni;
    if (foto) usuario.foto = foto;

    await usuario.save();
    
    // Retorna usuario actualizado sin contraseña
    const uJSON = usuario.toJSON();
    delete uJSON.password;
    
    res.json(uJSON);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
