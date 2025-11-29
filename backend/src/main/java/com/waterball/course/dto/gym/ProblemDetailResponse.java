package com.waterball.course.dto.gym;

import com.waterball.course.entity.PrerequisiteType;
import com.waterball.course.entity.ReviewStatus;
import com.waterball.course.entity.SubmissionStatus;
import com.waterball.course.entity.SubmissionType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ProblemDetailResponse(
        UUID id,
        UUID stageId,
        String stageTitle,
        UUID gymId,
        String gymTitle,
        String title,
        String description,
        int difficulty,
        List<SubmissionType> submissionTypes,
        List<HintResponse> hints,
        int expReward,
        boolean isUnlocked,
        List<PrerequisiteInfoResponse> prerequisites,
        SubmissionInfoResponse latestSubmission,
        ProblemNavResponse previousProblem,
        ProblemNavResponse nextProblem
) {
    public record HintResponse(int order, String content) {}

    public record SubmissionInfoResponse(
            UUID id,
            SubmissionStatus status,
            String fileUrl,
            String fileName,
            LocalDateTime submittedAt,
            int version,
            ReviewInfoResponse review
    ) {}

    public record ReviewInfoResponse(
            UUID id,
            String content,
            ReviewStatus status,
            LocalDateTime reviewedAt,
            String reviewerName
    ) {}

    public record ProblemNavResponse(UUID id, String title) {}

    public record PrerequisiteInfoResponse(
            PrerequisiteType type,
            UUID id,
            String title,
            boolean isCompleted
    ) {}
}
