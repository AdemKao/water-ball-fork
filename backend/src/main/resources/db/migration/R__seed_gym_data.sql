-- Repeatable Migration: Seed Gym data
-- This script is idempotent and can be re-run safely

-- Clean up existing gym data (cascade deletes stages, problems, prerequisites)
DELETE FROM gyms WHERE journey_id = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

-- Seed Gym data for 軟體設計之路 journey (d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44)

-- ===== MAIN QUEST GYMS =====

-- Gym 1: 白段道館
INSERT INTO gyms (id, journey_id, title, description, gym_type, sort_order, is_published)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '白段道館',
    '設計模式入門練習，適合初學者挑戰',
    'MAIN_QUEST',
    1,
    true
);

-- Stage 1-1: 責任鏈模式
INSERT INTO stages (id, gym_id, title, description, difficulty, sort_order)
VALUES (
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    '責任鏈模式關卡',
    '學習責任鏈模式的應用場景與實作技巧',
    2,
    1
);

-- Problems for Stage 1-1
INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order)
VALUES 
(
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    '責任鏈模式概念題',
    '## 題目說明

請說明責任鏈模式的核心概念，並舉出至少兩個適合使用此模式的場景。

## 繳交格式
- PDF 文件，包含文字說明與 UML 圖',
    1,
    ARRAY['PDF'],
    '[{"order": 1, "content": "思考一下，當你有多個處理器需要依序處理請求時..."}, {"order": 2, "content": "責任鏈模式的關鍵是「傳遞」"}]',
    10,
    1
),
(
    'c1111111-1111-1111-1111-111111111112',
    'b1111111-1111-1111-1111-111111111111',
    '碰撞偵測系統實作',
    '## 題目說明

實作一個碰撞偵測系統，使用責任鏈模式來處理不同類型的碰撞事件。

## 需求
1. 支援至少三種碰撞類型（如：玩家-敵人、玩家-道具、子彈-敵人）
2. 每種碰撞類型有不同的處理邏輯
3. 使用責任鏈模式串接處理器

## 繳交格式
- 程式碼 ZIP 檔案',
    2,
    ARRAY['CODE', 'PDF'],
    '[{"order": 1, "content": "先定義一個抽象的碰撞處理器介面"}, {"order": 2, "content": "每個具體處理器決定是否處理或傳遞給下一個"}]',
    20,
    2
);

-- Stage 1-2: 狀態模式
INSERT INTO stages (id, gym_id, title, description, difficulty, sort_order)
VALUES (
    'b1111111-1111-1111-1111-111111111112',
    'a1111111-1111-1111-1111-111111111111',
    '狀態模式關卡',
    '學習狀態模式，實作有限狀態機',
    3,
    2
);

-- Problems for Stage 1-2
INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order)
VALUES 
(
    'c1111111-1111-1111-1111-111111111113',
    'b1111111-1111-1111-1111-111111111112',
    '角色狀態機設計',
    '## 題目說明

設計遊戲角色的狀態機，包含待機、行走、跳躍、攻擊等狀態。

## 需求
1. 繪製狀態轉換圖
2. 說明每個狀態的進入/離開條件
3. 實作狀態模式的程式碼

## 繳交格式
- PDF 文件（包含狀態圖）
- 程式碼 ZIP 檔案',
    3,
    ARRAY['CODE', 'PDF'],
    '[{"order": 1, "content": "先畫出狀態轉換圖，釐清所有可能的轉換"}, {"order": 2, "content": "每個狀態應該是一個獨立的類別"}]',
    30,
    1
);

-- Gym 2: 黑段道館
INSERT INTO gyms (id, journey_id, title, description, gym_type, sort_order, is_published)
VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '黑段道館',
    '進階設計模式練習，需要較強的物件導向基礎',
    'MAIN_QUEST',
    2,
    true
);

