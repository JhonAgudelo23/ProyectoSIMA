
--  SIMA - Sistema Inteligente de Monitoreo de Alcantarillado


SET NAMES utf8mb4;
DROP DATABASE IF EXISTS sima;
CREATE DATABASE sima CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sima;

-- Usuarios del sistema (ciudadanos, operarios, técnicos, administradores)
CREATE TABLE usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  rol           ENUM('ciudadano','operario','tecnico','admin') NOT NULL DEFAULT 'ciudadano',
  creado        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Pozos de inspección monitoreados
CREATE TABLE pozos (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  codigo    VARCHAR(10)  NOT NULL UNIQUE,
  nombre    VARCHAR(100) NOT NULL,
  lat       DOUBLE NOT NULL,
  lng       DOUBLE NOT NULL,
  nivel_pct INT NOT NULL DEFAULT 0      -- porcentaje de llenado (0-100)
) ENGINE=InnoDB;

-- Historial de mediciones de los sensores 
CREATE TABLE lecturas (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  pozo_id   INT NOT NULL,
  nivel_pct INT NOT NULL,
  fecha     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pozo_id) REFERENCES pozos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Reportes de problemas hechos por ciudadanos
CREATE TABLE reportes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  lat         DOUBLE NOT NULL,
  lng         DOUBLE NOT NULL,
  tipo        VARCHAR(50) NOT NULL,
  descripcion TEXT,
  estado      ENUM('pendiente','inspeccionado','resuelto') NOT NULL DEFAULT 'pendiente',
  creado      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Seguimiento del operario/técnico
  inspeccionado_por INT NULL,
  inspeccionado_en  DATETIME NULL,
  nota_inspeccion   TEXT NULL,
  resuelto_por      INT NULL,
  resuelto_en       DATETIME NULL,
  nota_resolucion   TEXT NULL,
  FOREIGN KEY (usuario_id)        REFERENCES usuarios(id),
  FOREIGN KEY (inspeccionado_por) REFERENCES usuarios(id),
  FOREIGN KEY (resuelto_por)      REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- ---------------- Datos iniciales ----------------
-- Contraseñas: admin123 y operario123
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Administrador SIMA', 'admin@sima.com',    '$2b$10$TQ583sgbNhIaPm9ABcAEbuhundIkzlH165Y5SOS0VXZ2eGvbSJese', 'admin'),
  ('Operario Demo',      'operario@sima.com', '$2b$10$pYqlmE.ZvQWbJd6q9a8e3ep7ZgQSykTQ9NHBu1CE.hqgg.GFzPIly', 'operario');

-- Zona de ejemplo: centro de Santa Marta (12 pozos)
INSERT INTO pozos (codigo, nombre, lat, lng, nivel_pct) VALUES
  ('P-001', 'Pozo de inspección 1', 11.239000, -74.214300, 20),
  ('P-002', 'Pozo de inspección 2', 11.239000, -74.212100, 35),
  ('P-003', 'Pozo de inspección 3', 11.239000, -74.209900, 15),
  ('P-004', 'Pozo de inspección 4', 11.239000, -74.207700, 82),
  ('P-005', 'Pozo de inspección 5', 11.240800, -74.214300, 45),
  ('P-006', 'Pozo de inspección 6', 11.240800, -74.212100, 60),
  ('P-007', 'Pozo de inspección 7', 11.240800, -74.209900, 25),
  ('P-008', 'Pozo de inspección 8', 11.240800, -74.207700, 90),
  ('P-009', 'Pozo de inspección 9', 11.242600, -74.214300, 30),
  ('P-010', 'Pozo de inspección 10', 11.242600, -74.212100, 55),
  ('P-011', 'Pozo de inspección 11', 11.242600, -74.209900, 18),
  ('P-012', 'Pozo de inspección 12', 11.242600, -74.207700, 72);

-- Comprobación
SELECT * FROM pozos;
SELECT id, nombre, email, rol FROM usuarios;