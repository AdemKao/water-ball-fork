package com.waterball.course.controller;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class VideoControllerTest extends BaseIntegrationTest {

    private static final UUID PUBLIC_VIDEO_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID TRIAL_VIDEO_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
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
    @DisplayName("GET /api/videos/{videoId}/stream")
    class GetVideoStream {

        @Test
        @DisplayName("should return stream url with valid access")
        void getVideoStream_withValidAccess_shouldReturnStreamUrl() throws Exception {
            mockMvc.perform(get("/api/videos/{videoId}/stream", PUBLIC_VIDEO_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.streamUrl").isNotEmpty())
                    .andExpect(jsonPath("$.expiresAt").isNotEmpty())
                    .andExpect(jsonPath("$.durationSeconds").value(600));
        }

        @Test
        @DisplayName("should return stream url for trial video with authenticated user")
        void getVideoStream_withTrialVideo_shouldReturnStreamUrl() throws Exception {
            mockMvc.perform(get("/api/videos/{videoId}/stream", TRIAL_VIDEO_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.streamUrl").isNotEmpty())
                    .andExpect(jsonPath("$.durationSeconds").value(300));
        }

        @Test
        @DisplayName("should return 404 for invalid id")
        void getVideoStream_withInvalidId_shouldReturn404() throws Exception {
            mockMvc.perform(get("/api/videos/{videoId}/stream", NON_EXISTENT_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without authentication")
        void getVideoStream_withoutAuth_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/videos/{videoId}/stream", PUBLIC_VIDEO_ID))
                    .andExpect(status().isUnauthorized());
        }
    }
}
