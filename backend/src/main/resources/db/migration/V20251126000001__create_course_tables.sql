CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'SUPABASE',
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    duration_seconds INT,
    status VARCHAR(50) NOT NULL DEFAULT 'READY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journeys_is_published ON journeys(is_published);

CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    access_type VARCHAR(50) NOT NULL DEFAULT 'PURCHASED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chapters_journey_id ON chapters(journey_id);
CREATE INDEX idx_chapters_sort_order ON chapters(journey_id, sort_order);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type VARCHAR(50) NOT NULL,
    content_url VARCHAR(500),
    video_id UUID REFERENCES videos(id),
    duration_seconds INT,
    sort_order INT NOT NULL DEFAULT 0,
    access_type VARCHAR(50) NOT NULL DEFAULT 'PURCHASED',
    instructor_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_chapter_id ON lessons(chapter_id);
CREATE INDEX idx_lessons_sort_order ON lessons(chapter_id, sort_order);

CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    last_position_seconds INT DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, journey_id)
);

CREATE INDEX idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_journey_id ON user_purchases(journey_id);
