package com.waterballsa.backend.gym.service;

import com.waterball.course.controller.BaseIntegrationTest;
import com.waterball.course.entity.ProblemPrerequisite;
import com.waterball.course.entity.StagePrerequisite;
import com.waterball.course.service.gym.PrerequisiteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/gym-test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/prerequisite-test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class PrerequisiteServiceTest extends BaseIntegrationTest {

    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID OTHER_USER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    
    private static final UUID STAGE_WITH_PREREQ = UUID.fromString("22222222-aaaa-aaaa-aaaa-222222222222");
    private static final UUID STAGE_WITHOUT_PREREQ = UUID.fromString("11111111-aaaa-aaaa-aaaa-111111111111");
    
    private static final UUID PROBLEM_WITH_PREREQ = UUID.fromString("aaaa4444-4444-4444-4444-444444444444");
    private static final UUID PROBLEM_WITHOUT_PREREQ = UUID.fromString("aaaa1111-1111-1111-1111-111111111111");
    private static final UUID PROBLEM_PREREQ_COMPLETED = UUID.fromString("aaaa1111-1111-1111-1111-111111111111");
    private static final UUID PROBLEM_WITH_LESSON_PREREQ = UUID.fromString("aaaa5555-5555-5555-5555-555555555555");

    @Autowired
    private PrerequisiteService prerequisiteService;

    @Nested
    @DisplayName("getStagePrerequisites")
    class GetStagePrerequisites {

        @Test
        @DisplayName("should return prerequisites for stage with prerequisites")
        void getStagePrerequisites_withPrerequisites_shouldReturnList() {
            List<StagePrerequisite> prerequisites = prerequisiteService.getStagePrerequisites(STAGE_WITH_PREREQ);

            assertThat(prerequisites).hasSize(1);
        }

        @Test
        @DisplayName("should return empty list for stage without prerequisites")
        void getStagePrerequisites_withoutPrerequisites_shouldReturnEmptyList() {
            List<StagePrerequisite> prerequisites = prerequisiteService.getStagePrerequisites(STAGE_WITHOUT_PREREQ);

            assertThat(prerequisites).isEmpty();
        }
    }

    @Nested
    @DisplayName("getProblemPrerequisites")
    class GetProblemPrerequisites {

        @Test
        @DisplayName("should return prerequisites for problem with prerequisites")
        void getProblemPrerequisites_withPrerequisites_shouldReturnList() {
            List<ProblemPrerequisite> prerequisites = prerequisiteService.getProblemPrerequisites(PROBLEM_WITH_PREREQ);

            assertThat(prerequisites).hasSize(1);
        }

        @Test
        @DisplayName("should return empty list for problem without prerequisites")
        void getProblemPrerequisites_withoutPrerequisites_shouldReturnEmptyList() {
            List<ProblemPrerequisite> prerequisites = prerequisiteService.getProblemPrerequisites(PROBLEM_WITHOUT_PREREQ);

            assertThat(prerequisites).isEmpty();
        }
    }

    @Nested
    @DisplayName("getStagePrerequisiteInfos")
    class GetStagePrerequisiteInfos {

        @Test
        @DisplayName("should include completion status for user")
        void getStagePrerequisiteInfos_shouldIncludeCompletionStatus() {
            List<PrerequisiteService.PrerequisiteInfo> infos = 
                    prerequisiteService.getStagePrerequisiteInfos(STAGE_WITH_PREREQ, TEST_USER_ID);

            assertThat(infos).hasSize(1);
            assertThat(infos.get(0).title()).isNotNull();
            assertThat(infos.get(0).id()).isNotNull();
        }

        @Test
        @DisplayName("should return empty list for stage without prerequisites")
        void getStagePrerequisiteInfos_noPrerequisites_shouldReturnEmptyList() {
            List<PrerequisiteService.PrerequisiteInfo> infos = 
                    prerequisiteService.getStagePrerequisiteInfos(STAGE_WITHOUT_PREREQ, TEST_USER_ID);

            assertThat(infos).isEmpty();
        }
    }

    @Nested
    @DisplayName("getProblemPrerequisiteInfos")
    class GetProblemPrerequisiteInfos {

        @Test
        @DisplayName("should return completed status when user completed prerequisite")
        void getProblemPrerequisiteInfos_completed_shouldReturnCompletedTrue() {
            List<PrerequisiteService.PrerequisiteInfo> infos = 
                    prerequisiteService.getProblemPrerequisiteInfos(PROBLEM_WITH_PREREQ, OTHER_USER_ID);

            assertThat(infos).hasSize(1);
            assertThat(infos.get(0).isCompleted()).isTrue();
        }

        @Test
        @DisplayName("should return not completed when user has not completed prerequisite")
        void getProblemPrerequisiteInfos_notCompleted_shouldReturnCompletedFalse() {
            List<PrerequisiteService.PrerequisiteInfo> infos = 
                    prerequisiteService.getProblemPrerequisiteInfos(PROBLEM_WITH_PREREQ, TEST_USER_ID);

            assertThat(infos).hasSize(1);
            assertThat(infos.get(0).isCompleted()).isFalse();
        }

        @Test
        @DisplayName("should handle lesson prerequisites correctly")
        void getProblemPrerequisiteInfos_lessonPrereq_shouldReturnCorrectType() {
            List<PrerequisiteService.PrerequisiteInfo> infos = 
                    prerequisiteService.getProblemPrerequisiteInfos(PROBLEM_WITH_LESSON_PREREQ, TEST_USER_ID);

            assertThat(infos).hasSize(1);
            assertThat(infos.get(0).type()).isEqualTo(com.waterball.course.entity.PrerequisiteType.LESSON);
        }
    }
}
