# Backend Implementation Tasks: Course Lesson System

## Phase 1: Database & Entity

### Task 1.1: 建立 Flyway Migration

**檔案:** `src/main/resources/db/migration/V3__create_course_tables.sql`

```sql
-- videos table (must be created first due to FK)
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'SUPABASE',
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    duration_seconds INT,
    status VARCHAR(50) NOT NULL DEFAULT 'READY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- journeys table
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journeys_is_published ON journeys(is_published);

-- chapters table
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    access_type VARCHAR(50) NOT NULL DEFAULT 'PURCHASED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chapters_journey_id ON chapters(journey_id);
CREATE INDEX idx_chapters_sort_order ON chapters(journey_id, sort_order);

-- lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type VARCHAR(50) NOT NULL,
    content_url VARCHAR(500),
    video_id UUID REFERENCES videos(id),
    duration_seconds INT,
    sort_order INT NOT NULL DEFAULT 0,
    access_type VARCHAR(50) NOT NULL DEFAULT 'PURCHASED',
    instructor_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_chapter_id ON lessons(chapter_id);
CREATE INDEX idx_lessons_sort_order ON lessons(chapter_id, sort_order);

-- lesson_progress table
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    last_position_seconds INT DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- user_purchases table
CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, journey_id)
);

CREATE INDEX idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_journey_id ON user_purchases(journey_id);
```

---

### Task 1.2: 建立 LessonType Enum

**檔案:** `src/main/java/com/waterball/course/entity/LessonType.java`

```java
package com.waterball.course.entity;

public enum LessonType {
    VIDEO,
    GOOGLE_FORM,
    ARTICLE
}
```

---

### Task 1.3: 建立 AccessType Enum

**檔案:** `src/main/java/com/waterball/course/entity/AccessType.java`

```java
package com.waterball.course.entity;

public enum AccessType {
    PUBLIC,
    TRIAL,
    PURCHASED
}
```

---

### Task 1.4: 建立 Video Entity

**檔案:** `src/main/java/com/waterball/course/entity/Video.java`

```java
@Entity
@Table(name = "videos")
@Getter @Setter
@NoArgsConstructor
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "storage_provider", nullable = false)
    private String storageProvider = "SUPABASE";

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(nullable = false)
    private String status = "READY";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### Task 1.5: 建立 Journey Entity

**檔案:** `src/main/java/com/waterball/course/entity/Journey.java`

```java
@Entity
@Table(name = "journeys")
@Getter @Setter
@NoArgsConstructor
public class Journey {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "is_published")
    private Boolean isPublished = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "journey", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<Chapter> chapters = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### Task 1.6: 建立 Chapter Entity

**檔案:** `src/main/java/com/waterball/course/entity/Chapter.java`

```java
@Entity
@Table(name = "chapters")
@Getter @Setter
@NoArgsConstructor
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journey_id", nullable = false)
    private Journey journey;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_type", nullable = false)
    private AccessType accessType = AccessType.PURCHASED;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<Lesson> lessons = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### Task 1.7: 建立 Lesson Entity

**檔案:** `src/main/java/com/waterball/course/entity/Lesson.java`

```java
@Entity
@Table(name = "lessons")
@Getter @Setter
@NoArgsConstructor
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false)
    private LessonType lessonType;

    @Column(name = "content_url")
    private String contentUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id")
    private Video video;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_type", nullable = false)
    private AccessType accessType = AccessType.PURCHASED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### Task 1.8: 建立 LessonProgress Entity

**檔案:** `src/main/java/com/waterball/course/entity/LessonProgress.java`

