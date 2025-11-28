package com.waterball.course.controller;

import com.waterball.course.dto.request.PaymentWebhookRequest;
import com.waterball.course.dto.response.WebhookResponse;
import com.waterball.course.exception.InvalidWebhookSecretException;
import com.waterball.course.service.payment.PaymentResult;
import com.waterball.course.service.payment.PaymentWebhookService;
import com.waterball.course.util.LoggingConstants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static net.logstash.logback.argument.StructuredArguments.kv;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
@RequiredArgsConstructor
public class PaymentWebhookController {
    private final PaymentWebhookService webhookService;

    @PostMapping("/payment")
    public ResponseEntity<WebhookResponse> handlePaymentWebhook(
            @RequestHeader("X-Webhook-Secret") String secret,
            @Valid @RequestBody PaymentWebhookRequest request,
            HttpServletRequest httpRequest) {

        log.info("Webhook received",
            kv("event", LoggingConstants.WEBHOOK_RECEIVED),
            kv("sessionId", request.getSessionId()),
            kv("status", request.getStatus()));

        if (!webhookService.validateWebhookSecret(secret)) {
            log.error("Webhook validation failed",
                kv("event", LoggingConstants.WEBHOOK_VALIDATION_FAILED),
                kv("sessionId", request.getSessionId()),
                kv("remoteAddr", httpRequest.getRemoteAddr()));
            throw new InvalidWebhookSecretException("Invalid webhook secret");
        }

        PaymentResult result = "SUCCESS".equals(request.getStatus()) ?
                PaymentResult.successful() :
                PaymentResult.failed(request.getFailureReason());

        webhookService.handlePaymentResult(request.getSessionId(), result);

        return ResponseEntity.ok(WebhookResponse.success());
    }
}
