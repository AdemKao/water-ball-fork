package com.waterball.course.service;

import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.entity.PurchaseOrder;
import com.waterball.course.entity.PurchaseStatus;
import com.waterball.course.service.payment.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class MockPaymentServiceTest {

    private MockPaymentService mockPaymentService;
    private PurchaseOrder order;

    @BeforeEach
    void setUp() {
        mockPaymentService = new MockPaymentService();
        order = new PurchaseOrder();
        order.setAmount(BigDecimal.valueOf(1999.00));
        order.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        order.setStatus(PurchaseStatus.PENDING);
    }

    @Nested
    @DisplayName("Credit Card Payment")
    class CreditCardPayment {

        @Test
        @DisplayName("should return success for valid credit card")
        void processPayment_withValidCreditCard_shouldReturnSuccess() {
            CreditCardDetails details = new CreditCardDetails(
                    "4111111111111234",
                    "12",
                    "2025",
                    "123",
                    "John Doe"
            );

            PaymentResult result = mockPaymentService.processPayment(order, details);

            assertThat(result.isSuccess()).isTrue();
            assertThat(result.failureReason()).isNull();
        }

        @Test
        @DisplayName("should return insufficient funds for card ending in 0000")
        void processPayment_withCardEndingIn0000_shouldReturnInsufficientFunds() {
            CreditCardDetails details = new CreditCardDetails(
                    "4111111111110000",
                    "12",
                    "2025",
                    "123",
                    "John Doe"
            );

            PaymentResult result = mockPaymentService.processPayment(order, details);

            assertThat(result.isSuccess()).isFalse();
            assertThat(result.failureReason()).isEqualTo("Insufficient funds");
        }

        @Test
        @DisplayName("should return card declined for card ending in 1111")
        void processPayment_withCardEndingIn1111_shouldReturnCardDeclined() {
            CreditCardDetails details = new CreditCardDetails(
                    "4111111111111111",
                    "12",
                    "2025",
                    "123",
                    "John Doe"
            );

            PaymentResult result = mockPaymentService.processPayment(order, details);

            assertThat(result.isSuccess()).isFalse();
            assertThat(result.failureReason()).isEqualTo("Card declined");
        }
    }

    @Nested
    @DisplayName("Bank Transfer Payment")
    class BankTransferPayment {

        @Test
        @DisplayName("should return success for valid bank transfer")
        void processPayment_withValidBankTransfer_shouldReturnSuccess() {
            BankTransferDetails details = new BankTransferDetails(
                    "1234567890",
                    "123"
            );

            PaymentResult result = mockPaymentService.processPayment(order, details);

            assertThat(result.isSuccess()).isTrue();
            assertThat(result.failureReason()).isNull();
        }

        @Test
        @DisplayName("should return invalid bank for bank code 999")
        void processPayment_withBankCode999_shouldReturnInvalidBank() {
            BankTransferDetails details = new BankTransferDetails(
                    "1234567890",
                    "999"
            );

            PaymentResult result = mockPaymentService.processPayment(order, details);

            assertThat(result.isSuccess()).isFalse();
            assertThat(result.failureReason()).isEqualTo("Invalid bank");
        }
    }
}
