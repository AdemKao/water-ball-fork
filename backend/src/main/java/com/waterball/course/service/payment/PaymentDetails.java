package com.waterball.course.service.payment;

public sealed interface PaymentDetails permits CreditCardDetails, BankTransferDetails {
}
