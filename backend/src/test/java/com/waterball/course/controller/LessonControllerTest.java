package com.waterball.course.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterball.course.dto.request.UpdateProgressRequest;
import com.waterball.course.entity.User;
import com.waterball.course.repository.UserRepository;
import com.waterball.course.service.auth.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class LessonControllerTest extends BaseIntegrationTest {

    private static final UUID PUBLIC_LESSON_ID = UUID.fromString("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID TRIAL_LESSON_ID = UUID.fromString("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID PURCHASED_LESSON_ID = UUID.fromString("33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID NON_EXISTENT_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    private String accessToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findById(TEST_USER_ID).orElseThrow();
        accessToken = jwtService.generateAccessToken(testUser);
    }

    @Nested
    @DisplayName("GET /api/lessons/{lessonId}")
    class GetLessonDetail {

        @Test
        @DisplayName("should return 200 for public lesson")
        void getLessonDetail_withPublicLesson_shouldReturn200() throws Exception {
            mockMvc.perform(get("/api/lessons/{lessonId}", PUBLIC_LESSON_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(PUBLIC_LESSON_ID.toString()))
                    .andExpect(jsonPath("$.title").value("Public Lesson"))
                    .andExpect(jsonPath("$.lessonType").value("VIDEO"))
                    .andExpect(jsonPath("$.instructor.name").value("Instructor"));
        }

        @Test
        @DisplayName("should return 200 for trial lesson")
        void getLessonDetail_withTrialLesson_shouldReturn200() throws Exception {
            mockMvc.perform(get("/api/lessons/{lessonId}", TRIAL_LESSON_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(TRIAL_LESSON_ID.toString()))
                    .andExpect(jsonPath("$.title").value("Trial Lesson"));
        }

        @Test
        @DisplayName("should return 403 for purchased lesson when not purchased")
        void getLessonDetail_withPurchasedLesson_whenNotPurchased_shouldReturn403() throws Exception {
            mockMvc.perform(get("/api/lessons/{lessonId}", PURCHASED_LESSON_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.message").value("請購買此課程以解鎖完整內容"));
        }

        @Test
        @DisplayName("should return 200 for purchased lesson when purchased")
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void getLessonDetail_withPurchasedLesson_whenPurchased_shouldReturn200() throws Exception {
            mockMvc.perform(get("/api/lessons/{lessonId}", PURCHASED_LESSON_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(PURCHASED_LESSON_ID.toString()))
                    .andExpect(jsonPath("$.title").value("Purchased Lesson"));
        }

        @Test
        @DisplayName("should return 404 for invalid id")
        void getLessonDetail_withInvalidId_shouldReturn404() throws Exception {
            mockMvc.perform(get("/api/lessons/{lessonId}", NON_EXISTENT_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without authentication")
        void getLessonDetail_withoutAuth_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/lessons/{lessonId}", PUBLIC_LESSON_ID))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /api/lessons/{lessonId}/progress")
    class UpdateProgress {

        @Test
        @DisplayName("should return 200 with valid request")
        void updateProgress_withValidRequest_shouldReturn200() throws Exception {
            UpdateProgressRequest request = new UpdateProgressRequest();
            request.setLastPositionSeconds(120);

            mockMvc.perform(put("/api/lessons/{lessonId}/progress", PUBLIC_LESSON_ID)
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.lessonId").value(PUBLIC_LESSON_ID.toString()))
                    .andExpect(jsonPath("$.lastPositionSeconds").value(120))
                    .andExpect(jsonPath("$.isCompleted").value(false));
        }

        @Test
        @DisplayName("should return 400 with negative position")
        void updateProgress_withNegativePosition_shouldReturn400() throws Exception {
            String requestJson = "{\"lastPositionSeconds\": -1}";

            mockMvc.perform(put("/api/lessons/{lessonId}/progress", PUBLIC_LESSON_ID)
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestJson))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 401 without authentication")
        void updateProgress_withoutAuth_shouldReturn401() throws Exception {
            UpdateProgressRequest request = new UpdateProgressRequest();
            request.setLastPositionSeconds(120);

            mockMvc.perform(put("/api/lessons/{lessonId}/progress", PUBLIC_LESSON_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/lessons/{lessonId}/complete")
    class CompleteLesson {

        @Test
        @DisplayName("should return 200 with valid request")
        void completeLesson_withValidRequest_shouldReturn200() throws Exception {
            mockMvc.perform(post("/api/lessons/{lessonId}/complete", PUBLIC_LESSON_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.lessonId").value(PUBLIC_LESSON_ID.toString()))
                    .andExpect(jsonPath("$.isCompleted").value(true))
                    .andExpect(jsonPath("$.completedAt").isNotEmpty());
        }

        @Test
        @DisplayName("should return 401 without authentication")
        void completeLesson_withoutAuth_shouldReturn401() throws Exception {
            mockMvc.perform(post("/api/lessons/{lessonId}/complete", PUBLIC_LESSON_ID))
                    .andExpect(status().isUnauthorized());
        }
    }
}
