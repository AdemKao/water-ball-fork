package com.waterball.course.repository;

import com.waterball.course.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, UUID> {
    List<Chapter> findByJourneyIdOrderBySortOrderAsc(UUID journeyId);
}
