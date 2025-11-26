package com.waterball.course.service;

import com.waterball.course.controller.BaseIntegrationTest;
import com.waterball.course.dto.request.CreatePurchaseRequest;
import com.waterball.course.dto.response.PaymentResultResponse;
import com.waterball.course.dto.response.PurchaseOrderResponse;
import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.entity.PurchaseStatus;
import com.waterball.course.exception.*;
import com.waterball.course.repository.UserPurchaseRepository;
import com.waterball.course.service.payment.CreditCardDetails;
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

    @Autowired
    private UserPurchaseRepository userPurchaseRepository;

    @Nested
    @DisplayName("createPurchaseOrder")
    class CreatePurchaseOrder {

        @Test
        @DisplayName("should create order with valid request")
        void createPurchaseOrder_withValidRequest_shouldCreateOrder() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);

            PurchaseOrderResponse response = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            assertThat(response.getId()).isNotNull();
            assertThat(response.getJourneyId()).isEqualTo(PUBLISHED_JOURNEY_ID);
            assertThat(response.getStatus()).isEqualTo(PurchaseStatus.PENDING);
            assertThat(response.getPaymentMethod()).isEqualTo(PaymentMethod.CREDIT_CARD);
        }

        @Test
        @DisplayName("should return existing pending order")
        void createPurchaseOrder_withExistingPending_shouldReturnExisting() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);

            PurchaseOrderResponse first = purchaseService.createPurchaseOrder(TEST_USER_ID, request);
            PurchaseOrderResponse second = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            assertThat(second.getId()).isEqualTo(first.getId());
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
    @DisplayName("processPayment")
    class ProcessPayment {

        @Test
        @DisplayName("should create user purchase on success")
        void processPayment_withSuccess_shouldCreateUserPurchase() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            CreditCardDetails details = new CreditCardDetails(
                    "4111111111111234", "12", "2025", "123", "John Doe"
            );

            PaymentResultResponse result = purchaseService.processPayment(TEST_USER_ID, order.getId(), details);

            assertThat(result.getStatus()).isEqualTo(PurchaseStatus.COMPLETED);
            assertThat(userPurchaseRepository.existsByUserIdAndJourneyId(TEST_USER_ID, PUBLISHED_JOURNEY_ID)).isTrue();
        }

        @Test
        @DisplayName("should update order status on failure")
        void processPayment_withFailure_shouldUpdateOrderStatus() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            CreditCardDetails details = new CreditCardDetails(
                    "4111111111110000", "12", "2025", "123", "John Doe"
            );

            PaymentResultResponse result = purchaseService.processPayment(TEST_USER_ID, order.getId(), details);

            assertThat(result.getStatus()).isEqualTo(PurchaseStatus.FAILED);
            assertThat(result.getFailureReason()).isEqualTo("Insufficient funds");
            assertThat(userPurchaseRepository.existsByUserIdAndJourneyId(TEST_USER_ID, PUBLISHED_JOURNEY_ID)).isFalse();
        }

        @Test
        @DisplayName("should throw exception for access denied")
        void processPayment_withDifferentUser_shouldThrowException() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            CreditCardDetails details = new CreditCardDetails(
                    "4111111111111234", "12", "2025", "123", "John Doe"
            );

            assertThatThrownBy(() -> purchaseService.processPayment(OTHER_USER_ID, order.getId(), details))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("should throw exception for non-pending order")
        void processPayment_withNonPendingOrder_shouldThrowException() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);
            purchaseService.cancelPurchase(TEST_USER_ID, order.getId());

            CreditCardDetails details = new CreditCardDetails(
                    "4111111111111234", "12", "2025", "123", "John Doe"
            );

            assertThatThrownBy(() -> purchaseService.processPayment(TEST_USER_ID, order.getId(), details))
                    .isInstanceOf(InvalidOrderStatusException.class);
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
        @DisplayName("should throw exception for non-pending order")
        void cancelPurchase_withNonPending_shouldThrowException() {
            CreatePurchaseRequest request = new CreatePurchaseRequest();
            request.setJourneyId(PUBLISHED_JOURNEY_ID);
            request.setPaymentMethod(PaymentMethod.CREDIT_CARD);
            PurchaseOrderResponse order = purchaseService.createPurchaseOrder(TEST_USER_ID, request);

            CreditCardDetails details = new CreditCardDetails(
                    "4111111111111234", "12", "2025", "123", "John Doe"
            );
            purchaseService.processPayment(TEST_USER_ID, order.getId(), details);

            assertThatThrownBy(() -> purchaseService.cancelPurchase(TEST_USER_ID, order.getId()))
                    .isInstanceOf(InvalidOrderStatusException.class);
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
}
