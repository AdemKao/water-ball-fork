package com.waterball.course.controller;

import com.waterball.course.dto.request.PaymentWebhookRequest;
import com.waterball.course.dto.response.WebhookResponse;
import com.waterball.course.exception.InvalidWebhookSecretException;
import com.waterball.course.service.payment.PaymentResult;
import com.waterball.course.service.payment.PaymentWebhookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class PaymentWebhookController {
    private final PaymentWebhookService webhookService;

    @PostMapping("/payment")
    public ResponseEntity<WebhookResponse> handlePaymentWebhook(
            @RequestHeader("X-Webhook-Secret") String secret,
            @Valid @RequestBody PaymentWebhookRequest request) {

        if (!webhookService.validateWebhookSecret(secret)) {
            throw new InvalidWebhookSecretException("Invalid webhook secret");
        }

        PaymentResult result = "SUCCESS".equals(request.getStatus()) ?
                PaymentResult.successful() :
                PaymentResult.failed(request.getFailureReason());

        webhookService.handlePaymentResult(request.getSessionId(), result);

        return ResponseEntity.ok(WebhookResponse.success());
    }
}
