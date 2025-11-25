package com.waterball.course.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProgressRequest {
    @Min(value = 0, message = "lastPositionSeconds must be >= 0")
    private int lastPositionSeconds;
}
