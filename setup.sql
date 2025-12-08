-- Archivo de Setup para importar en phpMyAdmin o en xamp como dice Lucas :v
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `la_sede_db`;
USE `la_sede_db`;

-- Tablas (Estructura simplificada basada en Sequelize)

CREATE TABLE IF NOT EXISTS `Usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `apellido` VARCHAR(255) NOT NULL,
  `dni` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `foto` VARCHAR(255),
  `rol` ENUM('admin', 'user') DEFAULT 'user',
  `activo` TINYINT(1) DEFAULT 1,
  `cuota_mes` INT,
  `cuota_anio` INT,
  `cuota_estado` ENUM('paga', 'pendiente', 'vencida') DEFAULT 'pendiente',
  `cuota_medio` VARCHAR(255),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `Canchas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `tipo` VARCHAR(255) NOT NULL,
  `estado` VARCHAR(255) DEFAULT 'ok',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `Clases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `disciplina` VARCHAR(255) NOT NULL,
  `diaSemana` VARCHAR(255) NOT NULL,
  `hora` VARCHAR(255) NOT NULL,
  `cupo` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `Partidos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `torneo` VARCHAR(255) NOT NULL,
  `rival` VARCHAR(255) NOT NULL,
  `fechaHora` DATETIME NOT NULL,
  `estadio` VARCHAR(255) NOT NULL,
  `stockEntradas` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `Reservas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fecha` VARCHAR(255) NOT NULL,
  `horaInicio` VARCHAR(255) NOT NULL,
  `horaFin` VARCHAR(255) NOT NULL,
  `canchaId` INT,
  `userId` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  FOREIGN KEY (`canchaId`) REFERENCES `Canchas`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`userId`) REFERENCES `Usuarios`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `Entradas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cantidad` INT DEFAULT 1,
  `partidoId` INT,
  `userId` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  FOREIGN KEY (`partidoId`) REFERENCES `Partidos`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`userId`) REFERENCES `Usuarios`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `Inscripciones` (
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `userId` INT NOT NULL,
  `claseId` INT NOT NULL,
  PRIMARY KEY (`userId`, `claseId`),
  FOREIGN KEY (`userId`) REFERENCES `Usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`claseId`) REFERENCES `Clases`(`id`) ON DELETE CASCADE
);

-- Datos de Prueba

INSERT INTO `Usuarios` (`id`, `nombre`, `apellido`, `dni`, `email`, `password`, `rol`, `activo`, `cuota_mes`, `cuota_anio`, `cuota_estado`, `cuota_medio`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin', 'Club', '11111111', 'admin@aj.com', 'admin', 'admin', 1, 11, 2025, 'paga', 'efectivo', NOW(), NOW()),
(2, 'Lucas', 'Socio', '22222222', 'socio@aj.com', 'socio', 'user', 1, 10, 2025, 'pendiente', NULL, NOW(), NOW());

INSERT INTO `Canchas` (`nombre`, `tipo`, `estado`, `createdAt`, `updatedAt`) VALUES
('La Paternal 1', '5', 'ok', NOW(), NOW()),
('La Paternal 2', '5', 'ok', NOW(), NOW()),
('La Paternal 3', '5', 'ok', NOW(), NOW());

INSERT INTO `Clases` (`disciplina`, `diaSemana`, `hora`, `cupo`, `createdAt`, `updatedAt`) VALUES
('boxeo', 'Lunes', '19:00', 15, NOW(), NOW()),
('natacion', 'Miércoles', '18:00', 12, NOW(), NOW());

INSERT INTO `Partidos` (`torneo`, `rival`, `fechaHora`, `estadio`, `stockEntradas`, `createdAt`, `updatedAt`) VALUES
('Liga', 'Racing', '2025-11-15 19:00:00', 'Diego A. Maradona', 200, NOW(), NOW());
