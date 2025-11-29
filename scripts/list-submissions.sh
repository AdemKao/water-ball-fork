#!/bin/bash
#
# 查詢 Submissions Script - 列出最近的 submissions
#
# 使用方式：
#   在 project 目錄下執行：
#   ./scripts/list-submissions.sh [數量]
#
# 範例：
#   # 查看最近 5 筆 (預設)
#   ./scripts/list-submissions.sh
#
#   # 查看最近 10 筆
#   ./scripts/list-submissions.sh 10
#
# 前置條件：
#   - Docker 正在執行
#   - waterball-course-db container 正在執行 (docker-compose up)
#

CONTAINER_NAME="waterball-course-db"
DB_NAME="course_platform"
DB_USER="waterball"

LIMIT=${1:-5}

echo "Recent $LIMIT submissions:"
echo ""

docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \
  "SELECT 
    s.id,
    s.status,
    COALESCE(r.status, '-') as review_status,
    s.file_name,
    s.submitted_at
  FROM submissions s
  LEFT JOIN reviews r ON r.submission_id = s.id
  ORDER BY s.submitted_at DESC 
  LIMIT $LIMIT;"
