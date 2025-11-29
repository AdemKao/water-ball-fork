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
public class GymAccessControlService {
    private final UserPurchaseRepository userPurchaseRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final SubmissionRepository submissionRepository;
    private final StagePrerequisiteRepository stagePrerequisiteRepository;
    private final ProblemPrerequisiteRepository problemPrerequisiteRepository;

    public boolean hasPurchasedJourney(UUID userId, UUID journeyId) {
        if (userId == null) {
            return false;
        }
        return userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
    }

    public boolean isStageUnlocked(UUID userId, Stage stage) {
        if (userId == null) {
            return false;
        }
        
        List<StagePrerequisite> prerequisites = stagePrerequisiteRepository.findByStageId(stage.getId());
        if (prerequisites.isEmpty()) {
            return true;
        }
        
        return prerequisites.stream().allMatch(prereq -> isPrerequisiteCompleted(userId, prereq));
    }

    public boolean isProblemUnlocked(UUID userId, Problem problem) {
        if (userId == null) {
            return false;
        }
        
        if (!isStageUnlocked(userId, problem.getStage())) {
            return false;
        }
        
        List<ProblemPrerequisite> prerequisites = problemPrerequisiteRepository.findByProblemId(problem.getId());
        if (prerequisites.isEmpty()) {
            return true;
        }
        
        return prerequisites.stream().allMatch(prereq -> isPrerequisiteCompleted(userId, prereq));
    }

    private boolean isPrerequisiteCompleted(UUID userId, StagePrerequisite prereq) {
        if (prereq.getPrerequisiteLesson() != null) {
            return isLessonCompleted(userId, prereq.getPrerequisiteLesson().getId());
        }
        if (prereq.getPrerequisiteProblem() != null) {
            return isProblemCompleted(userId, prereq.getPrerequisiteProblem().getId());
        }
        return false;
    }

    private boolean isPrerequisiteCompleted(UUID userId, ProblemPrerequisite prereq) {
        if (prereq.getPrerequisiteLesson() != null) {
            return isLessonCompleted(userId, prereq.getPrerequisiteLesson().getId());
        }
        if (prereq.getPrerequisiteProblem() != null) {
            return isProblemCompleted(userId, prereq.getPrerequisiteProblem().getId());
        }
        return false;
    }

    public boolean isLessonCompleted(UUID userId, UUID lessonId) {
        if (userId == null) {
            return false;
        }
        return lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(LessonProgress::getIsCompleted)
                .orElse(false);
    }

    public boolean isProblemCompleted(UUID userId, UUID problemId) {
        if (userId == null) {
            return false;
        }
        return submissionRepository.existsByUserIdAndProblemId(userId, problemId);
    }
}
