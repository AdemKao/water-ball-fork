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
class ProblemControllerTest extends BaseIntegrationTest {

    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID GYM_ID_1 = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID GYM_ID_2 = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static final UUID STAGE_ID_1 = UUID.fromString("11111111-aaaa-aaaa-aaaa-111111111111");
    private static final UUID STAGE_ID_SOLID = UUID.fromString("11111111-bbbb-bbbb-bbbb-111111111111");
    private static final UUID PROBLEM_ID_1 = UUID.fromString("aaaa1111-1111-1111-1111-111111111111");
    private static final UUID PROBLEM_ID_2 = UUID.fromString("aaaa2222-2222-2222-2222-222222222222");
    private static final UUID NON_EXISTENT_PROBLEM_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");

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
    @DisplayName("GET /api/gyms/{gymId}/stages/{stageId} - Problems in stage")
    class GetProblemsInStage {

        @Test
        @DisplayName("should return problems for stage when purchased")
        void getStageDetail_shouldReturnProblems() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/stages/{stageId}", GYM_ID_1, STAGE_ID_1)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.problems", hasSize(2)))
                    .andExpect(jsonPath("$.problems[0].id").value(PROBLEM_ID_1.toString()))
                    .andExpect(jsonPath("$.problems[0].title").value("Singleton Pattern"))
                    .andExpect(jsonPath("$.problems[0].difficulty").value(1))
                    .andExpect(jsonPath("$.problems[1].id").value(PROBLEM_ID_2.toString()))
                    .andExpect(jsonPath("$.problems[1].title").value("Factory Pattern"))
                    .andExpect(jsonPath("$.problems[1].difficulty").value(2));
        }

        @Test
        @DisplayName("should return empty problems when not purchased")
        void getStageDetail_notPurchased_shouldReturnEmptyProblems() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/stages/{stageId}", GYM_ID_1, STAGE_ID_1))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.problems", hasSize(0)))
                    .andExpect(jsonPath("$.isPurchased").value(false));
        }

        @Test
        @DisplayName("should return single problem for stage with one problem")
        void getStageDetail_singleProblem_shouldReturnOne() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/stages/{stageId}", GYM_ID_2, STAGE_ID_SOLID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.problems", hasSize(1)))
                    .andExpect(jsonPath("$.problems[0].title").value("Single Responsibility"));
        }
    }

    @Nested
    @DisplayName("GET /api/problems/{problemId}")
    class GetProblemDetail {

        @Test
        @DisplayName("should return problem detail with valid id when purchased")
        void getProblemDetail_withValidId_shouldReturnProblem() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}", PROBLEM_ID_1)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(PROBLEM_ID_1.toString()))
                    .andExpect(jsonPath("$.stageId").value(STAGE_ID_1.toString()))
                    .andExpect(jsonPath("$.gymId").value(GYM_ID_1.toString()))
                    .andExpect(jsonPath("$.title").value("Singleton Pattern"))
                    .andExpect(jsonPath("$.description").value("Implement singleton pattern"))
                    .andExpect(jsonPath("$.difficulty").value(1));
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void getProblemDetail_notAuthenticated_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}", PROBLEM_ID_1))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 500 with invalid id")
        void getProblemDetail_withInvalidId_shouldReturn500() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}", NON_EXISTENT_PROBLEM_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("should return problem with MEDIUM difficulty")
        void getProblemDetail_mediumDifficulty_shouldReturn() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}", PROBLEM_ID_2)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(PROBLEM_ID_2.toString()))
                    .andExpect(jsonPath("$.title").value("Factory Pattern"))
                    .andExpect(jsonPath("$.difficulty").value(2));
        }
    }
}
