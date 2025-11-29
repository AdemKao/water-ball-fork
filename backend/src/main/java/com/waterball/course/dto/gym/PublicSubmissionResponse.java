package com.waterball.course.dto.gym;

import com.waterball.course.entity.ReviewStatus;
import com.waterball.course.entity.SubmissionStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record PublicSubmissionResponse(
        UUID id,
        String userName,
        String userAvatarUrl,
        UUID problemId,
        String problemTitle,
        String gymTitle,
        String fileUrl,
        String fileName,
        SubmissionStatus status,
        LocalDateTime submittedAt,
        ReviewInfoResponse review
) {
    public record ReviewInfoResponse(
            String content,
            ReviewStatus status,
            LocalDateTime reviewedAt,
            String reviewerName
    ) {}
}
