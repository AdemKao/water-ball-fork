# Frontend Tasks: Course Purchase Flow

## Overview

實作課程購買流程介面，支援選擇付款方式、確認訂單、完成購買，並顯示待完成購買提示。

---

## Phase 1: Types Definition

### Task 1.1: 建立 types/purchase.ts

**檔案**: `src/types/purchase.ts`

```typescript
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER';
export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Purchase {
  id: string;
  journeyId: string;
  journeyTitle: string;
  journeyThumbnailUrl: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface PendingPurchase {
  id: string;
  journeyId: string;
  journeyTitle: string;
  journeyThumbnailUrl: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  expiresAt: string;
}

export interface CreatePurchaseRequest {
  journeyId: string;
  paymentMethod: PaymentMethod;
}

export interface CreatePurchaseResponse {
  purchaseId: string;
  amount: number;
  currency: string;
}

export interface CreditCardPaymentDetails {
  type: 'CREDIT_CARD';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface BankTransferPaymentDetails {
  type: 'BANK_TRANSFER';
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface JourneyPricing {
  journeyId: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}
```

**驗收條件**:

- [ ] PaymentMethod 和 PurchaseStatus 型別定義
- [ ] Purchase, PendingPurchase 介面
- [ ] CreatePurchaseRequest/Response 介面
- [ ] PaymentDetails 介面 (CreditCard, BankTransfer)
- [ ] JourneyPricing 介面

---

### Task 1.2: 更新 types/index.ts

**檔案**: `src/types/index.ts`

新增:

```typescript
export * from './purchase';
```

**驗收條件**:

- [ ] 匯出 purchase.ts 的所有型別

---

## Phase 2: Services

### Task 2.1: 建立 services/purchase.service.ts

**檔案**: `src/services/purchase.service.ts`

```typescript
import {
  JourneyPricing,
  CreatePurchaseRequest,
  CreatePurchaseResponse,
  Purchase,
  PendingPurchase,
  CreditCardPaymentDetails,
  BankTransferPaymentDetails,
} from '@/types';
import { apiClient } from '@/lib/api-client';

export const purchaseService = {
  async getJourneyPricing(journeyId: string): Promise<JourneyPricing> {
    return apiClient.get(`/api/journeys/${journeyId}/pricing`);
  },

  async createPurchase(data: CreatePurchaseRequest): Promise<CreatePurchaseResponse> {
    return apiClient.post('/api/purchases', data);
  },

  async confirmPurchase(
    purchaseId: string,
    paymentDetails: CreditCardPaymentDetails | BankTransferPaymentDetails
  ): Promise<Purchase> {
    return apiClient.post(`/api/purchases/${purchaseId}/confirm`, paymentDetails);
  },

  async cancelPurchase(purchaseId: string): Promise<void> {
    return apiClient.post(`/api/purchases/${purchaseId}/cancel`);
  },

  async getPurchase(purchaseId: string): Promise<Purchase> {
    return apiClient.get(`/api/purchases/${purchaseId}`);
  },

  async getPendingPurchases(): Promise<PendingPurchase[]> {
    return apiClient.get('/api/purchases/pending');
  },

  async getPendingPurchaseByJourney(journeyId: string): Promise<PendingPurchase | null> {
    return apiClient.get(`/api/purchases/pending/journey/${journeyId}`);
  },

  async getUserPurchases(): Promise<Purchase[]> {
    return apiClient.get('/api/purchases');
  },
};
```

**驗收條件**:

- [ ] getJourneyPricing(journeyId)
- [ ] createPurchase(data)
- [ ] confirmPurchase(purchaseId, paymentDetails)
- [ ] cancelPurchase(purchaseId)
- [ ] getPurchase(purchaseId)
- [ ] getPendingPurchases()
- [ ] getPendingPurchaseByJourney(journeyId)

---

## Phase 3: Hooks

### Task 3.1: 建立 hooks/usePurchase.ts

