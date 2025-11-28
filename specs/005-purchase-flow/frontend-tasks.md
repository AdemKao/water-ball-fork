# Frontend Tasks: Course Purchase Flow (Redirect-based)

## Overview

實作課程購買流程介面，採用**重導向式付款流程**。用戶選擇付款方式後，將被重導向至 Mock Payment Gateway 完成付款，付款完成後再重導回前端顯示結果。

---

## Phase 1: Types Definition

### Task 1.1: 建立 types/purchase.ts

**檔案**: `src/types/purchase.ts`

```typescript
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER';

export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export interface Purchase {
  id: string;
  journeyId: string;
  journeyTitle: string;
  journeyThumbnailUrl: string | null;
  journeyDescription?: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  checkoutUrl?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string | null;
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
  status: 'PENDING';
  checkoutUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreatePurchaseRequest {
  journeyId: string;
  paymentMethod: PaymentMethod;
}

export interface CreatePurchaseResponse {
  id: string;
  journeyId: string;
  journeyTitle: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  checkoutUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType;
}

export interface JourneyPricing {
  journeyId: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
}

export interface PurchaseCallbackParams {
  purchaseId: string;
  status: 'success' | 'cancel';
  error?: string;
}
```

**驗收條件**:

- [ ] PaymentMethod 型別定義
- [ ] PurchaseStatus 型別定義 (含 EXPIRED)
- [ ] Purchase 介面 (含 checkoutUrl, failureReason, expiresAt)
- [ ] PendingPurchase 介面 (含 checkoutUrl)
- [ ] CreatePurchaseRequest/Response 介面 (Response 含 checkoutUrl)
- [ ] JourneyPricing 介面
- [ ] PurchaseCallbackParams 介面

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
  PurchaseStatus,
} from '@/types';
import { apiClient } from '@/lib/api-client';

export const purchaseService = {
  async getJourneyPricing(journeyId: string): Promise<JourneyPricing> {
    return apiClient.get(`/api/journeys/${journeyId}/pricing`);
  },

  async createPurchase(data: CreatePurchaseRequest): Promise<CreatePurchaseResponse> {
    return apiClient.post('/api/purchases', data);
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

  async getUserPurchases(params?: { 
    status?: PurchaseStatus; 
    page?: number; 
    size?: number 
  }): Promise<{
    content: Purchase[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());
    const query = searchParams.toString();
    return apiClient.get(`/api/purchases${query ? `?${query}` : ''}`);
  },
};
```

**驗收條件**:

- [ ] getJourneyPricing(journeyId)
- [ ] createPurchase(data) - 回傳含 checkoutUrl
- [ ] cancelPurchase(purchaseId)
- [ ] getPurchase(purchaseId)
- [ ] getPendingPurchases()
- [ ] getPendingPurchaseByJourney(journeyId)
- [ ] getUserPurchases(params) - 支援分頁

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
} from '@/types';
import { purchaseService } from '@/services/purchase.service';

export function usePurchase(journeyId: string) {
  const [pricing, setPricing] = useState<JourneyPricing | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
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

  const cancelPurchase = useCallback(async (purchaseId: string): Promise<void> => {
    setIsCancelling(true);
    setError(null);
    try {
      await purchaseService.cancelPurchase(purchaseId);
    } finally {
      setIsCancelling(false);
    }
  }, []);

  return {
    pricing,
    isLoadingPricing,
    createPurchase,
    cancelPurchase,
    isCreating,
    isCancelling,
    error,
  };
}
```

**驗收條件**:

- [ ] pricing 狀態管理
- [ ] createPurchase 方法 - 回傳含 checkoutUrl
- [ ] cancelPurchase 方法
- [ ] isCreating, isCancelling loading 狀態
- [ ] error 狀態

---

### Task 3.2: 建立 hooks/usePendingPurchases.ts

**檔案**: `src/hooks/usePendingPurchases.ts`

```typescript
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const pendingPurchaseForJourney = useMemo(() => {
    if (!journeyId) return null;
    return pendingPurchases.find(p => p.journeyId === journeyId) || null;
  }, [pendingPurchases, journeyId]);

  return { 
    pendingPurchases, 
    pendingPurchaseForJourney,
    isLoading, 
    error, 
    refetch: fetchPending 
  };
}
```

**驗收條件**:

- [ ] 取得待完成購買列表
- [ ] 支援 journeyId 過濾
- [ ] pendingPurchaseForJourney 便利屬性
- [ ] refetch 方法

---

### Task 3.3: 建立 hooks/usePurchaseStatus.ts

**檔案**: `src/hooks/usePurchaseStatus.ts`

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Purchase, PurchaseStatus } from '@/types';
import { purchaseService } from '@/services/purchase.service';

