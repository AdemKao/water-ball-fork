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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
    private static final UUID PROBLEM_ID_LOCKED = UUID.fromString("aaaa4444-4444-4444-4444-444444444444");
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
        @DisplayName("should return problems with isPurchased=false when not authenticated")
        void getStageDetail_notAuthenticated_shouldReturnProblemsWithPurchasedFalse() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/stages/{stageId}", GYM_ID_1, STAGE_ID_1))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.problems", hasSize(2)))
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

        @Test
        @DisplayName("should return 403 when problem is locked")
        void getProblemDetail_locked_shouldReturn403() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}", PROBLEM_ID_LOCKED)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /api/problems/{problemId}/submissions")
    class CreateSubmission {

        @Test
        @DisplayName("should return 400 when file type is not allowed")
        void createSubmission_invalidFileType_shouldReturn400() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.mp4", "video/mp4", "test video content".getBytes());
            
            mockMvc.perform(multipart("/api/problems/{problemId}/submissions", PROBLEM_ID_1)
                            .file(file)
                            .param("isPublic", "false")
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should increment version on repeated submission")
        void createSubmission_repeated_shouldIncrementVersion() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.pdf", "application/pdf", "test pdf content".getBytes());
            
            mockMvc.perform(multipart("/api/problems/{problemId}/submissions", PROBLEM_ID_1)
                            .file(file)
                            .param("isPublic", "false")
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.version").value(3));
        }
    }
}
