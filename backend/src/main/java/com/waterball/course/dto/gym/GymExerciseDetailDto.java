package com.waterball.course.dto.gym;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
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
