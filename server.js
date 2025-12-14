require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'API Backend La Sede funcionando' });
});

// Start Server + Sync DB
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // No usar alter: true para evitar problemas con demasiados índices
    // Las tablas ya deberían estar creadas
    // Si necesitas recrear las tablas, usa: await sequelize.sync({ force: true })
    // await sequelize.sync({ alter: false }); // No alterar tablas existentes
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
