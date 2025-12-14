const jwt = require('jsonwebtoken');

// Clave secreta para firmar tokens JWT
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key';

// Middleware: Verifica token JWT en headers
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Extrae token del formato "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  // Verifica y decodifica token, agrega user al request
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, SECRET_KEY };
