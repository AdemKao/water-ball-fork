package com.waterball.course.repository;

import com.waterball.course.entity.UserPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPurchaseRepository extends JpaRepository<UserPurchase, UUID> {
    boolean existsByUserIdAndJourneyId(UUID userId, UUID journeyId);
    Optional<UserPurchase> findByUserIdAndJourneyId(UUID userId, UUID journeyId);
    List<UserPurchase> findByUserId(UUID userId);
}
