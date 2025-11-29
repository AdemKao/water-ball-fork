package com.waterball.course.controller;

import com.waterball.course.CoursePlatformApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Base64;

@SpringBootTest(classes = CoursePlatformApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    protected static final String TEST_JWT_SECRET = Base64.getEncoder()
            .encodeToString("test-secret-key-for-jwt-must-be-at-least-256-bits-long-for-hs256".getBytes());
    
    static PostgreSQLContainer<?> postgres;
    
    static {
        postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);
        postgres.start();
    }
    
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
