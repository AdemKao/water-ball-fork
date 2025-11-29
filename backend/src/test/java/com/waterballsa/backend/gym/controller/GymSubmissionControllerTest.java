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
class GymSubmissionControllerTest extends BaseIntegrationTest {

    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final Long EXERCISE_ID_1 = 1L;
    private static final Long EXERCISE_ID_4 = 4L;
    private static final Long NON_EXISTENT_EXERCISE_ID = 999L;

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
    @DisplayName("POST /api/exercises/{exerciseId}/submissions")
    class CreateSubmission {

        @Test
        @DisplayName("should create submission with valid file")
        void createSubmission_withValidFile_shouldReturn200() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "solution.zip",
                    MediaType.APPLICATION_OCTET_STREAM_VALUE,
                    "test content".getBytes()
            );

            mockMvc.perform(multipart("/api/exercises/{exerciseId}/submissions", EXERCISE_ID_4)
                            .file(file)
                            .cookie(new Cookie("access_token", accessToken))
                            .requestAttr("userId", TEST_USER_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.exerciseId").value(EXERCISE_ID_4))
                    .andExpect(jsonPath("$.userId").value(TEST_USER_ID.toString()))
                    .andExpect(jsonPath("$.fileName").value("solution.zip"))
                    .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("should return 500 for non-existent exercise")
        void createSubmission_nonExistentExercise_shouldReturn500() throws Exception {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "solution.zip",
                    MediaType.APPLICATION_OCTET_STREAM_VALUE,
                    "test content".getBytes()
            );

            mockMvc.perform(multipart("/api/exercises/{exerciseId}/submissions", NON_EXISTENT_EXERCISE_ID)
                            .file(file)
                            .cookie(new Cookie("access_token", accessToken))
                            .requestAttr("userId", TEST_USER_ID))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /api/exercises/{exerciseId}/submissions/me")
    class GetMySubmissions {

        @Test
        @DisplayName("should return user submissions for exercise")
        void getMySubmissions_shouldReturnSubmissions() throws Exception {
            mockMvc.perform(get("/api/exercises/{exerciseId}/submissions/me", EXERCISE_ID_1)
                            .cookie(new Cookie("access_token", accessToken))
                            .requestAttr("userId", TEST_USER_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.submissions", hasSize(2)))
                    .andExpect(jsonPath("$.submissions[0].fileName").value("singleton_v2.zip"))
                    .andExpect(jsonPath("$.submissions[0].status").value("PENDING"))
                    .andExpect(jsonPath("$.submissions[1].fileName").value("singleton.zip"))
                    .andExpect(jsonPath("$.submissions[1].status").value("APPROVED"));
        }

        @Test
        @DisplayName("should return empty list for exercise with no submissions")
        void getMySubmissions_noSubmissions_shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get("/api/exercises/{exerciseId}/submissions/me", EXERCISE_ID_4)
                            .cookie(new Cookie("access_token", accessToken))
                            .requestAttr("userId", TEST_USER_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.submissions", hasSize(0)));
        }

        @Test
        @DisplayName("should return submissions with feedback for reviewed ones")
        void getMySubmissions_shouldIncludeFeedback() throws Exception {
            mockMvc.perform(get("/api/exercises/{exerciseId}/submissions/me", EXERCISE_ID_1)
                            .cookie(new Cookie("access_token", accessToken))
                            .requestAttr("userId", TEST_USER_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.submissions[1].feedback").value("Great implementation!"))
                    .andExpect(jsonPath("$.submissions[1].reviewerName").value("Instructor"));
        }
    }
}
