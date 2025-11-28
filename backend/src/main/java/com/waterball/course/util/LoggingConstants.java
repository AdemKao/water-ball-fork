package com.waterball.course.util;

public final class LoggingConstants {
    private LoggingConstants() {}
    
    public static final String PURCHASE_ORDER_CREATED = "PURCHASE_ORDER_CREATED";
    public static final String PURCHASE_ORDER_STATUS_CHANGED = "PURCHASE_ORDER_STATUS_CHANGED";
    public static final String PURCHASE_ORDER_CANCELLED = "PURCHASE_ORDER_CANCELLED";
    
    public static final String CHECKOUT_SESSION_CREATED = "CHECKOUT_SESSION_CREATED";
    public static final String CHECKOUT_SESSION_EXPIRED = "CHECKOUT_SESSION_EXPIRED";
    
    public static final String PAYMENT_PROCESSING_STARTED = "PAYMENT_PROCESSING_STARTED";
    public static final String PAYMENT_SUCCESS = "PAYMENT_SUCCESS";
    public static final String PAYMENT_FAILED = "PAYMENT_FAILED";
    
    public static final String WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED";
    public static final String WEBHOOK_VALIDATION_FAILED = "WEBHOOK_VALIDATION_FAILED";
    public static final String WEBHOOK_PROCESSED = "WEBHOOK_PROCESSED";
    public static final String WEBHOOK_PROCESSING_FAILED = "WEBHOOK_PROCESSING_FAILED";
    
    public static final String EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR";
    public static final String OPERATION_TIMEOUT = "OPERATION_TIMEOUT";
    public static final String DATA_INCONSISTENCY = "DATA_INCONSISTENCY";
}
