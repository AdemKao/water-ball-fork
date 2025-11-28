package com.waterball.course.service.payment;

public record PaymentResult(
    boolean success,
    String failureReason
) {
    public static PaymentResult successful() {
        return new PaymentResult(true, null);
    }

    public static PaymentResult failed(String reason) {
        return new PaymentResult(false, reason);
    }
}
