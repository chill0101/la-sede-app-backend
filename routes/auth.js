const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { SECRET_KEY } = require('../middleware/auth');

// POST /register
router.post('/register', async (req, res) => {
  const { nombre, apellido, dni, email, password } = req.body;

  try {
    // Validar campos requeridos
    if (!nombre || !apellido || !dni || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar que el email no esté registrado
    const existeEmail = await Usuario.findOne({ where: { email } });
    if (existeEmail) {
      return res.status(400).json({ message: 'Este email ya está registrado' });
    }

    // Verificar que el DNI no esté registrado
    const existeDni = await Usuario.findOne({ where: { dni } });
    if (existeDni) {
      return res.status(400).json({ message: 'Este DNI ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      dni,
      email,
      password: hashedPassword,
      rol: 'user',
      activo: true
    });

    // Devolver respuesta exitosa (sin la contraseña)
    const usuarioResponse = nuevoUsuario.toJSON();
    delete usuarioResponse.password;

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      user: usuarioResponse
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Comparar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (!user.activo) {
      return res.status(403).json({ message: 'Usuario inactivo. Contacte al administrador.' });
    }
 
    // Generar Token
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    // Devolver datos + token
     res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        cuota: { 
          mes: user.cuota_mes,
          anio: user.cuota_anio,
          estado: user.cuota_estado,
          medio: user.cuota_medio
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
