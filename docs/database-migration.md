# Database Migration Guide

## 1. Overview

This project uses [Flyway](https://flywaydb.org/) for database schema versioning and migrations. Flyway tracks which migrations have been applied and ensures the database schema evolves consistently across all environments.

**Key Concepts:**

- Migrations are versioned SQL scripts that modify the database schema
- Flyway maintains a `flyway_schema_history` table to track applied migrations
- Migrations are immutable once applied - never modify an executed migration

**Configuration:**

- **Database:** PostgreSQL 15
- **Migration location:** `backend/src/main/resources/db/migration/`
- **Naming convention:** `V{version}__{description}.sql` (note: double underscore)

**Current Migrations:**

| Version | Description | File |
|---------|-------------|------|
| V1 | Initial schema | `V1__init_schema.sql` |
| V2 | Users and auth tables | `V2__create_users_and_auth_tables.sql` |

## 2. Running Migrations

### Local Development (with Docker PostgreSQL)

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Run migrations automatically when starting Spring Boot
cd backend
./mvnw spring-boot:run

# Or run migrations only (without starting the app)
./mvnw flyway:migrate \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123
```

### Docker (Full Stack)

```bash
# Start all services (migrations run automatically on backend startup)
docker-compose up

# View migration logs
docker-compose logs backend | grep -i flyway

# Run migrations only in Docker environment
docker-compose run --rm backend ./mvnw flyway:migrate \
  -Dflyway.url=jdbc:postgresql://postgres:5432/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123
```

### Production

```bash
# 1. Always backup before migrations
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Validate migrations first (dry run)
./mvnw flyway:validate \
  -Dflyway.url=$DATABASE_URL \
  -Dflyway.user=$DB_USER \
  -Dflyway.password=$DB_PASSWORD

# 3. Apply migrations
./mvnw flyway:migrate \
  -Dflyway.url=$DATABASE_URL \
  -Dflyway.user=$DB_USER \
  -Dflyway.password=$DB_PASSWORD

# 4. Verify migration status
./mvnw flyway:info \
  -Dflyway.url=$DATABASE_URL \
  -Dflyway.user=$DB_USER \
  -Dflyway.password=$DB_PASSWORD
```

**Production Best Practices:**

- Run migrations during maintenance windows when possible
- Always backup the database before applying migrations
- Use `flyway:validate` before `flyway:migrate`
- Consider using a CI/CD pipeline for automated migrations
- Monitor application logs during migration

## 3. Flyway Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `flyway:migrate` | Apply pending migrations | Primary command for updating schema |
| `flyway:info` | Show migration status | Check which migrations are applied/pending |
| `flyway:validate` | Validate applied migrations | Verify checksums match and no manual changes |
| `flyway:clean` | Drop all database objects | **DANGER: Development only!** |
| `flyway:repair` | Repair schema history table | Fix failed migrations or checksum mismatches |
| `flyway:baseline` | Baseline existing database | Mark existing schema as version 1 |

### Maven Commands

```bash
# Apply pending migrations
./mvnw flyway:migrate \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123

# Check migration status
./mvnw flyway:info \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123

# Validate migrations
./mvnw flyway:validate \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123

# Clean database (DEVELOPMENT ONLY - destroys all data!)
./mvnw flyway:clean \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123 \
  -Dflyway.cleanDisabled=false

# Repair schema history
./mvnw flyway:repair \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123
```

## 4. Creating New Migrations

### Step-by-Step Guide

1. **Determine the next version number**

   ```bash
   ls backend/src/main/resources/db/migration/
   # Currently: V1, V2 -> Next version is V3
   ```

2. **Create the migration file**

   ```bash
   touch backend/src/main/resources/db/migration/V3__create_courses_table.sql
   ```

3. **Write SQL DDL statements**
   - Use PostgreSQL-specific syntax
   - Include indexes for frequently queried columns
   - Add foreign key constraints with appropriate actions

4. **Test locally**

   ```bash
   cd backend
   ./mvnw flyway:migrate \
     -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
     -Dflyway.user=waterball \
     -Dflyway.password=waterball123
   ```

5. **Verify the migration**

   ```bash
   ./mvnw flyway:info \
     -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
     -Dflyway.user=waterball \
     -Dflyway.password=waterball123
   ```

### Example Migration

```sql
-- V3__create_courses_table.sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    thumbnail_url VARCHAR(500),
    price DECIMAL(10, 2) DEFAULT 0.00,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_title ON courses(title);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_is_published ON courses(is_published);
```

### Rollback Strategy

Flyway Community Edition does not support automatic rollbacks. Document rollback SQL separately:

```sql
-- V3__create_courses_table_ROLLBACK.sql (DO NOT place in migration folder)
-- Use this manually if rollback is needed

DROP INDEX IF EXISTS idx_courses_is_published;
DROP INDEX IF EXISTS idx_courses_instructor_id;
DROP INDEX IF EXISTS idx_courses_title;
DROP TABLE IF EXISTS courses;

-- After manual rollback, repair the schema history:
-- DELETE FROM flyway_schema_history WHERE version = '3';
```

## 5. Best Practices

### Do's

- **Test migrations locally** before committing
- **Backup production databases** before applying migrations
- **Use descriptive names** for migration files (e.g., `V3__create_courses_table.sql`)
- **Include indexes** for columns used in WHERE clauses or JOINs
- **Use UUID** for primary keys (PostgreSQL `gen_random_uuid()`)
- **Add appropriate constraints** (NOT NULL, UNIQUE, FOREIGN KEY)
- **Keep migrations small** and focused on a single change
- **Document complex migrations** with SQL comments

### Don'ts

- **Never modify** an already executed migration
- **Never delete** a migration file that has been applied
- **Never use `flyway:clean`** in production
- **Avoid data migrations** in schema migrations when possible
- **Don't skip version numbers** (V1, V2, V3... not V1, V3, V5)

### Migration Patterns

```sql
-- Adding a nullable column (safe)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Adding a NOT NULL column (requires default or backfill)
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL;

-- Renaming a column
ALTER TABLE users RENAME COLUMN username TO display_name;

-- Adding a foreign key
ALTER TABLE courses ADD CONSTRAINT fk_courses_instructor 
    FOREIGN KEY (instructor_id) REFERENCES users(id);
```

## 6. Troubleshooting

### Migration Checksum Mismatch

**Error:** `Migration checksum mismatch for migration version X`

**Cause:** A migration file was modified after it was applied.

**Solution:**

```bash
# Option 1: Repair (if change was intentional and safe)
./mvnw flyway:repair \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123

# Option 2: Revert the file change (preferred)
git checkout backend/src/main/resources/db/migration/VX__*.sql
```

### Failed Migration Recovery

**Error:** Migration failed mid-execution

**Solution:**

```bash
# 1. Fix the underlying issue (syntax error, constraint violation, etc.)

# 2. Manually clean up partial changes if needed
psql -h localhost -p 54325 -U waterball -d course_platform
# Run cleanup SQL...

# 3. Repair the schema history
./mvnw flyway:repair \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123

# 4. Re-run migrations
./mvnw flyway:migrate \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123
```

### Schema Out of Sync

**Error:** Database schema doesn't match JPA entities

**Solution:**

```bash
# 1. Check current migration status
./mvnw flyway:info \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123

# 2. Validate migrations
./mvnw flyway:validate \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123

# 3. For local development, consider clean + migrate
./mvnw flyway:clean flyway:migrate \
  -Dflyway.url=jdbc:postgresql://localhost:54325/course_platform \
  -Dflyway.user=waterball \
  -Dflyway.password=waterball123 \
  -Dflyway.cleanDisabled=false
```

### Pending Migrations Not Detected

**Cause:** Migration files not in the correct location or naming format.

**Checklist:**

- [ ] File is in `backend/src/main/resources/db/migration/`
- [ ] Filename starts with `V` followed by a number
- [ ] Double underscore `__` separates version from description
- [ ] File extension is `.sql`
- [ ] No spaces in filename

## 7. Configuration

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:54325/course_platform
    username: waterball
    password: waterball123
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate  # Validates schema matches entities; doesn't modify
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

  flyway:
    enabled: true
    baseline-on-migrate: true  # Creates baseline for existing databases
    locations: classpath:db/migration
```

### Configuration Options

| Property | Description | Default |
|----------|-------------|---------|
| `spring.flyway.enabled` | Enable/disable Flyway | `true` |
| `spring.flyway.locations` | Migration file locations | `classpath:db/migration` |
| `spring.flyway.baseline-on-migrate` | Baseline existing databases | `false` |
| `spring.flyway.baseline-version` | Version to use for baseline | `1` |
| `spring.flyway.validate-on-migrate` | Validate before migrating | `true` |
| `spring.flyway.out-of-order` | Allow out-of-order migrations | `false` |
| `spring.flyway.clean-disabled` | Disable clean command | `true` |

### Docker Profile Configuration

```yaml
---
spring:
  config:
    activate:
      on-profile: docker
  
  datasource:
    url: jdbc:postgresql://postgres:5432/course_platform
```

### Test Profile Configuration

```yaml
---
spring:
  config:
    activate:
      on-profile: test
  
  datasource:
    url: jdbc:tc:postgresql:15-alpine:///testdb  # Testcontainers
  
  jpa:
    hibernate:
      ddl-auto: create-drop  # Auto-create for tests
```

## 8. Adding Flyway Maven Plugin (Optional)

To use Flyway commands directly via Maven, add the plugin to `pom.xml`:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-maven-plugin</artifactId>
            <version>9.22.3</version>
            <configuration>
                <url>jdbc:postgresql://localhost:54325/course_platform</url>
                <user>waterball</user>
                <password>waterball123</password>
                <locations>
                    <location>classpath:db/migration</location>
                </locations>
            </configuration>
            <dependencies>
                <dependency>
                    <groupId>org.postgresql</groupId>
                    <artifactId>postgresql</artifactId>
                    <version>42.7.1</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>
```
