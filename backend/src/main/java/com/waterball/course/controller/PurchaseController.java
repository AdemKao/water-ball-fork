package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.request.BankTransferPaymentRequest;
import com.waterball.course.dto.request.CreatePurchaseRequest;
import com.waterball.course.dto.request.CreditCardPaymentRequest;
import com.waterball.course.dto.response.PaymentResultResponse;
import com.waterball.course.dto.response.PurchaseOrderDetailResponse;
import com.waterball.course.dto.response.PurchaseOrderResponse;
import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.entity.PurchaseStatus;
import com.waterball.course.exception.PaymentValidationException;
import com.waterball.course.service.payment.BankTransferDetails;
import com.waterball.course.service.payment.CreditCardDetails;
import com.waterball.course.service.payment.PaymentDetails;
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
import java.util.Map;
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
        if (response.isNewOrder()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        return ResponseEntity.ok(response);
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

    @GetMapping("/{purchaseId}")
    public ResponseEntity<PurchaseOrderDetailResponse> getPurchaseOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId) {
        PurchaseOrderDetailResponse response = purchaseService.getPurchaseOrder(
                principal.getUser().getId(), purchaseId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{purchaseId}/pay")
    public ResponseEntity<PaymentResultResponse> processPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId,
            @RequestBody Map<String, Object> paymentRequest) {
        PurchaseOrderDetailResponse order = purchaseService.getPurchaseOrder(
                principal.getUser().getId(), purchaseId);
        
        PaymentDetails paymentDetails = parsePaymentDetails(order.getPaymentMethod(), paymentRequest);
        
        PaymentResultResponse response = purchaseService.processPayment(
                principal.getUser().getId(), purchaseId, paymentDetails);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{purchaseId}")
    public ResponseEntity<Void> cancelPurchase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId) {
        purchaseService.cancelPurchase(principal.getUser().getId(), purchaseId);
        return ResponseEntity.noContent().build();
    }

    private PaymentDetails parsePaymentDetails(PaymentMethod paymentMethod, Map<String, Object> request) {
        if (paymentMethod == PaymentMethod.CREDIT_CARD) {
            String cardNumber = getRequiredString(request, "cardNumber");
            String expiryMonth = getRequiredString(request, "expiryMonth");
            String expiryYear = getRequiredString(request, "expiryYear");
            String cvv = getRequiredString(request, "cvv");
            String cardholderName = getRequiredString(request, "cardholderName");

            validateCreditCard(cardNumber, expiryMonth, expiryYear, cvv, cardholderName);

            return new CreditCardDetails(cardNumber, expiryMonth, expiryYear, cvv, cardholderName);
        } else if (paymentMethod == PaymentMethod.BANK_TRANSFER) {
            String accountNumber = getRequiredString(request, "accountNumber");
            String bankCode = getRequiredString(request, "bankCode");

            validateBankTransfer(accountNumber, bankCode);

            return new BankTransferDetails(accountNumber, bankCode);
        }
        throw new PaymentValidationException("Invalid payment method");
    }

    private String getRequiredString(Map<String, Object> request, String field) {
        Object value = request.get(field);
        if (value == null || value.toString().isBlank()) {
            throw new PaymentValidationException(field + " is required");
        }
        return value.toString();
    }

    private void validateCreditCard(String cardNumber, String expiryMonth, String expiryYear, 
                                     String cvv, String cardholderName) {
        if (!cardNumber.matches("^\\d{16}$")) {
            throw new PaymentValidationException("Card number must be 16 digits");
        }
        if (!expiryMonth.matches("^(0[1-9]|1[0-2])$")) {
            throw new PaymentValidationException("Expiry month must be 01-12");
        }
        if (!expiryYear.matches("^\\d{4}$")) {
            throw new PaymentValidationException("Expiry year must be 4 digits");
        }
        if (!cvv.matches("^\\d{3,4}$")) {
            throw new PaymentValidationException("CVV must be 3-4 digits");
        }
        if (cardholderName.isBlank()) {
            throw new PaymentValidationException("Cardholder name is required");
        }
    }

    private void validateBankTransfer(String accountNumber, String bankCode) {
        if (!accountNumber.matches("^\\d{10,14}$")) {
            throw new PaymentValidationException("Account number must be 10-14 digits");
        }
        if (!bankCode.matches("^\\d{3}$")) {
            throw new PaymentValidationException("Bank code must be 3 digits");
        }
    }
}
