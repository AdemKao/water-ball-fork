package com.waterball.course.service;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.waterball.course.controller.BaseIntegrationTest;
import com.waterball.course.dto.request.CreatePurchaseRequest;
import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.service.payment.PaymentResult;
import com.waterball.course.service.payment.PaymentWebhookService;
import com.waterball.course.service.purchase.PurchaseService;
import com.waterball.course.util.LoggingConstants;
import net.logstash.logback.argument.StructuredArgument;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.jdbc.Sql;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class PurchaseLoggingTest extends BaseIntegrationTest {

    private static final UUID PUBLISHED_JOURNEY_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private PaymentWebhookService paymentWebhookService;

    private ListAppender<ILoggingEvent> purchaseServiceAppender;
    private ListAppender<ILoggingEvent> webhookServiceAppender;
    private Logger purchaseServiceLogger;
    private Logger webhookServiceLogger;

    @BeforeEach
    void setupLogCapture() {
        purchaseServiceLogger = (Logger) LoggerFactory.getLogger(PurchaseService.class);
        purchaseServiceLogger.setLevel(Level.DEBUG);
        purchaseServiceAppender = new ListAppender<>();
        purchaseServiceAppender.start();
        purchaseServiceLogger.addAppender(purchaseServiceAppender);

        webhookServiceLogger = (Logger) LoggerFactory.getLogger(PaymentWebhookService.class);
        webhookServiceLogger.setLevel(Level.DEBUG);
        webhookServiceAppender = new ListAppender<>();
        webhookServiceAppender.start();
        webhookServiceLogger.addAppender(webhookServiceAppender);
    }

    @AfterEach
    void teardownLogCapture() {
        purchaseServiceLogger.detachAppender(purchaseServiceAppender);
        webhookServiceLogger.detachAppender(webhookServiceAppender);
    }

    private List<ILoggingEvent> getLogsWithEventType(ListAppender<ILoggingEvent> appender, String eventType) {
        return appender.list.stream()
                .filter(event -> containsEventType(event, eventType))
                .collect(Collectors.toList());
    }

    private boolean containsEventType(ILoggingEvent event, String eventType) {
        Object[] args = event.getArgumentArray();
        if (args == null) {
            return false;
        }
        return Arrays.stream(args)
                .filter(arg -> arg instanceof StructuredArgument)
                .map(Object::toString)
                .anyMatch(s -> s.contains(eventType));
    }

    @Nested
    @DisplayName("Order Creation Logging")
    class OrderCreationLogging {

        @Test
        @DisplayName("should log PURCHASE_ORDER_CREATED event on order creation")
        void createOrder_shouldLogPurchaseOrderCreatedEvent() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);

            var response = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            List<ILoggingEvent> creationLogs = getLogsWithEventType(purchaseServiceAppender, LoggingConstants.PURCHASE_ORDER_CREATED);
            assertThat(creationLogs).hasSize(1);
            
            ILoggingEvent logEvent = creationLogs.get(0);
            assertThat(logEvent.getLevel()).isEqualTo(Level.INFO);
            assertThat(logEvent.getMessage()).contains("Purchase order created");
            
            String argsAsString = Arrays.toString(logEvent.getArgumentArray());
            assertThat(argsAsString).contains(response.getId().toString());
            assertThat(argsAsString).contains(TEST_USER_ID.toString());
            assertThat(argsAsString).contains(PUBLISHED_JOURNEY_ID.toString());
        }
    }

    @Nested
    @DisplayName("Order Cancellation Logging")
    class OrderCancellationLogging {

        @Test
        @DisplayName("should log PURCHASE_ORDER_CANCELLED event on cancellation")
        void cancelOrder_shouldLogPurchaseOrderCancelledEvent() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            var order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            purchaseService.cancelPurchase(TEST_USER_ID, order.getId());

            List<ILoggingEvent> cancellationLogs = getLogsWithEventType(purchaseServiceAppender, LoggingConstants.PURCHASE_ORDER_CANCELLED);
            assertThat(cancellationLogs).hasSize(1);
            
            ILoggingEvent logEvent = cancellationLogs.get(0);
            assertThat(logEvent.getLevel()).isEqualTo(Level.INFO);
            assertThat(logEvent.getMessage()).contains("Purchase order cancelled");
            
            String argsAsString = Arrays.toString(logEvent.getArgumentArray());
            assertThat(argsAsString).contains(order.getId().toString());
        }
    }

    @Nested
    @DisplayName("Webhook Processing Logging")
    class WebhookLogging {

        @Test
        @DisplayName("should log WEBHOOK_PROCESSED event on successful payment")
        void webhookPaymentSuccess_shouldLogWebhookProcessedEvent() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            var order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            var purchaseDetail = purchaseService.getPurchaseOrder(TEST_USER_ID, order.getId());
            String sessionId = extractSessionIdFromCheckoutUrl(purchaseDetail.getCheckoutUrl());

            paymentWebhookService.handlePaymentResult(sessionId, PaymentResult.successful());

            List<ILoggingEvent> webhookLogs = getLogsWithEventType(webhookServiceAppender, LoggingConstants.WEBHOOK_PROCESSED);
            assertThat(webhookLogs).hasSize(1);
            
            ILoggingEvent logEvent = webhookLogs.get(0);
            assertThat(logEvent.getLevel()).isEqualTo(Level.INFO);
            assertThat(logEvent.getMessage()).contains("Webhook processed");
            
            String argsAsString = Arrays.toString(logEvent.getArgumentArray());
            assertThat(argsAsString).contains(order.getId().toString());
            assertThat(argsAsString).contains("COMPLETED");
        }

        @Test
        @DisplayName("should log WEBHOOK_PROCESSED event on failed payment")
        void webhookPaymentFailure_shouldLogWebhookProcessedEvent() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            var order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            var purchaseDetail = purchaseService.getPurchaseOrder(TEST_USER_ID, order.getId());
            String sessionId = extractSessionIdFromCheckoutUrl(purchaseDetail.getCheckoutUrl());

            paymentWebhookService.handlePaymentResult(sessionId, PaymentResult.failed("Insufficient funds"));

            List<ILoggingEvent> webhookLogs = getLogsWithEventType(webhookServiceAppender, LoggingConstants.WEBHOOK_PROCESSED);
            assertThat(webhookLogs).hasSize(1);
            
            ILoggingEvent logEvent = webhookLogs.get(0);
            assertThat(logEvent.getLevel()).isEqualTo(Level.INFO);
            
            String argsAsString = Arrays.toString(logEvent.getArgumentArray());
            assertThat(argsAsString).contains("FAILED");
        }

        @Test
        @DisplayName("should log WEBHOOK_VALIDATION_FAILED event on invalid secret")
        void webhookInvalidSecret_shouldLogValidationFailedEvent() {
            paymentWebhookService.validateWebhookSecret("invalid-secret");

            List<ILoggingEvent> validationLogs = getLogsWithEventType(webhookServiceAppender, LoggingConstants.WEBHOOK_VALIDATION_FAILED);
            assertThat(validationLogs).hasSize(1);
            
            ILoggingEvent logEvent = validationLogs.get(0);
            assertThat(logEvent.getLevel()).isEqualTo(Level.ERROR);
            assertThat(logEvent.getMessage()).contains("Webhook validation failed");
        }
    }

    private String extractSessionIdFromCheckoutUrl(String checkoutUrl) {
        String[] parts = checkoutUrl.split("/checkout/");
        return parts[parts.length - 1];
    }
}
