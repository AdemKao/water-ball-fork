package com.waterball.course.dto.gym;

import com.waterball.course.entity.GymType;

import java.util.List;
import java.util.UUID;

public record GymProgressResponse(
        int totalGyms,
        int completedGyms,
        int totalProblems,
        int completedProblems,
        int pendingReviews,
        List<GymProgressItemResponse> gyms
) {
    public record GymProgressItemResponse(
            UUID gymId,
            String gymTitle,
            GymType type,
            int problemCount,
            int completedCount,
            int pendingCount,
            int progressPercentage
    ) {}
}
