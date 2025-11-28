package com.waterball.course.service.course;

import com.waterball.course.entity.AccessType;
import com.waterball.course.entity.Lesson;
import com.waterball.course.repository.UserPurchaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccessControlService {
    private final UserPurchaseRepository userPurchaseRepository;

    public boolean canAccessLesson(Lesson lesson, UUID userId) {
        AccessType accessType = lesson.getAccessType();
        UUID journeyId = lesson.getChapter().getJourney().getId();
        UUID lessonId = lesson.getId();
        
        log.debug("Checking lesson access: userId={}, lessonId={}, journeyId={}, accessType={}", 
                userId, lessonId, journeyId, accessType);
        
        if (accessType == AccessType.PUBLIC) {
            log.debug("Access granted: lesson is PUBLIC");
            return true;
        }
        
        if (userId == null) {
            log.debug("Access denied: userId is null for non-public lesson");
            return false;
        }
        
        if (accessType == AccessType.TRIAL) {
            log.debug("Access granted: lesson is TRIAL and user is authenticated");
            return true;
        }
        
        boolean hasPurchase = userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
        log.info("Purchase check: userId={}, journeyId={}, hasPurchase={}", userId, journeyId, hasPurchase);
        return hasPurchase;
    }

    public boolean hasPurchasedJourney(UUID userId, UUID journeyId) {
        if (userId == null) {
            log.debug("hasPurchasedJourney: userId is null, returning false");
            return false;
        }
        boolean result = userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
        log.info("hasPurchasedJourney: userId={}, journeyId={}, result={}", userId, journeyId, result);
        return result;
    }

    public boolean isAccessible(AccessType accessType, UUID userId, UUID journeyId) {
        log.debug("isAccessible check: accessType={}, userId={}, journeyId={}", accessType, userId, journeyId);
        
        if (accessType == AccessType.PUBLIC) {
            log.debug("isAccessible: granted - PUBLIC access");
            return true;
        }
        if (userId == null) {
            log.debug("isAccessible: denied - userId is null");
            return false;
        }
        if (accessType == AccessType.TRIAL) {
            log.debug("isAccessible: granted - TRIAL access for authenticated user");
            return true;
        }
        boolean result = userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
        log.info("isAccessible purchase check: userId={}, journeyId={}, result={}", userId, journeyId, result);
        return result;
    }
}
