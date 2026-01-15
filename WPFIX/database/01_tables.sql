-- ==================================================
-- Platform Wallet Point Gamifikasi Kampus
-- Part 1: Table Definitions
-- ==================================================

DROP DATABASE IF EXISTS wallet_point;
CREATE DATABASE wallet_point CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wallet_point;

-- 1. USERS
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nim_nip VARCHAR(50) NOT NULL UNIQUE,
    role ENUM('admin', 'dosen', 'mahasiswa') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role), INDEX idx_status (status), INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. WALLETS
CREATE TABLE wallets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    balance INT DEFAULT 0 NOT NULL,
    last_sync_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id), INDEX idx_balance (balance),
    CONSTRAINT chk_balance_positive CHECK (balance >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. WALLET_TRANSACTIONS (IMMUTABLE)
CREATE TABLE wallet_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wallet_id BIGINT UNSIGNED NOT NULL,
    type ENUM('mission', 'task', 'transfer_in', 'transfer_out', 'marketplace', 'external', 'adjustment', 'topup') NOT NULL,
    amount INT NOT NULL,
    direction ENUM('credit', 'debit') NOT NULL,
    reference_id BIGINT UNSIGNED NULL,
    status ENUM('success', 'failed', 'pending') DEFAULT 'success',
    description VARCHAR(500) NULL,
    created_by ENUM('system', 'admin', 'dosen') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_wallet_id (wallet_id), INDEX idx_type (type), INDEX idx_reference (reference_id),
    INDEX idx_created_at (created_at), INDEX idx_status (status),
    CONSTRAINT chk_amount_positive CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MISSIONS
CREATE TABLE missions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    creator_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    points_reward INT NOT NULL,
    deadline DATETIME NULL,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_creator_id (creator_id), INDEX idx_status (status), INDEX idx_deadline (deadline),
    CONSTRAINT chk_mission_points_positive CHECK (points_reward > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. MISSION_SUBMISSIONS
CREATE TABLE mission_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mission_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    submission_content TEXT NULL,
    file_url VARCHAR(500) NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    validated_by BIGINT UNSIGNED NULL,
    validated_at TIMESTAMP NULL,
    validation_note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_mission_id (mission_id), INDEX idx_student_id (student_id), INDEX idx_status (status),
    UNIQUE KEY uk_mission_student (mission_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TASKS
CREATE TABLE tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    creator_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    points_reward INT NOT NULL,
    deadline DATETIME NULL,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_creator_id (creator_id), INDEX idx_status (status), INDEX idx_deadline (deadline),
    CONSTRAINT chk_task_points_positive CHECK (points_reward > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TASK_SUBMISSIONS
CREATE TABLE task_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    submission_content TEXT NULL,
    file_url VARCHAR(500) NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    validated_by BIGINT UNSIGNED NULL,
    validated_at TIMESTAMP NULL,
    validation_note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_task_id (task_id), INDEX idx_student_id (student_id), INDEX idx_status (status),
    UNIQUE KEY uk_task_student (task_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TRANSFERS
CREATE TABLE transfers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_wallet_id BIGINT UNSIGNED NOT NULL,
    receiver_wallet_id BIGINT UNSIGNED NOT NULL,
    amount INT NOT NULL,
    note VARCHAR(255) NULL,
    status ENUM('success', 'failed') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_wallet_id), INDEX idx_receiver (receiver_wallet_id), INDEX idx_created_at (created_at),
    CONSTRAINT chk_transfer_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_different_wallets CHECK (sender_wallet_id != receiver_wallet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PRODUCTS
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price INT NOT NULL,
    stock INT DEFAULT 0 NOT NULL,
    image_url VARCHAR(500) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status), INDEX idx_price (price), INDEX idx_created_by (created_by),
    CONSTRAINT chk_product_price_positive CHECK (price > 0),
    CONSTRAINT chk_product_stock_nonnegative CHECK (stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. MARKETPLACE_TRANSACTIONS
CREATE TABLE marketplace_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wallet_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    total_amount INT NOT NULL,
    status ENUM('success', 'failed') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_wallet_id (wallet_id), INDEX idx_product_id (product_id), INDEX idx_created_at (created_at),
    CONSTRAINT chk_marketplace_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_marketplace_total_positive CHECK (total_amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. EXTERNAL_SOURCES
CREATE TABLE external_sources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL UNIQUE,
    api_endpoint VARCHAR(500) NOT NULL,
    api_key_hash VARCHAR(255) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. EXTERNAL_POINT_LOGS
CREATE TABLE external_point_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wallet_id BIGINT UNSIGNED NOT NULL,
    external_source_id BIGINT UNSIGNED NOT NULL,
    external_transaction_id VARCHAR(255) NOT NULL UNIQUE,
    amount INT NOT NULL,
    metadata TEXT NULL,
    status ENUM('success', 'failed', 'pending') DEFAULT 'success',
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (external_source_id) REFERENCES external_sources(id) ON DELETE CASCADE,
    INDEX idx_wallet_id (wallet_id), INDEX idx_external_source (external_source_id),
    INDEX idx_synced_at (synced_at), INDEX idx_status (status),
    CONSTRAINT chk_external_amount_positive CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. AUDIT_LOGS
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT UNSIGNED NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id), INDEX idx_action (action),
    INDEX idx_table_name (table_name), INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
