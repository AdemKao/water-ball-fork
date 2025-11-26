# Development Guide

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Java 17+
- Maven 3.9+

### Environment Setup

1. 複製環境變數範例檔案：

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. 修改 `.env` 檔案中的設定

### Local Development

#### Docker Development (推薦)

使用 `docker-compose.dev.yml` 可以啟動完整開發環境，前後端都支援 hot reload：

```bash
docker compose -f docker-compose.dev.yml up
```

這會啟動：
- PostgreSQL (port 54325)
- Backend with hot reload (port 8888)
- Frontend with hot reload (port 3388)

##### Frontend Hot Reload

修改前端程式碼後會自動刷新頁面。

##### Backend Hot Reload

後端使用 Spring Boot DevTools，修改 Java 檔案後：

1. **IntelliJ IDEA**: 按 `Cmd+F9` (Mac) 或 `Ctrl+F9` (Windows/Linux) 重新 build
2. **VS Code**: 儲存檔案後執行 `mvn compile`
3. **命令列**: 在 backend 目錄執行 `mvn compile`

DevTools 會偵測 class 檔案變更並自動重啟應用程式（通常 1-2 秒）。

**注意事項：**
- 首次啟動較慢（需下載 Maven 依賴），之後會快很多（maven-repo volume 會 cache）
- 如果改動了 `pom.xml`，需要重啟 container
- 結構性改動（如新增 Spring Bean）可能需要完整重啟

#### Production-like Docker

使用 `docker-compose.yml` 啟動 production build：

```bash
docker compose up --build
```

#### Backend Development

```bash
cd backend

./mvnw spring-boot:run
```

Backend 會在 `http://localhost:8888` 啟動

#### Frontend Development

```bash
cd frontend

npm install

npm run dev
```

Frontend 會在 `http://localhost:3388` 啟動

#### Database

使用 Docker Compose 啟動 PostgreSQL：

```bash
docker-compose up postgres
```

或連接到已存在的 PostgreSQL instance。

## Project Structure

### Backend

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/waterball/course/
│   │   │   ├── controller/          # REST API endpoints
│   │   │   ├── service/              # Business logic
│   │   │   ├── repository/           # Data access
│   │   │   ├── model/
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   └── dto/             # Data transfer objects
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── exception/           # Custom exceptions
│   │   │   └── util/                # Utility classes
│   │   └── resources/
│   │       ├── application.yml      # Application config
│   │       └── db/migration/        # Flyway migrations
│   └── test/                        # Tests
├── Dockerfile
└── pom.xml
```

### Frontend

```
frontend/
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/
│   │   ├── ui/            # shadcn components
│   │   └── features/      # Feature components
│   ├── lib/               # Utilities
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── types/             # TypeScript types
├── public/
├── Dockerfile
├── next.config.ts
└── package.json
```

## Database Migration

此專案使用 **Flyway** 進行 database schema 版本管理。

### Migration 檔案位置

```
backend/src/main/resources/db/migration/
├── V1__init_schema.sql
├── V2__create_courses_table.sql
└── V3__add_user_roles.sql
```

### 命名規則

- 格式：`V{版本號}__{描述}.sql`
- 版本號範例：`V1`, `V1_1`, `V20231123`
- 描述使用底線分隔：`create_users_table`

### 建立新的 Migration

1. 在 `backend/src/main/resources/db/migration/` 建立新的 SQL 檔案
2. 遵循命名規則（版本號必須遞增）
3. 撰寫 DDL 語句

範例：

```sql
-- V2__create_courses_table.sql
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_title ON courses(title);
```

### 重要事項

- Migration 檔案一旦被執行就**不能修改**
- 如需變更，請建立新的 migration 檔案
- Flyway 會自動在啟動時執行未執行的 migration
- 使用 `hibernate.ddl-auto=validate` 確保 schema 與 Entity 一致

## Development Workflow

### Adding a New Feature

1. 在 `specs/` 建立新的需求文件夾
2. 撰寫 spec.md, plan.md, tasks.md
3. 實作 Backend:
   - **建立 Flyway migration** (如需 DB 變更)
   - Entity → Repository → Service → Controller
4. 實作 Frontend:
   - Types → Service → Component
5. 撰寫測試
6. 更新文件

### Backend Development

#### Creating a New Entity

```java
@Entity
@Table(name = "courses")
@Getter @Setter
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
}
```

#### Creating a Repository

```java
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTitleContaining(String keyword);
}
```

#### Creating a Service

```java
@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    
    public List<Course> searchCourses(String keyword) {
        return courseRepository.findByTitleContaining(keyword);
    }
}
```

#### Creating a Controller

```java
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;
    
    @GetMapping("/search")
    public ResponseEntity<List<Course>> search(@RequestParam String q) {
        return ResponseEntity.ok(courseService.searchCourses(q));
    }
}
```

### Frontend Development

#### Creating a Service

```typescript
export const courseService = {
  searchCourses: async (keyword: string): Promise<Course[]> => {
    return apiClient.get(`/api/courses/search?q=${keyword}`);
  },
};
```

#### Creating a Component

```tsx
'use client';

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      const data = await courseService.searchCourses('');
      setCourses(data);
    };
    loadCourses();
  }, []);

  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

## Testing

### Backend Tests

執行所有測試：

```bash
cd backend
./mvnw test
```

執行特定測試：

```bash
./mvnw test -Dtest=HealthCheckControllerTest
```

### E2E Tests

E2E 測試使用 TestContainers 自動啟動 PostgreSQL container：

```java
@SpringBootTest
@Testcontainers
class MyIntegrationTest extends BaseIntegrationTest {
    
    @Test
    void testSomething() {
        // test code
    }
}
```

## Code Style

- Backend: 遵循 Java standard conventions
- Frontend: 使用 ESLint + Prettier
- 不要加註解除非必要
- 使用有意義的變數和函式名稱

## Common Issues

### Port Already in Use

如果 port 被佔用：

```bash
lsof -ti:8888 | xargs kill -9   # Backend
lsof -ti:3388 | xargs kill -9   # Frontend
lsof -ti:54325 | xargs kill -9  # PostgreSQL
```

### Docker Build Fails

清除 Docker cache：

```bash
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
```

### Database Connection Issues

檢查 PostgreSQL 是否正在執行：

```bash
docker-compose ps
```

查看 logs：

```bash
docker-compose logs postgres
```
