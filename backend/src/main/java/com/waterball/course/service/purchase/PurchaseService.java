package com.waterball.course.service.purchase;

import com.waterball.course.dto.request.CreateCheckoutRequest;
import com.waterball.course.dto.request.CreatePurchaseRequest;
import com.waterball.course.dto.response.PurchaseOrderDetailResponse;
import com.waterball.course.dto.response.PurchaseOrderResponse;
import com.waterball.course.entity.*;
import com.waterball.course.exception.AccessDeniedException;
import com.waterball.course.exception.AlreadyPurchasedException;
import com.waterball.course.exception.InvalidOrderStatusException;
import com.waterball.course.exception.JourneyNotFoundException;
import com.waterball.course.exception.PurchaseOrderNotFoundException;
import com.waterball.course.repository.JourneyRepository;
import com.waterball.course.repository.PurchaseOrderRepository;
import com.waterball.course.repository.UserPurchaseRepository;
import com.waterball.course.repository.UserRepository;
import com.waterball.course.service.payment.MockPaymentGatewayService;
import com.waterball.course.util.LoggingConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static net.logstash.logback.argument.StructuredArguments.kv;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class PurchaseService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final JourneyRepository journeyRepository;
    private final UserPurchaseRepository userPurchaseRepository;
    private final UserRepository userRepository;
    private final MockPaymentGatewayService mockPaymentGatewayService;

    @Value("${app.payment.checkout-expiration-minutes:60}")
    private int checkoutExpirationMinutes;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public PurchaseOrderResponse createPurchaseOrder(UUID userId, CreatePurchaseRequest request) {
        Journey journey = journeyRepository.findByIdAndIsPublishedTrue(request.getJourneyId())
                .orElseThrow(() -> new JourneyNotFoundException("Journey not found"));

        if (userPurchaseRepository.existsByUserIdAndJourneyId(userId, journey.getId())) {
            throw new AlreadyPurchasedException("You have already purchased this course");
        }

        Optional<PurchaseOrder> existingPending = purchaseOrderRepository
                .findPendingByUserIdAndJourneyId(userId, journey.getId());

        if (existingPending.isPresent()) {
            PurchaseOrder existing = existingPending.get();
            if (existing.getExpiresAt() != null && existing.getExpiresAt().isAfter(Instant.now())) {
                String checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(existing.getCheckoutSessionId());
                return toResponseWithCheckoutUrl(existing, checkoutUrl, true);
            }
            existing.setStatus(PurchaseStatus.EXPIRED);
            purchaseOrderRepository.save(existing);
            log.warn("Purchase order expired",
                kv("event", LoggingConstants.PURCHASE_ORDER_STATUS_CHANGED),
                kv("orderId", existing.getId()),
                kv("userId", userId),
                kv("journeyId", journey.getId()),
                kv("oldStatus", PurchaseStatus.PENDING),
                kv("newStatus", PurchaseStatus.EXPIRED));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("User not found"));

        PurchaseOrder order = new PurchaseOrder();
        order.setUser(user);
        order.setJourney(journey);
        order.setAmount(journey.getPrice());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(PurchaseStatus.PENDING);
        order.setExpiresAt(Instant.now().plus(checkoutExpirationMinutes, ChronoUnit.MINUTES));

        purchaseOrderRepository.save(order);

        CreateCheckoutRequest checkoutRequest = CreateCheckoutRequest.builder()
                .purchaseOrderId(order.getId())
                .paymentMethod(request.getPaymentMethod())
                .amount(journey.getPrice())
                .currency("TWD")
                .successUrl(frontendBaseUrl + "/courses/" + journey.getId() + "/purchase/callback?status=success&purchaseId=" + order.getId())
                .cancelUrl(frontendBaseUrl + "/courses/" + journey.getId() + "/purchase/callback?status=cancel&purchaseId=" + order.getId())
                .productName(journey.getTitle())
                .build();

        CheckoutSession session = mockPaymentGatewayService.createCheckoutSession(checkoutRequest);

        order.setCheckoutSessionId(session.getId());
        purchaseOrderRepository.save(order);

        MDC.put("orderId", order.getId().toString());
        log.info("Purchase order created",
            kv("event", LoggingConstants.PURCHASE_ORDER_CREATED),
            kv("orderId", order.getId()),
            kv("userId", userId),
            kv("journeyId", journey.getId()),
            kv("amount", journey.getPrice()),
            kv("paymentMethod", request.getPaymentMethod()));

        String checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(session.getId());
        return toResponseWithCheckoutUrl(order, checkoutUrl);
    }

    public void cancelPurchase(UUID userId, UUID purchaseId) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("Purchase order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (order.getStatus() != PurchaseStatus.PENDING) {
            throw new InvalidOrderStatusException("Only pending orders can be cancelled");
        }

        order.setStatus(PurchaseStatus.CANCELLED);
        purchaseOrderRepository.save(order);

        log.info("Purchase order cancelled",
            kv("event", LoggingConstants.PURCHASE_ORDER_CANCELLED),
            kv("orderId", purchaseId),
            kv("userId", userId),
            kv("journeyId", order.getJourney().getId()));
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDetailResponse getPurchaseOrder(UUID userId, UUID purchaseId) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("Purchase order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        String checkoutUrl = null;
        if (order.getStatus() == PurchaseStatus.PENDING && order.getCheckoutSessionId() != null) {
            checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(order.getCheckoutSessionId());
        }

        return toDetailResponse(order, checkoutUrl);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getPurchaseHistory(UUID userId, PurchaseStatus status, Pageable pageable) {
        Page<PurchaseOrder> orders = status != null
                ? purchaseOrderRepository.findByUserIdAndStatus(userId, status, pageable)
                : purchaseOrderRepository.findByUserId(userId, pageable);

        return orders.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPendingPurchases(UUID userId) {
        return purchaseOrderRepository.findPendingByUserId(userId).stream()
                .map(order -> {
                    String checkoutUrl = null;
                    if (order.getCheckoutSessionId() != null) {
                        checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(order.getCheckoutSessionId());
                    }
                    return toResponseWithCheckoutUrl(order, checkoutUrl);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPendingPurchaseByJourney(UUID userId, UUID journeyId) {
        PurchaseOrder order = purchaseOrderRepository.findPendingByUserIdAndJourneyId(userId, journeyId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("No pending order for this journey"));

        String checkoutUrl = null;
        if (order.getCheckoutSessionId() != null) {
            checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(order.getCheckoutSessionId());
        }
        return toResponseWithCheckoutUrl(order, checkoutUrl);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder order) {
        return toResponseWithCheckoutUrl(order, null);
    }

    private PurchaseOrderResponse toResponseWithCheckoutUrl(PurchaseOrder order, String checkoutUrl) {
        return toResponseWithCheckoutUrl(order, checkoutUrl, false);
    }

    private PurchaseOrderResponse toResponseWithCheckoutUrl(PurchaseOrder order, String checkoutUrl, boolean resumed) {
        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .journeyId(order.getJourney().getId())
                .journeyTitle(order.getJourney().getTitle())
                .journeyThumbnailUrl(order.getJourney().getThumbnailUrl())
                .amount(order.getAmount())
                .currency("TWD")
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .checkoutUrl(checkoutUrl)
                .failureReason(order.getFailureReason())
                .resumed(resumed)
                .expiresAt(order.getExpiresAt())
                .createdAt(order.getCreatedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }

    private PurchaseOrderDetailResponse toDetailResponse(PurchaseOrder order, String checkoutUrl) {
        return PurchaseOrderDetailResponse.builder()
                .id(order.getId())
                .journeyId(order.getJourney().getId())
                .journeyTitle(order.getJourney().getTitle())
                .journeyThumbnailUrl(order.getJourney().getThumbnailUrl())
                .journeyDescription(order.getJourney().getDescription())
                .amount(order.getAmount())
                .currency("TWD")
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .checkoutUrl(checkoutUrl)
                .failureReason(order.getFailureReason())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .expiresAt(order.getExpiresAt())
                .completedAt(order.getCompletedAt())
                .build();
    }
}
