package com.waterball.course.exception;

public class InvalidWebhookSecretException extends RuntimeException {
    public InvalidWebhookSecretException(String message) {
        super(message);
    }
}
