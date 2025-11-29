package com.waterball.course.repository;

import com.waterball.course.entity.Submission;
import com.waterball.course.entity.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByUserIdAndProblemIdOrderByVersionDesc(UUID userId, UUID problemId);
    
    Optional<Submission> findTopByUserIdAndProblemIdOrderByVersionDesc(UUID userId, UUID problemId);
    
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId AND s.problem.id = :problemId")
    int countByUserIdAndProblemId(@Param("userId") UUID userId, @Param("problemId") UUID problemId);
    
    @Query("SELECT MAX(s.version) FROM Submission s WHERE s.user.id = :userId AND s.problem.id = :problemId")
    Optional<Integer> findMaxVersionByUserIdAndProblemId(@Param("userId") UUID userId, @Param("problemId") UUID problemId);
    
    boolean existsByUserIdAndProblemId(UUID userId, UUID problemId);
    
    @Query("SELECT COUNT(s) FROM Submission s " +
           "WHERE s.user.id = :userId " +
           "AND s.problem.stage.gym.id = :gymId")
    int countCompletedByUserIdAndGymId(@Param("userId") UUID userId, @Param("gymId") UUID gymId);
    
    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s " +
           "WHERE s.user.id = :userId " +
           "AND s.problem.stage.id = :stageId")
    int countCompletedByUserIdAndStageId(@Param("userId") UUID userId, @Param("stageId") UUID stageId);
    
    @Query("SELECT COUNT(s) FROM Submission s " +
           "WHERE s.user.id = :userId " +
           "AND s.status = :status")
    int countByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") SubmissionStatus status);
    
    Page<Submission> findByIsPublicTrueOrderBySubmittedAtDesc(Pageable pageable);
    
    @Query("SELECT s FROM Submission s " +
           "WHERE s.isPublic = true " +
           "AND s.problem.id = :problemId " +
           "ORDER BY s.submittedAt DESC")
    Page<Submission> findPublicByProblemId(@Param("problemId") UUID problemId, Pageable pageable);
    
    @Query("SELECT s FROM Submission s " +
           "WHERE s.isPublic = true " +
           "AND s.problem.stage.gym.id = :gymId " +
           "ORDER BY s.submittedAt DESC")
    Page<Submission> findPublicByGymId(@Param("gymId") UUID gymId, Pageable pageable);
}