```java
@Entity
@Table(name = "lesson_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
@Getter @Setter
@NoArgsConstructor
public class LessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "last_position_seconds")
    private Integer lastPositionSeconds = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### Task 1.9: 建立 UserPurchase Entity

**檔案:** `src/main/java/com/waterball/course/entity/UserPurchase.java`

```java
@Entity
@Table(name = "user_purchases",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "journey_id"}))
@Getter @Setter
@NoArgsConstructor
public class UserPurchase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journey_id", nullable = false)
    private Journey journey;

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    @PrePersist
    protected void onCreate() {
        purchasedAt = LocalDateTime.now();
    }
}
```

---

### Task 1.10: 建立 JourneyRepository

**檔案:** `src/main/java/com/waterball/course/repository/JourneyRepository.java`

```java
@Repository
public interface JourneyRepository extends JpaRepository<Journey, UUID> {
    List<Journey> findByIsPublishedTrue();
    Optional<Journey> findByIdAndIsPublishedTrue(UUID id);
}
```

---

### Task 1.11: 建立 ChapterRepository

**檔案:** `src/main/java/com/waterball/course/repository/ChapterRepository.java`

```java
@Repository
public interface ChapterRepository extends JpaRepository<Chapter, UUID> {
    List<Chapter> findByJourneyIdOrderBySortOrderAsc(UUID journeyId);
}
```

---

### Task 1.12: 建立 LessonRepository

**檔案:** `src/main/java/com/waterball/course/repository/LessonRepository.java`

```java
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
```

---

### Task 1.13: 建立 LessonProgressRepository

**檔案:** `src/main/java/com/waterball/course/repository/LessonProgressRepository.java`

```java
@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    Optional<LessonProgress> findByUserIdAndLessonId(UUID userId, UUID lessonId);
    List<LessonProgress> findByUserId(UUID userId);
    
    @Query("SELECT lp FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.id IN :lessonIds")
    List<LessonProgress> findByUserIdAndLessonIds(@Param("userId") UUID userId, @Param("lessonIds") List<UUID> lessonIds);
    
    @Query("SELECT COUNT(lp) FROM LessonProgress lp JOIN lp.lesson l JOIN l.chapter c WHERE lp.user.id = :userId AND c.journey.id = :journeyId AND lp.isCompleted = true")
    int countCompletedByUserIdAndJourneyId(@Param("userId") UUID userId, @Param("journeyId") UUID journeyId);
}
```

---

### Task 1.14: 建立 UserPurchaseRepository

**檔案:** `src/main/java/com/waterball/course/repository/UserPurchaseRepository.java`

```java
@Repository
public interface UserPurchaseRepository extends JpaRepository<UserPurchase, UUID> {
    boolean existsByUserIdAndJourneyId(UUID userId, UUID journeyId);
    Optional<UserPurchase> findByUserIdAndJourneyId(UUID userId, UUID journeyId);
    List<UserPurchase> findByUserId(UUID userId);
}
```

---

### Task 1.15: 建立 VideoRepository

**檔案:** `src/main/java/com/waterball/course/repository/VideoRepository.java`

```java
@Repository
public interface VideoRepository extends JpaRepository<Video, UUID> {
}
```

---

## Phase 2: Service Layer

### Task 2.1: 建立 AccessControlService

**檔案:** `src/main/java/com/waterball/course/service/course/AccessControlService.java`

```java
@Service
@RequiredArgsConstructor
public class AccessControlService {
    private final UserPurchaseRepository userPurchaseRepository;

    public boolean canAccessLesson(Lesson lesson, UUID userId) {
        AccessType accessType = lesson.getAccessType();
        
        if (accessType == AccessType.PUBLIC) {
            return true;
        }
        
        if (userId == null) {
            return false;
        }
        
        if (accessType == AccessType.TRIAL) {
            return true;
        }
        
        UUID journeyId = lesson.getChapter().getJourney().getId();
        return userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
    }

    public boolean hasPurchasedJourney(UUID userId, UUID journeyId) {
        if (userId == null) {
            return false;
        }
        return userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
    }

