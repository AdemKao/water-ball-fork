package com.waterballsa.backend.gym.controller;

import com.waterball.course.controller.BaseIntegrationTest;
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
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/gym-test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class GymControllerTest extends BaseIntegrationTest {

    private static final UUID PUBLISHED_JOURNEY_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID UNPUBLISHED_JOURNEY_ID = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID NON_EXISTENT_JOURNEY_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");
    private static final Long GYM_ID_1 = 1L;
    private static final Long NON_EXISTENT_GYM_ID = 999L;

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
    @DisplayName("GET /api/journeys/{journeyId}/gyms")
    class GetGymsByJourney {

        @Test
        @DisplayName("should return gyms for published journey")
        void getGymsByJourney_shouldReturnGyms() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}/gyms", PUBLISHED_JOURNEY_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.gyms", hasSize(2)))
                    .andExpect(jsonPath("$.gyms[0].id").value(1))
                    .andExpect(jsonPath("$.gyms[0].title").value("Design Patterns Gym"))
                    .andExpect(jsonPath("$.gyms[0].exerciseCount").value(3))
                    .andExpect(jsonPath("$.gyms[1].id").value(2))
                    .andExpect(jsonPath("$.gyms[1].title").value("SOLID Principles Gym"));
        }

        @Test
        @DisplayName("should return empty list for journey with no gyms")
        void getGymsByJourney_withNoGyms_shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}/gyms", NON_EXISTENT_JOURNEY_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.gyms", hasSize(0)));
        }

        @Test
        @DisplayName("should return completed count when authenticated")
        void getGymsByJourney_authenticated_shouldReturnCompletedCount() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}/gyms", PUBLISHED_JOURNEY_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.gyms[0].completedCount").value(1));
        }

        @Test
        @DisplayName("should return zero completed count when not authenticated")
        void getGymsByJourney_notAuthenticated_shouldReturnZeroCompletedCount() throws Exception {
            mockMvc.perform(get("/api/journeys/{journeyId}/gyms", PUBLISHED_JOURNEY_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.gyms[0].completedCount").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/gyms/{gymId}")
    class GetGymDetail {

        @Test
        @DisplayName("should return gym detail with valid id")
        void getGymDetail_withValidId_shouldReturnGym() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}", GYM_ID_1)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.title").value("Design Patterns Gym"))
                    .andExpect(jsonPath("$.description").value("Practice design patterns"))
                    .andExpect(jsonPath("$.exerciseCount").value(3))
                    .andExpect(jsonPath("$.completedCount").value(1));
        }

        @Test
        @DisplayName("should return 500 with invalid id")
        void getGymDetail_withInvalidId_shouldReturn500() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}", NON_EXISTENT_GYM_ID))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("should return gym detail without authentication")
        void getGymDetail_withoutAuth_shouldReturnGym() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}", GYM_ID_1))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.completedCount").value(0));
        }
    }
}
