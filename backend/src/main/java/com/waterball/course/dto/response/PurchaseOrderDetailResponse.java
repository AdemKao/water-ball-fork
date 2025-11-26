package com.waterball.course.dto.response;

import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.entity.PurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private PaymentMethod paymentMethod;
    private PurchaseStatus status;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