**檔案**: `src/hooks/usePurchase.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  JourneyPricing,
  PaymentMethod,
  CreatePurchaseResponse,
  Purchase,
  CreditCardPaymentDetails,
  BankTransferPaymentDetails,
} from '@/types';
import { purchaseService } from '@/services/purchase.service';

export function usePurchase(journeyId: string) {
  const [pricing, setPricing] = useState<JourneyPricing | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!journeyId) return;
    setIsLoadingPricing(true);
    purchaseService
      .getJourneyPricing(journeyId)
      .then(setPricing)
      .catch(setError)
      .finally(() => setIsLoadingPricing(false));
  }, [journeyId]);

  const createPurchase = useCallback(
    async (paymentMethod: PaymentMethod): Promise<CreatePurchaseResponse> => {
      setIsCreating(true);
      setError(null);
      try {
        return await purchaseService.createPurchase({ journeyId, paymentMethod });
      } finally {
        setIsCreating(false);
      }
    },
    [journeyId]
  );

  const confirmPurchase = useCallback(
    async (
      purchaseId: string,
      paymentDetails: CreditCardPaymentDetails | BankTransferPaymentDetails
    ): Promise<Purchase> => {
      setIsConfirming(true);
      setError(null);
      try {
        return await purchaseService.confirmPurchase(purchaseId, paymentDetails);
      } finally {
        setIsConfirming(false);
      }
    },
    []
  );

  const cancelPurchase = useCallback(async (purchaseId: string): Promise<void> => {
    await purchaseService.cancelPurchase(purchaseId);
  }, []);

  return {
    pricing,
    isLoadingPricing,
    createPurchase,
    confirmPurchase,
    cancelPurchase,
    isCreating,
    isConfirming,
    error,
  };
}
```

**驗收條件**:

- [ ] pricing 狀態管理
- [ ] createPurchase, confirmPurchase, cancelPurchase 方法
- [ ] loading 和 error 狀態

---

### Task 3.2: 建立 hooks/usePendingPurchases.ts

**檔案**: `src/hooks/usePendingPurchases.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PendingPurchase } from '@/types';
import { purchaseService } from '@/services/purchase.service';

export function usePendingPurchases(journeyId?: string) {
  const [pendingPurchases, setPendingPurchases] = useState<PendingPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (journeyId) {
        const pending = await purchaseService.getPendingPurchaseByJourney(journeyId);
        setPendingPurchases(pending ? [pending] : []);
      } else {
        const pending = await purchaseService.getPendingPurchases();
        setPendingPurchases(pending);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return { pendingPurchases, isLoading, error, refetch: fetchPending };
}
```

**驗收條件**:

- [ ] 取得待完成購買列表
- [ ] 支援 journeyId 過濾

---

### Task 3.3: 建立 hooks/usePayment.ts

**檔案**: `src/hooks/usePayment.ts`

```typescript
'use client';

import { useCallback } from 'react';

export function usePayment() {
  const validateCreditCard = useCallback((cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleaned)) return false;
    // Luhn algorithm
    let sum = 0;
    for (let i = 0; i < 16; i++) {
      let digit = parseInt(cleaned[i], 10);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  }, []);

  const formatCardNumber = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }, []);

  const formatExpiryDate = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  }, []);

  const isExpired = useCallback((expiryDate: string): boolean => {
    const [month, year] = expiryDate.split('/').map(Number);
    if (!month || !year) return true;
    const now = new Date();
    const expiry = new Date(2000 + year, month - 1);
    return expiry < now;
  }, []);

  return { validateCreditCard, formatCardNumber, formatExpiryDate, isExpired };
}
```

**驗收條件**:

- [ ] validateCreditCard 驗證
- [ ] formatCardNumber, formatExpiryDate 格式化
- [ ] isExpired 檢查

---

## Phase 4: Components

### Task 4.1: 建立 components/purchase/PurchaseButton.tsx

