# Backend Implementation Tasks: Course Purchase Flow

## Phase 1: Database & Entity

### Task 1.1: 建立 Flyway Migration - Purchase Orders Table

**檔案:** `src/main/resources/db/migration/V20251127000001__create_purchase_orders_table.sql`

```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    checkout_session_id VARCHAR(255),
    failure_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_journey_id ON purchase_orders(journey_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_user_status ON purchase_orders(user_id, status);
CREATE INDEX idx_purchase_orders_checkout_session ON purchase_orders(checkout_session_id);
```

**驗收條件:**

- [ ] Migration 執行成功
- [ ] 所有 index 建立正確
- [ ] checkout_session_id 和 expires_at 欄位存在

---

### Task 1.2: 建立 Flyway Migration - Checkout Sessions Table

**檔案:** `src/main/resources/db/migration/V20251127000002__create_checkout_sessions_table.sql`

```sql
CREATE TABLE checkout_sessions (
    id VARCHAR(255) PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'TWD',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    success_url VARCHAR(500) NOT NULL,
    cancel_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP
);

CREATE INDEX idx_checkout_sessions_purchase_order ON checkout_sessions(purchase_order_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);
```

**驗收條件:**

- [ ] Migration 執行成功
- [ ] checkout_sessions 表格建立成功

---

### Task 1.3: 建立 Flyway Migration - Add Price to Journeys

**檔案:** `src/main/resources/db/migration/V20251127000003__add_price_to_journeys.sql`

```sql
ALTER TABLE journeys ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
```

**驗收條件:**

- [ ] journeys 表格新增 price 欄位

---

### Task 1.4: 建立 PurchaseStatus Enum

**檔案:** `src/main/java/com/waterball/course/entity/PurchaseStatus.java`

```java
package com.waterball.course.entity;

public enum PurchaseStatus {
    PENDING,
    COMPLETED,
    FAILED,
    CANCELLED,
    EXPIRED
}
```

**驗收條件:**

- [ ] Enum 包含五種狀態 (含 EXPIRED)

---

### Task 1.5: 建立 PaymentMethod Enum

**檔案:** `src/main/java/com/waterball/course/entity/PaymentMethod.java`

```java
package com.waterball.course.entity;

public enum PaymentMethod {
    CREDIT_CARD,
    BANK_TRANSFER
}
```

**驗收條件:**

- [ ] Enum 包含兩種付款方式

---

### Task 1.6: 建立 CheckoutSessionStatus Enum

**檔案:** `src/main/java/com/waterball/course/entity/CheckoutSessionStatus.java`

```java
package com.waterball.course.entity;

public enum CheckoutSessionStatus {
    PENDING,
    SUCCESS,
    FAILED,
    EXPIRED
}
```

**驗收條件:**

- [ ] Enum 包含四種狀態

---

### Task 1.7: 建立 PurchaseOrder Entity

**檔案:** `src/main/java/com/waterball/course/entity/PurchaseOrder.java`

