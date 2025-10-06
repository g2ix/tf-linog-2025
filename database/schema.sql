-- Earthquake Cebu Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS earthquake_cebu;
USE earthquake_cebu;

-- Markers table for map points
CREATE TABLE markers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Updates table for news and updates
CREATE TABLE updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin table for authentication
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations table for donation information
CREATE TABLE donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    contact_info VARCHAR(500),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin (username, password_hash) VALUES 
('admin', '$2b$10$rQZ8K9LmN2pO3qR4sT5uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z');

-- Sample data for testing
INSERT INTO markers (latitude, longitude, description, image_url) VALUES 
(10.3157, 123.8854, 'Cebu City - Minor damage reported', 'https://cdn.jsdelivr.net/gh/username/earthquake-images/main/cebu-city-1.jpg'),
(10.2444, 123.8139, 'Mandaue City - Building inspection ongoing', 'https://cdn.jsdelivr.net/gh/username/earthquake-images/main/mandaue-1.jpg'),
(10.3319, 123.8969, 'Lapu-Lapu City - Evacuation center active', 'https://cdn.jsdelivr.net/gh/username/earthquake-images/main/lapu-lapu-1.jpg');

INSERT INTO updates (title, content) VALUES 
('Earthquake Update - January 15, 2025', 'Latest assessment shows minimal structural damage in most areas. Emergency services are monitoring the situation.'),
('Evacuation Centers Status', 'Three evacuation centers are currently active in Cebu City, Mandaue, and Lapu-Lapu. All centers are well-stocked with supplies.'),
('Road Conditions Update', 'Major roads are passable. Minor debris reported on secondary roads. Please drive with caution.');

INSERT INTO donations (title, description, contact_info, image_url) VALUES 
('Emergency Relief Fund', 'Help support earthquake victims with immediate needs', 'Contact: +63 917 123 4567', 'https://cdn.jsdelivr.net/gh/username/earthquake-images/main/donation-qr.jpg'),
('Food and Water Drive', 'Donate essential supplies for affected families', 'Email: relief@cebu.gov.ph', 'https://cdn.jsdelivr.net/gh/username/earthquake-images/main/food-drive.jpg');
