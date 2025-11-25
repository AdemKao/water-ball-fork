package com.waterball.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

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
