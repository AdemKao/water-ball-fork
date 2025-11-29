package com.waterball.course.service.gym;

import com.waterball.course.entity.Problem;
import com.waterball.course.entity.Stage;
import com.waterball.course.exception.StageNotFoundException;
import com.waterball.course.repository.ProblemRepository;
import com.waterball.course.repository.StageRepository;
import com.waterball.course.repository.SubmissionRepository;
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
public class StageService {
    private final StageRepository stageRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final GymAccessControlService gymAccessControlService;

    public Stage getStage(UUID stageId) {
        return stageRepository.findById(stageId)
                .orElseThrow(() -> new StageNotFoundException("Stage not found: " + stageId));
    }

    public Stage getStageByGym(UUID gymId, UUID stageId) {
        return stageRepository.findByIdAndGymId(stageId, gymId)
                .orElseThrow(() -> new StageNotFoundException("Stage not found: " + stageId));
    }

    public List<Problem> getStageProblems(UUID stageId) {
        return problemRepository.findByStageIdOrderBySortOrder(stageId);
    }

    public int getProblemCount(UUID stageId) {
        return problemRepository.countByStageId(stageId);
    }

    public int getCompletedProblemCount(UUID userId, UUID stageId) {
        if (userId == null) {
            return 0;
        }
        return submissionRepository.countCompletedByUserIdAndStageId(userId, stageId);
    }

    public boolean isStageUnlocked(UUID userId, Stage stage) {
        return gymAccessControlService.isStageUnlocked(userId, stage);
    }
}