interface UsePurchaseStatusOptions {
  purchaseId: string;
  enabled?: boolean;
  pollingInterval?: number;
  maxPollingAttempts?: number;
  onStatusChange?: (status: PurchaseStatus) => void;
}

const TERMINAL_STATUSES: PurchaseStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'];

export function usePurchaseStatus(options: UsePurchaseStatusOptions) {
  const { 
    purchaseId, 
    enabled = true, 
    pollingInterval = 2000,
    maxPollingAttempts = 30,
    onStatusChange 
  } = options;
  
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [status, setStatus] = useState<PurchaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await purchaseService.getPurchase(purchaseId);
      setPurchase(data);
      setStatus(data.status);
      
      if (onStatusChange && data.status !== status) {
        onStatusChange(data.status);
      }
      
      if (TERMINAL_STATUSES.includes(data.status)) {
        stopPolling();
      }
      
      attemptRef.current++;
      if (attemptRef.current >= maxPollingAttempts) {
        stopPolling();
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch purchase status'));
      stopPolling();
      throw err;
    }
  }, [purchaseId, status, maxPollingAttempts, onStatusChange, stopPolling]);

  useEffect(() => {
    if (!enabled || !purchaseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    attemptRef.current = 0;
    
    fetchStatus()
      .then((data) => {
        setIsLoading(false);
        if (!TERMINAL_STATUSES.includes(data.status)) {
          setIsPolling(true);
          pollingRef.current = setInterval(fetchStatus, pollingInterval);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });

    return () => {
      stopPolling();
    };
  }, [enabled, purchaseId, pollingInterval, fetchStatus, stopPolling]);

  return {
    purchase,
    status,
    isLoading,
    isPolling,
    error,
    stopPolling,
  };
}
```

**驗收條件**:

- [ ] 自動輪詢訂單狀態
- [ ] 預設輪詢間隔 2 秒
- [ ] 最大輪詢次數 30 次（1 分鐘）
- [ ] 狀態變為終態時停止輪詢 (COMPLETED, FAILED, CANCELLED, EXPIRED)
- [ ] onStatusChange callback 支援
- [ ] 手動 stopPolling 方法
- [ ] isPolling 狀態

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
- 已登入導向購買頁面 `/courses/[courseId]/purchase`

**驗收條件**:

- [ ] 顯示格式化價格
- [ ] 登入檢查
- [ ] 正確導航到購買頁面

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
  isCancelling?: boolean;
}
```

**顯示內容**:

- 提示文字：「您有一筆未完成的購買」
- 購買金額、到期時間倒數
- 「繼續付款」按鈕 → 重導向至 checkoutUrl
- 「取消」按鈕 → 呼叫取消 API

**行為**:

- 固定於頁面底部
- 點擊繼續直接重導向至 Mock Gateway (`window.location.href = purchase.checkoutUrl`)
- 點擊取消呼叫取消 API，成功後 Banner 消失

**驗收條件**:

- [ ] 固定於頁面底部
- [ ] 倒數計時顯示
- [ ] 繼續按鈕重導向至 checkoutUrl
- [ ] 取消按鈕事件處理
- [ ] isCancelling loading 狀態

---

### Task 4.5: 建立 components/purchase/PurchaseSuccess.tsx

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
- 恭喜訊息、購買明細（金額、付款方式、完成時間）
- 「開始學習」按鈕
- 「返回課程列表」按鈕

**驗收條件**:

- [ ] 成功動畫
- [ ] 購買資訊顯示
- [ ] 導航按鈕

---

### Task 4.6: 建立 components/purchase/PurchaseStatus.tsx

**檔案**: `src/components/purchase/PurchaseStatus.tsx`

**Props**:

```typescript
interface PurchaseStatusProps {
  status: PurchaseStatus;
  failureReason?: string | null;
  onRetry?: () => void;
  onBackToCourse?: () => void;
}
```

**根據狀態顯示**:

- `PENDING` - 處理中動畫 + 「正在確認付款結果...」
- `COMPLETED` - 成功圖示
- `FAILED` - 失敗訊息 + 重試按鈕
- `CANCELLED` - 取消訊息
- `EXPIRED` - 過期訊息 + 重新購買按鈕

**驗收條件**:

- [ ] 各狀態正確顯示
- [ ] PENDING 顯示 loading 動畫
- [ ] FAILED 顯示 failureReason
- [ ] 重試/返回按鈕事件

---

### Task 4.7: 建立 components/purchase/index.ts

**檔案**: `src/components/purchase/index.ts`

```typescript
export * from './PurchaseButton';
export * from './PaymentMethodSelector';
export * from './PurchaseSummary';
export * from './PendingPurchaseBanner';
export * from './PurchaseSuccess';
export * from './PurchaseStatus';
```

**驗收條件**:

- [ ] 所有元件正確匯出

---

## Phase 5: Pages

### Task 5.1: 建立 courses/[courseId]/purchase/page.tsx

**檔案**: `src/app/courses/[courseId]/purchase/page.tsx`

**URL**: `/courses/[courseId]/purchase`

**功能**:

1. 顯示課程資訊與價格
2. 選擇付款方式
3. 建立訂單並重導向至 Gateway

**State**:

```typescript
interface PurchasePageState {
  selectedMethod: PaymentMethod | null;
  isCreating: boolean;
  error: string | null;
}
```

**流程**:

1. 載入課程資訊與價格
2. 檢查是否有待完成購買
   - 有：顯示 Banner，點擊可直接前往 Gateway
   - 無：顯示付款方式選擇
3. 用戶選擇付款方式
4. 點擊「前往付款」
5. 呼叫 `createPurchase` API
6. 取得 `checkoutUrl`
7. `window.location.href = checkoutUrl` 重導向至 Mock Gateway

**驗收條件**:

- [ ] 顯示 PurchaseSummary
- [ ] 顯示 PaymentMethodSelector
- [ ] 待完成購買時顯示 PendingPurchaseBanner
- [ ] 點擊「前往付款」建立訂單
- [ ] 成功後重導向至 checkoutUrl

---

### Task 5.2: 建立 courses/[courseId]/purchase/callback/page.tsx

**檔案**: `src/app/courses/[courseId]/purchase/callback/page.tsx`

**URL**: `/courses/[courseId]/purchase/callback?purchaseId=xxx&status=success|cancel&error=xxx`

**功能**:

1. 接收 Gateway 回調
2. 解析 URL 參數 (PurchaseCallbackParams)
3. 根據 status 處理：
   - `success`: 輪詢訂單狀態，確認 COMPLETED 後導向成功頁
   - `cancel`: 顯示取消/錯誤訊息，提供重試選項

**流程 (success)**:

```typescript
if (status === 'success') {
  // 使用 usePurchaseStatus 開始輪詢
  // 等待 Webhook 處理完成
  // 確認 COMPLETED 後導向成功頁
}
```

**流程 (cancel)**:

```typescript
if (status === 'cancel') {
  // 顯示 PurchaseStatus 元件 (CANCELLED 或 FAILED)
  // 顯示錯誤訊息 (如有)
  // 提供「重新嘗試」按鈕 → 返回購買頁面
  // 提供「返回課程」按鈕
}
```

**驗收條件**:

- [ ] 解析 URL 參數
- [ ] success 狀態使用 usePurchaseStatus 輪詢
- [ ] 輪詢時顯示 loading 狀態
- [ ] COMPLETED 後自動導向成功頁
- [ ] cancel 狀態顯示錯誤訊息
- [ ] 重試/返回按鈕功能

---

### Task 5.3: 建立 courses/[courseId]/purchase/success/page.tsx

**檔案**: `src/app/courses/[courseId]/purchase/success/page.tsx`

**URL**: `/courses/[courseId]/purchase/success?purchaseId=xxx`

**功能**:

1. 顯示購買成功資訊
2. 提供開始學習入口

**顯示內容**:

- PurchaseSuccess 元件
- 成功動畫、購買詳情、導航按鈕

**驗收條件**:

- [ ] 從 URL 讀取 purchaseId
- [ ] 載入購買資訊
- [ ] 顯示 PurchaseSuccess 元件
- [ ] 導航到課程或課程列表

---

## Phase 6: Integration

### Task 6.1: 更新 courses/[courseId]/page.tsx - 加入 PendingPurchaseBanner

**檔案**: `src/app/courses/[courseId]/page.tsx`

**更新內容**:

- 使用 usePendingPurchases(courseId) 檢查待完成購買
- 若有待完成購買，在頁面底部顯示 PendingPurchaseBanner
- 點擊繼續：`window.location.href = pendingPurchaseForJourney.checkoutUrl`
- 點擊取消：呼叫 cancelPurchase API，成功後 refetch

```typescript
export default function CoursePage({ params }: { params: { courseId: string } }) {
  const { pendingPurchaseForJourney, refetch } = usePendingPurchases(params.courseId);
  const { cancelPurchase, isCancelling } = usePurchase(params.courseId);
  
  const handleContinue = () => {
    if (pendingPurchaseForJourney) {
      window.location.href = pendingPurchaseForJourney.checkoutUrl;
    }
  };
  
  const handleCancel = async () => {
    if (pendingPurchaseForJourney) {
      await cancelPurchase(pendingPurchaseForJourney.id);
      refetch();
    }
  };
  
  return (
    <div>
      {/* 課程內容 */}
      
      {pendingPurchaseForJourney && (
        <PendingPurchaseBanner
          purchase={pendingPurchaseForJourney}
          onContinue={handleContinue}
          onCancel={handleCancel}
          isCancelling={isCancelling}
        />
      )}
    </div>
  );
}
```

**驗收條件**:

- [ ] 檢查並顯示待完成購買
- [ ] 繼續按鈕重導向至 checkoutUrl
- [ ] 取消功能正常

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

## Phase 7: E2E Tests

### Task 7.1: 建立 e2e/purchase-credit-card.spec.ts

**檔案**: `e2e/purchase-credit-card.spec.ts`

**測試場景**: 完整購買流程（信用卡成功）

```typescript
import { test, expect } from '@playwright/test';

test.describe('Purchase Flow - Credit Card', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
  });

  test('completes purchase with credit card via redirect flow', async ({ page }) => {
    // 1. 進入課程詳情頁
    await page.goto('/courses/journey-1');
    
    // 2. 點擊購買按鈕
    await page.click('[data-testid="purchase-button"]');
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase/);
    
    // 3. 選擇信用卡付款
    await page.click('[data-testid="payment-method-CREDIT_CARD"]');
    
    // 4. 點擊「前往付款」
    await page.click('[data-testid="proceed-to-payment-button"]');
    
    // 5. 驗證重導向至 Mock Gateway (模擬)
    // 在測試中我們 mock API 回傳 checkoutUrl，然後模擬 Gateway 回調
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase\/callback\?.*status=success/);
    
    // 6. 驗證顯示「正在確認付款結果」
    await expect(page.locator('text=正在確認付款結果')).toBeVisible();
    
    // 7. 等待輪詢完成，導向成功頁面
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase\/success/, { timeout: 10000 });
    await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible();
  });
});
```

**驗收條件**:

- [ ] 選擇付款方式
- [ ] 點擊前往付款後重導向
- [ ] 回調頁面輪詢狀態
- [ ] 成功後導向成功頁面

---

### Task 7.2: 建立 e2e/purchase-bank-transfer.spec.ts

**檔案**: `e2e/purchase-bank-transfer.spec.ts`

**測試場景**: 完整購買流程（銀行轉帳成功）

```typescript
import { test, expect } from '@playwright/test';

test.describe('Purchase Flow - Bank Transfer', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
  });

  test('completes purchase with bank transfer via redirect flow', async ({ page }) => {
    await page.goto('/courses/journey-1');
    await page.click('[data-testid="purchase-button"]');
    
    // 選擇銀行轉帳
    await page.click('[data-testid="payment-method-BANK_TRANSFER"]');
    await page.click('[data-testid="proceed-to-payment-button"]');
    
    // 模擬 Gateway 回調成功
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase\/callback\?.*status=success/);
    
    // 等待成功頁面
    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase\/success/, { timeout: 10000 });
  });
});
```

**驗收條件**:

- [ ] 銀行轉帳流程正常
- [ ] 重導向與回調正確

---

### Task 7.3: 建立 e2e/purchase-auth.spec.ts

**檔案**: `e2e/purchase-auth.spec.ts`

**測試場景**: 未登入用戶購買

```typescript
import { test, expect } from '@playwright/test';

test.describe('Purchase Flow - Authentication', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    // 未登入狀態進入課程頁
    await page.goto('/courses/journey-1');
    
    // 點擊購買按鈕
    await page.click('[data-testid="purchase-button"]');
    
    // 驗證導向登入頁，並記錄 redirect URL
    await expect(page).toHaveURL(/\/login\?redirect=/);
    expect(page.url()).toContain('redirect=%2Fcourses%2Fjourney-1%2Fpurchase');
  });
});
```

**驗收條件**:

- [ ] 正確導向登入頁
- [ ] 記錄 redirect URL

---

### Task 7.4: 建立 e2e/purchase-pending.spec.ts

**檔案**: `e2e/purchase-pending.spec.ts`

**測試場景**: 繼續未完成購買

```typescript
import { test, expect } from '@playwright/test';

test.describe('Pending Purchase', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
  });

  test('shows pending purchase banner and allows continue to gateway', async ({ page }) => {
    // Mock API 回傳有待完成購買（含 checkoutUrl）
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
          status: 'PENDING',
          checkoutUrl: 'https://mock-gateway.example.com/checkout/session-123',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
      });
    });
    
    await page.goto('/courses/journey-1');
    
    // 驗證 Banner 顯示
    await expect(page.locator('[data-testid="pending-purchase-banner"]')).toBeVisible();
    await expect(page.locator('text=您有一筆未完成的購買')).toBeVisible();
    
    // 驗證繼續購買按鈕
    await expect(page.locator('[data-testid="continue-purchase-button"]')).toBeVisible();
  });
});
```

**驗收條件**:

- [ ] Banner 正確顯示
- [ ] 顯示到期時間倒數
- [ ] 繼續購買按鈕可用

---

### Task 7.5: 建立 e2e/purchase-cancel.spec.ts

**檔案**: `e2e/purchase-cancel.spec.ts`

**測試場景**: 取消待完成購買

```typescript
import { test, expect } from '@playwright/test';

test.describe('Cancel Pending Purchase', () => {
  test('cancels pending purchase and allows new purchase', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
    
    let cancelCalled = false;
    await page.route('**/api/purchases/*/cancel', async route => {
      cancelCalled = true;
      await route.fulfill({ status: 200 });
    });
    
    await page.route('**/api/purchases/pending/journey/**', async route => {
      if (cancelCalled) {
        await route.fulfill({ status: 200, body: 'null' });
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
            status: 'PENDING',
            checkoutUrl: 'https://mock-gateway.example.com/checkout/session-123',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          })
        });
      }
    });
    
    await page.goto('/courses/journey-1');
    
    // 點擊取消
    await page.click('[data-testid="cancel-purchase-button"]');
    
    // 驗證 Banner 消失
    await expect(page.locator('[data-testid="pending-purchase-banner"]')).not.toBeVisible();
    
    // 驗證可重新購買
    await expect(page.locator('[data-testid="purchase-button"]')).toBeVisible();
  });
});
```

**驗收條件**:

- [ ] 取消功能正常
- [ ] Banner 消失
- [ ] 可重新發起購買

---

### Task 7.6: 建立 e2e/purchase-already-purchased.spec.ts

**檔案**: `e2e/purchase-already-purchased.spec.ts`

**測試場景**: 已購買課程無法重複購買

```typescript
import { test, expect } from '@playwright/test';

test.describe('Already Purchased Course', () => {
  test('shows learn button instead of purchase button for purchased course', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
    
    // 模擬已購買的課程
    await page.route('**/api/journeys/journey-1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'journey-1',
          title: 'Test Journey',
          isPurchased: true,
        })
      });
    });
    
    await page.goto('/courses/journey-1');
    
    // 驗證不顯示購買按鈕
    await expect(page.locator('[data-testid="purchase-button"]')).not.toBeVisible();
    
    // 驗證顯示學習按鈕
    await expect(page.locator('[data-testid="start-learning-button"], [data-testid="continue-learning-button"]')).toBeVisible();
  });
  
  test('redirects to course page when accessing purchase page for already purchased course', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
    
    // 直接訪問購買頁面
    await page.goto('/courses/journey-1/purchase');
    
    // 驗證顯示「您已購買此課程」提示並導向
    await expect(page).toHaveURL(/\/courses\/journey-1$/);
  });
});
```

**驗收條件**:

- [ ] 購買按鈕不顯示
- [ ] 學習按鈕正確顯示
- [ ] 直接訪問購買頁面時導向課程頁

---

### Task 7.7: 建立 e2e/payment-validation.spec.ts

**檔案**: `e2e/payment-validation.spec.ts`

**測試場景**: 付款方式選擇驗證

```typescript
import { test, expect } from '@playwright/test';

test.describe('Payment Method Selection', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
    
    await page.goto('/courses/journey-1/purchase');
  });

  test('requires payment method selection before proceeding', async ({ page }) => {
    // 「前往付款」按鈕應該被禁用或顯示提示
    const proceedButton = page.locator('[data-testid="proceed-to-payment-button"]');
    await expect(proceedButton).toBeDisabled();
    
    // 選擇付款方式後按鈕啟用
    await page.click('[data-testid="payment-method-CREDIT_CARD"]');
    await expect(proceedButton).toBeEnabled();
  });

  test('shows correct payment method options', async ({ page }) => {
    await expect(page.locator('[data-testid="payment-method-CREDIT_CARD"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method-BANK_TRANSFER"]')).toBeVisible();
    
    // 驗證描述文字
    await expect(page.locator('text=支援 Visa、MasterCard、JCB')).toBeVisible();
    await expect(page.locator('text=ATM 轉帳或網路銀行')).toBeVisible();
  });
});
```

**驗收條件**:

- [ ] 未選擇付款方式時按鈕禁用
- [ ] 選擇後按鈕啟用
- [ ] 付款方式選項正確顯示

---

### Task 7.8: 建立 e2e/purchase-expiration.spec.ts

**檔案**: `e2e/purchase-expiration.spec.ts`

**測試場景**: 購買過期處理

```typescript
import { test, expect } from '@playwright/test';

test.describe('Purchase Expiration', () => {
  test('handles expired purchase and allows new purchase', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
    
    // 模擬回調頁面訂單狀態為 EXPIRED
    await page.route('**/api/purchases/*', async route => {
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
          status: 'EXPIRED',
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        })
      });
    });
    
    // 訪問回調頁面
    await page.goto('/courses/journey-1/purchase/callback?purchaseId=purchase-1&status=success');
    
    // 驗證顯示過期訊息
    await expect(page.locator('text=過期')).toBeVisible();
    
    // 驗證有重新購買選項
    await expect(page.locator('[data-testid="retry-button"], [data-testid="back-to-course-button"]')).toBeVisible();
  });
});
```

**驗收條件**:

- [ ] 過期狀態正確顯示
- [ ] 提供重新購買/返回選項

---

### Task 7.9: 建立 e2e/purchase-gateway-cancel.spec.ts

**檔案**: `e2e/purchase-gateway-cancel.spec.ts`

**測試場景**: Gateway 取消返回

```typescript
import { test, expect } from '@playwright/test';

test.describe('Gateway Cancel', () => {
  test('handles cancel callback from gateway', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
    
    // 訪問取消回調頁面
    await page.goto('/courses/journey-1/purchase/callback?purchaseId=purchase-1&status=cancel');
    
    // 驗證顯示取消訊息
    await expect(page.locator('text=購買已取消')).toBeVisible();
    
    // 驗證有重試和返回選項
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="back-to-course-button"]')).toBeVisible();
  });

  test('handles cancel callback with error message', async ({ page, context }) => {
    await context.addCookies([
      { name: 'access_token', value: 'mock-jwt-token', domain: 'localhost', path: '/' }
    ]);
    
    // 訪問取消回調頁面（含錯誤訊息）
    await page.goto('/courses/journey-1/purchase/callback?purchaseId=purchase-1&status=cancel&error=餘額不足');
    
    // 驗證顯示錯誤訊息
    await expect(page.locator('text=餘額不足')).toBeVisible();
  });
});
```

**驗收條件**:

- [ ] 取消狀態正確顯示
- [ ] 錯誤訊息正確顯示
- [ ] 重試/返回按鈕可用

---

## Summary Checklist

### Types (2 tasks)

- [x] 1.1 purchase.ts (含 PurchaseCallbackParams, checkoutUrl, EXPIRED 狀態)
- [x] 1.2 types/index.ts

### Services (1 task)

- [x] 2.1 purchase.service.ts (移除 confirmPurchase，新增分頁支援)

### Hooks (3 tasks)

- [ ] 3.1 usePurchase.ts (移除 confirmPurchase)
- [ ] 3.2 usePendingPurchases.ts (新增 pendingPurchaseForJourney)
- [ ] 3.3 usePurchaseStatus.ts (新增 - 輪詢訂單狀態)

### Components (7 tasks)

- [ ] 4.1 PurchaseButton.tsx
- [ ] 4.2 PaymentMethodSelector.tsx
- [ ] 4.3 PurchaseSummary.tsx
- [ ] 4.4 PendingPurchaseBanner.tsx (更新 - 重導向至 checkoutUrl)
- [ ] 4.5 PurchaseSuccess.tsx
- [ ] 4.6 PurchaseStatus.tsx (新增)
- [ ] 4.7 purchase/index.ts

### Pages (3 tasks)

- [ ] 5.1 purchase/page.tsx (更新 - 重導向流程)
- [ ] 5.2 purchase/callback/page.tsx (新增 - 取代 confirm)
- [ ] 5.3 purchase/success/page.tsx

### Integration (2 tasks)

- [ ] 6.1 courses/[courseId]/page.tsx (更新 - 重導向至 checkoutUrl)
- [ ] 6.2 JourneyCard.tsx

### E2E Tests (9 tasks)

- [ ] 7.1 purchase-credit-card.spec.ts (更新 - 重導向流程)
- [ ] 7.2 purchase-bank-transfer.spec.ts (更新 - 重導向流程)
- [ ] 7.3 purchase-auth.spec.ts
- [ ] 7.4 purchase-pending.spec.ts (更新 - checkoutUrl)
- [ ] 7.5 purchase-cancel.spec.ts
- [ ] 7.6 purchase-already-purchased.spec.ts
- [ ] 7.7 payment-validation.spec.ts (更新 - 付款方式選擇驗證)
- [ ] 7.8 purchase-expiration.spec.ts (更新 - EXPIRED 狀態)
- [ ] 7.9 purchase-gateway-cancel.spec.ts (新增)

**Total: 27 tasks**