**檔案**: `src/components/purchase/PurchaseButton.tsx`

**Props**:

```typescript
interface PurchaseButtonProps {
  journeyId: string;
  price: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}
```

**行為**:

- 顯示價格與購買按鈕
- 點擊後檢查登入狀態
- 未登入導向登入頁，記錄 redirect URL
- 已登入導向購買頁面

**驗收條件**:

- [ ] 顯示格式化價格
- [ ] 登入檢查
- [ ] 正確導航

---

### Task 4.2: 建立 components/purchase/PaymentMethodSelector.tsx

**檔案**: `src/components/purchase/PaymentMethodSelector.tsx`

**Props**:

```typescript
interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}
```

**顯示選項**:

- 信用卡付款 (CREDIT_CARD) - 支援 Visa, MasterCard, JCB
- 銀行轉帳 (BANK_TRANSFER) - ATM 轉帳或網路銀行

**驗收條件**:

- [ ] 兩種付款方式選項
- [ ] 選中狀態樣式
- [ ] disabled 狀態

---

### Task 4.3: 建立 components/purchase/PurchaseSummary.tsx

**檔案**: `src/components/purchase/PurchaseSummary.tsx`

**Props**:

```typescript
interface PurchaseSummaryProps {
  journey: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    chapterCount: number;
    lessonCount: number;
  };
  pricing: JourneyPricing;
  paymentMethod?: PaymentMethod;
}
```

**顯示內容**:

- 課程縮圖、標題
- 章節數、課程數
- 原價、折扣金額、最終價格
- 選擇的付款方式

**驗收條件**:

- [ ] 課程資訊顯示
- [ ] 價格計算正確
- [ ] 折扣顯示

---

### Task 4.4: 建立 components/purchase/PendingPurchaseBanner.tsx

**檔案**: `src/components/purchase/PendingPurchaseBanner.tsx`

**Props**:

```typescript
interface PendingPurchaseBannerProps {
  purchase: PendingPurchase;
  onContinue: () => void;
  onCancel: () => void;
}
```

**顯示內容**:

- 提示文字：「您有一筆未完成的購買」
- 購買金額、到期時間倒數
- 「繼續購買」和「取消」按鈕

**驗收條件**:

- [ ] 固定於頁面底部
- [ ] 倒數計時顯示
- [ ] 按鈕事件處理

---

### Task 4.5: 建立 components/purchase/PaymentForm.tsx

**檔案**: `src/components/purchase/PaymentForm.tsx`

**Props**:

```typescript
interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  onSubmit: (details: CreditCardPaymentDetails | BankTransferPaymentDetails) => void;
  isSubmitting?: boolean;
  error?: string | null;
}
```

**信用卡欄位**: cardNumber, expiryDate, cvv, cardholderName
**銀行轉帳欄位**: bankCode, accountNumber, accountName

**驗證規則**:

- 信用卡號：16 位數字，Luhn 驗證
- 到期日：MM/YY 格式，不可過期
- CVV：3 位數字
- 銀行帳號：至少 10 位數字

**驗收條件**:

- [ ] 根據 paymentMethod 顯示對應表單
- [ ] 即時驗證
- [ ] 錯誤訊息顯示

---

### Task 4.6: 建立 components/purchase/PurchaseSuccess.tsx

**檔案**: `src/components/purchase/PurchaseSuccess.tsx`

**Props**:

```typescript
interface PurchaseSuccessProps {
  purchase: Purchase;
  journey: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  };
}
```

**顯示內容**:

- 成功圖示與動畫
- 恭喜訊息、購買明細
- 「開始學習」和「返回課程列表」按鈕

**驗收條件**:

- [ ] 成功動畫
- [ ] 購買資訊顯示
- [ ] 導航按鈕

---

### Task 4.7: 建立 components/purchase/index.ts

**檔案**: `src/components/purchase/index.ts`

