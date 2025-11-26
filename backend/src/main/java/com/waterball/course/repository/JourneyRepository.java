package com.waterball.course.repository;

import com.waterball.course.entity.Journey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, UUID> {
    List<Journey> findByIsPublishedTrue();
    Optional<Journey> findByIdAndIsPublishedTrue(UUID id);
}
