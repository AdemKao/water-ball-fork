package com.waterball.course.dto.request;

import com.waterball.course.entity.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCheckoutRequest {
    private UUID purchaseOrderId;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private String currency;
    private String successUrl;
    private String cancelUrl;
}
