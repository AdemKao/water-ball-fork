package com.waterball.course.service.course;

import com.waterball.course.dto.response.*;
import com.waterball.course.entity.*;
import com.waterball.course.exception.AccessDeniedException;
import com.waterball.course.repository.LessonProgressRepository;
import com.waterball.course.repository.LessonRepository;
import com.waterball.course.service.video.VideoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LessonService {
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final AccessControlService accessControlService;
    private final VideoService videoService;

    public LessonDetailResponse getLessonDetail(UUID lessonId, UUID userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));

        if (!accessControlService.canAccessLesson(lesson, userId)) {
            throw new AccessDeniedException("請購買此課程以解鎖完整內容");
        }

        Chapter chapter = lesson.getChapter();
        Journey journey = chapter.getJourney();

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElse(null);

        ProgressResponse progressResponse = ProgressResponse.builder()
                .isCompleted(progress != null && Boolean.TRUE.equals(progress.getIsCompleted()))
                .lastPositionSeconds(progress != null ? progress.getLastPositionSeconds() : 0)
                .completedAt(progress != null ? progress.getCompletedAt() : null)
                .build();

        List<Lesson> allLessons = lessonRepository.findByJourneyIdOrdered(journey.getId());
        LessonNavResponse previousLesson = null;
        LessonNavResponse nextLesson = null;
        
        for (int i = 0; i < allLessons.size(); i++) {
            if (allLessons.get(i).getId().equals(lessonId)) {
                if (i > 0) {
                    Lesson prev = allLessons.get(i - 1);
                    previousLesson = new LessonNavResponse(prev.getId(), prev.getTitle());
                }
                if (i < allLessons.size() - 1) {
                    Lesson next = allLessons.get(i + 1);
                    nextLesson = new LessonNavResponse(next.getId(), next.getTitle());
                }
                break;
            }
        }

        InstructorResponse instructor = null;
        if (lesson.getInstructor() != null) {
            instructor = InstructorResponse.builder()
                    .id(lesson.getInstructor().getId())
                    .name(lesson.getInstructor().getName())
                    .pictureUrl(lesson.getInstructor().getPictureUrl())
                    .build();
        }

        String videoStreamUrl = null;
        if (lesson.getVideo() != null) {
            videoStreamUrl = videoService.generateStreamUrl(lesson.getVideo().getId());
        }

        return LessonDetailResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .lessonType(lesson.getLessonType())
                .contentUrl(lesson.getContentUrl())
                .videoStreamUrl(videoStreamUrl)
                .durationSeconds(lesson.getDurationSeconds())
                .instructor(instructor)
                .progress(progressResponse)
                .previousLesson(previousLesson)
                .nextLesson(nextLesson)
                .journeyId(journey.getId())
                .journeyTitle(journey.getTitle())
                .build();
    }
}