    public boolean isAccessible(AccessType accessType, UUID userId, UUID journeyId) {
        if (accessType == AccessType.PUBLIC) {
            return true;
        }
        if (userId == null) {
            return false;
        }
        if (accessType == AccessType.TRIAL) {
            return true;
        }
        return userPurchaseRepository.existsByUserIdAndJourneyId(userId, journeyId);
    }
}
```

---

### Task 2.2: 建立 JourneyService

**檔案:** `src/main/java/com/waterball/course/service/course/JourneyService.java`

```java
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

        return JourneyListResponse.builder()
                .id(journey.getId())
                .title(journey.getTitle())
                .description(journey.getDescription())
                .thumbnailUrl(journey.getThumbnailUrl())
                .chapterCount(chapterCount)
                .lessonCount(lessonCount)
                .totalDurationSeconds(totalDuration)
                .build();
    }

    private JourneyDetailResponse toJourneyDetailResponse(Journey journey, UUID userId, 
            boolean isPurchased, Map<UUID, LessonProgress> progressMap) {
        List<ChapterResponse> chapters = journey.getChapters().stream()
                .map(chapter -> toChapterResponse(chapter, userId, journey.getId(), progressMap))
                .collect(Collectors.toList());

        return JourneyDetailResponse.builder()
                .id(journey.getId())
                .title(journey.getTitle())
                .description(journey.getDescription())
                .thumbnailUrl(journey.getThumbnailUrl())
                .chapters(chapters)
                .isPurchased(isPurchased)
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
```

---

### Task 2.3: 建立 LessonService

**檔案:** `src/main/java/com/waterball/course/service/course/LessonService.java`

```java
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
```

---

### Task 2.4: 建立 LessonProgressService

**檔案:** `src/main/java/com/waterball/course/service/course/LessonProgressService.java`

```java
@Service
@RequiredArgsConstructor
public class LessonProgressService {
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final AccessControlService accessControlService;
    private final JourneyRepository journeyRepository;

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
                    newProgress.setUser(new User());
                    newProgress.getUser().setId(userId);
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
                    newProgress.setUser(new User());
                    newProgress.getUser().setId(userId);
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
```

---

### Task 2.5: 建立 VideoService

**檔案:** `src/main/java/com/waterball/course/service/video/VideoService.java`

```java
@Service
@RequiredArgsConstructor
public class VideoService {
    private final VideoRepository videoRepository;
    private final LessonRepository lessonRepository;
    private final AccessControlService accessControlService;
    private final StorageService storageService;

    @Value("${video.signed-url-expiration:3600}")
    private int signedUrlExpiration;

    public VideoStreamResponse getVideoStream(UUID videoId, UUID userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new EntityNotFoundException("Video not found: " + videoId));

        Lesson lesson = lessonRepository.findAll().stream()
                .filter(l -> l.getVideo() != null && l.getVideo().getId().equals(videoId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found for video: " + videoId));

        if (!accessControlService.canAccessLesson(lesson, userId)) {
            throw new AccessDeniedException("無權限存取此影片");
        }

        String streamUrl = storageService.generateSignedUrl(video.getStoragePath(), signedUrlExpiration);
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(signedUrlExpiration);

        return VideoStreamResponse.builder()
                .streamUrl(streamUrl)
                .expiresAt(expiresAt)
                .durationSeconds(video.getDurationSeconds())
                .build();
    }

    public String generateStreamUrl(UUID videoId) {
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null) {
            return null;
        }
        return storageService.generateSignedUrl(video.getStoragePath(), signedUrlExpiration);
    }
}
```

---

## Phase 3: DTOs

### Task 3.1: 建立 Request DTOs

**檔案:** `src/main/java/com/waterball/course/dto/request/UpdateProgressRequest.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProgressRequest {
    @Min(value = 0, message = "lastPositionSeconds must be >= 0")
    private int lastPositionSeconds;
}
```

---

### Task 3.2: 建立 JourneyListResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/JourneyListResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneyListResponse {
    private UUID id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private int chapterCount;
    private int lessonCount;
    private int totalDurationSeconds;
}
```

---

### Task 3.3: 建立 JourneyDetailResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/JourneyDetailResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneyDetailResponse {
    private UUID id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private List<ChapterResponse> chapters;
    private boolean isPurchased;
}
```

---

### Task 3.4: 建立 ChapterResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/ChapterResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChapterResponse {
    private UUID id;
    private String title;
    private String description;
    private int sortOrder;
    private AccessType accessType;
    private List<LessonSummaryResponse> lessons;
}
```

---

### Task 3.5: 建立 LessonSummaryResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/LessonSummaryResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonSummaryResponse {
    private UUID id;
    private String title;
    private LessonType lessonType;
    private Integer durationSeconds;
    private AccessType accessType;
    private boolean isAccessible;
    private boolean isCompleted;
    private InstructorResponse instructor;
}
```

---

### Task 3.6: 建立 LessonDetailResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/LessonDetailResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonDetailResponse {
    private UUID id;
    private String title;
    private String description;
    private LessonType lessonType;
    private String contentUrl;
    private String videoStreamUrl;
    private Integer durationSeconds;
    private InstructorResponse instructor;
    private ProgressResponse progress;
    private LessonNavResponse previousLesson;
    private LessonNavResponse nextLesson;
    private UUID journeyId;
    private String journeyTitle;
}
```

---

