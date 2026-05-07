-- Database Schema for Event Creation Module
-- Requires MariaDB or MySQL

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
    organizer_id INT NOT NULL,
    status ENUM('draft', 'published', 'cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Se asume la existencia de una tabla 'users' para la llave foránea
    -- CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
    INDEX idx_event_slug (slug),
    INDEX idx_event_dates (event_date_start, event_date_end)
);
