-- ============================================================
-- SCRIPT COMPLETO DE BASE DE DATOS: SIMA
-- Sistema de Monitoreo de Alcantarillado
-- ============================================================

CREATE DATABASE IF NOT EXISTS `sima` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sima`;

-- Eliminar tablas en orden por restricciones de llaves foráneas
DROP TABLE IF EXISTS `lecturas`;
DROP TABLE IF EXISTS `reportes`;
DROP TABLE IF EXISTS `pozos`;
DROP TABLE IF EXISTS `usuarios`;

-- ------------------------------------------------------------
-- 1. Tabla: usuarios
-- ------------------------------------------------------------
CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('ciudadano', 'operario', 'admin') NOT NULL DEFAULT 'ciudadano',
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Tabla: pozos
-- ------------------------------------------------------------
CREATE TABLE `pozos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(20) NOT NULL UNIQUE,
  `ubicacion` VARCHAR(255) NOT NULL,
  `latitud` DECIMAL(10, 8) NOT NULL,
  `longitud` DECIMAL(11, 8) NOT NULL,
  `nivel_pct` INT NOT NULL DEFAULT 0,
  `profundidad_m` DECIMAL(4,2) DEFAULT 3.50,
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Tabla: lecturas (Histórico de sensores IoT)
-- ------------------------------------------------------------
CREATE TABLE `lecturas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pozo_id` INT NOT NULL,
  `nivel_pct` INT NOT NULL,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pozo_id`) REFERENCES `pozos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Tabla: reportes (Incidencias ciudadanas)
-- ------------------------------------------------------------
CREATE TABLE `reportes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `lat` DECIMAL(10, 8) NOT NULL,
  `lng` DECIMAL(11, 8) NOT NULL,
  `tipo` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `evidencia` LONGTEXT DEFAULT NULL,
  `estado` ENUM('pendiente', 'inspeccionado', 'resuelto') NOT NULL DEFAULT 'pendiente',
  `fecha_reporte` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `inspeccionado_por` INT DEFAULT NULL,
  `inspeccionado_en` DATETIME DEFAULT NULL,
  `nota_inspeccion` TEXT DEFAULT NULL,
  `resuelto_por` INT DEFAULT NULL,
  `resuelto_en` DATETIME DEFAULT NULL,
  `nota_resolucion` TEXT DEFAULT NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inspeccionado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`resuelto_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERCIÓN DE DATOS INICIALES DE PRUEBA
-- ============================================================

-- Usuarios Semilla
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`) VALUES
(1, 'Administrador SIMA', 'admin@sima.com', 'admin123', 'admin'),
(2, 'Operario de Campo', 'operario@sima.com', 'operario123', 'operario'),
(3, 'Jhon Agudelo', 'ciudadano@sima.com', 'ciudadano123', 'ciudadano');

-- Pozos de Telemetría (Santa Marta)
INSERT INTO `pozos` (`id`, `codigo`, `ubicacion`, `latitud`, `longitud`, `nivel_pct`, `profundidad_m`) VALUES
(1, 'PZ-001', 'Av. El Libertador #15', 11.24080000, -74.21100000, 35, 3.50),
(2, 'PZ-002', 'Centro Histórico Cr 3', 11.24500000, -74.21300000, 65, 4.00),
(3, 'PZ-003', 'Rodadero Cl 8', 11.20100000, -74.22800000, 82, 3.20),
(4, 'PZ-004', 'Bello Horizonte', 11.15500000, -74.23000000, 20, 3.80);

-- Lecturas Iniciales
INSERT INTO `lecturas` (`pozo_id`, `nivel_pct`) VALUES
(1, 35), (2, 65), (3, 82), (4, 20);