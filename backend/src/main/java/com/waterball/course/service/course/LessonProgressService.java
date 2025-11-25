package com.waterball.course.service.course;

import com.waterball.course.dto.response.*;
import com.waterball.course.entity.*;
import com.waterball.course.exception.AccessDeniedException;
import com.waterball.course.repository.JourneyRepository;
import com.waterball.course.repository.LessonProgressRepository;
import com.waterball.course.repository.LessonRepository;
import com.waterball.course.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonProgressService {
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final AccessControlService accessControlService;
    private final JourneyRepository journeyRepository;
    private final UserRepository userRepository;

    @Transactional
    public UpdateProgressResponse updateProgress(UUID lessonId, UUID userId, int lastPositionSeconds) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));

        if (!accessControlService.canAccessLesson(lesson, userId)) {
            throw new AccessDeniedException("請購買此課程以解鎖完整內容");
        }

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> {
                    LessonProgress newProgress = new LessonProgress();
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
                    newProgress.setUser(user);
                    newProgress.setLesson(lesson);
                    return newProgress;
                });

        progress.setLastPositionSeconds(lastPositionSeconds);
        lessonProgressRepository.save(progress);

        return UpdateProgressResponse.builder()
                .lessonId(lessonId)
                .isCompleted(Boolean.TRUE.equals(progress.getIsCompleted()))
                .lastPositionSeconds(lastPositionSeconds)
                .updatedAt(progress.getUpdatedAt())
                .build();
    }

    @Transactional
    public CompleteResponse completeLesson(UUID lessonId, UUID userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));

        if (!accessControlService.canAccessLesson(lesson, userId)) {
            throw new AccessDeniedException("請購買此課程以解鎖完整內容");
        }

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> {
                    LessonProgress newProgress = new LessonProgress();
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
                    newProgress.setUser(user);
                    newProgress.setLesson(lesson);
                    return newProgress;
                });

        progress.setIsCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        lessonProgressRepository.save(progress);

        return CompleteResponse.builder()
                .lessonId(lessonId)
                .isCompleted(true)
                .completedAt(progress.getCompletedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public JourneyProgressResponse getJourneyProgress(UUID journeyId, UUID userId) {
        Journey journey = journeyRepository.findByIdAndIsPublishedTrue(journeyId)
                .orElseThrow(() -> new EntityNotFoundException("Journey not found: " + journeyId));

        int totalLessons = lessonRepository.countByJourneyId(journeyId);
        int completedLessons = lessonProgressRepository.countCompletedByUserIdAndJourneyId(userId, journeyId);
        int progressPercentage = totalLessons > 0 ? (completedLessons * 100) / totalLessons : 0;

        List<ChapterProgressResponse> chapters = journey.getChapters().stream()
                .map(chapter -> toChapterProgressResponse(chapter, userId))
                .collect(Collectors.toList());

        return JourneyProgressResponse.builder()
                .journeyId(journeyId)
                .totalLessons(totalLessons)
                .completedLessons(completedLessons)
                .progressPercentage(progressPercentage)
                .chapters(chapters)
                .build();
    }

    private ChapterProgressResponse toChapterProgressResponse(Chapter chapter, UUID userId) {
        List<UUID> lessonIds = chapter.getLessons().stream()
                .map(Lesson::getId)
                .collect(Collectors.toList());

        int totalLessons = lessonIds.size();
        long completedLessons = 0;
        
        if (!lessonIds.isEmpty()) {
            completedLessons = lessonProgressRepository.findByUserIdAndLessonIds(userId, lessonIds).stream()
                    .filter(p -> Boolean.TRUE.equals(p.getIsCompleted()))
                    .count();
        }

        return ChapterProgressResponse.builder()
                .chapterId(chapter.getId())
                .title(chapter.getTitle())
                .totalLessons(totalLessons)
                .completedLessons((int) completedLessons)
                .isCompleted(totalLessons > 0 && completedLessons == totalLessons)
                .build();
    }
}
