const express = require('express');
const router = express.Router();
const { Usuario, Cancha, Reserva, Clase, Partido, Entrada } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Op } = require('sequelize');

// GET /init
router.get('/init', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ include: [Reserva, Entrada] });
    const canchas = await Cancha.findAll({ include: Reserva });
    const clases = await Clase.findAll({ include: Usuario });
    const partidos = await Partido.findAll();
    const reservas = await Reserva.findAll();
    const entradas = await Entrada.findAll();

    // Formatear para que coincida con lo que espera el seed del frontend
    // (Esta es una adaptación rápida para no reescribir todo el frontend)
    res.json({
      usuarios: usuarios || [],
      canchas: canchas || [],
      reservas: reservas || [],
      clases: clases || [],
      partidos: partidos || [],
      entradas: entradas || []
    });
  } catch (error) {
    console.error('Error en /init:', error);
    res.status(500).json({ 
      error: error.message,
      usuarios: [],
      canchas: [],
      reservas: [],
      clases: [],
      partidos: [],
      entradas: []
    });
  }
});

// GET /canchas
router.get('/canchas', async (req, res) => {
  const canchas = await Cancha.findAll();
  res.json(canchas);
});

// PUT /canchas/:id/toggle -- Admin
router.put('/canchas/:id/toggle', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Requiere admin' });
  const cancha = await Cancha.findByPk(req.params.id);
  cancha.estado = cancha.estado === 'disponible' ? 'no disponible' : 'disponible';
  await cancha.save();
  res.json(cancha);
});

// --- RESERVAS ---
router.get('/reservas', async (req, res) => {
  const reservas = await Reserva.findAll();
  res.json(reservas);
});

router.post('/reservas', authenticateToken, async (req, res) => {
  const { canchaId, fecha, horaInicio, horaFin } = req.body;
  try {
    // Validar solapamiento
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

router.post('/clases/:id/inscribir', authenticateToken, async (req, res) => {
  try {
    const clase = await Clase.findByPk(req.params.id, { include: Usuario });
    if (!clase) return res.status(404).json({ message: 'Clase no encontrada' });
    
    if (clase.Usuarios.length >= clase.cupo) return res.status(400).json({ message: 'Cupo completo' });

    // Sequelize magic method
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

router.post('/entradas', authenticateToken, async (req, res) => {
  const { partidoId, cantidad } = req.body;
  try {
    const partido = await Partido.findByPk(partidoId);
    if (partido.stockEntradas < cantidad) return res.status(400).json({ message: 'Stock insuficiente' });

    partido.stockEntradas -= cantidad;
    await partido.save();

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

// --- USUARIOS (Pagos) ---
router.post('/pagos', authenticateToken, async (req, res) => {
  const { mes, anio, medio } = req.body;
  try {
    const usuario = await Usuario.findByPk(req.user.id);
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

// --- UPLOAD ---
router.post('/upload', authenticateToken, upload.single('foto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }
  // Cloudinary devuelve la URL en req.file.path
  res.json({ url: req.file.path });
});

// --- USUARIO (Update profile) ---
router.put('/usuarios/:id', authenticateToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) {
    return res.status(403).json({ message: 'No puedes editar otro usuario' });
  }
  try {
    const { nombre, apellido, dni, foto } = req.body;
    const usuario = await Usuario.findByPk(req.user.id);
    
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (dni) usuario.dni = dni;
    if (foto) usuario.foto = foto;

    await usuario.save();
    
    // Devolver usuario actualizado (sin pass)
    const uJSON = usuario.toJSON();
    delete uJSON.password;
    
    res.json(uJSON);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN: USUARIOS ---
// PUT /usuarios/:id/admin - Admin puede actualizar cualquier usuario
router.put('/usuarios/:id/admin', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Requiere rol de admin' });
  }
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { nombre, apellido, email, rol, activo } = req.body;
    
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (email) usuario.email = email;
    if (rol) usuario.rol = rol;
    if (typeof activo === 'boolean') usuario.activo = activo;

    await usuario.save();
    
    const uJSON = usuario.toJSON();
    delete uJSON.password;
    
    res.json(uJSON);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /usuarios/:id - Admin puede eliminar usuarios
router.delete('/usuarios/:id', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Requiere rol de admin' });
  }
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // No permitir eliminarse a sí mismo
    if (usuario.id === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    }

    await usuario.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN: CLASES ---
// POST /clases - Admin puede crear clases
router.post('/clases', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Requiere rol de admin' });
  }
  try {
    const { disciplina, diaSemana, hora, cupo } = req.body;
    
    if (!disciplina || !diaSemana || !hora || !cupo) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const clase = await Clase.create({
      disciplina,
      diaSemana,
      hora,
      cupo: parseInt(cupo)
    });

    res.status(201).json(clase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN: PARTIDOS ---
// POST /partidos - Admin puede crear partidos
router.post('/partidos', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Requiere rol de admin' });
  }
  try {
    const { rival, fechaHora, stockEntradas, torneo, estadio } = req.body;
    
    if (!rival || !fechaHora || stockEntradas === undefined) {
      return res.status(400).json({ message: 'Rival, fechaHora y stockEntradas son obligatorios' });
    }

    const partido = await Partido.create({
      torneo: torneo || 'Liga',
      rival,
      fechaHora,
      estadio: estadio || 'Diego A. Maradona',
      stockEntradas: parseInt(stockEntradas)
    });

    res.status(201).json(partido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
