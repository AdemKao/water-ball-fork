import { test, expect, Page } from '@playwright/test';

const TEST_COURSE_ID = 'test-journey-001';

const mockJourneyDetail = {
  id: TEST_COURSE_ID,
  title: 'Test Course',
  description: 'A test course for E2E testing',
  thumbnailUrl: null,
  chapterCount: 3,
  lessonCount: 10,
  totalDurationSeconds: 3600,
  chapters: [],
  isPurchased: false,
  price: 1990,
  currency: 'TWD',
};

const mockCreatePurchaseResponse = {
  purchaseId: 'purchase-001',
  amount: 1990,
  currency: 'TWD',
};

const mockPaymentResultResponse = {
  purchaseId: 'purchase-001',
  status: 'COMPLETED',
  message: 'Payment successful',
  completedAt: new Date().toISOString(),
  failureReason: null,
};

const mockPurchaseResponse = {
  id: 'purchase-001',
  journeyId: TEST_COURSE_ID,
  userId: 'user-001',
  amount: 1990,
  currency: 'TWD',
  paymentMethod: 'CREDIT_CARD',
  status: 'COMPLETED',
  createdAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  expiresAt: null,
  failureReason: null,
};

async function setupMockAuth(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: 'auth_token',
      value: 'mock-jwt-token',
      domain: 'localhost',
      path: '/',
    },
  ]);
}

async function setupApiMocks(page: Page): Promise<void> {
  await page.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-001',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
      }),
    });
  });

  await page.route(`**/api/journeys/${TEST_COURSE_ID}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockJourneyDetail),
    });
  });

  await page.route('**/api/purchases', (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockCreatePurchaseResponse),
      });
    } else {
      route.continue();
    }
  });

  await page.route('**/api/purchases/*/pay', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPaymentResultResponse),
    });
  });

  await page.route(`**/api/purchases/pending/journey/${TEST_COURSE_ID}`, (route) => {
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'No pending purchase' }),
    });
  });

  await page.route('**/api/purchases/purchase-001', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPurchaseResponse),
      });
    } else {
      route.continue();
    }
  });
}

test.describe('Purchase Flow - Credit Card', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupApiMocks(page);
  });

  test('should complete purchase with credit card', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}`);

    await page.getByTestId('purchase-button').click();

    await page.getByTestId('payment-method-CREDIT_CARD').click();
    await page.getByTestId('next-step-button').click();

    await page.getByTestId('card-number').fill('4111111111111111');
    await page.getByTestId('expiry-date').fill('12/25');
    await page.getByTestId('cvv').fill('123');
    await page.getByTestId('cardholder-name').fill('Test User');

    await page.getByTestId('confirm-purchase-button').click();

    await expect(page.getByTestId('purchase-success')).toBeVisible();
  });

  test('should show validation errors for empty credit card fields', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}`);

    await page.getByTestId('purchase-button').click();

    await page.getByTestId('payment-method-CREDIT_CARD').click();
    await page.getByTestId('next-step-button').click();

    await page.getByTestId('confirm-purchase-button').click();

    await expect(page.getByTestId('card-number-error')).toBeVisible();
  });

  test('should allow going back to payment method selection', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}`);

    await page.getByTestId('purchase-button').click();

    await page.getByTestId('payment-method-CREDIT_CARD').click();
    await page.getByTestId('next-step-button').click();

    await expect(page.getByTestId('card-number')).toBeVisible();

    await page.getByRole('button', { name: /返回/ }).click();

    await expect(page.getByTestId('payment-method-CREDIT_CARD')).toBeVisible();
  });
});
