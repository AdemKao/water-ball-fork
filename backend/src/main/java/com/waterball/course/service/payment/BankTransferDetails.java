package com.waterball.course.service.payment;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public final class BankTransferDetails implements PaymentDetails {
    private String accountNumber;
    private String bankCode;
}
