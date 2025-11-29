package com.waterball.course.dto.gym;

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
public class GymDto {
    private Long id;
    private UUID journeyId;
    private String title;
    private String description;
    private String type;
    private Integer displayOrder;
    private Integer exerciseCount;
    private Integer completedCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
