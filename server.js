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
    // alter table
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
