package com.waterball.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentWebhookRequest {
    @NotBlank
    private String sessionId;

    @NotBlank
    private String status;

    private String failureReason;

    private Instant completedAt;
}
