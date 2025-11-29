package com.waterballsa.backend.gym.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GymExerciseDetailDto {
    private Long id;
    private Long gymId;
    private String title;
    private String description;
    private String difficulty;
    private Integer displayOrder;
    private List<GymSubmissionDto> submissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
