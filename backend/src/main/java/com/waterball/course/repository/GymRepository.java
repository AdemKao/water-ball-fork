package com.waterball.course.repository;

import com.waterball.course.entity.Gym;
import com.waterball.course.entity.GymType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GymRepository extends JpaRepository<Gym, UUID> {
    List<Gym> findByIsPublishedTrueOrderBySortOrder();
    
    List<Gym> findByJourneyIdAndIsPublishedTrueOrderBySortOrder(UUID journeyId);
    
    List<Gym> findByGymTypeAndIsPublishedTrueOrderBySortOrder(GymType gymType);
    
    List<Gym> findByJourneyIdAndGymTypeAndIsPublishedTrueOrderBySortOrder(UUID journeyId, GymType gymType);
    
    Optional<Gym> findByIdAndIsPublishedTrue(UUID id);
    
    @Query("SELECT g FROM Gym g WHERE g.journey.id = :journeyId AND g.id != :gymId AND g.isPublished = true ORDER BY g.sortOrder")
    List<Gym> findRelatedGyms(@Param("journeyId") UUID journeyId, @Param("gymId") UUID gymId);
}
