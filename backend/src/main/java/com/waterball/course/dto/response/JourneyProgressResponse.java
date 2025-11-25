package com.waterball.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

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
