package com.waterball.course.service.payment;

import com.waterball.course.entity.CheckoutSession;
import com.waterball.course.entity.PurchaseOrder;
import com.waterball.course.entity.PurchaseStatus;
import com.waterball.course.entity.UserPurchase;
import com.waterball.course.exception.PurchaseOrderNotFoundException;
import com.waterball.course.repository.PurchaseOrderRepository;
import com.waterball.course.repository.UserPurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
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
        PurchaseOrder order = purchaseOrderRepository.findByCheckoutSessionId(sessionId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("Order not found for session: " + sessionId));

        if (result.success()) {
            order.setStatus(PurchaseStatus.COMPLETED);
            order.setCompletedAt(Instant.now());
            purchaseOrderRepository.save(order);

            UserPurchase userPurchase = new UserPurchase();
            userPurchase.setUser(order.getUser());
            userPurchase.setJourney(order.getJourney());
            userPurchaseRepository.save(userPurchase);
        } else {
            order.setStatus(PurchaseStatus.FAILED);
            order.setFailureReason(result.failureReason());
            purchaseOrderRepository.save(order);
        }
    }

    public boolean validateWebhookSecret(String secret) {
        return webhookSecret.equals(secret);
    }
}
