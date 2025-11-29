#!/bin/bash
#
# 批改通過 Script - 將 submission 標記為已批改並通過
#
# 使用方式：
#   在 project 目錄下執行：
#   ./scripts/approve-submission.sh <submission-id> [評語]
#
# 範例：
#   # 查看最近的 submissions
#   ./scripts/approve-submission.sh
#
#   # 使用預設評語批改通過
#   ./scripts/approve-submission.sh 147fd8d6-adcd-437e-823e-b034798345b2
#
#   # 自訂評語批改通過
#   ./scripts/approve-submission.sh 147fd8d6-adcd-437e-823e-b034798345b2 "非常優秀！"
#
# 前置條件：
#   - Docker 正在執行
#   - waterball-course-db container 正在執行 (docker-compose up)
#

CONTAINER_NAME="waterball-course-db"
DB_NAME="course_platform"
DB_USER="waterball"

if [ -z "$1" ]; then
  echo "Usage: $0 <submission-id> [review-comment]"
  echo ""
  echo "Example:"
  echo "  $0 147fd8d6-adcd-437e-823e-b034798345b2"
  echo "  $0 147fd8d6-adcd-437e-823e-b034798345b2 \"做得很好！\""
  echo ""
  echo "Recent submissions:"
  docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \
    "SELECT id, status, file_name, submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 5;"
  exit 1
fi

SUBMISSION_ID=$1
COMMENT=${2:-"做得很好！程式碼結構清晰，邏輯正確。"}

echo "Approving submission: $SUBMISSION_ID"
echo "Comment: $COMMENT"
echo ""

docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \
  "UPDATE submissions SET status = 'REVIEWED' WHERE id = '$SUBMISSION_ID';"

REVIEWER_ID=$(docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c \
  "SELECT user_id FROM submissions WHERE id = '$SUBMISSION_ID';" | tr -d ' \n')

if [ -n "$REVIEWER_ID" ]; then
  docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \
    "DELETE FROM reviews WHERE submission_id = '$SUBMISSION_ID';"
  
  docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \
    "INSERT INTO reviews (id, submission_id, reviewer_id, content, status, reviewed_at) 
     VALUES (gen_random_uuid(), '$SUBMISSION_ID', '$REVIEWER_ID', '$COMMENT', 'APPROVED', NOW());"
  
  echo ""
  echo "Done! Submission approved."
else
  echo "Error: Submission not found."
  exit 1
fi