### Task 3.7: 建立 InstructorResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/InstructorResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructorResponse {
    private UUID id;
    private String name;
    private String pictureUrl;
}
```

---

### Task 3.8: 建立 ProgressResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/ProgressResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressResponse {
    private boolean isCompleted;
    private int lastPositionSeconds;
    private LocalDateTime completedAt;
}
```

---

### Task 3.9: 建立 LessonNavResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/LessonNavResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class LessonNavResponse {
    private UUID id;
    private String title;
}
```

---

### Task 3.10: 建立 UpdateProgressResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/UpdateProgressResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProgressResponse {
    private UUID lessonId;
    private boolean isCompleted;
    private int lastPositionSeconds;
    private LocalDateTime updatedAt;
}
```

---

### Task 3.11: 建立 CompleteResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/CompleteResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompleteResponse {
    private UUID lessonId;
    private boolean isCompleted;
    private LocalDateTime completedAt;
}
```

---

### Task 3.12: 建立 JourneyProgressResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/JourneyProgressResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneyProgressResponse {
    private UUID journeyId;
    private int totalLessons;
    private int completedLessons;
    private int progressPercentage;
    private List<ChapterProgressResponse> chapters;
}
```

---

### Task 3.13: 建立 ChapterProgressResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/ChapterProgressResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChapterProgressResponse {
    private UUID chapterId;
    private String title;
    private int totalLessons;
    private int completedLessons;
    private boolean isCompleted;
}
```

---

### Task 3.14: 建立 VideoStreamResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/VideoStreamResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoStreamResponse {
    private String streamUrl;
    private LocalDateTime expiresAt;
    private Integer durationSeconds;
}
```

---

## Phase 4: Controllers

### Task 4.1: 建立 JourneyController

**檔案:** `src/main/java/com/waterball/course/controller/JourneyController.java`

```java
@RestController
@RequestMapping("/api/journeys")
@RequiredArgsConstructor
public class JourneyController {
    private final JourneyService journeyService;
    private final LessonProgressService lessonProgressService;

    @GetMapping
    public ResponseEntity<List<JourneyListResponse>> getJourneys() {
        return ResponseEntity.ok(journeyService.getPublishedJourneys());
    }

    @GetMapping("/{journeyId}")
    public ResponseEntity<JourneyDetailResponse> getJourneyDetail(
            @PathVariable UUID journeyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getUser().getId() : null;
        return ResponseEntity.ok(journeyService.getJourneyDetail(journeyId, userId));
    }

    @GetMapping("/{journeyId}/progress")
    public ResponseEntity<JourneyProgressResponse> getJourneyProgress(
            @PathVariable UUID journeyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                lessonProgressService.getJourneyProgress(journeyId, principal.getUser().getId()));
    }
}
```

---

### Task 4.2: 建立 LessonController

**檔案:** `src/main/java/com/waterball/course/controller/LessonController.java`

```java
@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {
    private final LessonService lessonService;
    private final LessonProgressService lessonProgressService;

    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonDetailResponse> getLessonDetail(
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                lessonService.getLessonDetail(lessonId, principal.getUser().getId()));
    }

    @PutMapping("/{lessonId}/progress")
    public ResponseEntity<UpdateProgressResponse> updateProgress(
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProgressRequest request) {
        return ResponseEntity.ok(
                lessonProgressService.updateProgress(
                        lessonId, 
                        principal.getUser().getId(), 
                        request.getLastPositionSeconds()));
    }

    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<CompleteResponse> completeLesson(
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                lessonProgressService.completeLesson(lessonId, principal.getUser().getId()));
    }
}
```

---

### Task 4.3: 建立 VideoController

**檔案:** `src/main/java/com/waterball/course/controller/VideoController.java`

```java
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {
    private final VideoService videoService;

    @GetMapping("/{videoId}/stream")
    public ResponseEntity<VideoStreamResponse> getVideoStream(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                videoService.getVideoStream(videoId, principal.getUser().getId()));
    }
}
```

---

### Task 4.4: 更新 SecurityConfig

**檔案:** `src/main/java/com/waterball/course/config/SecurityConfig.java`

