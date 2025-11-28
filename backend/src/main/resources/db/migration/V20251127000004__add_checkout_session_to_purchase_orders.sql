ALTER TABLE purchase_orders ADD COLUMN checkout_session_id VARCHAR(255);
ALTER TABLE purchase_orders ADD COLUMN expires_at TIMESTAMP;

CREATE INDEX idx_purchase_orders_checkout_session ON purchase_orders(checkout_session_id);
