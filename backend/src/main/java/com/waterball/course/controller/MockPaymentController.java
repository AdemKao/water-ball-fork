package com.waterball.course.controller;

import com.waterball.course.entity.CheckoutSession;
import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.exception.CheckoutSessionNotFoundException;
import com.waterball.course.exception.SessionExpiredException;
import com.waterball.course.repository.CheckoutSessionRepository;
import com.waterball.course.service.payment.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Controller
@RequestMapping("/mock-payment")
@RequiredArgsConstructor
public class MockPaymentController {
    private final MockPaymentGatewayService gatewayService;
    private final CheckoutSessionRepository checkoutSessionRepository;

    @GetMapping("/checkout/{sessionId}")
    public String showCheckoutPage(@PathVariable String sessionId, Model model) {
        CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CheckoutSessionNotFoundException("Session not found"));

        if (session.isExpired()) {
            model.addAttribute("error", "Session expired");
            model.addAttribute("cancelUrl", session.getCancelUrl());
            return "mock-payment/expired";
        }

        model.addAttribute("session", session);
        model.addAttribute("isCreditCard", session.getPaymentMethod() == PaymentMethod.CREDIT_CARD);
        return "mock-payment/checkout";
    }

    @PostMapping("/checkout/{sessionId}/submit")
    public String processPayment(
            @PathVariable String sessionId,
            @RequestParam Map<String, String> formData) {

        CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CheckoutSessionNotFoundException("Session not found"));

        PaymentDetails details;
        if (session.getPaymentMethod() == PaymentMethod.CREDIT_CARD) {
            details = new CreditCardDetails(
                    formData.get("cardNumber"),
                    formData.get("expiryMonth"),
                    formData.get("expiryYear"),
                    formData.get("cvv"),
                    formData.get("cardholderName")
            );
        } else {
            details = new BankTransferDetails(
                    formData.get("accountNumber"),
                    formData.get("bankCode")
            );
        }

        try {
            PaymentResult result = gatewayService.processPayment(sessionId, details);

            if (result.success()) {
                return "redirect:" + session.getSuccessUrl();
            } else {
                String cancelUrl = session.getCancelUrl() +
                        (session.getCancelUrl().contains("?") ? "&" : "?") +
                        "error=" + URLEncoder.encode(result.failureReason(), StandardCharsets.UTF_8);
                return "redirect:" + cancelUrl;
            }
        } catch (SessionExpiredException e) {
            return "redirect:" + session.getCancelUrl() + "?error=session_expired";
        }
    }

    @GetMapping("/checkout/{sessionId}/cancel")
    public String cancelPayment(@PathVariable String sessionId) {
        CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CheckoutSessionNotFoundException("Session not found"));

        return "redirect:" + session.getCancelUrl();
    }
}
