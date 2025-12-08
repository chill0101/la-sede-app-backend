const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { SECRET_KEY } = require('../middleware/auth');

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (user.password !== password) {
      // TODO: Meterr bcrypt.compare(password, user.password)
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
