package com.waterball.course.controller;

import com.waterball.course.entity.User;
import com.waterball.course.entity.UserRole;
import com.waterball.course.repository.*;
import com.waterball.course.service.auth.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class JourneyControllerTest extends BaseIntegrationTest {

    private static final UUID PUBLISHED_JOURNEY_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID UNPUBLISHED_JOURNEY_ID = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID NON_EXISTENT_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");

    @Autowired
    private MockMvc mockMvc;

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
    @DisplayName("GET /api/journeys")
    class GetJourneys {

        @Test
        @DisplayName("should return published journeys")
        void getJourneys_shouldReturnPublishedJourneys() throws Exception {
            mockMvc.perform(get("/api/journeys"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id").value(PUBLISHED_JOURNEY_ID.toString()))
                    .andExpect(jsonPath("$[0].title").value("Published Journey"))
                    .andExpect(jsonPath("$[0].chapterCount").value(2))
                    .andExpect(jsonPath("$[0].lessonCount").value(4))
                    .andExpect(jsonPath("$[0].totalDurationSeconds").value(1200));
        }

        @Test
        @DisplayName("should not return unpublished journeys")
        void getJourneys_shouldNotReturnUnpublishedJourneys() throws Exception {
            mockMvc.perform(get("/api/journeys"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].id", not(hasItem(UNPUBLISHED_JOURNEY_ID.toString()))));
        }
    }

    @Nested
    @DisplayName("GET /api/journeys/{journeyId}")
    class GetJourneyDetail {

        @Test
        @DisplayName("should return journey detail with valid id")
        void getJourneyDetail_withValidId_shouldReturnJourney() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}", PUBLISHED_JOURNEY_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(PUBLISHED_JOURNEY_ID.toString()))
                    .andExpect(jsonPath("$.title").value("Published Journey"))
                    .andExpect(jsonPath("$.chapters", hasSize(2)))
                    .andExpect(jsonPath("$.chapters[0].title").value("Chapter 1"))
                    .andExpect(jsonPath("$.chapters[0].lessons", hasSize(2)))
                    .andExpect(jsonPath("$.isPurchased").value(false));
        }

        @Test
        @DisplayName("should return 404 with invalid id")
        void getJourneyDetail_withInvalidId_shouldReturn404() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}", NON_EXISTENT_ID))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 404 for unpublished journey")
        void getJourneyDetail_withUnpublishedJourney_shouldReturn404() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}", UNPUBLISHED_JOURNEY_ID))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return purchase status when authenticated")
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void getJourneyDetail_withAuthenticatedUser_shouldReturnPurchaseStatus() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}", PUBLISHED_JOURNEY_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isPurchased").value(true));
        }

        @Test
        @DisplayName("should return progress when authenticated")
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        @Sql(scripts = "/sql/test-progress-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void getJourneyDetail_withAuthenticatedUser_shouldReturnProgress() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}", PUBLISHED_JOURNEY_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.chapters[0].lessons[0].isCompleted").value(true));
        }
    }

    @Nested
    @DisplayName("GET /api/journeys/{journeyId}/progress")
    class GetJourneyProgress {

        @Test
        @DisplayName("should return progress with valid id")
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        @Sql(scripts = "/sql/test-progress-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void getJourneyProgress_withValidId_shouldReturnProgress() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}/progress", PUBLISHED_JOURNEY_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.journeyId").value(PUBLISHED_JOURNEY_ID.toString()))
                    .andExpect(jsonPath("$.totalLessons").value(4))
                    .andExpect(jsonPath("$.completedLessons").value(1))
                    .andExpect(jsonPath("$.progressPercentage").value(25))
                    .andExpect(jsonPath("$.chapters", hasSize(2)));
        }

        @Test
        @DisplayName("should return 401 without authentication")
        void getJourneyProgress_withoutAuth_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}/progress", PUBLISHED_JOURNEY_ID))
                    .andExpect(status().isUnauthorized());
        }
    }
}
