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
    failure_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_journey_id ON purchase_orders(journey_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_user_status ON purchase_orders(user_id, status);
```

**驗收條件:**

- [ ] Migration 執行成功
- [ ] 所有 index 建立正確

---

### Task 1.2: 建立 Flyway Migration - Add Price to Journeys

**檔案:** `src/main/resources/db/migration/V20251127000002__add_price_to_journeys.sql`

```sql
ALTER TABLE journeys ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
```

**驗收條件:**

- [ ] journeys 表格新增 price 欄位

---

### Task 1.3: 建立 PurchaseStatus Enum

**檔案:** `src/main/java/com/waterball/course/entity/PurchaseStatus.java`

```java
package com.waterball.course.entity;

public enum PurchaseStatus {
    PENDING,
    COMPLETED,
    FAILED,
    CANCELLED
}
```

**驗收條件:**

- [ ] Enum 包含四種狀態

---

### Task 1.4: 建立 PaymentMethod Enum

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

### Task 1.5: 建立 PurchaseOrder Entity

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

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

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
- [ ] 時間戳記自動更新

---

### Task 1.6: 更新 Journey Entity - 新增 price 欄位

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

### Task 1.7: 建立 PurchaseOrderRepository

**檔案:** `src/main/java/com/waterball/course/repository/PurchaseOrderRepository.java`

```java
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {
    
    Optional<PurchaseOrder> findByUserIdAndJourneyIdAndStatus(UUID userId, UUID journeyId, PurchaseStatus status);
    
    List<PurchaseOrder> findByUserIdAndStatus(UUID userId, PurchaseStatus status);
    
    Page<PurchaseOrder> findByUserId(UUID userId, Pageable pageable);
    
    Page<PurchaseOrder> findByUserIdAndStatus(UUID userId, PurchaseStatus status, Pageable pageable);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.user.id = :userId AND po.status = 'PENDING'")
    List<PurchaseOrder> findPendingByUserId(@Param("userId") UUID userId);
}
```

**驗收條件:**

- [ ] 所有查詢方法實作完成
- [ ] 分頁功能正確

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

### Task 2.3: 建立 MockPaymentService

**檔案:** `src/main/java/com/waterball/course/service/payment/MockPaymentService.java`

```java
@Service
public class MockPaymentService {
    
    public PaymentResult processPayment(PurchaseOrder order, PaymentDetails details) {
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
}
```

**驗收條件:**

- [ ] 卡號結尾 0000 -> Insufficient funds
- [ ] 卡號結尾 1111 -> Card declined  
- [ ] 銀行代碼 999 -> Invalid bank
- [ ] 其他情況 -> 成功

---

### Task 2.4: 建立 PurchaseService

**檔案:** `src/main/java/com/waterball/course/service/purchase/PurchaseService.java`

```java
@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final JourneyRepository journeyRepository;
    private final UserPurchaseRepository userPurchaseRepository;
    private final MockPaymentService mockPaymentService;

    public PurchaseOrderResponse createPurchaseOrder(UUID userId, CreatePurchaseRequest request) {
        Journey journey = journeyRepository.findByIdAndIsPublishedTrue(request.getJourneyId())
                .orElseThrow(() -> new JourneyNotFoundException("Journey not found"));

        if (userPurchaseRepository.existsByUserIdAndJourneyId(userId, journey.getId())) {
            throw new AlreadyPurchasedException("You have already purchased this course");
        }

        Optional<PurchaseOrder> existingPending = purchaseOrderRepository
                .findByUserIdAndJourneyIdAndStatus(userId, journey.getId(), PurchaseStatus.PENDING);
        
        if (existingPending.isPresent()) {
            return toResponse(existingPending.get());
        }

        PurchaseOrder order = new PurchaseOrder();
        order.setUser(new User());
        order.getUser().setId(userId);
        order.setJourney(journey);
        order.setAmount(journey.getPrice());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(PurchaseStatus.PENDING);

        purchaseOrderRepository.save(order);
        return toResponse(order);
    }

    public PaymentResultResponse processPayment(UUID userId, UUID purchaseId, PaymentDetails paymentDetails) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseId)
                .orElseThrow(() -> new PurchaseOrderNotFoundException("Purchase order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (order.getStatus() != PurchaseStatus.PENDING) {
            throw new InvalidOrderStatusException("Order is not in pending status");
        }

        PaymentResult result = mockPaymentService.processPayment(order, paymentDetails);

        if (result.success()) {
            order.setStatus(PurchaseStatus.COMPLETED);
            order.setCompletedAt(Instant.now());
            purchaseOrderRepository.save(order);

            UserPurchase userPurchase = new UserPurchase();
            userPurchase.setUser(order.getUser());
            userPurchase.setJourney(order.getJourney());
            userPurchaseRepository.save(userPurchase);

            return PaymentResultResponse.success(order.getId(), order.getCompletedAt());
        } else {
            order.setStatus(PurchaseStatus.FAILED);
            order.setFailureReason(result.failureReason());
            purchaseOrderRepository.save(order);

            return PaymentResultResponse.failed(order.getId(), result.failureReason());
        }
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

        return toDetailResponse(order);
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
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder order) {
        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .journeyId(order.getJourney().getId())
                .journeyTitle(order.getJourney().getTitle())
                .journeyThumbnailUrl(order.getJourney().getThumbnailUrl())
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .failureReason(order.getFailureReason())
                .createdAt(order.getCreatedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }

    private PurchaseOrderDetailResponse toDetailResponse(PurchaseOrder order) {
        return PurchaseOrderDetailResponse.builder()
                .id(order.getId())
                .journeyId(order.getJourney().getId())
                .journeyTitle(order.getJourney().getTitle())
                .journeyThumbnailUrl(order.getJourney().getThumbnailUrl())
                .journeyDescription(order.getJourney().getDescription())
                .amount(order.getAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .failureReason(order.getFailureReason())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }
}
```

**驗收條件:**

- [ ] createPurchaseOrder - 建立訂單、檢查重複購買、返回現有 PENDING 訂單
- [ ] processPayment - 處理付款、更新狀態、建立 UserPurchase
- [ ] cancelPurchase - 取消訂單
- [ ] getPurchaseOrder - 取得訂單詳情
- [ ] getPurchaseHistory - 分頁查詢歷史
- [ ] getPendingPurchases - 取得待付款訂單

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

**驗收條件:**

- [ ] 所有 validation annotations 正確
- [ ] 錯誤訊息清楚

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
    private PaymentMethod paymentMethod;
    private PurchaseStatus status;
    private String failureReason;
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
    private PaymentMethod paymentMethod;
    private PurchaseStatus status;
    private String failureReason;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant completedAt;
}
```

**檔案:** `src/main/java/com/waterball/course/dto/response/PaymentResultResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResultResponse {
    private UUID purchaseId;
    private PurchaseStatus status;
    private String message;
    private Instant completedAt;
    private String failureReason;

    public static PaymentResultResponse success(UUID purchaseId, Instant completedAt) {
        return PaymentResultResponse.builder()
                .purchaseId(purchaseId)
                .status(PurchaseStatus.COMPLETED)
                .message("Payment successful")
                .completedAt(completedAt)
                .build();
    }

    public static PaymentResultResponse failed(UUID purchaseId, String reason) {
        return PaymentResultResponse.builder()
                .purchaseId(purchaseId)
                .status(PurchaseStatus.FAILED)
                .message("Payment failed")
                .failureReason(reason)
                .build();
    }
}
```

**驗收條件:**

- [ ] 所有 Response DTO 建立完成
- [ ] Builder pattern 實作

---

## Phase 4: Controller

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
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @GetMapping("/{purchaseId}")
    public ResponseEntity<PurchaseOrderDetailResponse> getPurchaseOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId) {
        PurchaseOrderDetailResponse response = purchaseService.getPurchaseOrder(
                principal.getUser().getId(), purchaseId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{purchaseId}/pay")
    public ResponseEntity<PaymentResultResponse> processPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId,
            @Valid @RequestBody Object paymentRequest) {
        // Determine payment method from order and convert request
        PaymentDetails details = convertToPaymentDetails(paymentRequest);
        PaymentResultResponse response = purchaseService.processPayment(
                principal.getUser().getId(), purchaseId, details);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{purchaseId}")
    public ResponseEntity<Void> cancelPurchase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID purchaseId) {
        purchaseService.cancelPurchase(principal.getUser().getId(), purchaseId);
        return ResponseEntity.noContent().build();
    }

    private PaymentDetails convertToPaymentDetails(Object request) {
        // Implementation to convert request to appropriate PaymentDetails
        // Based on the content of the request
        throw new UnsupportedOperationException("Implement based on request type");
    }
}
```

**驗收條件:**

- [ ] 所有 API endpoints 實作
- [ ] 適當的 HTTP status codes
- [ ] Authentication 正確處理

---

### Task 4.2: 更新 SecurityConfig

**檔案:** `src/main/java/com/waterball/course/config/SecurityConfig.java`

更新 authorizeHttpRequests 區塊：

```java
.authorizeHttpRequests(auth -> auth
    // ... existing rules
    .requestMatchers("/api/purchases/**").authenticated()
    .anyRequest().authenticated()
)
```

**驗收條件:**

- [ ] /api/purchases/** 需要認證

---

### Task 4.3: 建立 Business Exceptions

**檔案:** `src/main/java/com/waterball/course/exception/JourneyNotFoundException.java`

```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class JourneyNotFoundException extends RuntimeException {
    public JourneyNotFoundException(String message) {
        super(message);
    }
}
```

**檔案:** `src/main/java/com/waterball/course/exception/PurchaseOrderNotFoundException.java`

```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class PurchaseOrderNotFoundException extends RuntimeException {
    public PurchaseOrderNotFoundException(String message) {
        super(message);
    }
}
```

**檔案:** `src/main/java/com/waterball/course/exception/AlreadyPurchasedException.java`

```java
@ResponseStatus(HttpStatus.CONFLICT)
public class AlreadyPurchasedException extends RuntimeException {
    public AlreadyPurchasedException(String message) {
        super(message);
    }
}
```

**檔案:** `src/main/java/com/waterball/course/exception/InvalidOrderStatusException.java`

```java
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidOrderStatusException extends RuntimeException {
    public InvalidOrderStatusException(String message) {
        super(message);
    }
}
```

**檔案:** `src/main/java/com/waterball/course/exception/PaymentValidationException.java`

```java
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PaymentValidationException extends RuntimeException {
    public PaymentValidationException(String message) {
        super(message);
    }
}
```

**驗收條件:**

- [ ] 所有 exception 包含適當的 HTTP status
- [ ] 訊息清楚

---

### Task 4.4: 更新 GlobalExceptionHandler

**檔案:** `src/main/java/com/waterball/course/exception/GlobalExceptionHandler.java`

新增處理購買相關 exceptions：

```java
@ExceptionHandler(AlreadyPurchasedException.class)
public ResponseEntity<ErrorResponse> handleAlreadyPurchased(
        AlreadyPurchasedException ex, HttpServletRequest request) {
    ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.CONFLICT.value(),
            "Conflict",
            ex.getMessage(),
            request.getRequestURI()
    );
    return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
}

