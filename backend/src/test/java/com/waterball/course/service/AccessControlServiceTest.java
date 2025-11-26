package com.waterball.course.service;

import com.waterball.course.controller.BaseIntegrationTest;
import com.waterball.course.entity.*;
import com.waterball.course.repository.*;
import com.waterball.course.service.course.AccessControlService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.jdbc.Sql;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class AccessControlServiceTest extends BaseIntegrationTest {

    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID JOURNEY_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID PUBLIC_LESSON_ID = UUID.fromString("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID TRIAL_LESSON_ID = UUID.fromString("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID PURCHASED_LESSON_ID = UUID.fromString("33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private UserPurchaseRepository userPurchaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JourneyRepository journeyRepository;

    private Lesson publicLesson;
    private Lesson trialLesson;
    private Lesson purchasedLesson;

    @BeforeEach
    void setUp() {
        publicLesson = lessonRepository.findById(PUBLIC_LESSON_ID).orElseThrow();
        trialLesson = lessonRepository.findById(TRIAL_LESSON_ID).orElseThrow();
        purchasedLesson = lessonRepository.findById(PURCHASED_LESSON_ID).orElseThrow();
    }

    @Nested
    @DisplayName("canAccessLesson")
    class CanAccessLesson {

        @Test
        @DisplayName("should return true for public lesson")
        void canAccessLesson_withPublicLesson_shouldReturnTrue() {
            boolean result = accessControlService.canAccessLesson(publicLesson, null);
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return true for trial lesson when authenticated")
        void canAccessLesson_withTrialLesson_whenAuthenticated_shouldReturnTrue() {
            boolean result = accessControlService.canAccessLesson(trialLesson, TEST_USER_ID);
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false for trial lesson when not authenticated")
        void canAccessLesson_withTrialLesson_whenNotAuthenticated_shouldReturnFalse() {
            boolean result = accessControlService.canAccessLesson(trialLesson, null);
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should return true for purchased lesson when purchased")
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void canAccessLesson_withPurchasedLesson_whenPurchased_shouldReturnTrue() {
            boolean result = accessControlService.canAccessLesson(purchasedLesson, TEST_USER_ID);
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false for purchased lesson when not purchased")
        void canAccessLesson_withPurchasedLesson_whenNotPurchased_shouldReturnFalse() {
            boolean result = accessControlService.canAccessLesson(purchasedLesson, TEST_USER_ID);
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("hasPurchasedJourney")
    class HasPurchasedJourney {

        @Test
        @DisplayName("should return true when purchased")
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void hasPurchasedJourney_whenPurchased_shouldReturnTrue() {
            boolean result = accessControlService.hasPurchasedJourney(TEST_USER_ID, JOURNEY_ID);
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when not purchased")
        void hasPurchasedJourney_whenNotPurchased_shouldReturnFalse() {
            boolean result = accessControlService.hasPurchasedJourney(TEST_USER_ID, JOURNEY_ID);
            assertThat(result).isFalse();
        }
    }
}
