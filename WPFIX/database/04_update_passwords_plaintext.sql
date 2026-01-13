-- ==================================================
-- Update existing users to use plain text passwords
-- For testing purposes only!
-- ==================================================
USE walletpoint_db;

-- Update all existing users to use plain text password
UPDATE users SET password_hash = 'Password123!' WHERE email = 'admin@campus.edu';
UPDATE users SET password_hash = 'Password123!' WHERE email = 'dosen1@campus.edu';
UPDATE users SET password_hash = 'Password123!' WHERE email = 'dosen2@campus.edu';
UPDATE users SET password_hash = 'Password123!' WHERE email = 'mahasiswa1@campus.edu';
UPDATE users SET password_hash = 'Password123!' WHERE email = 'mahasiswa2@campus.edu';
UPDATE users SET password_hash = 'Password123!' WHERE email = 'mahasiswa3@campus.edu';

SELECT 'Passwords updated to plain text for testing' as message;
SELECT email, password_hash, role FROM users;
