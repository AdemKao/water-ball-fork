DELETE FROM purchase_orders WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM user_purchases WHERE user_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO user_purchases (id, user_id, journey_id, purchased_at)
VALUES ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW());

INSERT INTO purchase_orders (id, user_id, journey_id, amount, payment_method, status, created_at, updated_at, completed_at)
VALUES 
    ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1999.00, 'CREDIT_CARD', 'COMPLETED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 999.00, 'CREDIT_CARD', 'PENDING', NOW(), NOW(), NULL),
    ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 999.00, 'CREDIT_CARD', 'FAILED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL);
