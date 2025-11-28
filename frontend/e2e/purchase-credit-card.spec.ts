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
  id: 'purchase-001',
  journeyId: TEST_COURSE_ID,
  journeyTitle: 'Test Course',
  amount: 1990,
  currency: 'TWD',
  paymentMethod: 'CREDIT_CARD',
  status: 'PENDING',
  checkoutUrl: 'https://mock-gateway.example.com/checkout/session-123',
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
};

const mockPurchaseCompleted = {
  id: 'purchase-001',
  journeyId: TEST_COURSE_ID,
  journeyTitle: 'Test Course',
  journeyThumbnailUrl: null,
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

  await page.route(`**/api/journeys/${TEST_COURSE_ID}/pricing`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        journeyId: TEST_COURSE_ID,
        price: 1990,
        currency: 'TWD',
      }),
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
        body: JSON.stringify(mockPurchaseCompleted),
      });
    } else {
      route.continue();
    }
  });
}

test.describe('Purchase Flow - Credit Card (Redirect)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupApiMocks(page);
  });

  test('should navigate to purchase page and select credit card', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}`);

    await page.getByTestId('purchase-button').click();

    await expect(page).toHaveURL(new RegExp(`/courses/${TEST_COURSE_ID}/purchase`));

    await expect(page.getByTestId('payment-method-CREDIT_CARD')).toBeVisible();
    await expect(page.getByTestId('payment-method-BANK_TRANSFER')).toBeVisible();

    await page.getByTestId('payment-method-CREDIT_CARD').click();

    await expect(page.getByTestId('proceed-to-payment-button')).toBeEnabled();
  });

  test('should display course summary on purchase page', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}/purchase`);

    await expect(page.getByText('Test Course')).toBeVisible();
    await expect(page.getByText(/1,990|NT\$1,990/)).toBeVisible();
  });

  test('should handle callback with success status and redirect to success page', async ({
    page,
  }) => {
    await page.goto(
      `/courses/${TEST_COURSE_ID}/purchase/callback?purchaseId=purchase-001&status=success`
    );

    await expect(page.getByTestId('purchase-success')).toBeVisible({ timeout: 15000 });
  });
});
