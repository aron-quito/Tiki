-- Database Schema for Event Creation Module
-- Requires MariaDB or MySQL

-- 1. Tabla Principal de Eventos (gestionada por la empresa)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    event_date_start DATETIME NOT NULL,
    event_date_end DATETIME NOT NULL,
    venue_name VARCHAR(255),
    venue_address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    banner_image VARCHAR(512),
    company_id INT NOT NULL, -- ID del usuario empresa creador del evento
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_event_slug (slug),
    INDEX idx_event_dates (event_date_start, event_date_end),
    INDEX idx_company (company_id)
);

-- 2. Categorías de Tickets (e.g. VIP, Normal, Preventa General)
CREATE TABLE IF NOT EXISTS ticket_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- Ej: "VIP", "General", "Discapacitados"
    capacity INT NOT NULL, -- Aforo límite para esta categoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ticket_tier_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 3. Fases de Precios de los Tickets (e.g. Preventa 1, Venta Regular)
CREATE TABLE IF NOT EXISTS ticket_pricing_phases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_tier_id INT NOT NULL,
    phase_name VARCHAR(100) NOT NULL, -- Ej: "Preventa 1", "Regular"
    price DECIMAL(10,2) NOT NULL, -- Precio durante esta fase
    start_date DATETIME NOT NULL, -- Cuándo comienza este precio
    end_date DATETIME NOT NULL, -- Cuándo termina (límite de compras con este precio)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pricing_phase_tier FOREIGN KEY (ticket_tier_id) REFERENCES ticket_tiers(id) ON DELETE CASCADE
);
