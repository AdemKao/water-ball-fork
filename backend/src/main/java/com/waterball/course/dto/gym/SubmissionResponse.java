package com.waterball.course.dto.gym;

import com.waterball.course.entity.SubmissionStatus;
import com.waterball.course.entity.SubmissionType;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubmissionResponse(
        UUID id,
        UUID problemId,
        String fileUrl,
        String fileName,
        SubmissionType fileType,
        SubmissionStatus status,
        boolean isPublic,
        int version,
        LocalDateTime submittedAt
) {}
