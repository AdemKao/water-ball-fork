package com.waterballsa.backend.gym.repository;

import com.waterballsa.backend.gym.domain.Gym;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GymRepository extends JpaRepository<Gym, Long> {

    List<Gym> findByJourneyIdOrderByDisplayOrderAsc(UUID journeyId);

    @Query("SELECT g FROM Gym g LEFT JOIN FETCH g.exercises WHERE g.id = :id")
    Optional<Gym> findByIdWithExercises(@Param("id") Long id);
}
