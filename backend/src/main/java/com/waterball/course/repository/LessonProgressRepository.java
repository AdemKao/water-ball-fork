package com.waterball.course.repository;

import com.waterball.course.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    Optional<LessonProgress> findByUserIdAndLessonId(UUID userId, UUID lessonId);
    List<LessonProgress> findByUserId(UUID userId);
    
    @Query("SELECT lp FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.id IN :lessonIds")
    List<LessonProgress> findByUserIdAndLessonIds(@Param("userId") UUID userId, @Param("lessonIds") List<UUID> lessonIds);
    
    @Query("SELECT COUNT(lp) FROM LessonProgress lp JOIN lp.lesson l JOIN l.chapter c WHERE lp.user.id = :userId AND c.journey.id = :journeyId AND lp.isCompleted = true")
    int countCompletedByUserIdAndJourneyId(@Param("userId") UUID userId, @Param("journeyId") UUID journeyId);
}
