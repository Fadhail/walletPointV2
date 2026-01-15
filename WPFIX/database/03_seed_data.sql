-- ==================================================
-- Part 3: Seed Data
-- ==================================================
USE wallet_point;

-- Sample users (password: Password123!)
INSERT INTO users (email, password_hash, full_name, nim_nip, role, status) VALUES
('admin@campus.edu', '$2a$10$D1pwwOkIxUD4zjcgvPpDUOd9uTePy9t/OIkFmTJJRa98TtZw/n152', 'System Administrator', 'ADM001', 'admin', 'active'),
('dosen1@campus.edu', '$2a$10$D1pwwOkIxUD4zjcgvPpDUOd9uTePy9t/OIkFmTJJRa98TtZw/n152', 'Dr. John Doe', 'NIP001', 'dosen', 'active'),
('dosen2@campus.edu', '$2a$10$D1pwwOkIxUD4zjcgvPpDUOd9uTePy9t/OIkFmTJJRa98TtZw/n152', 'Dr. Jane Smith', 'NIP002', 'dosen', 'active'),
('mahasiswa1@campus.edu', '$2a$10$D1pwwOkIxUD4zjcgvPpDUOd9uTePy9t/OIkFmTJJRa98TtZw/n152', 'Alice Johnson', '2023001', 'mahasiswa', 'active'),
('mahasiswa2@campus.edu', '$2a$10$D1pwwOkIxUD4zjcgvPpDUOd9uTePy9t/OIkFmTJJRa98TtZw/n152', 'Bob Williams', '2023002', 'mahasiswa', 'active'),
('mahasiswa3@campus.edu', '$2a$10$D1pwwOkIxUD4zjcgvPpDUOd9uTePy9t/OIkFmTJJRa98TtZw/n152', 'Charlie Brown', '2023003', 'mahasiswa', 'active');

-- Sample external source
INSERT INTO external_sources (source_name, api_endpoint, api_key_hash, status) VALUES
('Campus LMS', 'https://lms.campus.edu/api/points', '$2a$10$YourHashedAPIKey', 'active');

-- Sample products
INSERT INTO products (name, description, price, stock, status, created_by) VALUES
('Notebook', 'Campus branded notebook', 50, 100, 'active', 1),
('Pen Set', 'Premium pen set (5 pcs)', 30, 200, 'active', 1),
('T-Shirt', 'Campus t-shirt (various sizes)', 100, 50, 'active', 1),
('Coffee Voucher', 'Campus cafeteria coffee voucher', 20, 500, 'active', 1);
