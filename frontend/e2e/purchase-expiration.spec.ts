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

const mockExpiredPurchase = {
  id: 'purchase-001',
  journeyId: TEST_COURSE_ID,
  journeyTitle: 'Test Course',
  journeyThumbnailUrl: null,
  amount: 1990,
  currency: 'TWD',
  paymentMethod: 'CREDIT_CARD',
  status: 'EXPIRED',
  createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  completedAt: null,
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

  await page.route(`**/api/purchases/pending/journey/${TEST_COURSE_ID}`, (route) => {
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'No pending purchase or expired' }),
    });
  });

  await page.route('**/api/purchases/purchase-001', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockExpiredPurchase),
    });
  });
}

test.describe('Purchase Expiration Handling', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupApiMocks(page);
  });

  test('should not show pending purchase banner for expired purchase and allow new purchase', async ({
    page,
  }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}`);

    await expect(page.getByTestId('pending-purchase-banner')).not.toBeVisible();

    await expect(page.getByTestId('purchase-button')).toBeVisible();
  });

  test('should show expired status on callback page for expired purchase', async ({ page }) => {
    await page.goto(
      `/courses/${TEST_COURSE_ID}/purchase/callback?purchaseId=purchase-001&status=success`
    );

    await expect(page.getByText(/訂單已過期|已過期|expired/i)).toBeVisible();

    const retryButton = page.getByTestId('retry-button');
    const backButton = page.getByTestId('back-to-course-button');

    const isRetryVisible = await retryButton.isVisible().catch(() => false);
    const isBackVisible = await backButton.isVisible().catch(() => false);

    expect(isRetryVisible || isBackVisible).toBe(true);
  });
});
