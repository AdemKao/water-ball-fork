package com.waterball.course.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class CompleteResponse {
    private UUID lessonId;
    @JsonProperty("isCompleted")
    private boolean isCompleted;
    private LocalDateTime completedAt;
}
