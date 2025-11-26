package com.waterball.course.service.payment;

public record PaymentResult(
    boolean isSuccess,
    String failureReason
) {
    public static PaymentResult success() {
        return new PaymentResult(true, null);
    }

    public static PaymentResult failed(String reason) {
        return new PaymentResult(false, reason);
    }
}