-- Stage 2-1: 複合模式
INSERT INTO stages (id, gym_id, title, description, difficulty, sort_order)
VALUES (
    'b2222222-2222-2222-2222-222222222221',
    'a2222222-2222-2222-2222-222222222222',
    '複合模式關卡',
    '學習複合模式，建立樹狀結構',
    4,
    1
);

-- Problems for Stage 2-1
INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order)
VALUES 
(
    'c2222222-2222-2222-2222-222222222221',
    'b2222222-2222-2222-2222-222222222221',
    '遊戲物件組合系統',
    '## 題目說明

使用複合模式建立遊戲物件的層級結構，支援群組操作。

## 需求
1. 設計 Component 介面
2. 實作 Leaf 和 Composite 類別
3. 支援遞迴操作（如：渲染、更新）

## 繳交格式
- 程式碼 ZIP 檔案
- 設計說明 PDF',
    4,
    ARRAY['CODE', 'PDF'],
    '[{"order": 1, "content": "Component 介面應該包含所有共用操作"}, {"order": 2, "content": "Composite 需要管理子元件的集合"}]',
    40,
    1
);

-- Stage 2-2: 觀察者模式
INSERT INTO stages (id, gym_id, title, description, difficulty, sort_order)
VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    '觀察者模式關卡',
    '學習觀察者模式，實作事件系統',
    3,
    2
);

-- Problems for Stage 2-2
INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order)
VALUES 
(
    'c2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    '遊戲事件系統實作',
    '## 題目說明

實作遊戲內的事件發布/訂閱系統。

## 需求
1. 設計 Subject 和 Observer 介面
2. 實作事件管理器
3. 支援多種事件類型

## 繳交格式
- 程式碼 ZIP 檔案',
    3,
    ARRAY['CODE'],
    '[{"order": 1, "content": "考慮使用泛型來支援不同類型的事件"}, {"order": 2, "content": "注意觀察者的生命週期管理"}]',
    25,
    1
);

-- Gym 3: 大師道館
INSERT INTO gyms (id, journey_id, title, description, gym_type, sort_order, is_published)
VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '大師道館',
    '綜合應用挑戰，結合多種設計模式',
    'MAIN_QUEST',
    3,
    true
);

-- Stage 3-1: 綜合挑戰
INSERT INTO stages (id, gym_id, title, description, difficulty, sort_order)
VALUES (
    'b3333333-3333-3333-3333-333333333331',
    'a3333333-3333-3333-3333-333333333333',
    '綜合應用關卡',
    '結合多種設計模式的綜合挑戰',
    5,
    1
);

-- Problems for Stage 3-1
INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order)
VALUES 
(
    'c3333333-3333-3333-3333-333333333331',
    'b3333333-3333-3333-3333-333333333331',
    'RPG 戰鬥系統',
    '## 題目說明

結合多種設計模式，實作完整的 RPG 戰鬥系統。

## 需求
1. 使用策略模式處理不同攻擊類型
2. 使用狀態模式管理戰鬥狀態
3. 使用觀察者模式處理戰鬥事件
4. 使用工廠模式創建角色和技能

## 繳交格式
- 程式碼 ZIP 檔案
- 設計文件 PDF（含 UML 圖）
- 展示影片 MP4（可選）',
    5,
    ARRAY['CODE', 'PDF', 'MP4'],
    '[{"order": 1, "content": "先設計整體架構，確定各模式的職責"}, {"order": 2, "content": "可以先實作核心功能，再逐步加入設計模式"}]',
    100,
    1
);

-- ===== SIDE QUEST GYMS =====

-- Gym 4: 重構練習場
INSERT INTO gyms (id, journey_id, title, description, gym_type, sort_order, is_published)
VALUES (
    'a4444444-4444-4444-4444-444444444444',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '重構練習場',
    '程式碼重構練習，學習如何改善既有程式碼結構',
    'SIDE_QUEST',
    4,
    true
);

