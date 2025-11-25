package com.waterball.course.repository;

import com.waterball.course.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    List<Lesson> findByChapterIdOrderBySortOrderAsc(UUID chapterId);
    
    @Query("SELECT l FROM Lesson l JOIN l.chapter c WHERE c.journey.id = :journeyId ORDER BY c.sortOrder, l.sortOrder")
    List<Lesson> findByJourneyIdOrdered(@Param("journeyId") UUID journeyId);
    
    @Query("SELECT COUNT(l) FROM Lesson l JOIN l.chapter c WHERE c.journey.id = :journeyId")
    int countByJourneyId(@Param("journeyId") UUID journeyId);
    
    @Query("SELECT COALESCE(SUM(l.durationSeconds), 0) FROM Lesson l JOIN l.chapter c WHERE c.journey.id = :journeyId")
    int sumDurationByJourneyId(@Param("journeyId") UUID journeyId);
}
