# Backend E2E Test Report - Purchase Flow

## Test Execution Summary

- **Date**: 2025-11-28
- **Total Tests**: 94
- **Passed**: 94
- **Failed**: 0
- **Skipped**: 0
- **Build Status**: SUCCESS

---

## Purchase E2E Test Scenarios

### PurchaseE2ETest

| Scenario | Test Name | Status | Description |
|----------|-----------|--------|-------------|
| 6.1.1 | `CompletePurchaseFlowCreditCard.completePurchaseFlow_withCreditCard_success` | PASSED | Complete purchase flow with credit card via webhook |
| 6.1.2 | `PaymentFailureInsufficientFunds.purchaseFlow_withInsufficientFunds_shouldFail` | PASSED | Payment failure handling with insufficient funds |
| 6.1.3 | `ResumePendingPurchase.resumePendingPurchase` | PASSED | Resume existing pending purchase returns HTTP 200 |
| 6.1.4 | `AlreadyPurchasedCourse.alreadyPurchased_shouldReturn409` | PASSED | Already purchased course returns 409 Conflict |
| 6.1.5 | `CancelPendingOrder.cancelPendingOrder` | PASSED | Cancel pending order sets status to CANCELLED |
| 6.1.6 | `CannotCancelCompletedOrder.cannotCancelCompletedOrder` | PASSED | Cannot cancel completed order returns 400 |
| 6.1.7 | `CannotPayCancelledOrder.cannotPayCancelledOrder` | PASSED | Cancelled orders cannot be processed |
| 6.1.8 | `AccessControlAfterPurchase.accessControl_afterPurchase` | PASSED | Lesson access granted after successful purchase |
| 6.1.9 | `PurchaseHistoryPagination.purchaseHistory_pagination` | PASSED | Purchase history pagination works correctly |
| 6.1.10 | `FilterPurchaseHistoryByStatus.purchaseHistory_filterByStatus` | PASSED | Filter purchase history by status |

---

## Architecture Validation

### Redirect-Based Payment Flow

The E2E tests validate the **redirect-based mock gateway flow**:

```
1. POST /api/purchases
   - Creates PurchaseOrder with PENDING status
   - Creates CheckoutSession via MockPaymentGatewayService
   - Returns checkoutUrl for redirect

2. User redirected to Mock Gateway
   - MockPaymentGatewayService.processPayment() called
   - Sends webhook to backend

3. POST /api/webhooks/payment
   - PaymentWebhookController receives webhook
   - PaymentWebhookService updates order status
   - Creates UserPurchase on SUCCESS

4. User redirected back to frontend callback
   - Frontend polls purchase status
   - Shows success/failure based on status
```

### Key Components Tested

| Component | Responsibility | Coverage |
|-----------|---------------|----------|
| `PurchaseController` | API endpoints for purchase CRUD | Full |
| `PurchaseService` | Business logic for purchases | Full |
| `PaymentWebhookController` | Webhook handling | Full |
| `PaymentWebhookService` | Order status updates | Full |
| `MockPaymentGatewayService` | Checkout session management | Full |

---

## HTTP Status Code Validation

| Endpoint | Action | Expected Status | Validated |
|----------|--------|-----------------|-----------|
| `POST /api/purchases` | Create new order | 201 Created | Yes |
| `POST /api/purchases` | Resume pending order | 200 OK | Yes |
| `POST /api/purchases` | Already purchased | 409 Conflict | Yes |
| `POST /api/purchases` | Invalid journey | 404 Not Found | Yes |
| `GET /api/purchases/{id}` | Get order | 200 OK | Yes |
| `DELETE /api/purchases/{id}` | Cancel order | 204 No Content | Yes |
| `DELETE /api/purchases/{id}` | Cancel non-pending | 400 Bad Request | Yes |
| `POST /api/webhooks/payment` | Payment success | 200 OK | Yes |
| `POST /api/webhooks/payment` | Payment failure | 200 OK | Yes |

---

## Data Integrity Tests

### Purchase Order States

| Initial State | Action | Expected State | Tested |
|---------------|--------|----------------|--------|
| PENDING | Payment Success Webhook | COMPLETED | Yes |
| PENDING | Payment Failure Webhook | FAILED | Yes |
| PENDING | Cancel | CANCELLED | Yes |
| COMPLETED | Cancel | Error (400) | Yes |
| CANCELLED | Pay | N/A (Order invalid) | Yes |

### Access Control

| Condition | Lesson Access | Tested |
|-----------|---------------|--------|
| Before purchase | 403 Forbidden | Yes |
| After successful purchase | 200 OK | Yes |

---

## Test Data Files

| File | Purpose |
|------|---------|
| `/sql/test-data-cleanup.sql` | Clean up test data before each test |
| `/sql/test-journey-data.sql` | Set up journey/chapter/lesson data |
| `/sql/test-purchase-data.sql` | Set up existing purchase records |
| `/sql/test-pagination-data.sql` | Set up 25 purchase records for pagination tests |

---

## Recent Fixes Applied

### Issue: Resume Pending Purchase Returning 201 Instead of 200

**Problem**: When creating a purchase with an existing pending order, the API returned 201 (Created) instead of 200 (OK).

**Root Cause**: The controller logic checked `status == PENDING && checkoutUrl != null` to determine HTTP status, which was true for both new and resumed orders.

**Solution**:
1. Added `resumed` field to `PurchaseOrderResponse` DTO
2. Updated `PurchaseService.toResponseWithCheckoutUrl()` to accept a `resumed` parameter
3. Set `resumed=true` when returning existing pending order
4. Controller now uses `response.isResumed()` to determine HTTP 200 vs 201

**Files Modified**:
- `PurchaseOrderResponse.java` - Added `resumed` field
- `PurchaseService.java` - Added overloaded method with resumed parameter
- `PurchaseController.java` - Updated status logic

---

## Conclusion

All 94 backend tests pass successfully. The purchase flow implementation correctly handles:

- Complete purchase lifecycle (create, pay, complete)
- Payment failures and error handling
- Resume pending purchases
- Order cancellation
- Access control after purchase
- Purchase history pagination and filtering
- Webhook-based payment confirmation

The architecture follows the redirect-based mock gateway pattern as specified, with proper separation between:
- `PurchaseController` (user-facing API)
- `PaymentWebhookController` (gateway callbacks)
- `MockPaymentGatewayService` (payment gateway simulation)
