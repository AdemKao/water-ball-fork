package com.waterball.course.dto.response;

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
public class ChapterProgressResponse {
    private UUID chapterId;
    private String title;
    private int totalLessons;
    private int completedLessons;
    private boolean isCompleted;
}
