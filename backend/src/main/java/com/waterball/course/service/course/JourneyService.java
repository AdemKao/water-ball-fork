package com.waterball.course.service.course;

import com.waterball.course.dto.response.*;
import com.waterball.course.entity.*;
import com.waterball.course.repository.JourneyRepository;
import com.waterball.course.repository.LessonProgressRepository;
import com.waterball.course.repository.LessonRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JourneyService {
    private final JourneyRepository journeyRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final AccessControlService accessControlService;

    public List<JourneyListResponse> getPublishedJourneys() {
        List<Journey> journeys = journeyRepository.findByIsPublishedTrue();
        return journeys.stream()
                .map(this::toJourneyListResponse)
                .collect(Collectors.toList());
    }

    public JourneyDetailResponse getJourneyDetail(UUID journeyId, UUID userId) {
        Journey journey = journeyRepository.findByIdAndIsPublishedTrue(journeyId)
                .orElseThrow(() -> new EntityNotFoundException("Journey not found: " + journeyId));

        boolean isPurchased = accessControlService.hasPurchasedJourney(userId, journeyId);
        
        List<UUID> lessonIds = journey.getChapters().stream()
                .flatMap(c -> c.getLessons().stream())
                .map(Lesson::getId)
                .collect(Collectors.toList());
        
        Map<UUID, LessonProgress> progressMap = new HashMap<>();
        if (userId != null && !lessonIds.isEmpty()) {
            lessonProgressRepository.findByUserIdAndLessonIds(userId, lessonIds)
                    .forEach(p -> progressMap.put(p.getLesson().getId(), p));
        }

        return toJourneyDetailResponse(journey, userId, isPurchased, progressMap);
    }

    private JourneyListResponse toJourneyListResponse(Journey journey) {
        int chapterCount = journey.getChapters().size();
        int lessonCount = lessonRepository.countByJourneyId(journey.getId());
        int totalDuration = lessonRepository.sumDurationByJourneyId(journey.getId());

        Integer priceValue = journey.getPrice() != null 
                ? journey.getPrice().intValue() 
                : 1990;

        return JourneyListResponse.builder()
                .id(journey.getId())
                .title(journey.getTitle())
                .description(journey.getDescription())
                .thumbnailUrl(journey.getThumbnailUrl())
                .chapterCount(chapterCount)
                .lessonCount(lessonCount)
                .totalDurationSeconds(totalDuration)
                .price(priceValue)
                .currency("TWD")
                .originalPrice(null)
                .discountPercentage(null)
                .build();
    }

    private JourneyDetailResponse toJourneyDetailResponse(Journey journey, UUID userId, 
            boolean isPurchased, Map<UUID, LessonProgress> progressMap) {
        List<ChapterResponse> chapters = journey.getChapters().stream()
                .map(chapter -> toChapterResponse(chapter, userId, journey.getId(), progressMap))
                .collect(Collectors.toList());

        Integer priceValue = journey.getPrice() != null 
                ? journey.getPrice().intValue() 
                : 1990;

        return JourneyDetailResponse.builder()
                .id(journey.getId())
                .title(journey.getTitle())
                .description(journey.getDescription())
                .thumbnailUrl(journey.getThumbnailUrl())
                .chapters(chapters)
                .isPurchased(isPurchased)
                .price(priceValue)
                .currency("TWD")
                .originalPrice(null)
                .discountPercentage(null)
                .build();
    }

    private ChapterResponse toChapterResponse(Chapter chapter, UUID userId, UUID journeyId,
            Map<UUID, LessonProgress> progressMap) {
        List<LessonSummaryResponse> lessons = chapter.getLessons().stream()
                .map(lesson -> toLessonSummaryResponse(lesson, userId, journeyId, progressMap))
                .collect(Collectors.toList());

        return ChapterResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .sortOrder(chapter.getSortOrder())
                .accessType(chapter.getAccessType())
                .lessons(lessons)
                .build();
    }

    private LessonSummaryResponse toLessonSummaryResponse(Lesson lesson, UUID userId, 
            UUID journeyId, Map<UUID, LessonProgress> progressMap) {
        boolean isAccessible = accessControlService.isAccessible(lesson.getAccessType(), userId, journeyId);
        LessonProgress progress = progressMap.get(lesson.getId());
        boolean isCompleted = progress != null && Boolean.TRUE.equals(progress.getIsCompleted());

        InstructorResponse instructor = null;
        if (lesson.getInstructor() != null) {
            instructor = InstructorResponse.builder()
                    .id(lesson.getInstructor().getId())
                    .name(lesson.getInstructor().getName())
                    .pictureUrl(lesson.getInstructor().getPictureUrl())
                    .build();
        }

        return LessonSummaryResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .lessonType(lesson.getLessonType())
                .durationSeconds(lesson.getDurationSeconds())
                .accessType(lesson.getAccessType())
                .isAccessible(isAccessible)
                .isCompleted(isCompleted)
                .instructor(instructor)
                .build();
    }
}
