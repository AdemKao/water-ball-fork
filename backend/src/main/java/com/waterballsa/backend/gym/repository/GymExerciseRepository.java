package com.waterballsa.backend.gym.repository;

import com.waterballsa.backend.gym.domain.GymExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GymExerciseRepository extends JpaRepository<GymExercise, Long> {

    List<GymExercise> findByGymIdOrderByDisplayOrderAsc(Long gymId);

    @Query("SELECT e FROM GymExercise e LEFT JOIN FETCH e.submissions WHERE e.id = :id")
    Optional<GymExercise> findByIdWithSubmissions(@Param("id") Long id);

    @Query("SELECT COUNT(e) FROM GymExercise e WHERE e.gym.id = :gymId")
    long countByGymId(@Param("gymId") Long gymId);
}
