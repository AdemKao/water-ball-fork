package com.waterball.course.dto.request;

import com.waterball.course.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseRequest {
    @NotNull(message = "Journey ID is required")
    private UUID journeyId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
