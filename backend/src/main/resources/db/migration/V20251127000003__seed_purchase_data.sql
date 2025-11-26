-- Update journey prices for mock data
UPDATE journeys SET price = 1999.00 WHERE id = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'; -- 軟體設計之路
UPDATE journeys SET price = 2499.00 WHERE id = 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55'; -- 敏捷開發實戰
UPDATE journeys SET price = 2999.00 WHERE id = 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66'; -- 測試驅動開發 TDD

-- Create sample purchase orders for testing
INSERT INTO purchase_orders (id, user_id, journey_id, amount, payment_method, status, created_at, updated_at, completed_at)
VALUES 
(
    '01111111-1111-1111-1111-111111111111',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    1999.00,
    'CREDIT_CARD',
    'COMPLETED',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP - INTERVAL '7 days'
);
