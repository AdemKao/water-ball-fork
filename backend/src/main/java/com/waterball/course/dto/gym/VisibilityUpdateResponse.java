package com.waterball.course.dto.gym;

import java.time.LocalDateTime;
import java.util.UUID;

public record VisibilityUpdateResponse(
        UUID id,
        boolean isPublic,
        LocalDateTime updatedAt
) {}
