package com.waterball.course.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "checkout_sessions")
@Getter @Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class CheckoutSession {
    @Id
    private String id;

    @Column(name = "purchase_order_id", nullable = false)
    private UUID purchaseOrderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "TWD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckoutSessionStatus status = CheckoutSessionStatus.PENDING;

    @Column(name = "success_url", nullable = false, length = 500)
    private String successUrl;

    @Column(name = "cancel_url", nullable = false, length = 500)
    private String cancelUrl;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
