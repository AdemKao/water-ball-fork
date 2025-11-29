-- Additional prerequisite test data

-- Add a problem with lesson prerequisite
INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order, created_at, updated_at)
VALUES 
    ('aaaa5555-5555-5555-5555-555555555555', '11111111-aaaa-aaaa-aaaa-111111111111', 'Decorator Pattern', 'Implement decorator pattern', 2, ARRAY['PDF'], '[]', 20, 2, NOW(), NOW());

-- Stage prerequisite: Advanced Patterns stage requires Singleton problem to be completed
INSERT INTO stage_prerequisites (id, stage_id, prerequisite_problem_id, created_at)
VALUES
    ('00000002-0002-0002-0002-000000000001', '22222222-aaaa-aaaa-aaaa-222222222222', 'aaaa1111-1111-1111-1111-111111111111', NOW());

-- Problem prerequisite: Decorator Pattern requires Public Lesson to be completed
INSERT INTO problem_prerequisites (id, problem_id, prerequisite_lesson_id, created_at)
VALUES
    ('00000002-0002-0002-0002-000000000002', 'aaaa5555-5555-5555-5555-555555555555', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW());

-- Add lesson progress for test user (completed the public lesson)
INSERT INTO lesson_progress (id, user_id, lesson_id, is_completed, last_position_seconds, completed_at, created_at, updated_at)
VALUES
    ('00000003-0003-0003-0003-000000000001', '11111111-1111-1111-1111-111111111111', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TRUE, 600, NOW(), NOW(), NOW());
