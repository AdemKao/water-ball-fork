-- Seed Gym data for 軟體設計之路 journey (d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44)

-- Gym 1: 白段道館
INSERT INTO gym (journey_id, title, description, display_order)
VALUES ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '白段道館', '設計模式入門練習，適合初學者挑戰', 1);

-- Gym 2: 黑段道館
INSERT INTO gym (journey_id, title, description, display_order)
VALUES ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '黑段道館', '進階設計模式練習，需要較強的物件導向基礎', 2);

-- Gym 3: 大師道館
INSERT INTO gym (journey_id, title, description, display_order)
VALUES ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '大師道館', '綜合應用挑戰，結合多種設計模式', 3);

-- Exercises for 白段道館 (Gym 1)
INSERT INTO gym_exercise (gym_id, title, description, difficulty, display_order)
VALUES 
((SELECT id FROM gym WHERE title = '白段道館'), '責任鏈模式練習：碰撞偵測 & 處理', '實作一個碰撞偵測系統，使用責任鏈模式來處理不同類型的碰撞事件', 'EASY', 1),
((SELECT id FROM gym WHERE title = '白段道館'), '狀態模式練習：角色狀態機', '設計遊戲角色的狀態機，包含待機、行走、跳躍、攻擊等狀態', 'MEDIUM', 2),
((SELECT id FROM gym WHERE title = '白段道館'), '策略模式練習：攻擊策略切換', '實作可切換的攻擊策略系統，讓角色能夠動態切換不同的攻擊方式', 'EASY', 3);

-- Exercises for 黑段道館 (Gym 2)
INSERT INTO gym_exercise (gym_id, title, description, difficulty, display_order)
VALUES 
((SELECT id FROM gym WHERE title = '黑段道館'), '複合模式練習：遊戲物件組合', '使用複合模式建立遊戲物件的層級結構，支援群組操作', 'HARD', 1),
((SELECT id FROM gym WHERE title = '黑段道館'), '工廠模式練習：物件工廠', '設計物件生成工廠，支援多種類型的遊戲物件創建', 'MEDIUM', 2),
((SELECT id FROM gym WHERE title = '黑段道館'), '觀察者模式練習：事件系統', '實作遊戲內的事件發布/訂閱系統', 'MEDIUM', 3);

-- Exercises for 大師道館 (Gym 3)
INSERT INTO gym_exercise (gym_id, title, description, difficulty, display_order)
VALUES 
((SELECT id FROM gym WHERE title = '大師道館'), '綜合挑戰：RPG 戰鬥系統', '結合多種設計模式，實作完整的 RPG 戰鬥系統', 'HARD', 1),
((SELECT id FROM gym WHERE title = '大師道館'), '綜合挑戰：物件池系統', '實作高效能的物件池，管理遊戲中的可重用物件', 'HARD', 2);