@ExceptionHandler(InvalidOrderStatusException.class)
public ResponseEntity<ErrorResponse> handleInvalidOrderStatus(
        InvalidOrderStatusException ex, HttpServletRequest request) {
    ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            ex.getMessage(),
            request.getRequestURI()
    );
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
}

@ExceptionHandler(PurchaseOrderNotFoundException.class)
public ResponseEntity<ErrorResponse> handlePurchaseOrderNotFound(
        PurchaseOrderNotFoundException ex, HttpServletRequest request) {
    ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            request.getRequestURI()
    );
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
}
```

**驗收條件:**

- [ ] 所有購買相關 exception 有對應的 handler

---

## Phase 5: Integration Tests

### Task 5.1: 建立 PurchaseControllerTest

**檔案:** `src/test/java/com/waterball/course/controller/PurchaseControllerTest.java`

**測試案例:**

- `createPurchase_withValidRequest_shouldReturn201`
- `createPurchase_withExistingPendingOrder_shouldReturn200`
- `createPurchase_withAlreadyPurchased_shouldReturn409`
- `createPurchase_withInvalidJourney_shouldReturn404`
- `createPurchase_withoutAuth_shouldReturn401`
- `getPurchaseHistory_shouldReturnPaginatedResults`
- `getPurchaseHistory_withStatusFilter_shouldReturnFiltered`
- `getPendingPurchases_shouldReturnPendingOrders`
- `getPurchaseOrder_withValidId_shouldReturn200`
- `getPurchaseOrder_withOtherUserOrder_shouldReturn403`
- `getPurchaseOrder_withInvalidId_shouldReturn404`
- `processPayment_withCreditCard_success_shouldReturn200`
- `processPayment_withCreditCard_declined_shouldReturnFailed`
- `processPayment_withBankTransfer_success_shouldReturn200`
- `processPayment_withNonPendingOrder_shouldReturn400`
- `cancelPurchase_withPendingOrder_shouldReturn204`
- `cancelPurchase_withCompletedOrder_shouldReturn400`

**驗收條件:**

- [ ] 所有測試案例通過
- [ ] 涵蓋所有 API endpoints

---

### Task 5.2: 建立 MockPaymentServiceTest

**檔案:** `src/test/java/com/waterball/course/service/MockPaymentServiceTest.java`

**測試案例:**

- `processPayment_withValidCreditCard_shouldReturnSuccess`
- `processPayment_withCardEndingIn0000_shouldReturnInsufficientFunds`
- `processPayment_withCardEndingIn1111_shouldReturnCardDeclined`
- `processPayment_withValidBankTransfer_shouldReturnSuccess`
- `processPayment_withBankCode999_shouldReturnInvalidBank`

**驗收條件:**

- [ ] Mock 邏輯正確
- [ ] 所有失敗情境覆蓋

---

### Task 5.3: 建立 PurchaseServiceTest

**檔案:** `src/test/java/com/waterball/course/service/PurchaseServiceTest.java`

**測試案例:**

- `createPurchaseOrder_withValidRequest_shouldCreateOrder`
- `createPurchaseOrder_withExistingPending_shouldReturnExisting`
- `createPurchaseOrder_withAlreadyPurchased_shouldThrowException`
- `processPayment_withSuccess_shouldCreateUserPurchase`
- `processPayment_withFailure_shouldUpdateOrderStatus`
- `cancelPurchase_withPending_shouldUpdateStatus`
- `cancelPurchase_withNonPending_shouldThrowException`

**驗收條件:**

- [ ] Service 邏輯正確
- [ ] Exception 處理正確

---

## Phase 6: E2E Tests

### Task 6.1: 建立 PurchaseE2ETest

**檔案:** `src/test/java/com/waterball/course/e2e/PurchaseE2ETest.java`

**測試場景 6.1.1:** 完整購買流程（信用卡成功）

```java
@Test
void completePurchaseFlow_withCreditCard_success() {
    // 1. POST /api/purchases -> 201, status PENDING
    // 2. POST /api/purchases/{id}/pay -> 200, status COMPLETED
    // 3. GET /api/journeys/{journeyId} -> isPurchased = true
}
```

**測試場景 6.1.2:** 付款失敗（餘額不足）

```java
@Test
void purchaseFlow_withInsufficientFunds_shouldFail() {
    // 1. POST /api/purchases -> 201
    // 2. POST /api/purchases/{id}/pay (card ending 0000) -> 200, status FAILED
}
```

**測試場景 6.1.3:** 繼續未完成購買

```java
@Test
void resumePendingPurchase() {
    // 1. POST /api/purchases -> 201
    // 2. POST /api/purchases (same journey) -> 200, return existing
}
```

**測試場景 6.1.4:** 已購買課程

```java
@Test
void alreadyPurchased_shouldReturn409() {
    // 1. Complete purchase
    // 2. POST /api/purchases (same journey) -> 409
}
```

**測試場景 6.1.5:** 取消待付款訂單

```java
@Test
void cancelPendingOrder() {
    // 1. POST /api/purchases -> 201
    // 2. DELETE /api/purchases/{id} -> 204
    // 3. GET /api/purchases/{id} -> status CANCELLED
}
```

**測試場景 6.1.6:** 不能取消已完成訂單

```java
@Test
void cannotCancelCompletedOrder() {
    // 1. Complete purchase
    // 2. DELETE /api/purchases/{id} -> 400
}
```

**測試場景 6.1.7:** 不能對非 PENDING 訂單付款

```java
@Test
void cannotPayNonPendingOrder() {
    // 1. POST /api/purchases -> 201
    // 2. DELETE /api/purchases/{id} -> 204
    // 3. POST /api/purchases/{id}/pay -> 400
}
```

**測試場景 6.1.8:** 付款成功後可存取課程

```java
@Test
void accessControl_afterPurchase() {
    // 1. GET /api/lessons/{id} (PURCHASED) -> 403
    // 2. Complete purchase
    // 3. GET /api/lessons/{id} -> 200
}
```

**測試場景 6.1.9:** 購買歷史分頁

```java
@Test
void purchaseHistory_pagination() {
    // 1. Create 25 purchases
    // 2. GET /api/purchases?page=0&size=10 -> 10 items
    // 3. GET /api/purchases?page=1&size=10 -> 10 items
}
```

**測試場景 6.1.10:** 依狀態篩選購買歷史

```java
@Test
void purchaseHistory_filterByStatus() {
    // 1. Create COMPLETED and PENDING orders
    // 2. GET /api/purchases?status=PENDING -> only PENDING orders
}
```

**驗收條件:**

- [ ] 所有 E2E 測試場景通過
- [ ] 涵蓋 backend-spec.md 定義的所有場景

---

## Phase 7: Test Data

### Task 7.1: 更新 Seed Data

**檔案:** `src/main/resources/db/migration/V20251127000003__seed_purchase_data.sql`

```sql
-- Update journey prices
UPDATE journeys SET price = 1999.00 WHERE title LIKE '%軟體設計%';
UPDATE journeys SET price = 2999.00 WHERE title LIKE '%進階%';
UPDATE journeys SET price = 0.00 WHERE price IS NULL;
```

**驗收條件:**

- [ ] 測試課程有價格設定

---

### Task 7.2: 建立測試資料檔案

**檔案:** `src/test/resources/sql/test-purchase-data.sql`

```sql
-- Insert test purchase orders
INSERT INTO purchase_orders (id, user_id, journey_id, amount, payment_method, status, created_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', :userId, :journeyId, 1999.00, 'CREDIT_CARD', 'PENDING', NOW()),
    ('00000000-0000-0000-0000-000000000002', :userId, :journeyId2, 2999.00, 'BANK_TRANSFER', 'COMPLETED', NOW());
```

**驗收條件:**

- [ ] 測試資料可用於 integration tests

---

## Phase 8: Journey API Enhancement

### Task 8.1: 更新 JourneyListResponse DTO 加入定價欄位

**檔案:** `src/main/java/com/waterball/course/dto/response/JourneyListResponse.java`

新增欄位：

```java
private Integer price;
private String currency;
private Integer originalPrice;
private Integer discountPercentage;
```

**驗收條件:**

- [ ] JourneyListResponse 包含 price, currency, originalPrice, discountPercentage 欄位

---

### Task 8.2: 更新 JourneyDetailResponse DTO 加入定價欄位

**檔案:** `src/main/java/com/waterball/course/dto/response/JourneyDetailResponse.java`

新增欄位：

```java
private Integer price;
private String currency;
private Integer originalPrice;
private Integer discountPercentage;
```

**驗收條件:**

- [ ] JourneyDetailResponse 包含 price, currency, originalPrice, discountPercentage 欄位

---

### Task 8.3: 更新 JourneyService 設定定價資訊

**檔案:** `src/main/java/com/waterball/course/service/course/JourneyService.java`

更新 `toJourneyListResponse` 和 `toJourneyDetailResponse` 方法，從 Journey entity 取得 price 並設定到 response 中。

**驗收條件:**

- [ ] getPublishedJourneys 回傳的每個 journey 包含 pricing 資訊
- [ ] getJourneyDetail 回傳的 journey 包含 pricing 資訊
- [ ] currency 預設為 "TWD"

---

## Summary Checklist

### Phase 1: Database & Entity (7 tasks)

- [x] Task 1.1: Flyway Migration - purchase_orders
- [x] Task 1.2: Flyway Migration - add price to journeys
- [x] Task 1.3: PurchaseStatus Enum
- [x] Task 1.4: PaymentMethod Enum
- [x] Task 1.5: PurchaseOrder Entity
- [x] Task 1.6: Update Journey Entity
- [x] Task 1.7: PurchaseOrderRepository

### Phase 2: Service Layer (4 tasks)

- [x] Task 2.1: PaymentDetails classes
- [x] Task 2.2: PaymentResult class
- [x] Task 2.3: MockPaymentService
- [x] Task 2.4: PurchaseService

### Phase 3: DTOs (2 tasks)

- [x] Task 3.1: Request DTOs
- [x] Task 3.2: Response DTOs

### Phase 4: Controller (4 tasks)

- [x] Task 4.1: PurchaseController
- [x] Task 4.2: SecurityConfig update
- [x] Task 4.3: Business Exceptions
- [x] Task 4.4: GlobalExceptionHandler update

### Phase 5: Integration Tests (3 tasks)

- [x] Task 5.1: PurchaseControllerTest
- [x] Task 5.2: MockPaymentServiceTest
- [x] Task 5.3: PurchaseServiceTest

### Phase 6: E2E Tests (1 task)

- [x] Task 6.1: PurchaseE2ETest (10 scenarios)

### Phase 7: Test Data (2 tasks)

- [x] Task 7.1: Seed Data update
- [x] Task 7.2: Test data files

**Total: 23 tasks**
