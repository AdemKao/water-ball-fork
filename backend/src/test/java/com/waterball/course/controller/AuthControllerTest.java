package com.waterball.course.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterball.course.entity.AuthProvider;
import com.waterball.course.entity.User;
import com.waterball.course.entity.UserAuthProvider;
import com.waterball.course.entity.UserRole;
import com.waterball.course.repository.RefreshTokenRepository;
import com.waterball.course.repository.UserAuthProviderRepository;
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
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class AuthControllerTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAuthProviderRepository authProviderRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPictureUrl("https://example.com/picture.jpg");
        testUser.setRole(UserRole.STUDENT);
        testUser = userRepository.save(testUser);

        UserAuthProvider authProvider = new UserAuthProvider(testUser, AuthProvider.GOOGLE, "google-123");
        authProviderRepository.save(authProvider);
    }

    @Nested
    @DisplayName("GET /api/auth/me")
    class GetCurrentUser {

        @Test
        @DisplayName("should return user info when authenticated with valid access token")
        void withValidAccessToken_shouldReturnUser() throws Exception {
            String accessToken = jwtService.generateAccessToken(testUser);

            mockMvc.perform(get("/api/auth/me")
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
                    .andExpect(jsonPath("$.email").value("test@example.com"))
                    .andExpect(jsonPath("$.name").value("Test User"))
                    .andExpect(jsonPath("$.pictureUrl").value("https://example.com/picture.jpg"))
                    .andExpect(jsonPath("$.role").value("STUDENT"));
        }

        @Test
        @DisplayName("should return 401 when no access token provided")
        void withoutAccessToken_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/auth/me"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 401 when access token is invalid")
        void withInvalidAccessToken_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/auth/me")
                            .cookie(new Cookie("access_token", "invalid-token")))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/refresh")
    class RefreshToken {

        @Test
        @DisplayName("should return new access token when refresh token is valid")
        void withValidRefreshToken_shouldReturnNewAccessToken() throws Exception {
            String refreshToken = jwtService.generateRefreshToken(testUser);
            
            com.waterball.course.entity.RefreshToken tokenEntity = new com.waterball.course.entity.RefreshToken();
            tokenEntity.setUser(testUser);
            tokenEntity.setTokenHash(jwtService.hashToken(refreshToken));
            tokenEntity.setExpiresAt(java.time.LocalDateTime.now().plusDays(30));
            refreshTokenRepository.save(tokenEntity);

            MvcResult result = mockMvc.perform(post("/api/auth/refresh")
                            .cookie(new Cookie("refresh_token", refreshToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Token refreshed"))
                    .andReturn();

            Cookie accessTokenCookie = result.getResponse().getCookie("access_token");
            assertThat(accessTokenCookie).isNotNull();
            assertThat(accessTokenCookie.getValue()).isNotEmpty();
            assertThat(accessTokenCookie.isHttpOnly()).isTrue();
        }

        @Test
        @DisplayName("should return 401 when no refresh token provided")
        void withoutRefreshToken_shouldReturn401() throws Exception {
            mockMvc.perform(post("/api/auth/refresh"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"));
        }

        @Test
        @DisplayName("should return 401 when refresh token is invalid")
        void withInvalidRefreshToken_shouldReturn401() throws Exception {
            mockMvc.perform(post("/api/auth/refresh")
                            .cookie(new Cookie("refresh_token", "invalid-token")))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/logout")
    class Logout {

        @Test
        @DisplayName("should clear cookies and return success message")
        void shouldClearCookiesAndReturnSuccess() throws Exception {
            String refreshToken = jwtService.generateRefreshToken(testUser);
            
            com.waterball.course.entity.RefreshToken tokenEntity = new com.waterball.course.entity.RefreshToken();
            tokenEntity.setUser(testUser);
            tokenEntity.setTokenHash(jwtService.hashToken(refreshToken));
            tokenEntity.setExpiresAt(java.time.LocalDateTime.now().plusDays(30));
            refreshTokenRepository.save(tokenEntity);

            MvcResult result = mockMvc.perform(post("/api/auth/logout")
                            .cookie(new Cookie("refresh_token", refreshToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Logged out successfully"))
                    .andReturn();

            Cookie accessTokenCookie = result.getResponse().getCookie("access_token");
            Cookie refreshTokenCookie = result.getResponse().getCookie("refresh_token");

            assertThat(accessTokenCookie).isNotNull();
            assertThat(accessTokenCookie.getMaxAge()).isZero();

            assertThat(refreshTokenCookie).isNotNull();
            assertThat(refreshTokenCookie.getMaxAge()).isZero();

            assertThat(refreshTokenRepository.findByTokenHash(jwtService.hashToken(refreshToken))).isEmpty();
        }

        @Test
        @DisplayName("should succeed even without refresh token")
        void withoutRefreshToken_shouldSucceed() throws Exception {
            mockMvc.perform(post("/api/auth/logout"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Logged out successfully"));
        }
    }

    @Nested
    @DisplayName("POST /api/auth/google")
    class GoogleLogin {

        @Test
        @DisplayName("should return 401 when credential is missing")
        void withMissingCredential_shouldReturn400() throws Exception {
            mockMvc.perform(post("/api/auth/google")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 401 when credential is invalid")
        void withInvalidCredential_shouldReturn401() throws Exception {
            mockMvc.perform(post("/api/auth/google")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"credential\": \"invalid-google-token\"}"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
