package com.waterball.course.dto.gym;

import com.waterball.course.entity.GymType;

import java.util.UUID;

public record GymListItemResponse(
        UUID id,
        UUID journeyId,
        String journeyTitle,
        String title,
        String description,
        String thumbnailUrl,
        GymType type,
        int stageCount,
        int problemCount,
        int completedCount,
        boolean isPurchased
) {}