```typescript
export * from './PurchaseButton';
export * from './PaymentMethodSelector';
export * from './PurchaseSummary';
export * from './PendingPurchaseBanner';
export * from './PaymentForm';
export * from './PurchaseSuccess';
```

**驗收條件**:

- [ ] 所有元件正確匯出

---

## Phase 5: Pages

### Task 5.1: 建立 courses/[courseId]/purchase/page.tsx

**檔案**: `src/app/courses/[courseId]/purchase/page.tsx`

**State**:

```typescript
interface PurchasePageState {
  step: 'select-method' | 'payment-form';
  selectedMethod: PaymentMethod | null;
  purchaseId: string | null;
}
```

**步驟 1 - 選擇付款方式**:

- 顯示 PurchaseSummary
- 顯示 PaymentMethodSelector
- 「下一步」按鈕

**步驟 2 - 填寫付款資訊**:

- 顯示訂單摘要
- 顯示 PaymentForm
- 「返回」和「確認購買」按鈕

**驗收條件**:

- [ ] 兩步驟流程
- [ ] 狀態管理正確
- [ ] 表單提交後導向確認頁

---

### Task 5.2: 建立 courses/[courseId]/purchase/confirm/page.tsx

**檔案**: `src/app/courses/[courseId]/purchase/confirm/page.tsx`

**URL**: `/courses/[courseId]/purchase/confirm?purchaseId=xxx`

**顯示內容**:

- 訂單摘要、付款方式、金額
- 確認條款 checkbox
- 「確認付款」和「返回修改」按鈕

**行為**:

- 點擊確認付款後呼叫 confirmPurchase API
- 成功導向成功頁面
- 失敗顯示錯誤訊息

**驗收條件**:

- [ ] 從 URL 讀取 purchaseId
- [ ] 條款確認
- [ ] API 呼叫與錯誤處理

---

### Task 5.3: 建立 courses/[courseId]/purchase/success/page.tsx

**檔案**: `src/app/courses/[courseId]/purchase/success/page.tsx`

**URL**: `/courses/[courseId]/purchase/success?purchaseId=xxx`

**顯示內容**:

- PurchaseSuccess 元件
- 成功動畫、購買詳情、導航按鈕

**驗收條件**:

- [ ] 顯示購買成功資訊
- [ ] 導航到課程或課程列表

---

## Phase 6: Integration

### Task 6.1: 更新 courses/[courseId]/page.tsx - 加入 PendingPurchaseBanner

**檔案**: `src/app/courses/[courseId]/page.tsx`

**更新內容**:

- 使用 usePendingPurchases(courseId) 檢查待完成購買
- 若有待完成購買，在頁面底部顯示 PendingPurchaseBanner
- 點擊繼續導向確認頁面
- 點擊取消呼叫 cancelPurchase API

**驗收條件**:

- [ ] 檢查並顯示待完成購買
- [ ] 繼續/取消功能正常

---

### Task 6.2: 更新 components/course/JourneyCard.tsx - 加入 PurchaseButton

**檔案**: `src/components/course/JourneyCard.tsx`

**更新 Props**:

```typescript
interface JourneyCardProps {
  journey: Journey;
  progress?: JourneyProgress;
  isPurchased?: boolean;
  pricing?: JourneyPricing;
}
```

**更新內容**:

- 未購買時顯示 PurchaseButton（含價格）
- 已購買時顯示「繼續學習」或「開始學習」

**驗收條件**:

- [ ] 根據購買狀態顯示不同按鈕
- [ ] 價格正確顯示

---

## Phase 7: E2E Tests Setup & Implementation

### Task 7.0: 設定 E2E 測試環境

**檔案**:

- `playwright.config.ts`
- `vitest.config.ts`
- `src/test/setup.ts`
- `package.json` (新增測試腳本)

