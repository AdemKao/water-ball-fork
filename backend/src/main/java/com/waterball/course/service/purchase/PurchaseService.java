package com.waterball.course.service.purchase;

import com.waterball.course.dto.request.CreatePurchaseRequest;
import com.waterball.course.dto.response.PaymentResultResponse;
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
import com.waterball.course.service.payment.MockPaymentService;
import com.waterball.course.service.payment.PaymentDetails;
import com.waterball.course.service.payment.PaymentResult;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserPurchaseRepository userPurchaseRepository;
    private final JourneyRepository journeyRepository;
    private final UserRepository userRepository;
    private final MockPaymentService mockPaymentService;

    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(UUID userId, CreatePurchaseRequest request) {
        Journey journey = journeyRepository.findByIdAndIsPublishedTrue(request.getJourneyId())
                .orElseThrow(() -> new JourneyNotFoundException("Journey not found"));

        if (userPurchaseRepository.existsByUserIdAndJourneyId(userId, request.getJourneyId())) {
            throw new AlreadyPurchasedException("You have already purchased this course");
        }

        var existingPending = purchaseOrderRepository.findByUserIdAndJourneyIdAndStatus(
                userId, request.getJourneyId(), PurchaseStatus.PENDING);
        if (existingPending.isPresent()) {
            return toResponse(existingPending.get(), false);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        PurchaseOrder order = new PurchaseOrder();
        order.setUser(user);
        order.setJourney(journey);
        order.setAmount(journey.getPrice());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(PurchaseStatus.PENDING);

        order = purchaseOrderRepository.save(order);
        return toResponse(order, true);
    }

    @Transactional
    public PaymentResultResponse processPayment(UUID userId, UUID purchaseId, PaymentDetails paymentDetails) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("Purchase order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (order.getStatus() != PurchaseStatus.PENDING) {
            throw new InvalidOrderStatusException("Order is not in pending status");
        }

        PaymentResult result = mockPaymentService.processPayment(order, paymentDetails);

        if (result.isSuccess()) {
            order.setStatus(PurchaseStatus.COMPLETED);
            order.setCompletedAt(LocalDateTime.now());
            purchaseOrderRepository.save(order);

            UserPurchase userPurchase = new UserPurchase();
            userPurchase.setUser(order.getUser());
            userPurchase.setJourney(order.getJourney());
            userPurchaseRepository.save(userPurchase);

            return PaymentResultResponse.success(purchaseId, order.getCompletedAt());
        } else {
            order.setStatus(PurchaseStatus.FAILED);
            order.setFailureReason(result.failureReason());
            purchaseOrderRepository.save(order);

            return PaymentResultResponse.failed(purchaseId, result.failureReason());
        }
    }

    @Transactional
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
    }

    public PurchaseOrderDetailResponse getPurchaseOrder(UUID userId, UUID purchaseId) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("Purchase order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        return toDetailResponse(order);
    }

    public Page<PurchaseOrderResponse> getPurchaseHistory(UUID userId, PurchaseStatus status, Pageable pageable) {
        if (status != null) {
            return purchaseOrderRepository.findByUserIdAndStatus(userId, status, pageable)
                    .map(this::toResponse);
        }
        return purchaseOrderRepository.findByUserId(userId, pageable)
                .map(this::toResponse);
    }

    public List<PurchaseOrderResponse> getPendingPurchases(UUID userId) {
        return purchaseOrderRepository.findPendingByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder order) {
        return toResponse(order, false);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder order, boolean isNewOrder) {
        Journey journey = order.getJourney();
        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .journeyId(journey.getId())
                .journeyTitle(journey.getTitle())
                .journeyThumbnailUrl(journey.getThumbnailUrl())
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .failureReason(order.getFailureReason())
                .createdAt(order.getCreatedAt())
                .completedAt(order.getCompletedAt())
                .isNewOrder(isNewOrder)
                .build();
    }

    private PurchaseOrderDetailResponse toDetailResponse(PurchaseOrder order) {
        Journey journey = order.getJourney();
        return PurchaseOrderDetailResponse.builder()
                .id(order.getId())
                .journeyId(journey.getId())
                .journeyTitle(journey.getTitle())
                .journeyThumbnailUrl(journey.getThumbnailUrl())
                .journeyDescription(journey.getDescription())
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .failureReason(order.getFailureReason())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }
}
