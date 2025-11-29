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
import org.springframework.http.MediaType;
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
class SubmissionControllerTest extends BaseIntegrationTest {

    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID PROBLEM_ID_1 = UUID.fromString("aaaa1111-1111-1111-1111-111111111111");
    private static final UUID PROBLEM_SOLID = UUID.fromString("bbbb1111-1111-1111-1111-111111111111");
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
    @DisplayName("POST /api/problems/{problemId}/submissions")
    class CreateSubmission {

        @Test
        @DisplayName("should create submission with valid file")
        void createSubmission_withValidFile_shouldReturn201() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "solution.pdf",
                    MediaType.APPLICATION_PDF_VALUE,
                    "test content".getBytes()
            );

            mockMvc.perform(multipart("/api/problems/{problemId}/submissions", PROBLEM_SOLID)
                            .file(file)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.problemId").value(PROBLEM_SOLID.toString()))
                    .andExpect(jsonPath("$.fileName").value("solution.pdf"))
                    .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void createSubmission_notAuthenticated_shouldReturn401() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "solution.pdf",
                    MediaType.APPLICATION_PDF_VALUE,
                    "test content".getBytes()
            );

            mockMvc.perform(multipart("/api/problems/{problemId}/submissions", PROBLEM_SOLID)
                            .file(file))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 500 for non-existent problem")
        void createSubmission_nonExistentProblem_shouldReturn500() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "solution.pdf",
                    MediaType.APPLICATION_PDF_VALUE,
                    "test content".getBytes()
            );

            mockMvc.perform(multipart("/api/problems/{problemId}/submissions", NON_EXISTENT_PROBLEM_ID)
                            .file(file)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /api/problems/{problemId}/submissions")
    class GetSubmissionHistory {

        @Test
        @DisplayName("should return user submissions for problem")
        void getSubmissionHistory_shouldReturnSubmissions() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}/submissions", PROBLEM_ID_1)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].fileName").value("singleton_v2.pdf"))
                    .andExpect(jsonPath("$[0].status").value("PENDING"))
                    .andExpect(jsonPath("$[1].fileName").value("singleton.pdf"))
                    .andExpect(jsonPath("$[1].status").value("REVIEWED"));
        }

        @Test
        @DisplayName("should return empty list for problem with no submissions")
        void getSubmissionHistory_noSubmissions_shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}/submissions", PROBLEM_SOLID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void getSubmissionHistory_notAuthenticated_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}/submissions", PROBLEM_ID_1))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return submissions with review for reviewed ones")
        void getSubmissionHistory_shouldIncludeReview() throws Exception {
            mockMvc.perform(get("/api/problems/{problemId}/submissions", PROBLEM_ID_1)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[1].review.content").value("Great implementation!"))
                    .andExpect(jsonPath("$[1].review.reviewerName").value("Instructor"));
        }
    }
}
