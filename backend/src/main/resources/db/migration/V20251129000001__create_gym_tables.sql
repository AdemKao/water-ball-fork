-- Gym System: 3-layer architecture (Gym -> Stage -> Problem)

-- Create gyms table (道館)
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    gym_type VARCHAR(50) NOT NULL DEFAULT 'MAIN_QUEST',
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_gyms_type CHECK (gym_type IN ('MAIN_QUEST', 'SIDE_QUEST'))
);

CREATE INDEX idx_gyms_journey_id ON gyms(journey_id);
CREATE INDEX idx_gyms_type ON gyms(gym_type);
CREATE INDEX idx_gyms_published ON gyms(is_published);

-- Create stages table (關卡)
CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stages_gym_id ON stages(gym_id);
CREATE INDEX idx_stages_sort_order ON stages(gym_id, sort_order);

-- Create problems table (題目)
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    submission_types VARCHAR(255)[] NOT NULL DEFAULT ARRAY['PDF'],
    hints JSONB DEFAULT '[]',
    exp_reward INT NOT NULL DEFAULT 10,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_problems_stage_id ON problems(stage_id);
CREATE INDEX idx_problems_sort_order ON problems(stage_id, sort_order);

-- Create stage_prerequisites table (關卡前置條件)
CREATE TABLE stage_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    prerequisite_lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    prerequisite_problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_stage_prereq_one_type CHECK (
        (prerequisite_lesson_id IS NOT NULL AND prerequisite_problem_id IS NULL) OR
        (prerequisite_lesson_id IS NULL AND prerequisite_problem_id IS NOT NULL)
    ),
    UNIQUE(stage_id, prerequisite_lesson_id),
    UNIQUE(stage_id, prerequisite_problem_id)
);

CREATE INDEX idx_stage_prereq_stage ON stage_prerequisites(stage_id);
CREATE INDEX idx_stage_prereq_lesson ON stage_prerequisites(prerequisite_lesson_id) WHERE prerequisite_lesson_id IS NOT NULL;
CREATE INDEX idx_stage_prereq_problem ON stage_prerequisites(prerequisite_problem_id) WHERE prerequisite_problem_id IS NOT NULL;

-- Create problem_prerequisites table (題目前置條件)
CREATE TABLE problem_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    prerequisite_lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    prerequisite_problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_problem_prereq_one_type CHECK (
        (prerequisite_lesson_id IS NOT NULL AND prerequisite_problem_id IS NULL) OR
        (prerequisite_lesson_id IS NULL AND prerequisite_problem_id IS NOT NULL)
    ),
    CONSTRAINT chk_problem_prereq_not_self CHECK (problem_id != prerequisite_problem_id),
    UNIQUE(problem_id, prerequisite_lesson_id),
    UNIQUE(problem_id, prerequisite_problem_id)
);

CREATE INDEX idx_problem_prereq_problem ON problem_prerequisites(problem_id);
CREATE INDEX idx_problem_prereq_lesson ON problem_prerequisites(prerequisite_lesson_id) WHERE prerequisite_lesson_id IS NOT NULL;
CREATE INDEX idx_problem_prereq_prereq_problem ON problem_prerequisites(prerequisite_problem_id) WHERE prerequisite_problem_id IS NOT NULL;

-- Create submissions table (提交記錄)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    is_public BOOLEAN DEFAULT FALSE,
    version INT NOT NULL DEFAULT 1,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_submissions_status CHECK (status IN ('PENDING', 'REVIEWED', 'NEEDS_REVISION')),
    CONSTRAINT chk_submissions_file_type CHECK (file_type IN ('PDF', 'MP4', 'CODE', 'IMAGE'))
);

CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_public ON submissions(is_public) WHERE is_public = TRUE;

-- Create reviews table (批改記錄)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reviews_status CHECK (status IN ('APPROVED', 'NEEDS_REVISION'))
);

CREATE INDEX idx_reviews_submission_id ON reviews(submission_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
