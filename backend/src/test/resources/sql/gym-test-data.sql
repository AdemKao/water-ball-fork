INSERT INTO gym (id, journey_id, title, description, display_order, created_at, updated_at)
VALUES 
    (1, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Design Patterns Gym', 'Practice design patterns', 0, NOW(), NOW()),
    (2, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'SOLID Principles Gym', 'Practice SOLID principles', 1, NOW(), NOW()),
    (3, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Unpublished Gym', 'Gym for unpublished journey', 0, NOW(), NOW());

SELECT setval('gym_id_seq', 100);

INSERT INTO gym_exercise (id, gym_id, title, description, difficulty, display_order, created_at, updated_at)
VALUES 
    (1, 1, 'Singleton Pattern', 'Implement singleton pattern', 'EASY', 0, NOW(), NOW()),
    (2, 1, 'Factory Pattern', 'Implement factory pattern', 'MEDIUM', 1, NOW(), NOW()),
    (3, 1, 'Observer Pattern', 'Implement observer pattern', 'HARD', 2, NOW(), NOW()),
    (4, 2, 'Single Responsibility', 'Apply SRP to refactor code', 'MEDIUM', 0, NOW(), NOW()),
    (5, 3, 'Unpublished Exercise', 'Exercise in unpublished journey', 'EASY', 0, NOW(), NOW());

SELECT setval('gym_exercise_id_seq', 100);

INSERT INTO gym_submission (id, exercise_id, user_id, file_url, file_name, file_size, status, feedback, reviewed_by, reviewed_at, submitted_at, updated_at)
VALUES 
    (1, 1, '11111111-1111-1111-1111-111111111111', '/uploads/submissions/1/singleton.zip', 'singleton.zip', 1024, 'APPROVED', 'Great implementation!', '22222222-2222-2222-2222-222222222222', NOW(), NOW() - INTERVAL '2 days', NOW()),
    (2, 1, '11111111-1111-1111-1111-111111111111', '/uploads/submissions/1/singleton_v2.zip', 'singleton_v2.zip', 2048, 'PENDING', NULL, NULL, NULL, NOW() - INTERVAL '1 day', NOW()),
    (3, 2, '11111111-1111-1111-1111-111111111111', '/uploads/submissions/2/factory.zip', 'factory.zip', 3072, 'REJECTED', 'Missing abstract factory', '22222222-2222-2222-2222-222222222222', NOW(), NOW() - INTERVAL '3 days', NOW()),
    (4, 3, '22222222-2222-2222-2222-222222222222', '/uploads/submissions/3/observer.zip', 'observer.zip', 4096, 'PENDING', NULL, NULL, NULL, NOW(), NOW());

SELECT setval('gym_submission_id_seq', 100);
