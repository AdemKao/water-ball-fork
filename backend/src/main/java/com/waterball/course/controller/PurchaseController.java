package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.request.CreatePurchaseRequest;
import com.waterball.course.dto.response.PurchaseOrderDetailResponse;
import com.waterball.course.dto.response.PurchaseOrderResponse;
import com.waterball.course.entity.PurchaseStatus;
import com.waterball.course.service.purchase.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {
    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> createPurchase(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePurchaseRequest request) {
        PurchaseOrderResponse response = purchaseService.createPurchaseOrder(
                principal.getUser().getId(), request);

        HttpStatus status = response.isResumed() ? HttpStatus.OK : HttpStatus.CREATED;

        return ResponseEntity.status(status).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<PurchaseOrderResponse>> getPurchaseHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) PurchaseStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PurchaseOrderResponse> purchases = purchaseService.getPurchaseHistory(
                principal.getUser().getId(), status, pageRequest);
        return ResponseEntity.ok(purchases);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PurchaseOrderResponse>> getPendingPurchases(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PurchaseOrderResponse> purchases = purchaseService.getPendingPurchases(
                principal.getUser().getId());
        return ResponseEntity.ok(purchases);
    }

    @GetMapping("/pending/journey/{journeyId}")
    public ResponseEntity<PurchaseOrderResponse> getPendingPurchaseByJourney(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID journeyId) {
        PurchaseOrderResponse response = purchaseService.getPendingPurchaseByJourney(
                principal.getUser().getId(), journeyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{purchaseId}")
    public ResponseEntity<PurchaseOrderDetailResponse> getPurchaseOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId) {
        PurchaseOrderDetailResponse response = purchaseService.getPurchaseOrder(
                principal.getUser().getId(), purchaseId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{purchaseId}")
    public ResponseEntity<Void> cancelPurchase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId) {
        purchaseService.cancelPurchase(principal.getUser().getId(), purchaseId);
        return ResponseEntity.noContent().build();
    }
}
