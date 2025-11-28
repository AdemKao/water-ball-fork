package com.waterball.course.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressResponse {
    @JsonProperty("isCompleted")
    private boolean isCompleted;
    private int lastPositionSeconds;
    private LocalDateTime completedAt;
}
