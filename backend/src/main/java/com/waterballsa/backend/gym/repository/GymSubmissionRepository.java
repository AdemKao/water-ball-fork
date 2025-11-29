package com.waterballsa.backend.gym.repository;

import com.waterballsa.backend.gym.domain.GymSubmission;
import com.waterballsa.backend.gym.domain.SubmissionStatus;
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
public interface GymSubmissionRepository extends JpaRepository<GymSubmission, Long> {

    List<GymSubmission> findByExerciseIdAndUserIdOrderBySubmittedAtDesc(Long exerciseId, UUID userId);

    List<GymSubmission> findByExerciseIdOrderBySubmittedAtDesc(Long exerciseId);

    Page<GymSubmission> findByStatus(SubmissionStatus status, Pageable pageable);

    @Query("SELECT s FROM GymSubmission s WHERE s.exercise.id = :exerciseId AND s.user.id = :userId ORDER BY s.submittedAt DESC")
    List<GymSubmission> findUserSubmissionsForExercise(@Param("exerciseId") Long exerciseId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(DISTINCT s.exercise.id) FROM GymSubmission s WHERE s.exercise.gym.id = :gymId AND s.user.id = :userId AND s.status = 'APPROVED'")
    long countApprovedExercisesByGymAndUser(@Param("gymId") Long gymId, @Param("userId") UUID userId);

    Optional<GymSubmission> findTopByExerciseIdAndUserIdOrderBySubmittedAtDesc(Long exerciseId, UUID userId);
}
