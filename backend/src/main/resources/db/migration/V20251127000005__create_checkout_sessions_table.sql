CREATE TABLE checkout_sessions (
    id VARCHAR(255) PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'TWD',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    success_url VARCHAR(500) NOT NULL,
    cancel_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP
);

CREATE INDEX idx_checkout_sessions_purchase_order ON checkout_sessions(purchase_order_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);
