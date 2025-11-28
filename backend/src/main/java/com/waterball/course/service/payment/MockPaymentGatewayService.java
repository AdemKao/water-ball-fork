package com.waterball.course.service.payment;

import com.waterball.course.dto.request.CreateCheckoutRequest;
import com.waterball.course.entity.CheckoutSession;
import com.waterball.course.entity.CheckoutSessionStatus;
import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.exception.CheckoutSessionNotFoundException;
import com.waterball.course.exception.SessionExpiredException;
import com.waterball.course.repository.CheckoutSessionRepository;
import com.waterball.course.util.LoggingConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static net.logstash.logback.argument.StructuredArguments.kv;

@Service
@Slf4j
@RequiredArgsConstructor
public class MockPaymentGatewayService {
    private final CheckoutSessionRepository checkoutSessionRepository;
    private final PaymentWebhookService webhookService;

    @Value("${app.payment.checkout-expiration-minutes:60}")
    private int checkoutExpirationMinutes;

    @Value("${app.payment.mock-gateway.base-url:http://localhost:8080}")
    private String baseUrl;

    public CheckoutSession createCheckoutSession(CreateCheckoutRequest request) {
        CheckoutSession session = CheckoutSession.builder()
            .id(generateSessionId())
            .purchaseOrderId(request.getPurchaseOrderId())
            .paymentMethod(request.getPaymentMethod())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .successUrl(request.getSuccessUrl())
            .cancelUrl(request.getCancelUrl())
            .productName(request.getProductName())
            .status(CheckoutSessionStatus.PENDING)
            .expiresAt(Instant.now().plus(checkoutExpirationMinutes, ChronoUnit.MINUTES))
            .build();

        CheckoutSession saved = checkoutSessionRepository.save(session);

        log.info("Checkout session created",
            kv("event", LoggingConstants.CHECKOUT_SESSION_CREATED),
            kv("sessionId", saved.getId()),
            kv("orderId", request.getPurchaseOrderId()),
            kv("amount", request.getAmount()),
            kv("paymentMethod", request.getPaymentMethod()));

        return saved;
    }

    public String getCheckoutUrl(String sessionId) {
        return String.format("%s/mock-payment/checkout/%s", baseUrl, sessionId);
    }

    public Optional<CheckoutSession> getCheckoutSession(String sessionId) {
        return checkoutSessionRepository.findById(sessionId);
    }

    @Transactional
    public PaymentResult processPayment(String sessionId, PaymentDetails details) {
        log.info("Payment processing started",
            kv("event", LoggingConstants.PAYMENT_PROCESSING_STARTED),
            kv("sessionId", sessionId));

        CheckoutSession session = checkoutSessionRepository.findById(sessionId)
            .orElseThrow(() -> new CheckoutSessionNotFoundException("Session not found"));

        if (session.isExpired()) {
            session.setStatus(CheckoutSessionStatus.EXPIRED);
            checkoutSessionRepository.save(session);
            log.warn("Checkout session expired",
                kv("event", LoggingConstants.CHECKOUT_SESSION_EXPIRED),
                kv("sessionId", sessionId),
                kv("orderId", session.getPurchaseOrderId()));
            throw new SessionExpiredException("Session expired");
        }

        PaymentResult result = simulatePayment(session.getPaymentMethod(), details);

        session.setStatus(result.success() ?
            CheckoutSessionStatus.SUCCESS : CheckoutSessionStatus.FAILED);
        session.setCompletedAt(Instant.now());
        checkoutSessionRepository.save(session);

        if (result.success()) {
            log.info("Payment successful",
                kv("event", LoggingConstants.PAYMENT_SUCCESS),
                kv("sessionId", sessionId),
                kv("orderId", session.getPurchaseOrderId()),
                kv("amount", session.getAmount()));
        } else {
            log.warn("Payment failed",
                kv("event", LoggingConstants.PAYMENT_FAILED),
                kv("sessionId", sessionId),
                kv("orderId", session.getPurchaseOrderId()),
                kv("reason", result.failureReason()));
        }

        webhookService.sendPaymentNotification(session, result);

        return result;
    }

    private PaymentResult simulatePayment(PaymentMethod method, PaymentDetails details) {
        if (details instanceof CreditCardDetails card) {
            if (card.getCardNumber().endsWith("0000")) {
                return PaymentResult.failed("Insufficient funds");
            }
            if (card.getCardNumber().endsWith("1111")) {
                return PaymentResult.failed("Card declined");
            }
        }

        if (details instanceof BankTransferDetails bank) {
            if (bank.getBankCode().equals("999")) {
                return PaymentResult.failed("Invalid bank");
            }
        }

        return PaymentResult.successful();
    }

    private String generateSessionId() {
        return "cs_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
    }
}
