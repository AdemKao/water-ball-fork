package com.waterball.course.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterball.course.entity.PaymentMethod;
import com.waterball.course.entity.User;
import com.waterball.course.repository.UserRepository;
import com.waterball.course.service.auth.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/test-journey-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class PurchaseControllerTest extends BaseIntegrationTest {

    private static final UUID PUBLISHED_JOURNEY_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID UNPUBLISHED_JOURNEY_ID = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID OTHER_USER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID NON_EXISTENT_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String accessToken;
    private String otherUserToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findById(TEST_USER_ID).orElseThrow();
        accessToken = jwtService.generateAccessToken(testUser);
        User otherUser = userRepository.findById(OTHER_USER_ID).orElseThrow();
        otherUserToken = jwtService.generateAccessToken(otherUser);
    }

    @Nested
    @DisplayName("POST /api/purchases")
    class CreatePurchase {

        @Test
        @DisplayName("should create purchase with valid request and return 201")
        void createPurchase_withValidRequest_shouldReturn201() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("journeyId", PUBLISHED_JOURNEY_ID.toString());
            request.put("paymentMethod", "CREDIT_CARD");

            mockMvc.perform(post("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNotEmpty())
                    .andExpect(jsonPath("$.journeyId").value(PUBLISHED_JOURNEY_ID.toString()))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.paymentMethod").value("CREDIT_CARD"));
        }

        @Test
        @DisplayName("should return existing pending order with 200")
        void createPurchase_withExistingPendingOrder_shouldReturn200() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("journeyId", PUBLISHED_JOURNEY_ID.toString());
            request.put("paymentMethod", "CREDIT_CARD");

            mockMvc.perform(post("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());

            mockMvc.perform(post("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("should return 409 when already purchased")
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void createPurchase_withAlreadyPurchased_shouldReturn409() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("journeyId", PUBLISHED_JOURNEY_ID.toString());
            request.put("paymentMethod", "CREDIT_CARD");

            mockMvc.perform(post("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 404 with invalid journey")
        void createPurchase_withInvalidJourney_shouldReturn404() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("journeyId", NON_EXISTENT_ID.toString());
            request.put("paymentMethod", "CREDIT_CARD");

            mockMvc.perform(post("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 404 with unpublished journey")
        void createPurchase_withUnpublishedJourney_shouldReturn404() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("journeyId", UNPUBLISHED_JOURNEY_ID.toString());
            request.put("paymentMethod", "CREDIT_CARD");

            mockMvc.perform(post("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without authentication")
        void createPurchase_withoutAuth_shouldReturn401() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("journeyId", PUBLISHED_JOURNEY_ID.toString());
            request.put("paymentMethod", "CREDIT_CARD");

            mockMvc.perform(post("/api/purchases")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/purchases")
    class GetPurchaseHistory {

        @Test
        @DisplayName("should return paginated results")
        void getPurchaseHistory_shouldReturnPaginatedResults() throws Exception {
            createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            mockMvc.perform(get("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @DisplayName("should return filtered results by status")
        void getPurchaseHistory_withStatusFilter_shouldReturnFiltered() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);
            cancelPurchase(purchaseId);

            mockMvc.perform(get("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .param("status", "CANCELLED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].status").value("CANCELLED"));

            mockMvc.perform(get("/api/purchases")
                            .cookie(new Cookie("access_token", accessToken))
                            .param("status", "PENDING"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/purchases/pending")
    class GetPendingPurchases {

        @Test
        @DisplayName("should return pending orders")
        void getPendingPurchases_shouldReturnPendingOrders() throws Exception {
            createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            mockMvc.perform(get("/api/purchases/pending")
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].status").value("PENDING"));
        }
    }

    @Nested
    @DisplayName("GET /api/purchases/{purchaseId}")
    class GetPurchaseOrder {

        @Test
        @DisplayName("should return 200 with valid id")
        void getPurchaseOrder_withValidId_shouldReturn200() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(purchaseId))
                    .andExpect(jsonPath("$.journeyTitle").value("Published Journey"));
        }

        @Test
        @DisplayName("should return 403 with other user's order")
        void getPurchaseOrder_withOtherUserOrder_shouldReturn403() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(new Cookie("access_token", otherUserToken)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("should return 404 with invalid id")
        void getPurchaseOrder_withInvalidId_shouldReturn404() throws Exception {
            mockMvc.perform(get("/api/purchases/{purchaseId}", NON_EXISTENT_ID)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/purchases/{purchaseId}/pay")
    class ProcessPayment {

        @Test
        @DisplayName("should return 200 with successful credit card payment")
        void processPayment_withCreditCard_success_shouldReturn200() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("cardNumber", "4111111111111234");
            paymentRequest.put("expiryMonth", "12");
            paymentRequest.put("expiryYear", "2025");
            paymentRequest.put("cvv", "123");
            paymentRequest.put("cardholderName", "John Doe");

            mockMvc.perform(post("/api/purchases/{purchaseId}/pay", purchaseId)
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(paymentRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.purchaseId").value(purchaseId))
                    .andExpect(jsonPath("$.status").value("COMPLETED"))
                    .andExpect(jsonPath("$.message").value("Payment successful"));
        }

        @Test
        @DisplayName("should return failed status for declined card")
        void processPayment_withCreditCard_declined_shouldReturnFailed() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("cardNumber", "4111111111110000");
            paymentRequest.put("expiryMonth", "12");
            paymentRequest.put("expiryYear", "2025");
            paymentRequest.put("cvv", "123");
            paymentRequest.put("cardholderName", "John Doe");

            mockMvc.perform(post("/api/purchases/{purchaseId}/pay", purchaseId)
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(paymentRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("FAILED"))
                    .andExpect(jsonPath("$.failureReason").value("Insufficient funds"));
        }

        @Test
        @DisplayName("should return 200 with successful bank transfer")
        void processPayment_withBankTransfer_success_shouldReturn200() throws Exception {
            String purchaseId = createPurchaseOrderWithBankTransfer(PUBLISHED_JOURNEY_ID);

            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("accountNumber", "1234567890");
            paymentRequest.put("bankCode", "123");

            mockMvc.perform(post("/api/purchases/{purchaseId}/pay", purchaseId)
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(paymentRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("COMPLETED"));
        }

        @Test
        @DisplayName("should return 400 for non-pending order")
        void processPayment_withNonPendingOrder_shouldReturn400() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);
            cancelPurchase(purchaseId);

            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("cardNumber", "4111111111111234");
            paymentRequest.put("expiryMonth", "12");
            paymentRequest.put("expiryYear", "2025");
            paymentRequest.put("cvv", "123");
            paymentRequest.put("cardholderName", "John Doe");

            mockMvc.perform(post("/api/purchases/{purchaseId}/pay", purchaseId)
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(paymentRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 for invalid card number format")
        void processPayment_withInvalidCardNumber_shouldReturn400() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("cardNumber", "1234");
            paymentRequest.put("expiryMonth", "12");
            paymentRequest.put("expiryYear", "2025");
            paymentRequest.put("cvv", "123");
            paymentRequest.put("cardholderName", "John Doe");

            mockMvc.perform(post("/api/purchases/{purchaseId}/pay", purchaseId)
                            .cookie(new Cookie("access_token", accessToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(paymentRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/purchases/{purchaseId}")
    class CancelPurchase {

        @Test
        @DisplayName("should return 204 for pending order")
        void cancelPurchase_withPendingOrder_shouldReturn204() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            mockMvc.perform(delete("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(jsonPath("$.status").value("CANCELLED"));
        }

        @Test
        @DisplayName("should return 400 for completed order")
        void cancelPurchase_withCompletedOrder_shouldReturn400() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);
            completePayment(purchaseId);

            mockMvc.perform(delete("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(new Cookie("access_token", accessToken)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 403 for other user's order")
        void cancelPurchase_withOtherUserOrder_shouldReturn403() throws Exception {
            String purchaseId = createPurchaseOrder(PUBLISHED_JOURNEY_ID);

            mockMvc.perform(delete("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(new Cookie("access_token", otherUserToken)))
                    .andExpect(status().isForbidden());
        }
    }

    private String createPurchaseOrder(UUID journeyId) throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("journeyId", journeyId.toString());
        request.put("paymentMethod", "CREDIT_CARD");

        MvcResult result = mockMvc.perform(post("/api/purchases")
                        .cookie(new Cookie("access_token", accessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asText();
    }

    private String createPurchaseOrderWithBankTransfer(UUID journeyId) throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("journeyId", journeyId.toString());
        request.put("paymentMethod", "BANK_TRANSFER");

        MvcResult result = mockMvc.perform(post("/api/purchases")
                        .cookie(new Cookie("access_token", accessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asText();
    }

    private void cancelPurchase(String purchaseId) throws Exception {
        mockMvc.perform(delete("/api/purchases/{purchaseId}", purchaseId)
                        .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isNoContent());
    }

    private void completePayment(String purchaseId) throws Exception {
        Map<String, Object> paymentRequest = new HashMap<>();
        paymentRequest.put("cardNumber", "4111111111111234");
        paymentRequest.put("expiryMonth", "12");
        paymentRequest.put("expiryYear", "2025");
        paymentRequest.put("cvv", "123");
        paymentRequest.put("cardholderName", "John Doe");

        mockMvc.perform(post("/api/purchases/{purchaseId}/pay", purchaseId)
                        .cookie(new Cookie("access_token", accessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isOk());
    }
}
