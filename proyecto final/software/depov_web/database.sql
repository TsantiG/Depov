-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS emergency_alert_system2;
USE emergency_alert_system2;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  document VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(200) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'police') NOT NULL DEFAULT 'user',
  contact1_name VARCHAR(100) NOT NULL,
  contact1_phone VARCHAR(20) NOT NULL,
  contact2_name VARCHAR(100) NOT NULL,
  contact2_phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de estaciones de policía (CAIs)
CREATE TABLE IF NOT EXISTS police_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  status ENUM('pendiente', 'atendida') NOT NULL DEFAULT 'pendiente',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de asignaciones de alertas a estaciones de policía
CREATE TABLE IF NOT EXISTS alert_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_id INT NOT NULL,
  police_station_id INT NOT NULL,
  distance DECIMAL(10, 2) NOT NULL, -- Distancia en kilómetros
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
  FOREIGN KEY (police_station_id) REFERENCES police_stations(id)
);

-- Insertar datos de ejemplo para usuarios
INSERT INTO users (name, document, email, phone, address, password, role, contact1_name, contact1_phone, contact2_name, contact2_phone)
VALUES 
('Juan Pérez', '1234567890', 'juan@example.com', '3001234567', 'Calle 10 #30-45, Medellín', 'password123', 'user', 'María Pérez', '3009876543', 'Carlos Pérez', '3005678901'),
('Admin', '0987654321', 'admin@example.com', '3001112233', 'Calle 50 #40-30, Medellín', 'admin123', 'admin', 'Contact 1', '3001234567', 'Contact 2', '3007654321'),
('Oficial García', '5678901234', 'policia@example.com', '3004445566', 'Estación Central, Medellín', 'policia123', 'police', 'Contact 1', '3001234567', 'Contact 2', '3007654321');

-- Insertar datos de ejemplo para estaciones de policía (CAIs)
INSERT INTO police_stations (name, address, latitude, longitude, phone)
VALUES 
('CAI Centro', 'Carrera 50 #45-67, Medellín', 6.2476, -75.5658, '6045112233'),
('CAI Poblado', 'Calle 10 #43-12, Medellín', 6.2107, -75.5696, '6045223344'),
('CAI Laureles', 'Circular 73 #39-22, Medellín', 6.2450, -75.5926, '6045334455'),
('CAI Belén', 'Calle 30 #76-22, Medellín', 6.2342, -75.6068, '6045445566'),
('CAI Robledo', 'Carrera 80 #65-20, Medellín', 6.2867, -75.5908, '6045556677'),
('CAI Castilla', 'Carrera 90 #55-12, Medellín', 6.2765, -75.5914, '6045667788'),
('CAI San Javier', 'Carrera 72 #45-34, Medellín', 6.2754, -75.5890, '6045778899'),
('CAI Manrique', 'Carrera 45 #94-11, Medellín', 6.2819, -75.5710, '6045889900'),
('CAI Conquistadores', 'Carrera 70 #72-10, Medellín', 6.2621, -75.5765, '6045990011'),
('CAI San Antonio de Prado', 'Carrera 65 #82-21, Medellín', 6.1562, -75.6257, '6046001122'),
('CAI Guayabal', 'Carrera 65 #45-23, Medellín', 6.2091, -75.5855, '6046112233'),
('CAI Niquía', 'Carrera 56 #100-45, Medellín', 6.3415, -75.5173, '6046223344'),
('CAI San Cristóbal', 'Carrera 86 #104-23, Medellín', 6.3240, -75.6165, '6046334455'),
('CAI El Trapiche', 'Carrera 49 #45-35, Medellín', 6.2098, -75.5942, '6046445566'),
('CAI El Tesoro', 'Calle 6 #38-10, Medellín', 6.1872, -75.5680, '6046556677'),
('CAI Aranjuez', 'Carrera 42 #63-21, Medellín', 6.2671, -75.5768, '6046667788'),
('CAI Altavista', 'Carrera 89 #68-12, Medellín', 6.2679, -75.6012, '6046778899'),
('CAI La América', 'Calle 35 #78-12, Medellín', 6.2443, -75.5945, '6046889900'),
('CAI Santa Cruz', 'Carrera 25 #91-23, Medellín', 6.2349, -75.5859, '6046990011'),
('CAI Zamora', 'Carrera 52 #68-18, Medellín', 6.2436, -75.5667, '6047001122');

-- Insertar datos de ejemplo para alertas
INSERT INTO alerts (user_id, latitude, longitude, status)
VALUES (1, 6.2476, -75.5658, 'pendiente');

-- Insertar datos de ejemplo para asignaciones de alertas
INSERT INTO alert_assignments (alert_id, police_station_id, distance)
VALUES 
(1, 1, 0.2),
(1, 3, 1.5),
(1, 2, 2.1);

