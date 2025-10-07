-- Earthquake Cebu Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS tf_linog;
USE tf_linog;

-- Markers table for map points
CREATE TABLE markers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    images JSON,
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

-- Image groups table for organizing multiple images
CREATE TABLE image_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Images table for individual images within groups
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES image_groups(id) ON DELETE CASCADE
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
INSERT INTO markers (latitude, longitude, description, image_url, images) VALUES 
(10.3157, 123.8854, 'Cebu City - Minor damage reported', 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/cebu-city-1.jpg', 
'[{"url": "https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/cebu-city-1.jpg", "caption": "Main street damage assessment"}, {"url": "https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/cebu-city-2.jpg", "caption": "Building structural damage"}, {"url": "https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/cebu-city-3.jpg", "caption": "Emergency response team on site"}]'),
(10.2444, 123.8139, 'Mandaue City - Building inspection ongoing', 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/mandaue-1.jpg',
'[{"url": "https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/mandaue-1.jpg", "caption": "Building inspection in progress"}, {"url": "https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/mandaue-2.jpg", "caption": "Infrastructure damage assessment"}]'),
(10.3319, 123.8969, 'Lapu-Lapu City - Evacuation center active', 'https://cdn.jsdelivr.net/gh/username/earthquake-images/main/lapu-lapu-1.jpg',
'[{"url": "https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/lapu-lapu-1.jpg", "caption": "Evacuation center setup"}, {"url": "https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/lapu-lapu-2.jpg", "caption": "Relief distribution center"}]');

INSERT INTO updates (title, content) VALUES 
('Earthquake Update - January 15, 2025', 'Latest assessment shows minimal structural damage in most areas. Emergency services are monitoring the situation.'),
('Evacuation Centers Status', 'Three evacuation centers are currently active in Cebu City, Mandaue, and Lapu-Lapu. All centers are well-stocked with supplies.'),
('Road Conditions Update', 'Major roads are passable. Minor debris reported on secondary roads. Please drive with caution.');

INSERT INTO donations (title, description, contact_info, image_url) VALUES 
('Emergency Relief Fund', 'Help support earthquake victims with immediate needs', 'Contact: +63 917 123 4567', 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/donation-qr.jpg'),
('Food and Water Drive', 'Donate essential supplies for affected families', 'Email: relief@cebu.gov.ph', 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/food-drive.jpg');

-- Sample image groups
INSERT INTO image_groups (title, description, location_name, latitude, longitude) VALUES 
('Cebu City Damage Assessment', 'Comprehensive visual documentation of earthquake damage in Cebu City', 'Cebu City', 10.3157, 123.8854),
('Mandaue City Infrastructure', 'Building and infrastructure assessment in Mandaue City', 'Mandaue City', 10.2444, 123.8139),
('Lapu-Lapu Evacuation Centers', 'Evacuation centers and relief operations in Lapu-Lapu City', 'Lapu-Lapu City', 10.3319, 123.8969);

-- Sample images for the groups
INSERT INTO images (group_id, image_url, caption, display_order) VALUES 
(1, 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/cebu-city-1.jpg', 'Main street damage assessment', 1),
(1, 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/cebu-city-2.jpg', 'Building structural damage', 2),
(1, 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/cebu-city-3.jpg', 'Emergency response team on site', 3),
(2, 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/mandaue-1.jpg', 'Building inspection in progress', 1),
(2, 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/mandaue-2.jpg', 'Infrastructure damage assessment', 2),
(3, 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/lapu-lapu-1.jpg', 'Evacuation center setup', 1),
(3, 'https://cdn.jsdelivr.net/gh/g2ix/tf-linog-images/main/lapu-lapu-2.jpg', 'Relief distribution center', 2);
