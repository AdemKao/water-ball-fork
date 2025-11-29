package com.waterballsa.backend.gym.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GymExerciseDto {
    private Long id;
    private Long gymId;
    private String title;
    private String description;
    private String difficulty;
    private Integer displayOrder;
    private boolean hasSubmission;
    private String latestSubmissionStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
