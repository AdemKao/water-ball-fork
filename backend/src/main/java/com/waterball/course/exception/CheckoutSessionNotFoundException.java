package com.waterball.course.exception;

public class CheckoutSessionNotFoundException extends RuntimeException {
    public CheckoutSessionNotFoundException(String message) {
        super(message);
    }
}