-- Stage 4-1: 基礎重構
INSERT INTO stages (id, gym_id, title, description, difficulty, sort_order)
VALUES (
    'b4444444-4444-4444-4444-444444444441',
    'a4444444-4444-4444-4444-444444444444',
    '基礎重構技巧',
    '學習基本的重構手法',
    2,
    1
);

-- Problems for Stage 4-1
INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order)
VALUES 
(
    'c4444444-4444-4444-4444-444444444441',
    'b4444444-4444-4444-4444-444444444441',
    '巨型函式拆解',
    '## 題目說明

將一個 200 行的函式拆分成多個職責單一的小函式。

## 繳交格式
- 重構前後的程式碼對比 PDF
- 重構後的程式碼 ZIP',
    2,
    ARRAY['CODE', 'PDF'],
    '[{"order": 1, "content": "先找出函式中的不同職責區塊"}, {"order": 2, "content": "每個提取的方法應該有明確的命名"}]',
    15,
    1
),
(
    'c4444444-4444-4444-4444-444444444442',
    'b4444444-4444-4444-4444-444444444441',
    '消除重複程式碼',
    '## 題目說明

找出並消除程式碼中的重複邏輯，應用 DRY 原則。

## 繳交格式
- 程式碼 ZIP 檔案',
    2,
    ARRAY['CODE'],
    '[{"order": 1, "content": "使用 diff 工具找出相似的程式碼區塊"}, {"order": 2, "content": "考慮使用模板方法模式或策略模式"}]',
    15,
    2
);

-- Gym 5: 程式碼審查道場
INSERT INTO gyms (id, journey_id, title, description, gym_type, sort_order, is_published)
VALUES (
    'a5555555-5555-5555-5555-555555555555',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '程式碼審查道場',
    '透過 Code Review 練習提升程式碼品質',
    'SIDE_QUEST',
    5,
    true
);

-- Stage 5-1: Code Review 練習
INSERT INTO stages (id, gym_id, title, description, difficulty, sort_order)
VALUES (
    'b5555555-5555-5555-5555-555555555551',
    'a5555555-5555-5555-5555-555555555555',
    'Code Review 技巧',
    '學習如何進行有效的程式碼審查',
    3,
    1
);

-- Problems for Stage 5-1
INSERT INTO problems (id, stage_id, title, description, difficulty, submission_types, hints, exp_reward, sort_order)
VALUES 
(
    'c5555555-5555-5555-5555-555555555551',
    'b5555555-5555-5555-5555-555555555551',
    '找出 Bug 練習',
    '## 題目說明

審查一段程式碼，找出其中的潛在 Bug。

## 繳交格式
- PDF 文件，列出發現的問題和修復建議',
    2,
    ARRAY['PDF'],
    '[{"order": 1, "content": "注意邊界條件和例外處理"}, {"order": 2, "content": "檢查空值處理"}]',
    15,
    1
),
(
    'c5555555-5555-5555-5555-555555555552',
    'b5555555-5555-5555-5555-555555555551',
    '效能問題檢測',
    '## 題目說明

審查程式碼並找出效能瓶頸。

## 繳交格式
- PDF 文件，包含問題分析和優化建議',
    3,
    ARRAY['PDF'],
    '[{"order": 1, "content": "注意迴圈內的重複計算"}, {"order": 2, "content": "檢查資料結構的選擇是否合適"}]',
    20,
    2
);

-- ===== PREREQUISITES =====

-- Stage 1-2 requires completing problem c1111111-1111-1111-1111-111111111112 (碰撞偵測系統實作)
INSERT INTO stage_prerequisites (stage_id, prerequisite_problem_id)
VALUES ('b1111111-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111112');

-- Problem c1111111-1111-1111-1111-111111111112 requires completing c1111111-1111-1111-1111-111111111111
INSERT INTO problem_prerequisites (problem_id, prerequisite_problem_id)
VALUES ('c1111111-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111');
