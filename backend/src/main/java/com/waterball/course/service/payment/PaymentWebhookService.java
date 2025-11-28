package com.waterball.course.service.payment;

import com.waterball.course.entity.CheckoutSession;
import com.waterball.course.entity.PurchaseOrder;
import com.waterball.course.entity.PurchaseStatus;
import com.waterball.course.entity.UserPurchase;
import com.waterball.course.exception.PurchaseOrderNotFoundException;
import com.waterball.course.repository.PurchaseOrderRepository;
import com.waterball.course.repository.UserPurchaseRepository;
import com.waterball.course.util.LoggingConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static net.logstash.logback.argument.StructuredArguments.kv;

import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentWebhookService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserPurchaseRepository userPurchaseRepository;

    @Value("${app.payment.webhook-secret:mock-webhook-secret-12345}")
    private String webhookSecret;

    public void sendPaymentNotification(CheckoutSession session, PaymentResult result) {
        handlePaymentResult(session.getId(), result);
    }

    @Transactional
    public void handlePaymentResult(String sessionId, PaymentResult result) {
        log.info("Handling payment result: sessionId={}, success={}", sessionId, result.success());
        
        PurchaseOrder order;
        try {
            order = purchaseOrderRepository.findByCheckoutSessionId(sessionId)
                    .orElseThrow(() -> new PurchaseOrderNotFoundException("Order not found for session: " + sessionId));
        } catch (PurchaseOrderNotFoundException e) {
            log.error("Webhook processing failed - order not found",
                kv("event", LoggingConstants.WEBHOOK_PROCESSING_FAILED),
                kv("sessionId", sessionId),
                kv("reason", "Order not found"));
            throw e;
        }

        log.debug("Found order: orderId={}, userId={}, journeyId={}", 
                order.getId(), order.getUser().getId(), order.getJourney().getId());

        if (result.success()) {
            order.setStatus(PurchaseStatus.COMPLETED);
            order.setCompletedAt(Instant.now());
            purchaseOrderRepository.save(order);

            UserPurchase userPurchase = new UserPurchase();
            userPurchase.setUser(order.getUser());
            userPurchase.setJourney(order.getJourney());
            userPurchaseRepository.save(userPurchase);
            
            log.info("Webhook processed successfully",
                kv("event", LoggingConstants.WEBHOOK_PROCESSED),
                kv("sessionId", sessionId),
                kv("orderId", order.getId()),
                kv("userId", order.getUser().getId()),
                kv("journeyId", order.getJourney().getId()),
                kv("status", "COMPLETED"));
        } else {
            order.setStatus(PurchaseStatus.FAILED);
            order.setFailureReason(result.failureReason());
            purchaseOrderRepository.save(order);
            
            log.info("Webhook processed - payment failed",
                kv("event", LoggingConstants.WEBHOOK_PROCESSED),
                kv("sessionId", sessionId),
                kv("orderId", order.getId()),
                kv("status", "FAILED"),
                kv("reason", result.failureReason()));
        }
    }

    public boolean validateWebhookSecret(String secret) {
        boolean valid = webhookSecret.equals(secret);
        if (!valid) {
            log.error("Webhook validation failed",
                kv("event", LoggingConstants.WEBHOOK_VALIDATION_FAILED),
                kv("reason", "Invalid secret"));
        }
        return valid;
    }
}
