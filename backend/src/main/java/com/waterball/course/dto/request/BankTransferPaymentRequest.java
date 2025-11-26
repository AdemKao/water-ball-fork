package com.waterball.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankTransferPaymentRequest {
    @NotBlank(message = "Account number is required")
    @Pattern(regexp = "^\\d{10,14}$", message = "Account number must be 10-14 digits")
    private String accountNumber;

    @NotBlank(message = "Bank code is required")
    @Pattern(regexp = "^\\d{3}$", message = "Bank code must be 3 digits")
    private String bankCode;
}
