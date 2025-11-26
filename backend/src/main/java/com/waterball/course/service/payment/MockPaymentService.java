package com.waterball.course.service.payment;

import com.waterball.course.entity.PurchaseOrder;
import org.springframework.stereotype.Service;

@Service
public class MockPaymentService {

    public PaymentResult processPayment(PurchaseOrder order, PaymentDetails details) {
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

        return PaymentResult.success();
    }
}
