# Backend Testing Guide

## 1. Overview

The backend uses a multi-layer testing strategy:

| Test Type | Purpose | Tools |
|-----------|---------|-------|
| **Unit Tests** | Test individual components in isolation | JUnit 5, Mockito |
| **Integration Tests** | Test component interactions with real database | Testcontainers, MockMvc |
| **E2E Tests** | Test complete API flows | MockMvc with full Spring context |

### Testcontainers

All integration tests use [Testcontainers](https://testcontainers.com/) to spin up a real PostgreSQL 15 database in Docker. This ensures tests run against the same database engine as production, catching issues that in-memory databases would miss.

## 2. Running Tests

### Prerequisites

- Java 17+
- Maven 3.9+
- Docker (required for Testcontainers)

### Local

```bash
cd backend

mvn test

mvn test -Dtest=ClassName

mvn test -Dtest=ClassName#method
```

Examples:

```bash
mvn test -Dtest=AuthControllerTest

mvn test -Dtest=AuthControllerTest#withValidAccessToken_shouldReturnUser

mvn test -Dtest=HealthCheckControllerTest
```

### Docker

Run tests inside a Docker container (useful for CI or when you don't have Java installed locally):

```bash
docker run --rm \
  -v $(pwd)/backend:/app \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -w /app \
  maven:3.9-eclipse-temurin-17 \
  mvn test
```

> **Note:** The Docker socket mount (`/var/run/docker.sock`) is required for Testcontainers to create the PostgreSQL container.

### Docker Compose

For running tests as part of the full stack:

```bash
docker-compose run --rm backend mvn test
```

## 3. Writing Tests

### Base Test Class

All integration tests should extend `BaseIntegrationTest`:

```java
package com.waterball.course.controller;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Base64;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    protected static final String TEST_JWT_SECRET = Base64.getEncoder()
            .encodeToString("test-secret-key-for-jwt-must-be-at-least-256-bits-long-for-hs256".getBytes());
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("jwt.secret", () -> TEST_JWT_SECRET);
        registry.add("jwt.access-expiration", () -> "1800000");
        registry.add("jwt.refresh-expiration", () -> "2592000000");
        registry.add("google.client-id", () -> "test-google-client-id");
        registry.add("cookie.secure", () -> "false");
    }
}
```

This base class provides:

- **Testcontainers PostgreSQL**: Automatically starts a PostgreSQL 15 container
- **Dynamic Properties**: Configures Spring to use the container's connection details
- **Test Profile**: Activates the `test` Spring profile
- **JWT Test Secret**: Provides a consistent secret for token generation in tests

### Example Test Structure

```java
package com.waterball.course.controller;

import com.waterball.course.entity.User;
import com.waterball.course.entity.UserRole;
import com.waterball.course.repository.UserRepository;
import com.waterball.course.service.auth.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
class ExampleControllerTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setRole(UserRole.STUDENT);
        testUser = userRepository.save(testUser);
    }

    @Nested
    @DisplayName("GET /api/example")
    class GetExample {

        @Test
        @DisplayName("should return 200 when authenticated")
        void whenAuthenticated_shouldReturn200() throws Exception {
            String accessToken = jwtService.generateAccessToken(testUser);

            mockMvc.perform(get("/api/example")
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").exists());
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void whenNotAuthenticated_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/example"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
```

### Key Annotations

| Annotation | Purpose |
|------------|---------|
| `@AutoConfigureMockMvc` | Configures MockMvc for testing HTTP endpoints |
| `@Nested` | Groups related tests together |
| `@DisplayName` | Provides readable test names in reports |
| `@BeforeEach` | Runs setup before each test method |
| `@Test` | Marks a method as a test case |

## 4. Test Configuration

### Application Profiles

The test profile in `application.yml`:

```yaml
spring:
  config:
    activate:
      on-profile: test
  
  datasource:
    url: jdbc:tc:postgresql:15-alpine:///testdb
  
  jpa:
    hibernate:
      ddl-auto: create-drop
```

Key differences from default profile:

- **DDL Auto**: Uses `create-drop` to create fresh schema for each test run
- **Testcontainers JDBC URL**: The `jdbc:tc:` prefix enables Testcontainers JDBC driver

### Dynamic Properties

`BaseIntegrationTest` uses `@DynamicPropertySource` to override properties at runtime:

```java
@DynamicPropertySource
static void configureProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
    registry.add("jwt.secret", () -> TEST_JWT_SECRET);
}
```

This allows the test to use the actual connection details from the Testcontainers-managed PostgreSQL instance.

## 5. Authentication in Tests

### Creating Test Users

```java
@Autowired
private UserRepository userRepository;

@Autowired
private UserAuthProviderRepository authProviderRepository;

private User testUser;

@BeforeEach
void setUp() {
    authProviderRepository.deleteAll();
    userRepository.deleteAll();

    testUser = new User();
    testUser.setEmail("test@example.com");
    testUser.setName("Test User");
    testUser.setPictureUrl("https://example.com/picture.jpg");
    testUser.setRole(UserRole.STUDENT);
    testUser = userRepository.save(testUser);

    UserAuthProvider authProvider = new UserAuthProvider(testUser, AuthProvider.GOOGLE, "google-123");
    authProviderRepository.save(authProvider);
}
```

### Generating Test JWT Tokens

```java
@Autowired
private JwtService jwtService;

String accessToken = jwtService.generateAccessToken(testUser);
String refreshToken = jwtService.generateRefreshToken(testUser);
```

### Passing Cookies to MockMvc

```java
import jakarta.servlet.http.Cookie;

mockMvc.perform(get("/api/auth/me")
                .cookie(new Cookie("access_token", accessToken)))
        .andExpect(status().isOk());

mockMvc.perform(post("/api/auth/refresh")
                .cookie(new Cookie("refresh_token", refreshToken)))
        .andExpect(status().isOk());

mockMvc.perform(get("/api/protected")
                .cookie(new Cookie("access_token", accessToken))
                .cookie(new Cookie("refresh_token", refreshToken)))
        .andExpect(status().isOk());
```

### Verifying Response Cookies

```java
import static org.assertj.core.api.Assertions.assertThat;

MvcResult result = mockMvc.perform(post("/api/auth/refresh")
                .cookie(new Cookie("refresh_token", refreshToken)))
        .andExpect(status().isOk())
        .andReturn();

Cookie accessTokenCookie = result.getResponse().getCookie("access_token");
assertThat(accessTokenCookie).isNotNull();
assertThat(accessTokenCookie.getValue()).isNotEmpty();
assertThat(accessTokenCookie.isHttpOnly()).isTrue();
```

## 6. Common Patterns

### Testing JSON Responses

```java
mockMvc.perform(get("/api/users/me"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
        .andExpect(jsonPath("$.email").value("test@example.com"))
        .andExpect(jsonPath("$.roles").isArray())
        .andExpect(jsonPath("$.roles[0]").value("STUDENT"));
```

### Testing POST Requests with JSON Body

```java
@Autowired
private ObjectMapper objectMapper;

CreateUserRequest request = new CreateUserRequest("test@example.com", "Test User");

mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").exists());
```

### Testing Error Responses

```java
mockMvc.perform(get("/api/users/nonexistent"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Not Found"))
        .andExpect(jsonPath("$.message").exists());
```

## 7. Troubleshooting

### Docker Not Running

```
Could not find a valid Docker environment
```

**Solution:** Start Docker Desktop or the Docker daemon.

### Port Conflicts

Testcontainers uses random ports, so port conflicts are rare. If you see connection issues, ensure no other tests are running simultaneously.

### Slow Tests

- The first test run downloads the PostgreSQL Docker image
- Subsequent runs are faster due to Docker caching
- Consider using `@DirtiesContext` sparingly as it restarts the Spring context

### Database State Between Tests

Each test class shares the same container, but `@BeforeEach` should clean up data:

```java
@BeforeEach
void setUp() {
    repository.deleteAll();
}
```

For complete isolation, use `@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)`.
