package com.waterball.course.dto.gym;

import com.waterball.course.entity.PrerequisiteType;
import com.waterball.course.entity.SubmissionStatus;
import com.waterball.course.entity.SubmissionType;

import java.util.List;
import java.util.UUID;

public record StageDetailResponse(
        UUID id,
        UUID gymId,
        String gymTitle,
        String title,
        String description,
        int difficulty,
        List<ProblemSummaryResponse> problems,
        boolean isUnlocked,
        boolean isPurchased,
        List<PrerequisiteInfoResponse> prerequisites
) {
    public record ProblemSummaryResponse(
            UUID id,
            String title,
            int difficulty,
            List<SubmissionType> submissionTypes,
            boolean isCompleted,
            boolean isUnlocked,
            SubmissionStatus submissionStatus,
            List<PrerequisiteInfoResponse> prerequisites
    ) {}

    public record PrerequisiteInfoResponse(
            PrerequisiteType type,
            UUID id,
            String title,
            boolean isCompleted
    ) {}
}
