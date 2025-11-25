-- Mock Seed Data for Development
-- This migration adds sample data for testing the course platform

-- Insert a test instructor user
INSERT INTO users (id, email, name, picture_url, role, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'instructor@waterball.tw',
    '水球教練',
    'https://ui-avatars.com/api/?name=水球教練&background=0D8ABC&color=fff',
    'TEACHER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert auth provider for instructor
INSERT INTO user_auth_providers (id, user_id, provider, provider_user_id, created_at)
VALUES (
    'a1000001-0001-0001-0001-000000000001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'GOOGLE',
    'google-instructor-001',
    CURRENT_TIMESTAMP
) ON CONFLICT (provider, provider_user_id) DO NOTHING;

-- Insert test student users
INSERT INTO users (id, email, name, picture_url, role, created_at, updated_at)
VALUES 
(
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'student1@example.com',
    '學生小明',
    'https://ui-avatars.com/api/?name=學生小明&background=6366F1&color=fff',
    'STUDENT',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'student2@example.com',
    '學生小華',
    'https://ui-avatars.com/api/?name=學生小華&background=8B5CF6&color=fff',
    'STUDENT',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Insert auth providers for students
INSERT INTO user_auth_providers (id, user_id, provider, provider_user_id, created_at)
VALUES 
(
    'a2000002-0002-0002-0002-000000000002',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'GOOGLE',
    'google-student-001',
    CURRENT_TIMESTAMP
),
(
    'a3000003-0003-0003-0003-000000000003',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'GOOGLE',
    'google-student-002',
    CURRENT_TIMESTAMP
)
ON CONFLICT (provider, provider_user_id) DO NOTHING;

-- Journey 1: 軟體設計之路
INSERT INTO journeys (id, title, description, thumbnail_url, is_published, created_at, updated_at)
VALUES (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '軟體設計之路',
    '從零開始學習軟體設計的核心概念，包含物件導向設計、設計模式、重構技巧等。適合想要提升程式設計能力的開發者。',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Journey 2: 敏捷開發實戰
INSERT INTO journeys (id, title, description, thumbnail_url, is_published, created_at, updated_at)
VALUES (
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    '敏捷開發實戰',
    '學習 Scrum、Kanban 等敏捷方法論，掌握團隊協作與持續改進的技巧。',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Journey 3: 測試驅動開發 (未發布)
INSERT INTO journeys (id, title, description, thumbnail_url, is_published, created_at, updated_at)
VALUES (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    '測試驅動開發 TDD',
    '深入學習測試驅動開發的理念與實踐，寫出高品質、易維護的程式碼。',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    FALSE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Chapters for Journey 1: 軟體設計之路
INSERT INTO chapters (id, journey_id, title, description, sort_order, access_type, created_at, updated_at)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '第一章：物件導向基礎',
    '學習物件導向程式設計的核心概念',
    1,
    'PUBLIC',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '22222222-2222-2222-2222-222222222222',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '第二章：SOLID 原則',
    '掌握五大設計原則，寫出更好的程式碼',
    2,
    'PURCHASED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '33333333-3333-3333-3333-333333333333',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '第三章：設計模式入門',
    '學習常用的設計模式及其應用場景',
    3,
    'PURCHASED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Chapters for Journey 2: 敏捷開發實戰
INSERT INTO chapters (id, journey_id, title, description, sort_order, access_type, created_at, updated_at)
VALUES 
(
    '44444444-4444-4444-4444-444444444444',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    '第一章：敏捷思維',
    '了解敏捷開發的核心理念',
    1,
    'PUBLIC',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '55555555-5555-5555-5555-555555555555',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    '第二章：Scrum 框架',
    '深入學習 Scrum 的角色、事件與產出物',
    2,
    'PURCHASED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Lessons for Chapter 1 (物件導向基礎) - FREE
INSERT INTO lessons (id, chapter_id, title, description, lesson_type, content_url, duration_seconds, sort_order, access_type, instructor_id, created_at, updated_at)
VALUES 
(
    'aaaa1111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '1-1 什麼是物件導向？',
    '介紹物件導向程式設計的基本概念與優點',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    600,
    1,
    'PUBLIC',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'aaaa2222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '1-2 類別與物件',
    '學習如何定義類別並建立物件實例',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    720,
    2,
    'PUBLIC',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'aaaa3333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '1-3 封裝與存取修飾詞',
    '深入了解封裝的概念與實作方式',
    'ARTICLE',
    'https://example.com/articles/encapsulation',
    NULL,
    3,
    'PUBLIC',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'aaaa4444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    '第一章測驗',
    '測試你對物件導向基礎的理解',
    'GOOGLE_FORM',
    'https://docs.google.com/forms/d/e/1FAIpQLSc-example-form-id/viewform',
    NULL,
    4,
    'PUBLIC',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Lessons for Chapter 2 (SOLID 原則) - PURCHASED
INSERT INTO lessons (id, chapter_id, title, description, lesson_type, content_url, duration_seconds, sort_order, access_type, instructor_id, created_at, updated_at)
VALUES 
(
    'bbbb1111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '2-1 單一職責原則 (SRP)',
    '學習如何讓類別只負責一件事',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    900,
    1,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'bbbb2222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '2-2 開放封閉原則 (OCP)',
    '如何設計出易於擴展但不需修改的程式碼',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    850,
    2,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'bbbb3333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    '2-3 里氏替換原則 (LSP)',
    '正確使用繼承的關鍵原則',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    780,
    3,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'bbbb4444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    '2-4 介面隔離原則 (ISP)',
    '設計精簡且專注的介面',
    'ARTICLE',
    'https://example.com/articles/isp',
    NULL,
    4,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'bbbb5555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    '2-5 依賴反轉原則 (DIP)',
    '降低模組間的耦合度',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    920,
    5,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'bbbb6666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222222',
    'SOLID 原則總測驗',
    '綜合測驗：測試你對 SOLID 原則的理解',
    'GOOGLE_FORM',
    'https://docs.google.com/forms/d/e/1FAIpQLSc-solid-quiz/viewform',
    NULL,
    6,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Lessons for Chapter 3 (設計模式入門) - PURCHASED
INSERT INTO lessons (id, chapter_id, title, description, lesson_type, content_url, duration_seconds, sort_order, access_type, instructor_id, created_at, updated_at)
VALUES 
(
    'cccc1111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    '3-1 設計模式概述',
    '什麼是設計模式？為什麼要學習設計模式？',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    600,
    1,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'cccc2222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '3-2 策略模式 (Strategy)',
    '學習如何將演算法封裝成可互換的策略',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    1200,
    2,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'cccc3333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '3-3 觀察者模式 (Observer)',
    '實作一對多的依賴關係',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    1100,
    3,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Lessons for Journey 2, Chapter 1 (敏捷思維) - FREE
INSERT INTO lessons (id, chapter_id, title, description, lesson_type, content_url, duration_seconds, sort_order, access_type, instructor_id, created_at, updated_at)
VALUES 
(
    'dddd1111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    '1-1 敏捷宣言',
    '了解敏捷宣言的四大價值觀',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    480,
    1,
    'PUBLIC',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'dddd2222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    '1-2 敏捷十二原則',
    '深入解讀敏捷開發的十二條原則',
    'ARTICLE',
    'https://example.com/articles/agile-principles',
    NULL,
    2,
    'PUBLIC',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Lessons for Journey 2, Chapter 2 (Scrum 框架) - PURCHASED
INSERT INTO lessons (id, chapter_id, title, description, lesson_type, content_url, duration_seconds, sort_order, access_type, instructor_id, created_at, updated_at)
VALUES 
(
    'eeee1111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    '2-1 Scrum 角色介紹',
    '認識 PO、SM、Dev Team 的職責',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    900,
    1,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'eeee2222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    '2-2 Sprint 週期',
    '學習 Sprint 的規劃與執行',
    'VIDEO',
    'https://www.youtube.com/watch?v=wtubL3MIOq8',
    1080,
    2,
    'PURCHASED',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Add some purchase records (student1 purchased Journey 1)
INSERT INTO user_purchases (id, user_id, journey_id, purchased_at)
VALUES (
    'b1111111-1111-1111-1111-111111111111',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    CURRENT_TIMESTAMP
);

-- Add some lesson progress records for student1
INSERT INTO lesson_progress (id, user_id, lesson_id, is_completed, last_position_seconds, completed_at, created_at, updated_at)
VALUES 
(
    'c0011111-1111-1111-1111-111111111111',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'aaaa1111-1111-1111-1111-111111111111',
    TRUE,
    600,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'c0022222-2222-2222-2222-222222222222',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'aaaa2222-2222-2222-2222-222222222222',
    TRUE,
    720,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'c0033333-3333-3333-3333-333333333333',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'aaaa3333-3333-3333-3333-333333333333',
    FALSE,
    0,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'c0044444-4444-4444-4444-444444444444',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'bbbb1111-1111-1111-1111-111111111111',
    TRUE,
    900,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'c0055555-5555-5555-5555-555555555555',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'bbbb2222-2222-2222-2222-222222222222',
    FALSE,
    425,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
