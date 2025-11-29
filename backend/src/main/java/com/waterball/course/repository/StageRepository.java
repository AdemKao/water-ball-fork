package com.waterball.course.repository;

import com.waterball.course.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StageRepository extends JpaRepository<Stage, UUID> {
    List<Stage> findByGymIdOrderBySortOrder(UUID gymId);
    
    Optional<Stage> findByIdAndGymId(UUID id, UUID gymId);
    
    @Query("SELECT COUNT(s) FROM Stage s WHERE s.gym.id = :gymId")
    int countByGymId(@Param("gymId") UUID gymId);
}