```java
@Entity
@Table(name = "purchase_orders")
@Getter @Setter
@NoArgsConstructor
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journey_id", nullable = false)
    private Journey journey;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseStatus status = PurchaseStatus.PENDING;

    @Column(name = "checkout_session_id")
    private String checkoutSessionId;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

**驗收條件:**

- [ ] Entity 與 database schema 對應正確
- [ ] 包含 checkoutSessionId 和 expiresAt 欄位
- [ ] 時間戳記自動更新

---

### Task 1.8: 建立 CheckoutSession Entity

**檔案:** `src/main/java/com/waterball/course/entity/CheckoutSession.java`

```java
@Entity
@Table(name = "checkout_sessions")
@Getter @Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class CheckoutSession {
    @Id
    private String id;

    @Column(name = "purchase_order_id", nullable = false)
    private UUID purchaseOrderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "TWD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckoutSessionStatus status = CheckoutSessionStatus.PENDING;

    @Column(name = "success_url", nullable = false)
    private String successUrl;

    @Column(name = "cancel_url", nullable = false)
    private String cancelUrl;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
```

**驗收條件:**

- [ ] Entity 與 database schema 對應正確
- [ ] 包含 isExpired() 方法
- [ ] 包含 successUrl 和 cancelUrl 欄位

---

### Task 1.9: 更新 Journey Entity - 新增 price 欄位

**檔案:** `src/main/java/com/waterball/course/entity/Journey.java`

新增：

```java
@Column(nullable = false, precision = 10, scale = 2)
private BigDecimal price = BigDecimal.ZERO;
```

**驗收條件:**

- [ ] Journey entity 包含 price 欄位
- [ ] 預設值為 0

---

### Task 1.10: 建立 PurchaseOrderRepository

**檔案:** `src/main/java/com/waterball/course/repository/PurchaseOrderRepository.java`

```java
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {
    
    Optional<PurchaseOrder> findByUserIdAndJourneyIdAndStatus(UUID userId, UUID journeyId, PurchaseStatus status);
    
    Optional<PurchaseOrder> findByCheckoutSessionId(String checkoutSessionId);
    
    List<PurchaseOrder> findByUserIdAndStatus(UUID userId, PurchaseStatus status);
    
    Page<PurchaseOrder> findByUserId(UUID userId, Pageable pageable);
    
    Page<PurchaseOrder> findByUserIdAndStatus(UUID userId, PurchaseStatus status, Pageable pageable);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.user.id = :userId AND po.status = 'PENDING'")
    List<PurchaseOrder> findPendingByUserId(@Param("userId") UUID userId);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.user.id = :userId AND po.journey.id = :journeyId AND po.status = 'PENDING'")
    Optional<PurchaseOrder> findPendingByUserIdAndJourneyId(@Param("userId") UUID userId, @Param("journeyId") UUID journeyId);
}
```

**驗收條件:**

- [ ] 所有查詢方法實作完成
- [ ] 包含 findByCheckoutSessionId 方法
- [ ] 分頁功能正確

---

### Task 1.11: 建立 CheckoutSessionRepository

**檔案:** `src/main/java/com/waterball/course/repository/CheckoutSessionRepository.java`

```java
@Repository
public interface CheckoutSessionRepository extends JpaRepository<CheckoutSession, String> {
    
    Optional<CheckoutSession> findByPurchaseOrderId(UUID purchaseOrderId);
    
    List<CheckoutSession> findByStatusAndExpiresAtBefore(CheckoutSessionStatus status, Instant time);
}
```

**驗收條件:**

- [ ] Repository 包含基本查詢方法
- [ ] 可依 purchaseOrderId 查詢

---

## Phase 2: Service Layer

### Task 2.1: 建立 PaymentDetails 類別

**檔案:** `src/main/java/com/waterball/course/service/payment/PaymentDetails.java`

```java
package com.waterball.course.service.payment;

public sealed interface PaymentDetails permits CreditCardDetails, BankTransferDetails {
}
```

**檔案:** `src/main/java/com/waterball/course/service/payment/CreditCardDetails.java`

```java
@Getter
@AllArgsConstructor
public final class CreditCardDetails implements PaymentDetails {
    private String cardNumber;
    private String expiryMonth;
    private String expiryYear;
    private String cvv;
    private String cardholderName;
}
```

**檔案:** `src/main/java/com/waterball/course/service/payment/BankTransferDetails.java`

```java
@Getter
@AllArgsConstructor
public final class BankTransferDetails implements PaymentDetails {
    private String accountNumber;
    private String bankCode;
}
```

**驗收條件:**

- [ ] sealed interface 設計
- [ ] 兩種付款方式類別

---

### Task 2.2: 建立 PaymentResult 類別

**檔案:** `src/main/java/com/waterball/course/service/payment/PaymentResult.java`

```java
package com.waterball.course.service.payment;

public record PaymentResult(
    boolean success,
    String failureReason
) {
    public static PaymentResult success() {
        return new PaymentResult(true, null);
    }
    
    public static PaymentResult failed(String reason) {
        return new PaymentResult(false, reason);
    }
}
```

**驗收條件:**

- [ ] 使用 record 類別
- [ ] 工廠方法實作

---

### Task 2.3: 建立 MockPaymentGatewayService

**檔案:** `src/main/java/com/waterball/course/service/payment/MockPaymentGatewayService.java`

```java
@Service
@RequiredArgsConstructor
public class MockPaymentGatewayService {
    private final CheckoutSessionRepository checkoutSessionRepository;
    private final PaymentWebhookService webhookService;
    
    @Value("${app.payment.checkout-expiration-minutes:60}")
    private int checkoutExpirationMinutes;
    
    @Value("${app.payment.mock-gateway.base-url:http://localhost:8080}")
    private String baseUrl;

    public CheckoutSession createCheckoutSession(CreateCheckoutRequest request) {
        CheckoutSession session = CheckoutSession.builder()
            .id(generateSessionId())
            .purchaseOrderId(request.getPurchaseOrderId())
            .paymentMethod(request.getPaymentMethod())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .successUrl(request.getSuccessUrl())
            .cancelUrl(request.getCancelUrl())
            .status(CheckoutSessionStatus.PENDING)
            .expiresAt(Instant.now().plus(checkoutExpirationMinutes, ChronoUnit.MINUTES))
            .build();
        
        return checkoutSessionRepository.save(session);
    }
    
    public String getCheckoutUrl(String sessionId) {
        return String.format("%s/mock-payment/checkout/%s", baseUrl, sessionId);
    }
    
    public Optional<CheckoutSession> getCheckoutSession(String sessionId) {
        return checkoutSessionRepository.findById(sessionId);
    }
    
    @Transactional
    public PaymentResult processPayment(String sessionId, PaymentDetails details) {
        CheckoutSession session = checkoutSessionRepository.findById(sessionId)
            .orElseThrow(() -> new CheckoutSessionNotFoundException("Session not found"));
        
        if (session.isExpired()) {
            session.setStatus(CheckoutSessionStatus.EXPIRED);
            checkoutSessionRepository.save(session);
            throw new SessionExpiredException("Session expired");
        }
        
        PaymentResult result = simulatePayment(session.getPaymentMethod(), details);
        
        session.setStatus(result.success() ? 
            CheckoutSessionStatus.SUCCESS : CheckoutSessionStatus.FAILED);
        session.setCompletedAt(Instant.now());
        checkoutSessionRepository.save(session);
        
        webhookService.sendPaymentNotification(session, result);
        
        return result;
    }
    
    private PaymentResult simulatePayment(PaymentMethod method, PaymentDetails details) {
        if (details instanceof CreditCardDetails card) {
            if (card.getCardNumber().endsWith("0000")) {
                return PaymentResult.failed("Insufficient funds");
            }
            if (card.getCardNumber().endsWith("1111")) {
                return PaymentResult.failed("Card declined");
            }
        }
        
        if (details instanceof BankTransferDetails bank) {
            if (bank.getBankCode().equals("999")) {
                return PaymentResult.failed("Invalid bank");
            }
        }
        
        return PaymentResult.success();
    }
    
    private String generateSessionId() {
        return "cs_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
    }
}
```

**驗收條件:**

- [ ] 可建立 CheckoutSession
- [ ] 可取得 checkoutUrl
- [ ] 卡號結尾 0000 -> Insufficient funds
- [ ] 卡號結尾 1111 -> Card declined  
- [ ] 銀行代碼 999 -> Invalid bank
- [ ] 其他情況 -> 成功
- [ ] 過期 session 正確處理

---

### Task 2.4: 建立 PaymentWebhookService

**檔案:** `src/main/java/com/waterball/course/service/payment/PaymentWebhookService.java`

```java
@Service
@RequiredArgsConstructor
public class PaymentWebhookService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserPurchaseRepository userPurchaseRepository;
    
    @Value("${app.payment.webhook-secret:mock-webhook-secret-12345}")
    private String webhookSecret;

    public void sendPaymentNotification(CheckoutSession session, PaymentResult result) {
        // Mock: 直接處理，實際場景會是 async HTTP call
        handlePaymentResult(session.getId(), result);
    }

    @Transactional
    public void handlePaymentResult(String sessionId, PaymentResult result) {
        PurchaseOrder order = purchaseOrderRepository.findByCheckoutSessionId(sessionId)
            .orElseThrow(() -> new PurchaseOrderNotFoundException("Order not found for session: " + sessionId));
        
        if (result.success()) {
            order.setStatus(PurchaseStatus.COMPLETED);
            order.setCompletedAt(Instant.now());
            purchaseOrderRepository.save(order);

            UserPurchase userPurchase = new UserPurchase();
            userPurchase.setUser(order.getUser());
            userPurchase.setJourney(order.getJourney());
            userPurchaseRepository.save(userPurchase);
        } else {
            order.setStatus(PurchaseStatus.FAILED);
            order.setFailureReason(result.failureReason());
            purchaseOrderRepository.save(order);
        }
    }
    
    public boolean validateWebhookSecret(String secret) {
        return webhookSecret.equals(secret);
    }
}
```

**驗收條件:**

- [ ] 可處理付款成功通知
- [ ] 付款成功後建立 UserPurchase
- [ ] 可處理付款失敗通知
- [ ] 可驗證 webhook secret

---

### Task 2.5: 建立 PurchaseService

**檔案:** `src/main/java/com/waterball/course/service/purchase/PurchaseService.java`

```java
@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final JourneyRepository journeyRepository;
    private final UserPurchaseRepository userPurchaseRepository;
    private final MockPaymentGatewayService mockPaymentGatewayService;
    
    @Value("${app.payment.checkout-expiration-minutes:60}")
    private int checkoutExpirationMinutes;
    
    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public PurchaseOrderResponse createPurchaseOrder(UUID userId, CreatePurchaseRequest request) {
        Journey journey = journeyRepository.findByIdAndIsPublishedTrue(request.getJourneyId())
                .orElseThrow(() -> new JourneyNotFoundException("Journey not found"));

        if (userPurchaseRepository.existsByUserIdAndJourneyId(userId, journey.getId())) {
            throw new AlreadyPurchasedException("You have already purchased this course");
        }

        Optional<PurchaseOrder> existingPending = purchaseOrderRepository
                .findPendingByUserIdAndJourneyId(userId, journey.getId());
        
        if (existingPending.isPresent()) {
            PurchaseOrder existing = existingPending.get();
            if (existing.getExpiresAt() != null && existing.getExpiresAt().isAfter(Instant.now())) {
                String checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(existing.getCheckoutSessionId());
                return toResponseWithCheckoutUrl(existing, checkoutUrl);
            }
            // Expired, mark as expired
            existing.setStatus(PurchaseStatus.EXPIRED);
            purchaseOrderRepository.save(existing);
        }

        // Create new order
        PurchaseOrder order = new PurchaseOrder();
        User user = new User();
        user.setId(userId);
        order.setUser(user);
        order.setJourney(journey);
        order.setAmount(journey.getPrice());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(PurchaseStatus.PENDING);
        order.setExpiresAt(Instant.now().plus(checkoutExpirationMinutes, ChronoUnit.MINUTES));
        
        purchaseOrderRepository.save(order);

        // Create checkout session
        CreateCheckoutRequest checkoutRequest = CreateCheckoutRequest.builder()
                .purchaseOrderId(order.getId())
                .paymentMethod(request.getPaymentMethod())
                .amount(journey.getPrice())
                .currency("TWD")
                .successUrl(frontendBaseUrl + "/courses/" + journey.getId() + "/purchase/callback?status=success&purchaseId=" + order.getId())
                .cancelUrl(frontendBaseUrl + "/courses/" + journey.getId() + "/purchase/callback?status=cancel&purchaseId=" + order.getId())
                .build();
        
        CheckoutSession session = mockPaymentGatewayService.createCheckoutSession(checkoutRequest);
        
        order.setCheckoutSessionId(session.getId());
        purchaseOrderRepository.save(order);
        
        String checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(session.getId());
        return toResponseWithCheckoutUrl(order, checkoutUrl);
    }

    public void cancelPurchase(UUID userId, UUID purchaseId) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("Purchase order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (order.getStatus() != PurchaseStatus.PENDING) {
            throw new InvalidOrderStatusException("Only pending orders can be cancelled");
        }

        order.setStatus(PurchaseStatus.CANCELLED);
        purchaseOrderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDetailResponse getPurchaseOrder(UUID userId, UUID purchaseId) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("Purchase order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        String checkoutUrl = null;
        if (order.getStatus() == PurchaseStatus.PENDING && order.getCheckoutSessionId() != null) {
            checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(order.getCheckoutSessionId());
        }
        
        return toDetailResponse(order, checkoutUrl);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getPurchaseHistory(UUID userId, PurchaseStatus status, Pageable pageable) {
        Page<PurchaseOrder> orders = status != null
                ? purchaseOrderRepository.findByUserIdAndStatus(userId, status, pageable)
                : purchaseOrderRepository.findByUserId(userId, pageable);

        return orders.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPendingPurchases(UUID userId) {
        return purchaseOrderRepository.findPendingByUserId(userId).stream()
                .map(order -> {
                    String checkoutUrl = null;
                    if (order.getCheckoutSessionId() != null) {
                        checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(order.getCheckoutSessionId());
                    }
                    return toResponseWithCheckoutUrl(order, checkoutUrl);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPendingPurchaseByJourney(UUID userId, UUID journeyId) {
        PurchaseOrder order = purchaseOrderRepository.findPendingByUserIdAndJourneyId(userId, journeyId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("No pending order for this journey"));
        
        String checkoutUrl = null;
        if (order.getCheckoutSessionId() != null) {
            checkoutUrl = mockPaymentGatewayService.getCheckoutUrl(order.getCheckoutSessionId());
        }
        return toResponseWithCheckoutUrl(order, checkoutUrl);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder order) {
        return toResponseWithCheckoutUrl(order, null);
    }

    private PurchaseOrderResponse toResponseWithCheckoutUrl(PurchaseOrder order, String checkoutUrl) {
        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .journeyId(order.getJourney().getId())
                .journeyTitle(order.getJourney().getTitle())
                .journeyThumbnailUrl(order.getJourney().getThumbnailUrl())
                .amount(order.getAmount())
                .currency("TWD")
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .checkoutUrl(checkoutUrl)
                .failureReason(order.getFailureReason())
                .expiresAt(order.getExpiresAt())
                .createdAt(order.getCreatedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }

    private PurchaseOrderDetailResponse toDetailResponse(PurchaseOrder order, String checkoutUrl) {
        return PurchaseOrderDetailResponse.builder()
                .id(order.getId())
                .journeyId(order.getJourney().getId())
                .journeyTitle(order.getJourney().getTitle())
                .journeyThumbnailUrl(order.getJourney().getThumbnailUrl())
                .journeyDescription(order.getJourney().getDescription())
                .amount(order.getAmount())
                .currency("TWD")
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .checkoutUrl(checkoutUrl)
                .failureReason(order.getFailureReason())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .expiresAt(order.getExpiresAt())
                .completedAt(order.getCompletedAt())
                .build();
    }
}
```

**驗收條件:**

- [ ] createPurchaseOrder - 建立訂單、建立 CheckoutSession、返回 checkoutUrl
- [ ] createPurchaseOrder - 檢查重複購買
- [ ] createPurchaseOrder - 返回現有 PENDING 訂單
- [ ] cancelPurchase - 取消訂單
- [ ] getPurchaseOrder - 取得訂單詳情 (含 checkoutUrl)
- [ ] getPurchaseHistory - 分頁查詢歷史
- [ ] getPendingPurchases - 取得待付款訂單 (含 checkoutUrl)
- [ ] getPendingPurchaseByJourney - 取得特定課程待付款訂單

---

## Phase 3: DTOs

### Task 3.1: 建立 Request DTOs

**檔案:** `src/main/java/com/waterball/course/dto/request/CreatePurchaseRequest.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseRequest {
    @NotNull(message = "Journey ID is required")
    private UUID journeyId;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
```

**檔案:** `src/main/java/com/waterball/course/dto/request/CreateCheckoutRequest.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCheckoutRequest {
    private UUID purchaseOrderId;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private String currency;
    private String successUrl;
    private String cancelUrl;
}
```

**檔案:** `src/main/java/com/waterball/course/dto/request/CreditCardPaymentRequest.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardPaymentRequest {
    @NotBlank(message = "Card number is required")
    @Pattern(regexp = "\\d{16}", message = "Card number must be 16 digits")
    private String cardNumber;
    
    @NotBlank(message = "Expiry month is required")
    @Pattern(regexp = "(0[1-9]|1[0-2])", message = "Invalid expiry month")
    private String expiryMonth;
    
    @NotBlank(message = "Expiry year is required")
    @Pattern(regexp = "\\d{4}", message = "Expiry year must be 4 digits")
    private String expiryYear;
    
    @NotBlank(message = "CVV is required")
    @Pattern(regexp = "\\d{3,4}", message = "CVV must be 3-4 digits")
    private String cvv;
    
    @NotBlank(message = "Cardholder name is required")
    private String cardholderName;
}
```

**檔案:** `src/main/java/com/waterball/course/dto/request/BankTransferPaymentRequest.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankTransferPaymentRequest {
    @NotBlank(message = "Account number is required")
    @Pattern(regexp = "\\d{10,14}", message = "Account number must be 10-14 digits")
    private String accountNumber;
    
    @NotBlank(message = "Bank code is required")
    @Pattern(regexp = "\\d{3}", message = "Bank code must be 3 digits")
    private String bankCode;
}
```

**檔案:** `src/main/java/com/waterball/course/dto/request/PaymentWebhookRequest.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentWebhookRequest {
    @NotBlank
    private String sessionId;
    
    @NotBlank
    private String status; // SUCCESS, FAILED
    
    private String failureReason;
    
    private Instant completedAt;
}
```

**驗收條件:**

- [ ] 所有 validation annotations 正確
- [ ] 包含 CreateCheckoutRequest
- [ ] 包含 PaymentWebhookRequest

---

### Task 3.2: 建立 Response DTOs

**檔案:** `src/main/java/com/waterball/course/dto/response/PurchaseOrderResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderResponse {
    private UUID id;
    private UUID journeyId;
    private String journeyTitle;
    private String journeyThumbnailUrl;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private PurchaseStatus status;
    private String checkoutUrl;  // NEW: 結帳頁面 URL
    private String failureReason;
    private Instant expiresAt;   // NEW: 訂單過期時間
    private Instant createdAt;
    private Instant completedAt;
}
```

**檔案:** `src/main/java/com/waterball/course/dto/response/PurchaseOrderDetailResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderDetailResponse {
    private UUID id;
    private UUID journeyId;
    private String journeyTitle;
    private String journeyThumbnailUrl;
    private String journeyDescription;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private PurchaseStatus status;
    private String checkoutUrl;  // NEW: 結帳頁面 URL (僅 PENDING 狀態)
    private String failureReason;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant expiresAt;   // NEW: 訂單過期時間
    private Instant completedAt;
}
```

**檔案:** `src/main/java/com/waterball/course/dto/response/WebhookResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class WebhookResponse {
    private boolean received;
    
    public static WebhookResponse success() {
        return new WebhookResponse(true);
    }
}
```

**驗收條件:**

- [ ] PurchaseOrderResponse 包含 checkoutUrl 和 expiresAt
- [ ] PurchaseOrderDetailResponse 包含 checkoutUrl 和 expiresAt
- [ ] WebhookResponse 建立完成

---

## Phase 4: Controllers

### Task 4.1: 建立 PurchaseController

**檔案:** `src/main/java/com/waterball/course/controller/PurchaseController.java`

```java
@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {
    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> createPurchase(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePurchaseRequest request) {
        PurchaseOrderResponse response = purchaseService.createPurchaseOrder(
                principal.getUser().getId(), request);
        
        HttpStatus status = response.getStatus() == PurchaseStatus.PENDING && 
                           response.getCheckoutUrl() != null ? 
                           HttpStatus.CREATED : HttpStatus.OK;
        
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<PurchaseOrderResponse>> getPurchaseHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) PurchaseStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseOrderResponse> response = purchaseService.getPurchaseHistory(
                principal.getUser().getId(), status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PurchaseOrderResponse>> getPendingPurchases(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PurchaseOrderResponse> response = purchaseService.getPendingPurchases(
                principal.getUser().getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending/journey/{journeyId}")
    public ResponseEntity<PurchaseOrderResponse> getPendingPurchaseByJourney(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID journeyId) {
        PurchaseOrderResponse response = purchaseService.getPendingPurchaseByJourney(
                principal.getUser().getId(), journeyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{purchaseId}")
    public ResponseEntity<PurchaseOrderDetailResponse> getPurchaseOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId) {
        PurchaseOrderDetailResponse response = purchaseService.getPurchaseOrder(
                principal.getUser().getId(), purchaseId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{purchaseId}")
    public ResponseEntity<Void> cancelPurchase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId) {
        purchaseService.cancelPurchase(principal.getUser().getId(), purchaseId);
        return ResponseEntity.noContent().build();
    }
}
```

**驗收條件:**

- [ ] POST /api/purchases - 建立訂單並返回 checkoutUrl
- [ ] GET /api/purchases - 分頁查詢購買歷史
- [ ] GET /api/purchases/pending - 取得待付款訂單
- [ ] GET /api/purchases/pending/journey/{journeyId} - 取得特定課程待付款訂單
- [ ] GET /api/purchases/{purchaseId} - 取得訂單詳情
- [ ] DELETE /api/purchases/{purchaseId} - 取消訂單

---

### Task 4.2: 建立 PaymentWebhookController

**檔案:** `src/main/java/com/waterball/course/controller/PaymentWebhookController.java`

```java
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class PaymentWebhookController {
    private final PaymentWebhookService webhookService;

    @PostMapping("/payment")
    public ResponseEntity<WebhookResponse> handlePaymentWebhook(
            @RequestHeader("X-Webhook-Secret") String secret,
            @Valid @RequestBody PaymentWebhookRequest request) {
        
        if (!webhookService.validateWebhookSecret(secret)) {
            throw new InvalidWebhookSecretException("Invalid webhook secret");
        }
        
        PaymentResult result = "SUCCESS".equals(request.getStatus()) ?
                PaymentResult.success() :
                PaymentResult.failed(request.getFailureReason());
        
        webhookService.handlePaymentResult(request.getSessionId(), result);
        
        return ResponseEntity.ok(WebhookResponse.success());
    }
}
```

**驗收條件:**

- [ ] POST /api/webhooks/payment - 接收付款結果通知
- [ ] 驗證 X-Webhook-Secret header
- [ ] 處理 SUCCESS 和 FAILED 狀態

---

### Task 4.3: 建立 MockPaymentController

**檔案:** `src/main/java/com/waterball/course/controller/MockPaymentController.java`

```java
@Controller
@RequestMapping("/mock-payment")
@RequiredArgsConstructor
public class MockPaymentController {
    private final MockPaymentGatewayService gatewayService;
    private final CheckoutSessionRepository checkoutSessionRepository;

    @GetMapping("/checkout/{sessionId}")
    public String showCheckoutPage(@PathVariable String sessionId, Model model) {
        CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CheckoutSessionNotFoundException("Session not found"));
        
        if (session.isExpired()) {
            model.addAttribute("error", "Session expired");
            model.addAttribute("cancelUrl", session.getCancelUrl());
            return "mock-payment/expired";
        }
        
        model.addAttribute("session", session);
        model.addAttribute("isCreditCard", session.getPaymentMethod() == PaymentMethod.CREDIT_CARD);
        return "mock-payment/checkout";
    }

    @PostMapping("/checkout/{sessionId}/submit")
    public String processPayment(
            @PathVariable String sessionId,
            @RequestParam Map<String, String> formData,
            RedirectAttributes redirectAttributes) {
        
        CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CheckoutSessionNotFoundException("Session not found"));
        
        PaymentDetails details;
        if (session.getPaymentMethod() == PaymentMethod.CREDIT_CARD) {
            details = new CreditCardDetails(
                    formData.get("cardNumber"),
                    formData.get("expiryMonth"),
                    formData.get("expiryYear"),
                    formData.get("cvv"),
                    formData.get("cardholderName")
            );
        } else {
            details = new BankTransferDetails(
                    formData.get("accountNumber"),
                    formData.get("bankCode")
            );
        }
        
        try {
            PaymentResult result = gatewayService.processPayment(sessionId, details);
            
            if (result.success()) {
                return "redirect:" + session.getSuccessUrl();
            } else {
                String cancelUrl = session.getCancelUrl() + 
                        (session.getCancelUrl().contains("?") ? "&" : "?") + 
                        "error=" + URLEncoder.encode(result.failureReason(), StandardCharsets.UTF_8);
                return "redirect:" + cancelUrl;
            }
        } catch (SessionExpiredException e) {
            return "redirect:" + session.getCancelUrl() + "?error=session_expired";
        }
    }

    @GetMapping("/checkout/{sessionId}/cancel")
    public String cancelPayment(@PathVariable String sessionId) {
        CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CheckoutSessionNotFoundException("Session not found"));
        
        return "redirect:" + session.getCancelUrl();
    }
}
```

**驗收條件:**

- [ ] GET /mock-payment/checkout/{sessionId} - 顯示結帳頁面
- [ ] POST /mock-payment/checkout/{sessionId}/submit - 處理付款
- [ ] GET /mock-payment/checkout/{sessionId}/cancel - 取消付款
- [ ] 過期 session 正確處理
- [ ] 依付款方式顯示不同表單

---

### Task 4.4: 建立 Mock Payment HTML Templates

**檔案:** `src/main/resources/templates/mock-payment/checkout.html`

建立 Thymeleaf 模板，顯示模擬的結帳頁面，包含：
- 訂單資訊（金額、課程名稱）
- 依付款方式顯示信用卡或銀行轉帳表單
- 「確認付款」按鈕
- 「取消」按鈕

**檔案:** `src/main/resources/templates/mock-payment/expired.html`

建立過期頁面模板。

**驗收條件:**

- [ ] checkout.html 可顯示結帳表單
- [ ] expired.html 可顯示過期訊息
- [ ] 表單可正確提交

---

### Task 4.5: 更新 SecurityConfig

**檔案:** `src/main/java/com/waterball/course/config/SecurityConfig.java`

更新 authorizeHttpRequests 區塊：

```java
.authorizeHttpRequests(auth -> auth
    // ... existing rules
    .requestMatchers("/api/purchases/**").authenticated()
    .requestMatchers("/api/webhooks/payment").permitAll()  // Webhook 不需認證，用 secret 驗證
    .requestMatchers("/mock-payment/**").permitAll()       // Mock Gateway 頁面公開
    .anyRequest().authenticated()
)
```

**驗收條件:**

- [ ] /api/purchases/** 需要認證
- [ ] /api/webhooks/payment 允許匿名存取
- [ ] /mock-payment/** 允許匿名存取

---

### Task 4.6: 建立 Business Exceptions

**檔案:** 建立以下 Exception 類別：

- `JourneyNotFoundException` (404)
- `PurchaseOrderNotFoundException` (404)
- `CheckoutSessionNotFoundException` (404)
- `AlreadyPurchasedException` (409)
- `InvalidOrderStatusException` (400)
- `SessionExpiredException` (400)
- `PaymentValidationException` (400)
- `InvalidWebhookSecretException` (401)

**驗收條件:**

- [ ] 所有 exception 包含適當的 HTTP status
- [ ] 訊息清楚

---

### Task 4.7: 更新 GlobalExceptionHandler

新增處理購買相關 exceptions 的 handler methods。

**驗收條件:**

- [ ] 所有購買相關 exception 有對應的 handler

---

## Phase 5: Configuration

### Task 5.1: 更新 application.yml

**檔案:** `src/main/resources/application.yml`

新增：

```yaml
app:
  payment:
    webhook-secret: ${PAYMENT_WEBHOOK_SECRET:mock-webhook-secret-12345}
    checkout-expiration-minutes: 60
    mock-gateway:
      enabled: true
      base-url: ${MOCK_GATEWAY_BASE_URL:http://localhost:8080}
  frontend:
    base-url: ${FRONTEND_BASE_URL:http://localhost:3000}
```

**驗收條件:**

- [ ] 設定 webhook-secret
- [ ] 設定 checkout-expiration-minutes
- [ ] 設定 mock-gateway base-url
- [ ] 設定 frontend base-url

---

## Phase 6: Integration Tests

### Task 6.1: 建立 PurchaseControllerTest

**測試案例:**

- `createPurchase_withValidRequest_shouldReturn201WithCheckoutUrl`
- `createPurchase_withExistingPendingOrder_shouldReturn200WithSameCheckoutUrl`
- `createPurchase_withAlreadyPurchased_shouldReturn409`
- `createPurchase_withInvalidJourney_shouldReturn404`
- `createPurchase_withoutAuth_shouldReturn401`
- `getPurchaseHistory_shouldReturnPaginatedResults`
- `getPurchaseHistory_withStatusFilter_shouldReturnFiltered`
- `getPendingPurchases_shouldReturnPendingOrdersWithCheckoutUrl`
- `getPendingPurchaseByJourney_withPendingOrder_shouldReturn200`
- `getPendingPurchaseByJourney_withNoPendingOrder_shouldReturn404`
- `getPurchaseOrder_withValidId_shouldReturn200`
- `getPurchaseOrder_withOtherUserOrder_shouldReturn403`
- `getPurchaseOrder_withInvalidId_shouldReturn404`
- `cancelPurchase_withPendingOrder_shouldReturn204`
- `cancelPurchase_withCompletedOrder_shouldReturn400`

**驗收條件:**

- [ ] 所有測試案例通過
- [ ] 涵蓋所有 API endpoints

---

### Task 6.2: 建立 PaymentWebhookControllerTest

**測試案例:**

- `handleWebhook_withValidSecret_success_shouldUpdateOrderCompleted`
- `handleWebhook_withValidSecret_failed_shouldUpdateOrderFailed`
- `handleWebhook_withInvalidSecret_shouldReturn401`
- `handleWebhook_withUnknownSession_shouldReturn404`

**驗收條件:**

- [ ] Webhook 處理正確
- [ ] Secret 驗證正確

---

### Task 6.3: 建立 MockPaymentGatewayServiceTest

**測試案例:**

- `createCheckoutSession_shouldReturnSessionWithId`
- `processPayment_withValidCreditCard_shouldReturnSuccess`
- `processPayment_withCardEndingIn0000_shouldReturnInsufficientFunds`
- `processPayment_withCardEndingIn1111_shouldReturnCardDeclined`
- `processPayment_withValidBankTransfer_shouldReturnSuccess`
- `processPayment_withBankCode999_shouldReturnInvalidBank`
- `processPayment_withExpiredSession_shouldThrowException`

**驗收條件:**

- [ ] Mock 邏輯正確
- [ ] 所有失敗情境覆蓋

---

### Task 6.4: 建立 PurchaseServiceTest

**測試案例:**

- `createPurchaseOrder_withValidRequest_shouldCreateOrderAndCheckoutSession`
- `createPurchaseOrder_withExistingPending_shouldReturnExisting`
- `createPurchaseOrder_withExpiredPending_shouldCreateNewOrder`
- `createPurchaseOrder_withAlreadyPurchased_shouldThrowException`
- `cancelPurchase_withPending_shouldUpdateStatus`
- `cancelPurchase_withNonPending_shouldThrowException`
- `getPendingPurchaseByJourney_withPending_shouldReturnOrder`
- `getPendingPurchaseByJourney_withNoPending_shouldThrowException`

**驗收條件:**

- [ ] Service 邏輯正確
- [ ] Exception 處理正確

---

## Phase 7: E2E Tests

### Task 7.1: 建立 PurchaseE2ETest

**測試場景 7.1.1:** 完整購買流程（信用卡成功）

```java
@Test
void completePurchaseFlow_withCreditCard_success() {
    // 1. POST /api/purchases -> 201, status PENDING, has checkoutUrl
    // 2. GET /mock-payment/checkout/{sessionId} -> 200, show form
    // 3. POST /mock-payment/checkout/{sessionId}/submit (valid card) -> redirect to successUrl
    // 4. GET /api/purchases/{id} -> status COMPLETED
    // 5. GET /api/journeys/{journeyId} -> isPurchased = true
}
```

**測試場景 7.1.2:** 付款失敗（餘額不足）

```java
@Test
void purchaseFlow_withInsufficientFunds_shouldFail() {
    // 1. POST /api/purchases -> 201
    // 2. POST /mock-payment/checkout/{sessionId}/submit (card ending 0000) 
    //    -> redirect to cancelUrl with error
    // 3. GET /api/purchases/{id} -> status FAILED, failureReason = "Insufficient funds"
}
```

**測試場景 7.1.3:** 用戶在 Gateway 取消

```java
@Test
void userCancelsOnGateway() {
    // 1. POST /api/purchases -> 201
    // 2. GET /mock-payment/checkout/{sessionId}/cancel -> redirect to cancelUrl
    // 3. GET /api/purchases/{id} -> status PENDING (可重試)
}
```

**測試場景 7.1.4:** 繼續未完成購買

```java
@Test
void resumePendingPurchase() {
    // 1. POST /api/purchases -> 201
    // 2. POST /api/purchases (same journey) -> 200, return existing with same checkoutUrl
}
```

**測試場景 7.1.5:** 已購買課程

```java
@Test
void alreadyPurchased_shouldReturn409() {
    // 1. Complete purchase via gateway
    // 2. POST /api/purchases (same journey) -> 409
}
```

**測試場景 7.1.6:** 取消待付款訂單

```java
@Test
void cancelPendingOrder() {
    // 1. POST /api/purchases -> 201
    // 2. DELETE /api/purchases/{id} -> 204
    // 3. GET /api/purchases/{id} -> status CANCELLED
}
```

**測試場景 7.1.7:** Session 過期

```java
@Test
void expiredSession_shouldShowError() {
    // 1. POST /api/purchases -> 201
    // 2. Manually expire session in DB
    // 3. GET /mock-payment/checkout/{sessionId} -> show expired page
}
```

**測試場景 7.1.8:** 付款成功後可存取課程

```java
@Test
void accessControl_afterPurchase() {
    // 1. GET /api/lessons/{id} (PURCHASED) -> 403
    // 2. Complete purchase via gateway
    // 3. GET /api/lessons/{id} -> 200
}
```

**測試場景 7.1.9:** Webhook 正確處理

```java
@Test
void webhookHandler_updatesOrderStatus() {
    // 1. POST /api/purchases -> 201
    // 2. POST /api/webhooks/payment (SUCCESS) with valid secret
    // 3. GET /api/purchases/{id} -> status COMPLETED
}
```

**驗收條件:**

- [ ] 所有 E2E 測試場景通過
- [ ] 涵蓋 backend-spec.md 定義的所有場景

---

## Phase 8: Test Data

### Task 8.1: 更新 Seed Data

**檔案:** `src/main/resources/db/migration/V20251127000004__seed_purchase_data.sql`

```sql
-- Update journey prices
UPDATE journeys SET price = 1999.00 WHERE title LIKE '%軟體設計%';
UPDATE journeys SET price = 2999.00 WHERE title LIKE '%進階%';
UPDATE journeys SET price = 0.00 WHERE price IS NULL;
```

**驗收條件:**

- [ ] 測試課程有價格設定

---

### Task 8.2: 建立測試資料檔案

**檔案:** `src/test/resources/sql/test-purchase-data.sql`

建立測試用的 purchase_orders 和 checkout_sessions 資料。

**驗收條件:**

- [ ] 測試資料可用於 integration tests

---

## Phase 9: Journey API Enhancement

### Task 9.1: 更新 JourneyListResponse DTO 加入定價欄位

新增欄位：`price`, `currency`

**驗收條件:**

- [ ] JourneyListResponse 包含 price, currency 欄位

---

### Task 9.2: 更新 JourneyDetailResponse DTO 加入定價欄位

新增欄位：`price`, `currency`

**驗收條件:**

- [ ] JourneyDetailResponse 包含 price, currency 欄位

---

### Task 9.3: 更新 JourneyService 設定定價資訊

從 Journey entity 取得 price 並設定到 response 中，currency 預設為 "TWD"。

**驗收條件:**

- [ ] getPublishedJourneys 回傳的每個 journey 包含 pricing 資訊
- [ ] getJourneyDetail 回傳的 journey 包含 pricing 資訊

---

## Summary Checklist

### Phase 1: Database & Entity (11 tasks)

- [x] Task 1.1: Flyway Migration - purchase_orders
- [x] Task 1.2: Flyway Migration - checkout_sessions
- [x] Task 1.3: Flyway Migration - add price to journeys
- [x] Task 1.4: PurchaseStatus Enum (含 EXPIRED)
- [x] Task 1.5: PaymentMethod Enum
- [x] Task 1.6: CheckoutSessionStatus Enum
- [ ] Task 1.7: PurchaseOrder Entity (含 checkoutSessionId, expiresAt)
- [ ] Task 1.8: CheckoutSession Entity
- [ ] Task 1.9: Update Journey Entity
- [ ] Task 1.10: PurchaseOrderRepository
- [ ] Task 1.11: CheckoutSessionRepository

### Phase 2: Service Layer (5 tasks)

- [ ] Task 2.1: PaymentDetails classes
- [ ] Task 2.2: PaymentResult class
- [ ] Task 2.3: MockPaymentGatewayService
- [ ] Task 2.4: PaymentWebhookService
- [ ] Task 2.5: PurchaseService

### Phase 3: DTOs (2 tasks)

- [ ] Task 3.1: Request DTOs (含 CreateCheckoutRequest, PaymentWebhookRequest)
- [ ] Task 3.2: Response DTOs (含 checkoutUrl, expiresAt, WebhookResponse)

### Phase 4: Controllers (7 tasks)

- [ ] Task 4.1: PurchaseController
- [ ] Task 4.2: PaymentWebhookController
- [ ] Task 4.3: MockPaymentController
- [ ] Task 4.4: Mock Payment HTML Templates
- [ ] Task 4.5: SecurityConfig update
- [ ] Task 4.6: Business Exceptions
- [ ] Task 4.7: GlobalExceptionHandler update

### Phase 5: Configuration (1 task)

- [ ] Task 5.1: application.yml update

### Phase 6: Integration Tests (4 tasks)

- [ ] Task 6.1: PurchaseControllerTest
- [ ] Task 6.2: PaymentWebhookControllerTest
- [ ] Task 6.3: MockPaymentGatewayServiceTest
- [ ] Task 6.4: PurchaseServiceTest

### Phase 7: E2E Tests (1 task)

- [ ] Task 7.1: PurchaseE2ETest (9 scenarios)

### Phase 8: Test Data (2 tasks)

- [ ] Task 8.1: Seed Data update
- [ ] Task 8.2: Test data files

### Phase 9: Journey API Enhancement (3 tasks)

- [ ] Task 9.1: Update JourneyListResponse
- [ ] Task 9.2: Update JourneyDetailResponse
- [ ] Task 9.3: Update JourneyService

---

## Phase 10: Logging Infrastructure

### Task 10.1: 新增 logstash-logback-encoder 依賴

**檔案:** `pom.xml`

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

**驗收條件:**

- [ ] 依賴新增成功
- [ ] Maven build 正常

---

### Task 10.2: 建立 Logback 配置檔

**檔案:** `src/main/resources/logback-spring.xml`

```xml
<configuration>
    <springProfile name="!test">
        <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
            <encoder class="net.logstash.logback.encoder.LogstashEncoder">
                <includeMdcKeyName>requestId</includeMdcKeyName>
                <includeMdcKeyName>userId</includeMdcKeyName>
                <includeMdcKeyName>orderId</includeMdcKeyName>
            </encoder>
        </appender>

        <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>logs/purchase.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>logs/purchase.%d{yyyy-MM-dd}.log</fileNamePattern>
                <maxHistory>30</maxHistory>
            </rollingPolicy>
            <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
        </appender>

        <logger name="com.waterball.course.service.purchase" level="INFO"/>
        <logger name="com.waterball.course.service.payment" level="INFO"/>
        <logger name="com.waterball.course.controller" level="INFO"/>

        <root level="INFO">
            <appender-ref ref="JSON"/>
            <appender-ref ref="FILE"/>
        </root>
    </springProfile>

    <springProfile name="test">
        <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>
        <root level="WARN">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>
</configuration>
```

**驗收條件:**

- [ ] 非 test profile 使用 JSON 格式輸出
- [ ] 非 test profile 同時寫入檔案
- [ ] test profile 使用簡單 console 輸出
- [ ] MDC 欄位 (requestId, userId, orderId) 正確包含

---

### Task 10.3: 建立 LoggingFilter 元件

**檔案:** `src/main/java/com/waterball/course/config/LoggingFilter.java`

```java
package com.waterball.course.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            MDC.put("requestId", UUID.randomUUID().toString());
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                // Extract userId from principal if available
                Object principal = auth.getPrincipal();
                if (principal instanceof UserPrincipal userPrincipal) {
                    MDC.put("userId", userPrincipal.getUser().getId().toString());
                }
            }
            
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

**驗收條件:**

- [ ] Filter 為每個請求生成 requestId
- [ ] 認證用戶的 userId 自動加入 MDC
- [ ] 請求結束後清除 MDC

---

### Task 10.4: 更新 SecurityConfig 註冊 LoggingFilter

**檔案:** `src/main/java/com/waterball/course/config/SecurityConfig.java`

在 Security Filter Chain 中加入 LoggingFilter，確保在認證後執行：

```java
.addFilterAfter(loggingFilter, UsernamePasswordAuthenticationFilter.class)
```

**驗收條件:**

- [ ] LoggingFilter 正確註冊到 filter chain
- [ ] LoggingFilter 在認證後執行（可取得 userId）

---

### Task 10.5: 建立 LoggingConstants 工具類

**檔案:** `src/main/java/com/waterball/course/util/LoggingConstants.java`

```java
package com.waterball.course.util;

public final class LoggingConstants {
    private LoggingConstants() {}
    
    // Purchase Order Events
    public static final String PURCHASE_ORDER_CREATED = "PURCHASE_ORDER_CREATED";
    public static final String PURCHASE_ORDER_STATUS_CHANGED = "PURCHASE_ORDER_STATUS_CHANGED";
    public static final String PURCHASE_ORDER_CANCELLED = "PURCHASE_ORDER_CANCELLED";
    
    // Checkout Session Events
    public static final String CHECKOUT_SESSION_CREATED = "CHECKOUT_SESSION_CREATED";
    public static final String CHECKOUT_SESSION_EXPIRED = "CHECKOUT_SESSION_EXPIRED";
    
    // Payment Events
    public static final String PAYMENT_PROCESSING_STARTED = "PAYMENT_PROCESSING_STARTED";
    public static final String PAYMENT_SUCCESS = "PAYMENT_SUCCESS";
    public static final String PAYMENT_FAILED = "PAYMENT_FAILED";
    
    // Webhook Events
    public static final String WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED";
    public static final String WEBHOOK_VALIDATION_FAILED = "WEBHOOK_VALIDATION_FAILED";
    public static final String WEBHOOK_PROCESSED = "WEBHOOK_PROCESSED";
    public static final String WEBHOOK_PROCESSING_FAILED = "WEBHOOK_PROCESSING_FAILED";
    
    // Error Events
    public static final String EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR";
    public static final String OPERATION_TIMEOUT = "OPERATION_TIMEOUT";
    public static final String DATA_INCONSISTENCY = "DATA_INCONSISTENCY";
}
```

**驗收條件:**

- [ ] 所有 event 常數定義完成
- [ ] 分類清楚

---

### Task 10.6: 在 PurchaseService 加入 Logging

**檔案:** `src/main/java/com/waterball/course/service/purchase/PurchaseService.java`

加入以下 logging 點：

1. `createPurchaseOrder()` - 訂單建立成功後
2. `cancelPurchase()` - 訂單取消後
3. 訂單狀態變更時（PENDING -> EXPIRED 等）

使用 StructuredArguments.kv() 格式：

```java
import static net.logstash.logback.argument.StructuredArguments.kv;

log.info("Purchase order created",
    kv("event", LoggingConstants.PURCHASE_ORDER_CREATED),
    kv("orderId", order.getId()),
    kv("userId", userId),
    kv("journeyId", journeyId),
    kv("amount", amount),
    kv("paymentMethod", paymentMethod));
```

**驗收條件:**

- [ ] 訂單建立有 INFO log
- [ ] 訂單取消有 INFO log
- [ ] 訂單過期有 WARN log
- [ ] 使用 structured logging 格式

---

### Task 10.7: 在 MockPaymentGatewayService 加入 Logging

**檔案:** `src/main/java/com/waterball/course/service/payment/MockPaymentGatewayService.java`

加入以下 logging 點：

1. `createCheckoutSession()` - Session 建立後
2. `processPayment()` - 付款開始時
3. `processPayment()` - 付款成功時
4. `processPayment()` - 付款失敗時
5. Session 過期時

**驗收條件:**

- [ ] Session 建立有 INFO log
- [ ] 付款處理有 INFO log
- [ ] 付款成功有 INFO log
- [ ] 付款失敗有 WARN log
- [ ] Session 過期有 WARN log

---

### Task 10.8: 在 PaymentWebhookService 加入 Logging

**檔案:** `src/main/java/com/waterball/course/service/payment/PaymentWebhookService.java`

加入以下 logging 點：

1. `handlePaymentResult()` - Webhook 處理成功
2. `handlePaymentResult()` - 處理失敗（找不到訂單等）
3. `validateWebhookSecret()` - 驗證失敗時

**驗收條件:**

- [ ] Webhook 處理成功有 INFO log
- [ ] Webhook 處理失敗有 ERROR log
- [ ] 驗證失敗有 ERROR log

---

### Task 10.9: 在 PaymentWebhookController 加入 Logging

**檔案:** `src/main/java/com/waterball/course/controller/PaymentWebhookController.java`

加入以下 logging 點：

1. Webhook 接收時 - WEBHOOK_RECEIVED
2. Secret 驗證失敗時 - WEBHOOK_VALIDATION_FAILED（含 remoteAddr）

**驗收條件:**

- [ ] Webhook 接收有 INFO log
- [ ] 驗證失敗有 ERROR log 並記錄 remote address

---

### Task 10.10: 建立 Logging 整合測試

**檔案:** `src/test/java/com/waterball/course/logging/PurchaseLoggingTest.java`

使用 Logback 的 ListAppender 驗證 log 輸出：

```java
@Test
void createPurchaseOrder_shouldLogPurchaseCreatedEvent() {
    // Given
    ListAppender<ILoggingEvent> listAppender = new ListAppender<>();
    listAppender.start();
    Logger logger = (Logger) LoggerFactory.getLogger(PurchaseService.class);
    logger.addAppender(listAppender);
    
    // When
    purchaseService.createPurchaseOrder(userId, request);
    
    // Then
    assertThat(listAppender.list)
        .filteredOn(event -> event.getMessage().contains("Purchase order created"))
        .hasSize(1);
}
```

**驗收條件:**

- [ ] 驗證訂單建立會產生正確的 log
- [ ] 驗證付款成功會產生正確的 log
- [ ] 驗證付款失敗會產生正確的 log
- [ ] 驗證 Webhook 處理會產生正確的 log

---

## Summary Checklist

### Phase 1: Database & Entity (11 tasks)

- [x] Task 1.1: Flyway Migration - purchase_orders
- [x] Task 1.2: Flyway Migration - checkout_sessions
- [x] Task 1.3: Flyway Migration - add price to journeys
- [x] Task 1.4: PurchaseStatus Enum (含 EXPIRED)
- [x] Task 1.5: PaymentMethod Enum
- [x] Task 1.6: CheckoutSessionStatus Enum
- [ ] Task 1.7: PurchaseOrder Entity (含 checkoutSessionId, expiresAt)
- [ ] Task 1.8: CheckoutSession Entity
- [ ] Task 1.9: Update Journey Entity
- [ ] Task 1.10: PurchaseOrderRepository
- [ ] Task 1.11: CheckoutSessionRepository

### Phase 2: Service Layer (5 tasks)

- [ ] Task 2.1: PaymentDetails classes
- [ ] Task 2.2: PaymentResult class
- [ ] Task 2.3: MockPaymentGatewayService
- [ ] Task 2.4: PaymentWebhookService
- [ ] Task 2.5: PurchaseService

### Phase 3: DTOs (2 tasks)

- [ ] Task 3.1: Request DTOs (含 CreateCheckoutRequest, PaymentWebhookRequest)
- [ ] Task 3.2: Response DTOs (含 checkoutUrl, expiresAt, WebhookResponse)

### Phase 4: Controllers (7 tasks)

- [ ] Task 4.1: PurchaseController
- [ ] Task 4.2: PaymentWebhookController
- [ ] Task 4.3: MockPaymentController
- [ ] Task 4.4: Mock Payment HTML Templates
- [ ] Task 4.5: SecurityConfig update
- [ ] Task 4.6: Business Exceptions
- [ ] Task 4.7: GlobalExceptionHandler update

### Phase 5: Configuration (1 task)

- [ ] Task 5.1: application.yml update

### Phase 6: Integration Tests (4 tasks)

- [ ] Task 6.1: PurchaseControllerTest
- [ ] Task 6.2: PaymentWebhookControllerTest
- [ ] Task 6.3: MockPaymentGatewayServiceTest
- [ ] Task 6.4: PurchaseServiceTest

### Phase 7: E2E Tests (1 task)

- [ ] Task 7.1: PurchaseE2ETest (9 scenarios)

### Phase 8: Test Data (2 tasks)

- [ ] Task 8.1: Seed Data update
- [ ] Task 8.2: Test data files

### Phase 9: Journey API Enhancement (3 tasks)

- [ ] Task 9.1: Update JourneyListResponse
- [ ] Task 9.2: Update JourneyDetailResponse
- [ ] Task 9.3: Update JourneyService

### Phase 10: Logging Infrastructure (10 tasks)

- [ ] Task 10.1: Add logstash-logback-encoder dependency
- [ ] Task 10.2: Create logback-spring.xml configuration
- [ ] Task 10.3: Create LoggingFilter component
- [ ] Task 10.4: Update SecurityConfig to register LoggingFilter
- [ ] Task 10.5: Create LoggingConstants utility class
- [ ] Task 10.6: Add logging to PurchaseService
- [ ] Task 10.7: Add logging to MockPaymentGatewayService
- [ ] Task 10.8: Add logging to PaymentWebhookService
- [ ] Task 10.9: Add logging to PaymentWebhookController
- [ ] Task 10.10: Create logging integration tests

**Total: 46 tasks**