更新 authorizeHttpRequests 區塊：

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/google", "/api/auth/refresh").permitAll()
    .requestMatchers("/api/health/**").permitAll()
    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/journeys").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/journeys/{journeyId}").permitAll()
    .anyRequest().authenticated()
)
```

---

### Task 4.5: 建立 AccessDeniedException

**檔案:** `src/main/java/com/waterball/course/exception/AccessDeniedException.java`

```java
@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}
```

---

### Task 4.6: 更新 GlobalExceptionHandler

**檔案:** `src/main/java/com/waterball/course/exception/GlobalExceptionHandler.java`

新增處理 AccessDeniedException：

```java
@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
    ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.FORBIDDEN.value(),
            "Forbidden",
            ex.getMessage(),
            request.getRequestURI()
    );
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
}

@ExceptionHandler(EntityNotFoundException.class)
public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request) {
    ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            request.getRequestURI()
    );
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
}

@Getter
@AllArgsConstructor
public static class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
```

---

## Phase 5: Integration Tests

### Task 5.1: 建立 JourneyControllerTest

**檔案:** `src/test/java/com/waterball/course/controller/JourneyControllerTest.java`

**測試案例:**

- `getJourneys_shouldReturnPublishedJourneys`
- `getJourneys_shouldNotReturnUnpublishedJourneys`
- `getJourneyDetail_withValidId_shouldReturnJourney`
- `getJourneyDetail_withInvalidId_shouldReturn404`
- `getJourneyDetail_withUnpublishedJourney_shouldReturn404`
- `getJourneyDetail_withAuthenticatedUser_shouldReturnPurchaseStatus`
- `getJourneyDetail_withAuthenticatedUser_shouldReturnProgress`
- `getJourneyProgress_withValidId_shouldReturnProgress`
- `getJourneyProgress_withoutAuth_shouldReturn401`

---

### Task 5.2: 建立 LessonControllerTest

**檔案:** `src/test/java/com/waterball/course/controller/LessonControllerTest.java`

**測試案例:**

- `getLessonDetail_withPublicLesson_shouldReturn200`
- `getLessonDetail_withTrialLesson_shouldReturn200`
- `getLessonDetail_withPurchasedLesson_whenNotPurchased_shouldReturn403`
- `getLessonDetail_withPurchasedLesson_whenPurchased_shouldReturn200`
- `getLessonDetail_withInvalidId_shouldReturn404`
- `getLessonDetail_withoutAuth_shouldReturn401`
- `updateProgress_withValidRequest_shouldReturn200`
- `updateProgress_withNegativePosition_shouldReturn400`
- `updateProgress_withoutAuth_shouldReturn401`
- `completeLesson_withValidRequest_shouldReturn200`
- `completeLesson_withoutAuth_shouldReturn401`

---

### Task 5.3: 建立 VideoControllerTest

**檔案:** `src/test/java/com/waterball/course/controller/VideoControllerTest.java`

**測試案例:**

- `getVideoStream_withValidAccess_shouldReturnStreamUrl`
- `getVideoStream_withoutAccess_shouldReturn403`
- `getVideoStream_withInvalidId_shouldReturn404`
- `getVideoStream_withoutAuth_shouldReturn401`

---

### Task 5.4: 建立 AccessControlServiceTest

**檔案:** `src/test/java/com/waterball/course/service/AccessControlServiceTest.java`

**測試案例:**

- `canAccessLesson_withPublicLesson_shouldReturnTrue`
- `canAccessLesson_withTrialLesson_whenAuthenticated_shouldReturnTrue`
- `canAccessLesson_withTrialLesson_whenNotAuthenticated_shouldReturnFalse`
- `canAccessLesson_withPurchasedLesson_whenPurchased_shouldReturnTrue`
- `canAccessLesson_withPurchasedLesson_whenNotPurchased_shouldReturnFalse`
- `hasPurchasedJourney_whenPurchased_shouldReturnTrue`
- `hasPurchasedJourney_whenNotPurchased_shouldReturnFalse`

---

## Phase 6: E2E Tests

### Task 6.1: 建立 CourseE2ETest

**檔案:** `src/test/java/com/waterball/course/e2e/CourseE2ETest.java`

完整課程存取流程測試，包含以下場景：

**測試場景 6.1.1:** 未登入用戶瀏覽課程列表

```java
@Test
void anonymousUser_canBrowseJourneyList() {
    // GET /api/journeys - 不需驗證
    // 預期：200 OK，返回已發布課程列表
}
```

**測試場景 6.1.2:** 未登入用戶瀏覽課程詳情

```java
@Test
void anonymousUser_canBrowseJourneyDetail() {
    // GET /api/journeys/{id} - 不需驗證
    // 預期：200 OK，isPurchased = false，所有 isCompleted = false
}
```

**測試場景 6.1.3:** 登入用戶存取 PUBLIC 課程

```java
@Test
void authenticatedUser_canAccessPublicLesson() {
    // GET /api/lessons/{id} - PUBLIC lesson
    // 預期：200 OK
}
```

**測試場景 6.1.4:** 登入用戶存取 TRIAL 課程

```java
@Test
void authenticatedUser_canAccessTrialLesson() {
    // GET /api/lessons/{id} - TRIAL lesson
    // 預期：200 OK
}
```

**測試場景 6.1.5:** 登入用戶存取 PURCHASED 課程（未購買）

```java
@Test
void authenticatedUser_cannotAccessPurchasedLesson_whenNotPurchased() {
    // GET /api/lessons/{id} - PURCHASED lesson, user not purchased
    // 預期：403 Forbidden
}
```

**測試場景 6.1.6:** 已購買用戶存取 PURCHASED 課程

```java
@Test
void authenticatedUser_canAccessPurchasedLesson_whenPurchased() {
    // 先 INSERT user_purchases
    // GET /api/lessons/{id} - PURCHASED lesson
    // 預期：200 OK
}
```

**測試場景 6.1.7:** 學習進度更新與查詢

```java
@Test
void authenticatedUser_canUpdateAndQueryProgress() {
    // PUT /api/lessons/{id}/progress
    // GET /api/journeys/{id}/progress
    // 預期：進度正確更新並可查詢
}
```

**測試場景 6.1.8:** 課程完成標記

```java
@Test
void authenticatedUser_canMarkLessonComplete() {
    // POST /api/lessons/{id}/complete
    // 預期：isCompleted = true, completedAt 有值
}
```

---

## Checklist

### Phase 1: Database & Entity

- [ ] Task 1.1: Flyway Migration
- [ ] Task 1.2: LessonType Enum
- [ ] Task 1.3: AccessType Enum
- [ ] Task 1.4: Video Entity
- [ ] Task 1.5: Journey Entity
- [ ] Task 1.6: Chapter Entity
- [ ] Task 1.7: Lesson Entity
- [ ] Task 1.8: LessonProgress Entity
- [ ] Task 1.9: UserPurchase Entity
- [ ] Task 1.10: JourneyRepository
- [ ] Task 1.11: ChapterRepository
- [ ] Task 1.12: LessonRepository
- [ ] Task 1.13: LessonProgressRepository
- [ ] Task 1.14: UserPurchaseRepository
- [ ] Task 1.15: VideoRepository

### Phase 2: Service Layer

- [ ] Task 2.1: AccessControlService
- [ ] Task 2.2: JourneyService
- [ ] Task 2.3: LessonService
- [ ] Task 2.4: LessonProgressService
- [ ] Task 2.5: VideoService

### Phase 3: DTOs

- [ ] Task 3.1: UpdateProgressRequest
- [ ] Task 3.2: JourneyListResponse
- [ ] Task 3.3: JourneyDetailResponse
- [ ] Task 3.4: ChapterResponse
- [ ] Task 3.5: LessonSummaryResponse
- [ ] Task 3.6: LessonDetailResponse
- [ ] Task 3.7: InstructorResponse
- [ ] Task 3.8: ProgressResponse
- [ ] Task 3.9: LessonNavResponse
- [ ] Task 3.10: UpdateProgressResponse
- [ ] Task 3.11: CompleteResponse
- [ ] Task 3.12: JourneyProgressResponse
- [ ] Task 3.13: ChapterProgressResponse
- [ ] Task 3.14: VideoStreamResponse

### Phase 4: Controllers

- [ ] Task 4.1: JourneyController
- [ ] Task 4.2: LessonController
- [ ] Task 4.3: VideoController
- [ ] Task 4.4: SecurityConfig 更新
- [ ] Task 4.5: AccessDeniedException
- [ ] Task 4.6: GlobalExceptionHandler 更新

### Phase 5: Integration Tests

- [ ] Task 5.1: JourneyControllerTest
- [ ] Task 5.2: LessonControllerTest
- [ ] Task 5.3: VideoControllerTest
- [ ] Task 5.4: AccessControlServiceTest

### Phase 6: E2E Tests

- [ ] Task 6.1: CourseE2ETest (8 test scenarios)