**安裝依賴**:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom vite-tsconfig-paths @playwright/test
npx playwright install chromium
```

**package.json scripts**:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

**驗收條件**:

- [ ] Playwright 和 Vitest 依賴已安裝
- [ ] 設定檔已建立
- [ ] 測試腳本可執行

---

### Task 7.1: 建立 e2e/purchase-credit-card.spec.ts

**檔案**: `e2e/purchase-credit-card.spec.ts`

**測試場景**: 完整購買流程（信用卡）

```typescript
import { test, expect } from '@playwright/test'

test.describe('Purchase Flow - Credit Card', () => {
  test.beforeEach(async ({ page, context }) => {
    // 模擬已登入狀態
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ])
  })

  test('completes purchase with credit card', async ({ page }) => {
    // 1. 進入課程詳情頁
    await page.goto('/courses/journey-1')
    
    // 2. 點擊購買按鈕
    await page.click('[data-testid="purchase-button"]')
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase/)
    
    // 3. 選擇信用卡付款
    await page.click('[data-testid="payment-method-CREDIT_CARD"]')
    await page.click('[data-testid="next-step-button"]')
    
    // 4. 填寫信用卡資訊
    await page.fill('[data-testid="card-number"]', '4111 1111 1111 1111')
    await page.fill('[data-testid="expiry-date"]', '12/25')
    await page.fill('[data-testid="cvv"]', '123')
    await page.fill('[data-testid="cardholder-name"]', 'Test User')
    
    // 5. 確認購買
    await page.click('[data-testid="confirm-purchase-button"]')
    
    // 6. 驗證成功頁面
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase\/success/)
    await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible()
  })
})
```

**驗收條件**:

- [ ] 流程順利完成
- [ ] 購買狀態正確更新

---

### Task 7.2: 建立 e2e/purchase-bank-transfer.spec.ts

**檔案**: `e2e/purchase-bank-transfer.spec.ts`

**測試場景**: 完整購買流程（銀行轉帳）

```typescript
import { test, expect } from '@playwright/test'

test.describe('Purchase Flow - Bank Transfer', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ])
  })

  test('completes purchase with bank transfer', async ({ page }) => {
    await page.goto('/courses/journey-1')
    await page.click('[data-testid="purchase-button"]')
    
    // 選擇銀行轉帳
    await page.click('[data-testid="payment-method-BANK_TRANSFER"]')
    await page.click('[data-testid="next-step-button"]')
    
    // 填寫銀行資訊
    await page.fill('[data-testid="bank-code"]', '012')
    await page.fill('[data-testid="account-number"]', '1234567890123')
    await page.fill('[data-testid="account-name"]', 'Test User')
    
    await page.click('[data-testid="confirm-purchase-button"]')
    
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase\/success/)
  })
})
```

**驗收條件**:

- [ ] 流程順利完成
- [ ] 購買狀態正確更新

---

### Task 7.3: 建立 e2e/purchase-auth.spec.ts

**檔案**: `e2e/purchase-auth.spec.ts`

**測試場景**: 未登入用戶購買

```typescript
import { test, expect } from '@playwright/test'

test.describe('Purchase Flow - Authentication', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    // 未登入狀態進入課程頁
    await page.goto('/courses/journey-1')
    
    // 點擊購買按鈕
    await page.click('[data-testid="purchase-button"]')
    
    // 驗證導向登入頁，並記錄 redirect URL
    await expect(page).toHaveURL(/\/login\?redirect=/)
    expect(page.url()).toContain('redirect=%2Fcourses%2Fjourney-1%2Fpurchase')
  })
})
```

**驗收條件**:

- [ ] 正確導向登入頁
- [ ] 記錄 redirect URL

---

### Task 7.4: 建立 e2e/purchase-pending.spec.ts

**檔案**: `e2e/purchase-pending.spec.ts`

**測試場景**: 繼續未完成購買

```typescript
import { test, expect } from '@playwright/test'

