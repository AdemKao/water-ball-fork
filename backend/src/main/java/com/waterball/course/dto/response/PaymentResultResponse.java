package com.waterball.course.dto.response;

import com.waterball.course.entity.PurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResultResponse {
    private UUID purchaseId;
    private PurchaseStatus status;
    private String message;
    private LocalDateTime completedAt;
    private String failureReason;

    public static PaymentResultResponse success(UUID purchaseId, LocalDateTime completedAt) {
        return PaymentResultResponse.builder()
                .purchaseId(purchaseId)
                .status(PurchaseStatus.COMPLETED)
                .message("Payment successful")
                .completedAt(completedAt)
                .build();
    }

    public static PaymentResultResponse failed(UUID purchaseId, String failureReason) {
        return PaymentResultResponse.builder()
                .purchaseId(purchaseId)
                .status(PurchaseStatus.FAILED)
                .message("Payment failed")
                .failureReason(failureReason)
                .build();
    }
}
