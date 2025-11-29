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
public class GymSubmissionDto {
    private Long id;
    private Long exerciseId;
    private UUID userId;
    private String userName;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String status;
    private String feedback;
    private UUID reviewedBy;
    private String reviewerName;
    private LocalDateTime reviewedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