test.describe('Pending Purchase', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ])
  })

  test('shows pending purchase banner and allows continue', async ({ page }) => {
    // 假設 API 回傳有待完成購買
    await page.route('**/api/purchases/pending/journey/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'purchase-1',
          journeyId: 'journey-1',
          journeyTitle: 'Test Journey',
          amount: 1990,
          currency: 'TWD',
          paymentMethod: 'CREDIT_CARD',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
      })
    })
    
    await page.goto('/courses/journey-1')
    
    // 驗證 Banner 顯示
    await expect(page.locator('[data-testid="pending-purchase-banner"]')).toBeVisible()
    
    // 點擊繼續購買
    await page.click('[data-testid="continue-purchase-button"]')
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase\/confirm/)
  })
})
```

**驗收條件**:

- [ ] Banner 正確顯示
- [ ] 繼續購買功能正常

---

### Task 7.5: 建立 e2e/purchase-cancel.spec.ts

**檔案**: `e2e/purchase-cancel.spec.ts`

**測試場景**: 取消待完成購買

```typescript
import { test, expect } from '@playwright/test'

test.describe('Cancel Pending Purchase', () => {
  test('cancels pending purchase and allows new purchase', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ])
    
    let cancelCalled = false
    await page.route('**/api/purchases/*/cancel', async route => {
      cancelCalled = true
      await route.fulfill({ status: 200 })
    })
    
    await page.route('**/api/purchases/pending/journey/**', async route => {
      if (cancelCalled) {
        await route.fulfill({ status: 200, body: 'null' })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'purchase-1',
            journeyId: 'journey-1',
            journeyTitle: 'Test Journey',
            amount: 1990,
            currency: 'TWD',
            paymentMethod: 'CREDIT_CARD',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          })
        })
      }
    })
    
    await page.goto('/courses/journey-1')
    
    // 點擊取消
    await page.click('[data-testid="cancel-purchase-button"]')
    
    // 驗證 Banner 消失
    await expect(page.locator('[data-testid="pending-purchase-banner"]')).not.toBeVisible()
    
    // 驗證可重新購買
    await expect(page.locator('[data-testid="purchase-button"]')).toBeVisible()
  })
})
```

**驗收條件**:

- [ ] 取消功能正常
- [ ] 可重新發起購買

---

### Task 7.6: 建立 e2e/purchase-already-purchased.spec.ts

**檔案**: `e2e/purchase-already-purchased.spec.ts`

**測試場景**: 已購買課程無法重複購買

```typescript
import { test, expect } from '@playwright/test'

test.describe('Already Purchased Course', () => {
  test('shows learn button instead of purchase button for purchased course', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ])
    
    // 模擬已購買的課程
    await page.route('**/api/journeys/journey-1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'journey-1',
          title: 'Test Journey',
          isPurchased: true,
          // ... other fields
        })
      })
    })
    
    await page.goto('/courses/journey-1')
    
    // 驗證不顯示購買按鈕
    await expect(page.locator('[data-testid="purchase-button"]')).not.toBeVisible()
    
    // 驗證顯示學習按鈕
    await expect(page.locator('[data-testid="start-learning-button"], [data-testid="continue-learning-button"]')).toBeVisible()
  })
})
```

**驗收條件**:

- [ ] 購買按鈕不顯示
- [ ] 學習按鈕正確顯示

---

### Task 7.7: 建立 e2e/payment-validation.spec.ts

**檔案**: `e2e/payment-validation.spec.ts`

**測試場景**: 付款驗證

```typescript
import { test, expect } from '@playwright/test'

