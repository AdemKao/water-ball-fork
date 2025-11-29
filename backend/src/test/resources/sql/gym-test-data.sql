INSERT INTO purchase_orders (id, user_id, journey_id, amount, payment_method, status, created_at, updated_at, completed_at)
VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1999.00, 'CREDIT_CARD', 'COMPLETED', NOW(), NOW(), NOW()),
    ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 999.00, 'CREDIT_CARD', 'COMPLETED', NOW(), NOW(), NOW());

INSERT INTO user_purchases (id, user_id, journey_id, purchased_at)
VALUES
    ('bbbbbbbb-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW()),
    ('bbbbbbbb-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW());

INSERT INTO gyms (id, journey_id, title, description, gym_type, sort_order, is_published, created_at, updated_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Design Patterns Gym', 'Practice design patterns', 'MAIN_QUEST', 0, TRUE, NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'SOLID Principles Gym', 'Practice SOLID principles', 'MAIN_QUEST', 1, TRUE, NOW(), NOW()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Unpublished Gym', 'Gym for unpublished journey', 'MAIN_QUEST', 0, FALSE, NOW(), NOW());

INSERT INTO stages (id, gym_id, title, description, difficulty, sort_order, created_at, updated_at)
VALUES
    ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Basic Patterns', 'Learn basic design patterns', 1, 0, NOW(), NOW()),
    ('22222222-aaaa-aaaa-aaaa-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Advanced Patterns', 'Learn advanced design patterns', 3, 1, NOW(), NOW()),
    ('11111111-bbbb-bbbb-bbbb-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'SOLID Basics', 'Learn SOLID principles', 2, 0, NOW(), NOW()),
    ('11111111-eeee-eeee-eeee-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Unpublished Stage', 'Stage for unpublished gym', 1, 0, NOW(), NOW());

INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order, created_at, updated_at)
VALUES 
    ('aaaa1111-1111-1111-1111-111111111111', '11111111-aaaa-aaaa-aaaa-111111111111', 'Singleton Pattern', 'Implement singleton pattern', 1, ARRAY['PDF'], '[]', 10, 0, NOW(), NOW()),
    ('aaaa2222-2222-2222-2222-222222222222', '11111111-aaaa-aaaa-aaaa-111111111111', 'Factory Pattern', 'Implement factory pattern', 2, ARRAY['PDF', 'CODE'], '[{"order": 1, "content": "Consider using abstract factory"}]', 20, 1, NOW(), NOW()),
    ('aaaa3333-3333-3333-3333-333333333333', '22222222-aaaa-aaaa-aaaa-222222222222', 'Observer Pattern', 'Implement observer pattern', 3, ARRAY['PDF'], '[]', 30, 0, NOW(), NOW()),
    ('bbbb1111-1111-1111-1111-111111111111', '11111111-bbbb-bbbb-bbbb-111111111111', 'Single Responsibility', 'Apply SRP to refactor code', 2, ARRAY['PDF'], '[]', 20, 0, NOW(), NOW()),
    ('eeee1111-1111-1111-1111-111111111111', '11111111-eeee-eeee-eeee-111111111111', 'Unpublished Exercise', 'Exercise in unpublished journey', 1, ARRAY['PDF'], '[]', 10, 0, NOW(), NOW());

INSERT INTO submissions (id, user_id, problem_id, file_url, file_type, file_name, file_size_bytes, status, is_public, version, submitted_at, updated_at)
VALUES 
    ('00000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '/uploads/submissions/1/singleton.zip', 'PDF', 'singleton.pdf', 1024, 'REVIEWED', FALSE, 1, NOW() - INTERVAL '2 days', NOW()),
    ('00000001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '/uploads/submissions/1/singleton_v2.zip', 'PDF', 'singleton_v2.pdf', 2048, 'PENDING', FALSE, 2, NOW() - INTERVAL '1 day', NOW()),
    ('00000001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaa2222-2222-2222-2222-222222222222', '/uploads/submissions/2/factory.zip', 'PDF', 'factory.pdf', 3072, 'NEEDS_REVISION', FALSE, 1, NOW() - INTERVAL '3 days', NOW()),
    ('00000001-0001-0001-0001-000000000004', '22222222-2222-2222-2222-222222222222', 'aaaa3333-3333-3333-3333-333333333333', '/uploads/submissions/3/observer.zip', 'PDF', 'observer.pdf', 4096, 'PENDING', TRUE, 1, NOW(), NOW());

INSERT INTO reviews (id, submission_id, reviewer_id, content, status, reviewed_at)
VALUES
    ('aa000001-0001-0001-0001-000000000001', '00000001-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'Great implementation!', 'APPROVED', NOW()),
    ('aa000001-0001-0001-0001-000000000003', '00000001-0001-0001-0001-000000000003', '22222222-2222-2222-2222-222222222222', 'Missing abstract factory', 'NEEDS_REVISION', NOW() - INTERVAL '2 days');
