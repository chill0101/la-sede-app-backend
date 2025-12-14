const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configuración de Cloudinary para almacenar imágenes
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de almacenamiento: sube a Cloudinary en carpeta 'la-sede-app'
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'la-sede-app',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// Middleware de multer para subir archivos
const upload = multer({ storage: storage });

module.exports = upload;
