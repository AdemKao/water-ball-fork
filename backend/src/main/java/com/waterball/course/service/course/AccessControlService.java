package com.waterball.course.service.course;

import com.waterball.course.entity.AccessType;
import com.waterball.course.entity.Lesson;
import com.waterball.course.repository.UserPurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccessControlService {
    private final UserPurchaseRepository userPurchaseRepository;

    public boolean canAccessLesson(Lesson lesson, UUID userId) {
        AccessType accessType = lesson.getAccessType();
        
        if (accessType == AccessType.PUBLIC) {
            return true;
        }
        
        if (userId == null) {
            return false;
        }
        
        if (accessType == AccessType.TRIAL) {
            return true;
        }
        
        UUID journeyId = lesson.getChapter().getJourney().getId();
        return userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
    }

    public boolean hasPurchasedJourney(UUID userId, UUID journeyId) {
        if (userId == null) {
            return false;
        }
        return userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
    }

    public boolean isAccessible(AccessType accessType, UUID userId, UUID journeyId) {
        if (accessType == AccessType.PUBLIC) {
            return true;
        }
        if (userId == null) {
            return false;
        }
        if (accessType == AccessType.TRIAL) {
            return true;
        }
        return userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
    }
}
