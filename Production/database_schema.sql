-- Démolition Expert - Schéma de base de données MySQL
-- Application de gestion de casse automobile

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS demolition_expert CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE demolition_expert;

-- Table des utilisateurs
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Staff') NOT NULL DEFAULT 'Staff',
    status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des catégories de pièces
CREATE TABLE part_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name ENUM('Mécanique', 'Électricité', 'Carrosserie', 'Autre') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits (pièces détachées)
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    oem_ref VARCHAR(100),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    category_id VARCHAR(36),
    price DECIMAL(10,2) NOT NULL,
    condition ENUM('Neuf', 'Bon état', 'Occasion') NOT NULL,
    warranty VARCHAR(100),
    compatibility TEXT,
    description TEXT,
    stock_quantity INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES part_categories(id) ON DELETE SET NULL
);

-- Table des images des produits
CREATE TABLE product_images (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Table des enchères
CREATE TABLE auctions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehicle_name VARCHAR(255) NOT NULL,
    vehicle_brand VARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_year INT NOT NULL,
    vehicle_mileage INT NOT NULL,
    vehicle_description TEXT,
    starting_price DECIMAL(10,2) NOT NULL,
    current_bid DECIMAL(10,2),
    bid_count INT DEFAULT 0,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des images des enchères
CREATE TABLE auction_images (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    auction_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
);

-- Table des offres (bids)
CREATE TABLE bids (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    auction_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    bidder_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_auction_timestamp (auction_id, timestamp)
);

-- Table des réservations de location de pont
CREATE TABLE lift_rental_bookings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des messages administratifs
CREATE TABLE admin_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    from_source VARCHAR(100) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    user_id VARCHAR(36),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'replied') DEFAULT 'pending',
    attachment_name VARCHAR(255),
    attachment_url VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des contacts
CREATE TABLE contacts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'audit
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36),
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des paramètres du site
CREATE TABLE site_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des posts de blog
CREATE TABLE blog_posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    image VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des demandes de devis
CREATE TABLE quote_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    message TEXT,
    status ENUM('pending', 'replied', 'archived') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Table des demandes d'enlèvement d'épave
CREATE TABLE scrap_removal_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    vehicle_info TEXT NOT NULL,
    address TEXT NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des demandes de rachat de véhicule
CREATE TABLE buyback_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    vehicle_info TEXT NOT NULL,
    estimated_value DECIMAL(10,2),
    status ENUM('pending', 'estimated', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des demandes de pare-brise
CREATE TABLE windshield_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    vehicle_info TEXT NOT NULL,
    service_type ENUM('repair', 'replacement') NOT NULL,
    urgency ENUM('normal', 'urgent') DEFAULT 'normal',
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertion des catégories de pièces par défaut
INSERT INTO part_categories (name) VALUES
('Mécanique'),
('Électricité'),
('Carrosserie'),
('Autre');

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (name, email, password, role, status) VALUES
('Admin Expert', 'admin@expert.fr', '$2b$10$8K1p/a3q7R7gY2Z8X9Q8Z8X9Q8Z8X9Q8Z8X9Q8Z8X9Q8Z8X9Q8Z', 'Admin', 'approved');

-- Index pour améliorer les performances
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand_model ON products(brand, model);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_auctions_end_date ON auctions(end_date);
CREATE INDEX idx_auctions_active ON auctions(is_active);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_admin_messages_status ON admin_messages(status, is_archived);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);

-- Triggers pour mettre à jour les statistiques des enchères
DELIMITER //

CREATE TRIGGER update_auction_stats_after_bid
AFTER INSERT ON bids
FOR EACH ROW
BEGIN
    UPDATE auctions
    SET current_bid = NEW.amount,
        bid_count = bid_count + 1
    WHERE id = NEW.auction_id;
END//

DELIMITER ;
