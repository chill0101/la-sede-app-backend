const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key'; // fallback_secret_key es el fallback para dev pero se tiene que usar el secret_key del .env

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Formato: "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, SECRET_KEY };
