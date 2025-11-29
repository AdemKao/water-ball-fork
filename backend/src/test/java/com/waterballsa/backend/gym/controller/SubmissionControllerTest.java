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
    private static final UUID OTHER_USER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID PROBLEM_ID_1 = UUID.fromString("aaaa1111-1111-1111-1111-111111111111");
    private static final UUID PROBLEM_SOLID = UUID.fromString("bbbb1111-1111-1111-1111-111111111111");
    private static final UUID NON_EXISTENT_PROBLEM_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");
    private static final UUID GYM_ID_1 = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID OWN_SUBMISSION_ID = UUID.fromString("00000001-0001-0001-0001-000000000001");
    private static final UUID OTHER_USER_PUBLIC_SUBMISSION_ID = UUID.fromString("00000001-0001-0001-0001-000000000004");
    private static final UUID OWN_PENDING_SUBMISSION_ID = UUID.fromString("00000001-0001-0001-0001-000000000002");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    private String accessToken;
    private String otherUserAccessToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findById(TEST_USER_ID).orElseThrow();
        accessToken = jwtService.generateAccessToken(testUser);
        User otherUser = userRepository.findById(OTHER_USER_ID).orElseThrow();
        otherUserAccessToken = jwtService.generateAccessToken(otherUser);
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

    @Nested
    @DisplayName("GET /api/submissions/{submissionId}")
    class GetSubmissionDetail {

        @Test
        @DisplayName("should return own submission detail")
        void getSubmissionDetail_ownSubmission_shouldReturn200() throws Exception {
            mockMvc.perform(get("/api/submissions/{submissionId}", OWN_SUBMISSION_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(OWN_SUBMISSION_ID.toString()))
                    .andExpect(jsonPath("$.fileName").value("singleton.pdf"))
                    .andExpect(jsonPath("$.problemTitle").value("Singleton Pattern"));
        }

        @Test
        @DisplayName("should return other user's public submission")
        void getSubmissionDetail_otherUserPublicSubmission_shouldReturn200() throws Exception {
            mockMvc.perform(get("/api/submissions/{submissionId}", OTHER_USER_PUBLIC_SUBMISSION_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(OTHER_USER_PUBLIC_SUBMISSION_ID.toString()))
                    .andExpect(jsonPath("$.isPublic").value(true));
        }

        @Test
        @DisplayName("should return 403 for other user's private submission")
        void getSubmissionDetail_otherUserPrivateSubmission_shouldReturn403() throws Exception {
            mockMvc.perform(get("/api/submissions/{submissionId}", OWN_SUBMISSION_ID)
                            .cookie(new Cookie("access_token", otherUserAccessToken)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void getSubmissionDetail_notAuthenticated_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/submissions/{submissionId}", OWN_SUBMISSION_ID))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PATCH /api/submissions/{submissionId}/visibility")
    class UpdateVisibility {

        @Test
        @DisplayName("should update own submission visibility")
        void updateVisibility_ownSubmission_shouldReturn200() throws Exception {
            mockMvc.perform(patch("/api/submissions/{submissionId}/visibility", OWN_PENDING_SUBMISSION_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"isPublic\": true}")
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(OWN_PENDING_SUBMISSION_ID.toString()))
                    .andExpect(jsonPath("$.isPublic").value(true));
        }

        @Test
        @DisplayName("should return 403 for other user's submission")
        void updateVisibility_otherUserSubmission_shouldReturn403() throws Exception {
            mockMvc.perform(patch("/api/submissions/{submissionId}/visibility", OTHER_USER_PUBLIC_SUBMISSION_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"isPublic\": false}")
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void updateVisibility_notAuthenticated_shouldReturn401() throws Exception {
            mockMvc.perform(patch("/api/submissions/{submissionId}/visibility", OWN_SUBMISSION_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"isPublic\": true}"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/submissions/public")
    class GetPublicSubmissions {

        @Test
        @DisplayName("should return paginated public submissions")
        void getPublicSubmissions_shouldReturnPaginated() throws Exception {
            mockMvc.perform(get("/api/submissions/public")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)))
                    .andExpect(jsonPath("$.number").value(0))
                    .andExpect(jsonPath("$.size").value(10));
        }

        @Test
        @DisplayName("should filter by gymId")
        void getPublicSubmissions_filterByGymId_shouldReturnFiltered() throws Exception {
            mockMvc.perform(get("/api/submissions/public")
                            .param("gymId", GYM_ID_1.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/my/gym-progress")
    class GetGymProgress {

        @Test
        @DisplayName("should return user gym progress")
        void getGymProgress_shouldReturnProgress() throws Exception {
            mockMvc.perform(get("/api/my/gym-progress")
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalGyms").exists())
                    .andExpect(jsonPath("$.completedGyms").exists())
                    .andExpect(jsonPath("$.totalProblems").exists())
                    .andExpect(jsonPath("$.completedProblems").exists())
                    .andExpect(jsonPath("$.pendingReviews").exists())
                    .andExpect(jsonPath("$.gyms").isArray());
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void getGymProgress_notAuthenticated_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/my/gym-progress"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
