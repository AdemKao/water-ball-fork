package com.waterball.course.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterball.course.controller.BaseIntegrationTest;
import com.waterball.course.dto.request.UpdateProgressRequest;
import com.waterball.course.entity.User;
import com.waterball.course.repository.UserRepository;
import com.waterball.course.service.auth.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("Course E2E Tests")
class CourseE2ETest extends BaseIntegrationTest {

    private static final UUID PUBLISHED_JOURNEY_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID PUBLIC_LESSON_ID = UUID.fromString("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID TRIAL_LESSON_ID = UUID.fromString("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID PURCHASED_LESSON_ID = UUID.fromString("33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

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

    @Test
    @DisplayName("Scenario 6.1.1: Anonymous user can browse journey list")
    void anonymousUser_canBrowseJourneyList() throws Exception {
        mockMvc.perform(get("/api/journeys"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Published Journey"))
                .andExpect(jsonPath("$[0].chapterCount").value(2))
                .andExpect(jsonPath("$[0].lessonCount").value(4));
    }

    @Test
    @DisplayName("Scenario 6.1.2: Anonymous user can browse journey detail")
    void anonymousUser_canBrowseJourneyDetail() throws Exception {
        mockMvc.perform(get("/api/journeys/{journeyId}", PUBLISHED_JOURNEY_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(PUBLISHED_JOURNEY_ID.toString()))
                .andExpect(jsonPath("$.isPurchased").value(false))
                .andExpect(jsonPath("$.chapters[0].lessons[0].isCompleted").value(false))
                .andExpect(jsonPath("$.chapters[0].lessons[1].isCompleted").value(false));
    }

    @Test
    @DisplayName("Scenario 6.1.3: Authenticated user can access PUBLIC lesson")
    void authenticatedUser_canAccessPublicLesson() throws Exception {
        mockMvc.perform(get("/api/lessons/{lessonId}", PUBLIC_LESSON_ID)
                        .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(PUBLIC_LESSON_ID.toString()))
                .andExpect(jsonPath("$.title").value("Public Lesson"))
                .andExpect(jsonPath("$.lessonType").value("VIDEO"));
    }

    @Test
    @DisplayName("Scenario 6.1.4: Authenticated user can access TRIAL lesson")
    void authenticatedUser_canAccessTrialLesson() throws Exception {
        mockMvc.perform(get("/api/lessons/{lessonId}", TRIAL_LESSON_ID)
                        .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TRIAL_LESSON_ID.toString()))
                .andExpect(jsonPath("$.title").value("Trial Lesson"));
    }

    @Test
    @DisplayName("Scenario 6.1.5: Authenticated user cannot access PURCHASED lesson when not purchased")
    void authenticatedUser_cannotAccessPurchasedLesson_whenNotPurchased() throws Exception {
        mockMvc.perform(get("/api/lessons/{lessonId}", PURCHASED_LESSON_ID)
                        .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("請購買此課程以解鎖完整內容"));
    }

    @Test
    @DisplayName("Scenario 6.1.6: Authenticated user can access PURCHASED lesson when purchased")
    @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    void authenticatedUser_canAccessPurchasedLesson_whenPurchased() throws Exception {
        mockMvc.perform(get("/api/lessons/{lessonId}", PURCHASED_LESSON_ID)
                        .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(PURCHASED_LESSON_ID.toString()))
                .andExpect(jsonPath("$.title").value("Purchased Lesson"))
                .andExpect(jsonPath("$.lessonType").value("ARTICLE"));
    }

    @Test
    @DisplayName("Scenario 6.1.7: Authenticated user can update and query progress")
    void authenticatedUser_canUpdateAndQueryProgress() throws Exception {
        UpdateProgressRequest updateRequest = new UpdateProgressRequest();
        updateRequest.setLastPositionSeconds(300);
        mockMvc.perform(put("/api/lessons/{lessonId}/progress", PUBLIC_LESSON_ID)
                        .cookie(new Cookie("access_token", accessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value(PUBLIC_LESSON_ID.toString()))
                .andExpect(jsonPath("$.lastPositionSeconds").value(300));

        mockMvc.perform(get("/api/journeys/{journeyId}/progress", PUBLISHED_JOURNEY_ID)
                        .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.journeyId").value(PUBLISHED_JOURNEY_ID.toString()))
                .andExpect(jsonPath("$.totalLessons").value(4))
                .andExpect(jsonPath("$.completedLessons").value(0));
    }

    @Test
    @DisplayName("Scenario 6.1.8: Authenticated user can mark lesson complete")
    void authenticatedUser_canMarkLessonComplete() throws Exception {
        mockMvc.perform(post("/api/lessons/{lessonId}/complete", PUBLIC_LESSON_ID)
                        .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value(PUBLIC_LESSON_ID.toString()))
                .andExpect(jsonPath("$.isCompleted").value(true))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());

        mockMvc.perform(get("/api/journeys/{journeyId}/progress", PUBLISHED_JOURNEY_ID)
                        .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedLessons").value(1))
                .andExpect(jsonPath("$.progressPercentage").value(25));
    }
}
