package com.waterball.course.service.gym;

import com.waterball.course.entity.Gym;
import com.waterball.course.entity.GymType;
import com.waterball.course.entity.Stage;
import com.waterball.course.exception.GymNotFoundException;
import com.waterball.course.repository.GymRepository;
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
public class GymService {
    private final GymRepository gymRepository;
    private final StageRepository stageRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final GymAccessControlService gymAccessControlService;

    public List<Gym> getGyms(UUID journeyId, GymType type) {
        if (journeyId != null && type != null) {
            return gymRepository.findByJourneyIdAndGymTypeAndIsPublishedTrueOrderBySortOrder(journeyId, type);
        }
        if (journeyId != null) {
            return gymRepository.findByJourneyIdAndIsPublishedTrueOrderBySortOrder(journeyId);
        }
        if (type != null) {
            return gymRepository.findByGymTypeAndIsPublishedTrueOrderBySortOrder(type);
        }
        return gymRepository.findByIsPublishedTrueOrderBySortOrder();
    }

    public Gym getGym(UUID gymId) {
        return gymRepository.findByIdAndIsPublishedTrue(gymId)
                .orElseThrow(() -> new GymNotFoundException("Gym not found: " + gymId));
    }

    public List<Stage> getGymStages(UUID gymId) {
        return stageRepository.findByGymIdOrderBySortOrder(gymId);
    }

    public List<Gym> getRelatedGyms(UUID journeyId, UUID gymId) {
        return gymRepository.findRelatedGyms(journeyId, gymId);
    }

    public int getStageCount(UUID gymId) {
        return stageRepository.countByGymId(gymId);
    }

    public int getProblemCount(UUID gymId) {
        return problemRepository.countByGymId(gymId);
    }

    public int getCompletedProblemCount(UUID userId, UUID gymId) {
        if (userId == null) {
            return 0;
        }
        return submissionRepository.countCompletedByUserIdAndGymId(userId, gymId);
    }

    public boolean isPurchased(UUID userId, UUID journeyId) {
        return gymAccessControlService.hasPurchasedJourney(userId, journeyId);
    }
}
