package com.waterball.course.service.gym;

import com.waterball.course.entity.*;
import com.waterball.course.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrerequisiteService {
    private final StagePrerequisiteRepository stagePrerequisiteRepository;
    private final ProblemPrerequisiteRepository problemPrerequisiteRepository;
    private final GymAccessControlService gymAccessControlService;

    public List<StagePrerequisite> getStagePrerequisites(UUID stageId) {
        return stagePrerequisiteRepository.findByStageId(stageId);
    }

    public List<ProblemPrerequisite> getProblemPrerequisites(UUID problemId) {
        return problemPrerequisiteRepository.findByProblemId(problemId);
    }

    public record PrerequisiteInfo(
            PrerequisiteType type,
            UUID id,
            String title,
            boolean isCompleted
    ) {}

    public List<PrerequisiteInfo> getStagePrerequisiteInfos(UUID stageId, UUID userId) {
        return stagePrerequisiteRepository.findByStageId(stageId).stream()
                .map(prereq -> toPrerequisiteInfo(prereq, userId))
                .toList();
    }

    public List<PrerequisiteInfo> getProblemPrerequisiteInfos(UUID problemId, UUID userId) {
        return problemPrerequisiteRepository.findByProblemId(problemId).stream()
                .map(prereq -> toPrerequisiteInfo(prereq, userId))
                .toList();
    }

    private PrerequisiteInfo toPrerequisiteInfo(StagePrerequisite prereq, UUID userId) {
        if (prereq.getPrerequisiteLesson() != null) {
            Lesson lesson = prereq.getPrerequisiteLesson();
            return new PrerequisiteInfo(
                    PrerequisiteType.LESSON,
                    lesson.getId(),
                    lesson.getTitle(),
                    gymAccessControlService.isLessonCompleted(userId, lesson.getId())
            );
        }
        if (prereq.getPrerequisiteProblem() != null) {
            Problem problem = prereq.getPrerequisiteProblem();
            return new PrerequisiteInfo(
                    PrerequisiteType.PROBLEM,
                    problem.getId(),
                    problem.getTitle(),
                    gymAccessControlService.isProblemCompleted(userId, problem.getId())
            );
        }
        throw new IllegalStateException("Invalid prerequisite: no lesson or problem set");
    }

    private PrerequisiteInfo toPrerequisiteInfo(ProblemPrerequisite prereq, UUID userId) {
        if (prereq.getPrerequisiteLesson() != null) {
            Lesson lesson = prereq.getPrerequisiteLesson();
            return new PrerequisiteInfo(
                    PrerequisiteType.LESSON,
                    lesson.getId(),
                    lesson.getTitle(),
                    gymAccessControlService.isLessonCompleted(userId, lesson.getId())
            );
        }
        if (prereq.getPrerequisiteProblem() != null) {
            Problem problem = prereq.getPrerequisiteProblem();
            return new PrerequisiteInfo(
                    PrerequisiteType.PROBLEM,
                    problem.getId(),
                    problem.getTitle(),
                    gymAccessControlService.isProblemCompleted(userId, problem.getId())
            );
        }
        throw new IllegalStateException("Invalid prerequisite: no lesson or problem set");
    }
}
