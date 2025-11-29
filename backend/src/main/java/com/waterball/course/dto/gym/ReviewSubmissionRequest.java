package com.waterball.course.dto.gym;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSubmissionRequest {
    @NotNull
    private String status;
    private String feedback;
}
