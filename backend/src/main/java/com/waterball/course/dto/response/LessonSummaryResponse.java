package com.waterball.course.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.waterball.course.entity.AccessType;
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
public class LessonSummaryResponse {
    private UUID id;
    private String title;
    private LessonType lessonType;
    private Integer durationSeconds;
    private AccessType accessType;
    @JsonProperty("isAccessible")
    private boolean isAccessible;
    @JsonProperty("isCompleted")
    private boolean isCompleted;
    private InstructorResponse instructor;
}
