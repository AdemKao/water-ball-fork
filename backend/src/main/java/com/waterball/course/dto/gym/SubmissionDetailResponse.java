package com.waterball.course.dto.gym;

import com.waterball.course.entity.ReviewStatus;
import com.waterball.course.entity.SubmissionStatus;
import com.waterball.course.entity.SubmissionType;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubmissionDetailResponse(
        UUID id,
        UUID problemId,
        String problemTitle,
        String stageTitle,
        String gymTitle,
        String fileUrl,
        String fileName,
        SubmissionType fileType,
        long fileSizeBytes,
        SubmissionStatus status,
        boolean isPublic,
        int version,
        LocalDateTime submittedAt,
        ReviewInfoResponse review
) {
    public record ReviewInfoResponse(
            UUID id,
            String content,
            ReviewStatus status,
            LocalDateTime reviewedAt,
            String reviewerName
    ) {}
}
