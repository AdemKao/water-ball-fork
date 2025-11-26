package com.waterball.course.dto.response;

import com.waterball.course.entity.LessonType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

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
