package com.waterball.course.service;

import com.waterball.course.controller.BaseIntegrationTest;
import com.waterball.course.dto.request.CreatePurchaseRequest;
import com.waterball.course.dto.response.PurchaseOrderResponse;
import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.entity.PurchaseStatus;
import com.waterball.course.exception.*;
import com.waterball.course.service.purchase.PurchaseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.jdbc.Sql;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class PurchaseServiceTest extends BaseIntegrationTest {

    private static final UUID PUBLISHED_JOURNEY_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID OTHER_USER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID NON_EXISTENT_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");

    @Autowired
    private PurchaseService purchaseService;

    @Nested
    @DisplayName("createPurchaseOrder")
    class CreatePurchaseOrder {

        @Test
        @DisplayName("should create order with valid request and return checkout URL")
        void createPurchaseOrder_withValidRequest_shouldCreateOrderWithCheckoutUrl() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);

            PurchaseOrderResponse response = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            assertThat(response.getId()).isNotNull();
            assertThat(response.getJourneyId()).isEqualTo(PUBLISHED_JOURNEY_ID);
            assertThat(response.getStatus()).isEqualTo(PurchaseStatus.PENDING);
            assertThat(response.getPaymentMethod()).isEqualTo(PaymentMethod.CREDIT_CARD);
            assertThat(response.getCheckoutUrl()).isNotNull();
            assertThat(response.getCheckoutUrl()).contains("/mock-payment/checkout/");
            assertThat(response.getExpiresAt()).isNotNull();
        }

        @Test
        @DisplayName("should return existing pending order with same checkout URL")
        void createPurchaseOrder_withExistingPending_shouldReturnExisting() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);

            PurchaseOrderResponse first = purchaseService.createPurchaseOrder(TEST_USER_ID, request);
            PurchaseOrderResponse second = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            assertThat(second.getId()).isEqualTo(first.getId());
            assertThat(second.getCheckoutUrl()).isEqualTo(first.getCheckoutUrl());
        }

        @Test
        @DisplayName("should throw exception when already purchased")
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void createPurchaseOrder_withAlreadyPurchased_shouldThrowException() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);

            assertThatThrownBy(() -> purchaseService.createPurchaseOrder(TEST_USER_ID, request))
                    .isInstanceOf(AlreadyPurchasedException.class);
        }

        @Test
        @DisplayName("should throw exception for invalid journey")
        void createPurchaseOrder_withInvalidJourney_shouldThrowException() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(NON_EXISTENT_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);

            assertThatThrownBy(() -> purchaseService.createPurchaseOrder(TEST_USER_ID, request))
                    .isInstanceOf(JourneyNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("cancelPurchase")
    class CancelPurchase {

        @Test
        @DisplayName("should update status to cancelled")
        void cancelPurchase_withPending_shouldUpdateStatus() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            purchaseService.cancelPurchase(TEST_USER_ID, order.getId());

            var detail = purchaseService.getPurchaseOrder(TEST_USER_ID, order.getId());
            assertThat(detail.getStatus()).isEqualTo(PurchaseStatus.CANCELLED);
        }

        @Test
        @DisplayName("should throw exception for access denied")
        void cancelPurchase_withDifferentUser_shouldThrowException() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            assertThatThrownBy(() -> purchaseService.cancelPurchase(OTHER_USER_ID, order.getId()))
                    .isInstanceOf(AccessDeniedException.class);
        }
    }

    @Nested
    @DisplayName("getPurchaseOrder")
    class GetPurchaseOrder {

        @Test
        @DisplayName("should return order with checkout URL for pending status")
        void getPurchaseOrder_withPending_shouldReturnWithCheckoutUrl() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            var detail = purchaseService.getPurchaseOrder(TEST_USER_ID, order.getId());

            assertThat(detail.getCheckoutUrl()).isNotNull();
            assertThat(detail.getCheckoutUrl()).contains("/mock-payment/checkout/");
        }

        @Test
        @DisplayName("should throw exception for access denied")
        void getPurchaseOrder_withDifferentUser_shouldThrowException() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            assertThatThrownBy(() -> purchaseService.getPurchaseOrder(OTHER_USER_ID, order.getId()))
                    .isInstanceOf(AccessDeniedException.class);
        }
    }

    @Nested
    @DisplayName("getPendingPurchases")
    class GetPendingPurchases {

        @Test
        @DisplayName("should return pending orders with checkout URLs")
        void getPendingPurchases_shouldReturnWithCheckoutUrls() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            var pendingOrders = purchaseService.getPendingPurchases(TEST_USER_ID);

            assertThat(pendingOrders).hasSize(1);
            assertThat(pendingOrders.get(0).getCheckoutUrl()).isNotNull();
        }
    }

    @Nested
    @DisplayName("getPendingPurchaseByJourney")
    class GetPendingPurchaseByJourney {

        @Test
        @DisplayName("should return pending order for journey")
        void getPendingPurchaseByJourney_withPending_shouldReturn() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            var order = purchaseService.getPendingPurchaseByJourney(TEST_USER_ID, PUBLISHED_JOURNEY_ID);

            assertThat(order.getJourneyId()).isEqualTo(PUBLISHED_JOURNEY_ID);
            assertThat(order.getCheckoutUrl()).isNotNull();
        }

        @Test
        @DisplayName("should throw exception when no pending order")
        void getPendingPurchaseByJourney_withNoPending_shouldThrowException() {
            assertThatThrownBy(() -> purchaseService.getPendingPurchaseByJourney(TEST_USER_ID, PUBLISHED_JOURNEY_ID))
                    .isInstanceOf(PurchaseOrderNotFoundException.class);
        }
    }
}
