require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: CORS y parseo de JSON
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api', require('./routes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API Backend La Sede funcionando' });
});

// Inicia servidor y sincroniza BD
async function startServer() {
  try {
    // Sincroniza modelos con la BD (alter: true modifica tablas existentes)
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada con MySQL');
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
}

startServer();