test.describe('Payment Validation', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ])
    
    await page.goto('/courses/journey-1/purchase')
    await page.click('[data-testid="payment-method-CREDIT_CARD"]')
    await page.click('[data-testid="next-step-button"]')
  })

  test('shows error for invalid card number', async ({ page }) => {
    await page.fill('[data-testid="card-number"]', '1234 5678 9012 3456')
    await page.fill('[data-testid="cardholder-name"]', 'Test')
    
    await expect(page.locator('[data-testid="card-number-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-number-error"]')).toContainText('無效的信用卡號')
  })

  test('shows error for expired date', async ({ page }) => {
    await page.fill('[data-testid="expiry-date"]', '01/20')
    
    await expect(page.locator('[data-testid="expiry-date-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="expiry-date-error"]')).toContainText('已過期')
  })

  test('enables submit with valid info', async ({ page }) => {
    await page.fill('[data-testid="card-number"]', '4111 1111 1111 1111')
    await page.fill('[data-testid="expiry-date"]', '12/25')
    await page.fill('[data-testid="cvv"]', '123')
    await page.fill('[data-testid="cardholder-name"]', 'Test User')
    
    await expect(page.locator('[data-testid="confirm-purchase-button"]')).toBeEnabled()
  })
})
```

**驗收條件**:

- [ ] 即時驗證功能正常
- [ ] 錯誤訊息清楚

---

### Task 7.8: 建立 e2e/purchase-expiration.spec.ts

**檔案**: `e2e/purchase-expiration.spec.ts`

**測試場景**: 購買過期處理

```typescript
import { test, expect } from '@playwright/test'

test.describe('Purchase Expiration', () => {
  test('handles expired purchase and allows new purchase', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ])
    
    // 模擬已過期的待完成購買
    await page.route('**/api/purchases/pending/journey/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'purchase-1',
          journeyId: 'journey-1',
          journeyTitle: 'Test Journey',
          amount: 1990,
          currency: 'TWD',
          paymentMethod: 'CREDIT_CARD',
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 已過期
        })
      })
    })
    
    await page.goto('/courses/journey-1')
    
    // 驗證過期 Banner 或自動清除
    // Banner 不應顯示（或顯示過期訊息）
    await expect(page.locator('[data-testid="pending-purchase-banner"]')).not.toBeVisible()
    
    // 驗證可重新購買
    await expect(page.locator('[data-testid="purchase-button"]')).toBeVisible()
  })
})
```

**驗收條件**:

- [ ] 過期購買正確處理
- [ ] 可重新購買

---

## Summary Checklist

### Types (2 tasks)

- [x] 1.1 purchase.ts
- [x] 1.2 types/index.ts

### Services (1 task)

- [x] 2.1 purchase.service.ts

### Hooks (3 tasks)

- [x] 3.1 usePurchase.ts
- [x] 3.2 usePendingPurchases.ts
- [x] 3.3 usePayment.ts

### Components (7 tasks)

- [x] 4.1 PurchaseButton.tsx
- [x] 4.2 PaymentMethodSelector.tsx
- [x] 4.3 PurchaseSummary.tsx
- [x] 4.4 PendingPurchaseBanner.tsx
- [x] 4.5 PaymentForm.tsx
- [x] 4.6 PurchaseSuccess.tsx
- [x] 4.7 purchase/index.ts

### Pages (3 tasks)

- [x] 5.1 purchase/page.tsx
- [x] 5.2 purchase/confirm/page.tsx
- [x] 5.3 purchase/success/page.tsx

### Integration (2 tasks)

- [x] 6.1 courses/[courseId]/page.tsx
- [x] 6.2 JourneyCard.tsx

### E2E Tests (9 tasks)

- [x] 7.0 E2E 測試環境設定
- [x] 7.1 purchase-credit-card.spec.ts
- [x] 7.2 purchase-bank-transfer.spec.ts
- [x] 7.3 purchase-auth.spec.ts
- [x] 7.4 purchase-pending.spec.ts
- [x] 7.5 purchase-cancel.spec.ts
- [x] 7.6 purchase-already-purchased.spec.ts
- [x] 7.7 payment-validation.spec.ts
- [x] 7.8 purchase-expiration.spec.ts

**Total: 27 tasks (27 completed)**
