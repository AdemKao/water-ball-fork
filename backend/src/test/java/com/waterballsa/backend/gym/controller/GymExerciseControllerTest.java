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
class GymExerciseControllerTest extends BaseIntegrationTest {

    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final Long GYM_ID_1 = 1L;
    private static final Long GYM_ID_2 = 2L;
    private static final Long NON_EXISTENT_GYM_ID = 999L;
    private static final Long EXERCISE_ID_1 = 1L;
    private static final Long EXERCISE_ID_2 = 2L;
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
    @DisplayName("GET /api/gyms/{gymId}/exercises")
    class GetExercisesByGym {

        @Test
        @DisplayName("should return exercises for gym")
        void getExercises_shouldReturnExercises() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/exercises", GYM_ID_1))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.exercises", hasSize(3)))
                    .andExpect(jsonPath("$.exercises[0].id").value(1))
                    .andExpect(jsonPath("$.exercises[0].title").value("Singleton Pattern"))
                    .andExpect(jsonPath("$.exercises[0].difficulty").value("EASY"))
                    .andExpect(jsonPath("$.exercises[1].id").value(2))
                    .andExpect(jsonPath("$.exercises[1].title").value("Factory Pattern"))
                    .andExpect(jsonPath("$.exercises[1].difficulty").value("MEDIUM"))
                    .andExpect(jsonPath("$.exercises[2].id").value(3))
                    .andExpect(jsonPath("$.exercises[2].title").value("Observer Pattern"))
                    .andExpect(jsonPath("$.exercises[2].difficulty").value("HARD"));
        }

        @Test
        @DisplayName("should return empty list for gym with no exercises")
        void getExercises_withNoExercises_shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/exercises", NON_EXISTENT_GYM_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.exercises", hasSize(0)));
        }

        @Test
        @DisplayName("should return single exercise for gym with one exercise")
        void getExercises_singleExercise_shouldReturnOne() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/exercises", GYM_ID_2))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.exercises", hasSize(1)))
                    .andExpect(jsonPath("$.exercises[0].title").value("Single Responsibility"));
        }

        @Test
        @DisplayName("should return exercises ordered by displayOrder")
        void getExercises_shouldBeOrderedByDisplayOrder() throws Exception {
            mockMvc.perform(get("/api/gyms/{gymId}/exercises", GYM_ID_1))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.exercises[0].displayOrder").value(0))
                    .andExpect(jsonPath("$.exercises[1].displayOrder").value(1))
                    .andExpect(jsonPath("$.exercises[2].displayOrder").value(2));
        }
    }

    @Nested
    @DisplayName("GET /api/exercises/{exerciseId}")
    class GetExerciseDetail {

        @Test
        @DisplayName("should return exercise detail with valid id")
        void getExerciseDetail_withValidId_shouldReturnExercise() throws Exception {
            mockMvc.perform(get("/api/exercises/{exerciseId}", EXERCISE_ID_1))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.gymId").value(1))
                    .andExpect(jsonPath("$.title").value("Singleton Pattern"))
                    .andExpect(jsonPath("$.description").value("Implement singleton pattern"))
                    .andExpect(jsonPath("$.difficulty").value("EASY"));
        }

        @Test
        @DisplayName("should return 500 with invalid id")
        void getExerciseDetail_withInvalidId_shouldReturn500() throws Exception {
            mockMvc.perform(get("/api/exercises/{exerciseId}", NON_EXISTENT_EXERCISE_ID))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("should return exercise with MEDIUM difficulty")
        void getExerciseDetail_mediumDifficulty_shouldReturn() throws Exception {
            mockMvc.perform(get("/api/exercises/{exerciseId}", EXERCISE_ID_2))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(2))
                    .andExpect(jsonPath("$.title").value("Factory Pattern"))
                    .andExpect(jsonPath("$.difficulty").value("MEDIUM"));
        }

        @Test
        @DisplayName("should return empty submissions when not authenticated")
        void getExerciseDetail_notAuthenticated_shouldReturnEmptySubmissions() throws Exception {
            mockMvc.perform(get("/api/exercises/{exerciseId}", EXERCISE_ID_1))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.submissions", hasSize(0)));
        }
    }
}
