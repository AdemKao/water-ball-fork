package com.waterball.course.dto.gym;

import com.waterball.course.entity.GymType;
import com.waterball.course.entity.PrerequisiteType;

import java.util.List;
import java.util.UUID;

public record GymDetailResponse(
        UUID id,
        UUID journeyId,
        String journeyTitle,
        String title,
        String description,
        String thumbnailUrl,
        GymType type,
        List<StageSummaryResponse> stages,
        boolean isPurchased,
        List<GymSummaryResponse> relatedGyms
) {
    public record StageSummaryResponse(
            UUID id,
            String title,
            String description,
            int difficulty,
            int problemCount,
            int completedCount,
            boolean isUnlocked,
            List<PrerequisiteInfoResponse> prerequisites
    ) {}

    public record GymSummaryResponse(
            UUID id,
            String title,
            GymType type
    ) {}

    public record PrerequisiteInfoResponse(
            PrerequisiteType type,
            UUID id,
            String title,
            boolean isCompleted
    ) {}
}
