const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { SECRET_KEY } = require('../middleware/auth');

// Endpoint de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca usuario por email
    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verifica si la contraseña está hasheada (bcrypt)
    const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    
    let passwordMatch = false;
    
    if (isPasswordHashed) {
      // Compara contraseña hasheada
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Migración: hashea contraseñas antiguas en texto plano
      passwordMatch = user.password === password;
      if (passwordMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({ password: hashedPassword });
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verifica si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({ message: 'Usuario inactivo. Contacte al administrador.' });
    }
 
    // Genera token JWT con datos del usuario (expira en 2h)
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
