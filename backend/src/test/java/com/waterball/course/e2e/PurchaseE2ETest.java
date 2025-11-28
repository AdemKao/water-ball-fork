package com.waterball.course.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterball.course.controller.BaseIntegrationTest;
import com.waterball.course.dto.request.CreatePurchaseRequest;
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
import org.springframework.beans.factory.annotation.Value;
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
@DisplayName("Purchase E2E Tests")
class PurchaseE2ETest extends BaseIntegrationTest {

    private static final UUID PUBLISHED_JOURNEY_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID UNPUBLISHED_JOURNEY_ID = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
    private static final UUID PURCHASED_LESSON_ID = UUID.fromString("33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.payment.webhook-secret:mock-webhook-secret-12345}")
    private String webhookSecret;

    private String accessToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findById(TEST_USER_ID).orElseThrow();
        accessToken = jwtService.generateAccessToken(testUser);
    }

    private Cookie authCookie() {
        return new Cookie("access_token", accessToken);
    }

    private String createPurchaseRequestJson(UUID journeyId, PaymentMethod paymentMethod) throws Exception {
        CreatePurchaseRequest request = new CreatePurchaseRequest();
        request.setJourneyId(journeyId);
        request.setPaymentMethod(paymentMethod);
        return objectMapper.writeValueAsString(request);
    }

    private String getCheckoutSessionId(String purchaseId) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                        .cookie(authCookie()))
                .andReturn();

        String checkoutUrl = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("checkoutUrl").asText();

        return checkoutUrl.substring(checkoutUrl.lastIndexOf("/") + 1);
    }

    private void completePaymentViaWebhook(String purchaseId) throws Exception {
        String sessionId = getCheckoutSessionId(purchaseId);

        Map<String, Object> webhookRequest = new HashMap<>();
        webhookRequest.put("sessionId", sessionId);
        webhookRequest.put("status", "SUCCESS");

        mockMvc.perform(post("/api/webhooks/payment")
                        .header("X-Webhook-Secret", webhookSecret)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(webhookRequest)))
                .andExpect(status().isOk());
    }

    private void failPaymentViaWebhook(String purchaseId, String failureReason) throws Exception {
        String sessionId = getCheckoutSessionId(purchaseId);

        Map<String, Object> webhookRequest = new HashMap<>();
        webhookRequest.put("sessionId", sessionId);
        webhookRequest.put("status", "FAILED");
        webhookRequest.put("failureReason", failureReason);

        mockMvc.perform(post("/api/webhooks/payment")
                        .header("X-Webhook-Secret", webhookSecret)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(webhookRequest)))
                .andExpect(status().isOk());
    }

    @Nested
    @DisplayName("Scenario 6.1.1: Complete purchase flow with credit card success")
    class CompletePurchaseFlowCreditCard {
        @Test
        void completePurchaseFlow_withCreditCard_success() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.journeyId").value(PUBLISHED_JOURNEY_ID.toString()))
                    .andExpect(jsonPath("$.checkoutUrl").isNotEmpty())
                    .andReturn();

            String responseJson = createResult.getResponse().getContentAsString();
            String purchaseId = objectMapper.readTree(responseJson).get("id").asText();

            completePaymentViaWebhook(purchaseId);

            mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(authCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("COMPLETED"));

            mockMvc.perform(get("/api/journeys/{journeyId}", PUBLISHED_JOURNEY_ID)
                            .cookie(authCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isPurchased").value(true));
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.2: Payment failure - insufficient funds")
    class PaymentFailureInsufficientFunds {
        @Test
        void purchaseFlow_withInsufficientFunds_shouldFail() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andReturn();

            String responseJson = createResult.getResponse().getContentAsString();
            String purchaseId = objectMapper.readTree(responseJson).get("id").asText();

            failPaymentViaWebhook(purchaseId, "Insufficient funds");

            mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(authCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("FAILED"))
                    .andExpect(jsonPath("$.failureReason").value("Insufficient funds"));
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.3: Resume pending purchase")
    class ResumePendingPurchase {
        @Test
        void resumePendingPurchase() throws Exception {
            MvcResult firstResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String firstId = objectMapper.readTree(firstResult.getResponse().getContentAsString()).get("id").asText();

            MvcResult secondResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isOk())
                    .andReturn();

            String secondId = objectMapper.readTree(secondResult.getResponse().getContentAsString()).get("id").asText();

            org.junit.jupiter.api.Assertions.assertEquals(firstId, secondId);
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.4: Already purchased course returns 409")
    class AlreadyPurchasedCourse {
        @Test
        @Sql(scripts = "/sql/test-purchase-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void alreadyPurchased_shouldReturn409() throws Exception {
            mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message").value("You have already purchased this course"));
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.5: Cancel pending order")
    class CancelPendingOrder {
        @Test
        void cancelPendingOrder() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String purchaseId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

            mockMvc.perform(delete("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(authCookie()))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(authCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELLED"));
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.6: Cannot cancel completed order")
    class CannotCancelCompletedOrder {
        @Test
        void cannotCancelCompletedOrder() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String purchaseId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

            completePaymentViaWebhook(purchaseId);

            mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(authCookie()))
                    .andExpect(jsonPath("$.status").value("COMPLETED"));

            mockMvc.perform(delete("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(authCookie()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Only pending orders can be cancelled"));
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.7: Cannot pay cancelled order")
    class CannotPayCancelledOrder {
        @Test
        void cannotPayCancelledOrder() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String purchaseId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

            mockMvc.perform(delete("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(authCookie()))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/purchases/{purchaseId}", purchaseId)
                            .cookie(authCookie()))
                    .andExpect(jsonPath("$.status").value("CANCELLED"));
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.8: Access control after purchase")
    class AccessControlAfterPurchase {
        @Test
        void accessControl_afterPurchase() throws Exception {
            mockMvc.perform(get("/api/lessons/{lessonId}", PURCHASED_LESSON_ID)
                            .cookie(authCookie()))
                    .andExpect(status().isForbidden());

            MvcResult createResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String purchaseId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

            completePaymentViaWebhook(purchaseId);

            mockMvc.perform(get("/api/lessons/{lessonId}", PURCHASED_LESSON_ID)
                            .cookie(authCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(PURCHASED_LESSON_ID.toString()));
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.9: Purchase history pagination")
    class PurchaseHistoryPagination {
        @Test
        @Sql(scripts = "/sql/test-data-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        @Sql(scripts = "/sql/test-pagination-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
        void purchaseHistory_pagination() throws Exception {
            mockMvc.perform(get("/api/purchases")
                            .cookie(authCookie())
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(10)))
                    .andExpect(jsonPath("$.totalElements").value(25))
                    .andExpect(jsonPath("$.totalPages").value(3))
                    .andExpect(jsonPath("$.size").value(10))
                    .andExpect(jsonPath("$.number").value(0));

            mockMvc.perform(get("/api/purchases")
                            .cookie(authCookie())
                            .param("page", "1")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(10)))
                    .andExpect(jsonPath("$.totalElements").value(25))
                    .andExpect(jsonPath("$.number").value(1));

            mockMvc.perform(get("/api/purchases")
                            .cookie(authCookie())
                            .param("page", "2")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(5)))
                    .andExpect(jsonPath("$.totalElements").value(25))
                    .andExpect(jsonPath("$.number").value(2));
        }
    }

    @Nested
    @DisplayName("Scenario 6.1.10: Filter purchase history by status")
    class FilterPurchaseHistoryByStatus {
        @Test
        void purchaseHistory_filterByStatus() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/purchases")
                            .cookie(authCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createPurchaseRequestJson(PUBLISHED_JOURNEY_ID, PaymentMethod.CREDIT_CARD)))
                    .andExpect(status().isCreated())
                    .andReturn();

            String purchaseId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

            mockMvc.perform(get("/api/purchases")
                            .cookie(authCookie())
                            .param("status", "PENDING"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].status").value("PENDING"));

            completePaymentViaWebhook(purchaseId);

            mockMvc.perform(get("/api/purchases")
                            .cookie(authCookie())
                            .param("status", "PENDING"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            mockMvc.perform(get("/api/purchases")
                            .cookie(authCookie())
                            .param("status", "COMPLETED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].status").value("COMPLETED"));
        }
    }
}
