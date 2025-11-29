#!/bin/bash
#
# 退回 Script - 將 submission 標記為已批改但退回
#
# 使用方式：
#   在 project 目錄下執行：
#   ./scripts/reject-submission.sh <submission-id> [退回原因]
#
# 範例：
#   # 查看最近的 submissions
#   ./scripts/reject-submission.sh
#
#   # 使用預設原因退回
#   ./scripts/reject-submission.sh 147fd8d6-adcd-437e-823e-b034798345b2
#
#   # 自訂原因退回
#   ./scripts/reject-submission.sh 147fd8d6-adcd-437e-823e-b034798345b2 "請補充說明設計理由"
#
# 前置條件：
#   - Docker 正在執行
#   - waterball-course-db container 正在執行 (docker-compose up)
#

CONTAINER_NAME="waterball-course-db"
DB_NAME="course_platform"
DB_USER="waterball"

if [ -z "$1" ]; then
  echo "Usage: $0 <submission-id> [reject-reason]"
  echo ""
  echo "Example:"
  echo "  $0 147fd8d6-adcd-437e-823e-b034798345b2"
  echo "  $0 147fd8d6-adcd-437e-823e-b034798345b2 \"請補充說明設計理由\""
  echo ""
  echo "Recent submissions:"
  docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \
    "SELECT id, status, file_name, submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 5;"
  exit 1
fi

SUBMISSION_ID=$1
REASON=${2:-"請重新檢視作業內容，補充更多細節說明。"}

echo "Rejecting submission: $SUBMISSION_ID"
echo "Reason: $REASON"
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
     VALUES (gen_random_uuid(), '$SUBMISSION_ID', '$REVIEWER_ID', '$REASON', 'NEEDS_REVISION', NOW());"
  
  echo ""
  echo "Done! Submission rejected."
else
  echo "Error: Submission not found."
  exit 1
fi
