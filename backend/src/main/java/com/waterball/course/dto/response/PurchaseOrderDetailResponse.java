package com.waterball.course.dto.response;

import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.entity.PurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderDetailResponse {
    private UUID id;
    private UUID journeyId;
    private String journeyTitle;
    private String journeyThumbnailUrl;
    private String journeyDescription;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private PurchaseStatus status;
    private String checkoutUrl;
    private String failureReason;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant expiresAt;
    private Instant completedAt;
}
