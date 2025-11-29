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
    private static final UUID GYM_ID_1 = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID GYM_ID_2 = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static final UUID NON_EXISTENT_GYM_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");
    private static final UUID STAGE_ID_1 = UUID.fromString("11111111-aaaa-aaaa-aaaa-111111111111");

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
    @DisplayName("GET /api/gyms")
    class GetGyms {

        @Test
        @DisplayName("should return gyms for journey")
        void getGyms_withJourneyId_shouldReturnGyms() throws Exception {
            mockMvc.perform(get("/api/gyms")
                            .param("journeyId", PUBLISHED_JOURNEY_ID.toString())
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id").value(GYM_ID_1.toString()))
                    .andExpect(jsonPath("$[0].title").value("Design Patterns Gym"))
                    .andExpect(jsonPath("$[0].problemCount").value(4))
                    .andExpect(jsonPath("$[1].id").value(GYM_ID_2.toString()))
                    .andExpect(jsonPath("$[1].title").value("SOLID Principles Gym"));
        }

        @Test
        @DisplayName("should return empty list for journey with no gyms")
        void getGyms_withNoGyms_shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get("/api/gyms")
                            .param("journeyId", NON_EXISTENT_JOURNEY_ID.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("should return completed count when authenticated")
        void getGyms_authenticated_shouldReturnCompletedCount() throws Exception {
            mockMvc.perform(get("/api/gyms")
                            .param("journeyId", PUBLISHED_JOURNEY_ID.toString())
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].completedCount").isNumber());
        }

        @Test
        @DisplayName("should return zero completed count when not authenticated")
        void getGyms_notAuthenticated_shouldReturnZeroCompletedCount() throws Exception {
            mockMvc.perform(get("/api/gyms")
                            .param("journeyId", PUBLISHED_JOURNEY_ID.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].completedCount").value(0));
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
                    .andExpect(jsonPath("$.id").value(GYM_ID_1.toString()))
                    .andExpect(jsonPath("$.title").value("Design Patterns Gym"))
                    .andExpect(jsonPath("$.description").value("Practice design patterns"))
                    .andExpect(jsonPath("$.stages", hasSize(2)))
                    .andExpect(jsonPath("$.stages[0].title").value("Basic Patterns"))
                    .andExpect(jsonPath("$.stages[1].title").value("Advanced Patterns"));
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
                    .andExpect(jsonPath("$.id").value(GYM_ID_1.toString()))
                    .andExpect(jsonPath("$.stages[0].completedCount").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/gyms/{gymId}/stages/{stageId}")
    class GetStageDetail {

        @Test
        @DisplayName("should return stage detail with valid ids")
        void getStageDetail_withValidIds_shouldReturnStage() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/stages/{stageId}", GYM_ID_1, STAGE_ID_1)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(STAGE_ID_1.toString()))
                    .andExpect(jsonPath("$.gymId").value(GYM_ID_1.toString()))
                    .andExpect(jsonPath("$.title").value("Basic Patterns"))
                    .andExpect(jsonPath("$.description").value("Learn basic design patterns"))
                    .andExpect(jsonPath("$.difficulty").value(1));
        }

        @Test
        @DisplayName("should return stage without authentication")
        void getStageDetail_withoutAuth_shouldReturnStage() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/stages/{stageId}", GYM_ID_1, STAGE_ID_1))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(STAGE_ID_1.toString()))
                    .andExpect(jsonPath("$.isPurchased").value(false));
        }
    }
}
