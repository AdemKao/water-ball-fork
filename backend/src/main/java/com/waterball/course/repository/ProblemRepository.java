package com.waterball.course.repository;

import com.waterball.course.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, UUID> {
    List<Problem> findByStageIdOrderBySortOrder(UUID stageId);
    
    @Query("SELECT COUNT(p) FROM Problem p WHERE p.stage.id = :stageId")
    int countByStageId(@Param("stageId") UUID stageId);
    
    @Query("SELECT COUNT(p) FROM Problem p WHERE p.stage.gym.id = :gymId")
    int countByGymId(@Param("gymId") UUID gymId);
    
    @Query("SELECT p FROM Problem p WHERE p.stage.gym.id = :gymId ORDER BY p.stage.sortOrder, p.sortOrder")
    List<Problem> findByGymIdOrdered(@Param("gymId") UUID gymId);
    
    @Query("SELECT p FROM Problem p " +
           "WHERE p.stage.id = :stageId " +
           "AND p.sortOrder < :sortOrder " +
           "ORDER BY p.sortOrder DESC " +
           "LIMIT 1")
    Optional<Problem> findPreviousProblem(@Param("stageId") UUID stageId, @Param("sortOrder") int sortOrder);
    
    @Query("SELECT p FROM Problem p " +
           "WHERE p.stage.id = :stageId " +
           "AND p.sortOrder > :sortOrder " +
           "ORDER BY p.sortOrder ASC " +
           "LIMIT 1")
    Optional<Problem> findNextProblem(@Param("stageId") UUID stageId, @Param("sortOrder") int sortOrder);
}
