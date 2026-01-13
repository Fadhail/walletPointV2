-- ==================================================
-- Part 2: Triggers & Stored Procedures
-- ==================================================
USE walletpoint_db;

-- TRIGGERS
DELIMITER $$

CREATE TRIGGER trg_create_wallet_after_user_insert
AFTER INSERT ON users FOR EACH ROW
BEGIN
    INSERT INTO wallets (user_id, balance, created_at, updated_at)
    VALUES (NEW.id, 0, NOW(), NOW());
END$$

CREATE TRIGGER trg_audit_user_insert
AFTER INSERT ON users FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_value, created_at)
    VALUES (NEW.id, 'INSERT', 'users', NEW.id,
        JSON_OBJECT('email', NEW.email, 'full_name', NEW.full_name, 'nim_nip', NEW.nim_nip, 'role', NEW.role, 'status', NEW.status), NOW());
END$$

-- STORED PROCEDURES
CREATE PROCEDURE sp_get_wallet_balance(IN p_wallet_id BIGINT UNSIGNED, OUT p_balance INT)
BEGIN
    SELECT COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount WHEN direction = 'debit' THEN -amount END), 0) 
    INTO p_balance FROM wallet_transactions WHERE wallet_id = p_wallet_id AND status = 'success';
END$$

CREATE PROCEDURE sp_process_transfer(
    IN p_sender_wallet_id BIGINT UNSIGNED, IN p_receiver_wallet_id BIGINT UNSIGNED,
    IN p_amount INT, IN p_note VARCHAR(255),
    OUT p_transfer_id BIGINT UNSIGNED, OUT p_success BOOLEAN, OUT p_message VARCHAR(255))
BEGIN
    DECLARE v_sender_balance INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK; SET p_success = FALSE; SET p_message = 'Transaction failed';
    END;
    
    START TRANSACTION;
    IF p_amount <= 0 THEN
        SET p_success = FALSE; SET p_message = 'Amount must be positive'; ROLLBACK;
    ELSE
        SELECT balance INTO v_sender_balance FROM wallets WHERE id = p_sender_wallet_id FOR UPDATE;
        IF v_sender_balance < p_amount THEN
            SET p_success = FALSE; SET p_message = 'Insufficient balance'; ROLLBACK;
        ELSE
            INSERT INTO transfers (sender_wallet_id, receiver_wallet_id, amount, note, status, created_at)
            VALUES (p_sender_wallet_id, p_receiver_wallet_id, p_amount, p_note, 'success', NOW());
            SET p_transfer_id = LAST_INSERT_ID();
            
            INSERT INTO wallet_transactions (wallet_id, type, amount, direction, reference_id, status, created_by, created_at)
            VALUES (p_sender_wallet_id, 'transfer_out', p_amount, 'debit', p_transfer_id, 'success', 'system', NOW());
            UPDATE wallets SET balance = balance - p_amount, updated_at = NOW() WHERE id = p_sender_wallet_id;
            
            INSERT INTO wallet_transactions (wallet_id, type, amount, direction, reference_id, status, created_by, created_at)
            VALUES (p_receiver_wallet_id, 'transfer_in', p_amount, 'credit', p_transfer_id, 'success', 'system', NOW());
            UPDATE wallets SET balance = balance + p_amount, updated_at = NOW() WHERE id = p_receiver_wallet_id;
            
            SET p_success = TRUE; SET p_message = 'Transfer successful'; COMMIT;
        END IF;
    END IF;
END$$

CREATE PROCEDURE sp_process_marketplace_purchase(
    IN p_wallet_id BIGINT UNSIGNED, IN p_product_id BIGINT UNSIGNED, IN p_quantity INT,
    OUT p_transaction_id BIGINT UNSIGNED, OUT p_success BOOLEAN, OUT p_message VARCHAR(255))
BEGIN
    DECLARE v_wallet_balance INT; DECLARE v_product_price INT; DECLARE v_product_stock INT;
    DECLARE v_product_status VARCHAR(20); DECLARE v_total_amount INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK; SET p_success = FALSE; SET p_message = 'Transaction failed';
    END;
    
    START TRANSACTION;
    IF p_quantity <= 0 THEN
        SET p_success = FALSE; SET p_message = 'Quantity must be positive'; ROLLBACK;
    ELSE
        SELECT price, stock, status INTO v_product_price, v_product_stock, v_product_status
        FROM products WHERE id = p_product_id FOR UPDATE;
        
        IF v_product_status != 'active' THEN
            SET p_success = FALSE; SET p_message = 'Product not available'; ROLLBACK;
        ELSEIF v_product_stock < p_quantity THEN
            SET p_success = FALSE; SET p_message = 'Insufficient stock'; ROLLBACK;
        ELSE
            SET v_total_amount = v_product_price * p_quantity;
            SELECT balance INTO v_wallet_balance FROM wallets WHERE id = p_wallet_id FOR UPDATE;
            
            IF v_wallet_balance < v_total_amount THEN
                SET p_success = FALSE; SET p_message = 'Insufficient balance'; ROLLBACK;
            ELSE
                INSERT INTO marketplace_transactions (wallet_id, product_id, quantity, total_amount, status, created_at)
                VALUES (p_wallet_id, p_product_id, p_quantity, v_total_amount, 'success', NOW());
                SET p_transaction_id = LAST_INSERT_ID();
                
                INSERT INTO wallet_transactions (wallet_id, type, amount, direction, reference_id, status, created_by, created_at)
                VALUES (p_wallet_id, 'marketplace', v_total_amount, 'debit', p_transaction_id, 'success', 'system', NOW());
                UPDATE wallets SET balance = balance - v_total_amount, updated_at = NOW() WHERE id = p_wallet_id;
                UPDATE products SET stock = stock - p_quantity, updated_at = NOW() WHERE id = p_product_id;
                
                SET p_success = TRUE; SET p_message = 'Purchase successful'; COMMIT;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;
