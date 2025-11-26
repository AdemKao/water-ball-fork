INSERT INTO users (id, email, name, picture_url, role, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'test@example.com', 'Test User', 'https://example.com/pic.jpg', 'STUDENT', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'instructor@example.com', 'Instructor', 'https://example.com/instructor.jpg', 'TEACHER', NOW(), NOW());

INSERT INTO videos (id, original_filename, storage_path, storage_provider, file_size_bytes, mime_type, duration_seconds, status, created_at, updated_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lesson1.mp4', 'videos/lesson1.mp4', 'SUPABASE', 104857600, 'video/mp4', 600, 'READY', NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'lesson2.mp4', 'videos/lesson2.mp4', 'SUPABASE', 52428800, 'video/mp4', 300, 'READY', NOW(), NOW());

INSERT INTO journeys (id, title, description, thumbnail_url, is_published, price, created_at, updated_at)
VALUES 
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Published Journey', 'A published journey for testing', 'https://example.com/thumb.jpg', true, 1999.00, NOW(), NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Unpublished Journey', 'An unpublished journey', 'https://example.com/thumb2.jpg', false, 999.00, NOW(), NOW());

INSERT INTO chapters (id, journey_id, title, description, sort_order, access_type, created_at, updated_at)
VALUES 
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Chapter 1', 'First chapter', 0, 'PUBLIC', NOW(), NOW()),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Chapter 2', 'Second chapter', 1, 'PURCHASED', NOW(), NOW());

INSERT INTO lessons (id, chapter_id, title, description, lesson_type, content_url, video_id, duration_seconds, sort_order, access_type, instructor_id, created_at, updated_at)
VALUES 
    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Public Lesson', 'A public lesson', 'VIDEO', 'https://www.youtube.com/watch?v=test123', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 600, 0, 'PUBLIC', '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
    ('22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Trial Lesson', 'A trial lesson', 'VIDEO', 'https://www.youtube.com/watch?v=trial123', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 300, 1, 'TRIAL', '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
    ('33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Purchased Lesson', 'A purchased lesson', 'ARTICLE', 'https://example.com/article', NULL, NULL, 0, 'PURCHASED', '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
    ('44444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Google Form Lesson', 'A google form lesson', 'GOOGLE_FORM', 'https://docs.google.com/forms/d/example', NULL, NULL, 1, 'PURCHASED', NULL, NOW(), NOW());
