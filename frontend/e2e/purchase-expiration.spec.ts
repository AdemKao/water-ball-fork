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
};

function getExpiredDate(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - 30);
  return date.toISOString();
}

const mockExpiredPendingPurchase = {
  id: 'purchase-expired-001',
  journeyId: TEST_COURSE_ID,
  journeyTitle: 'Test Course',
  journeyThumbnailUrl: null,
  amount: 1990,
  currency: 'TWD',
  paymentMethod: 'CREDIT_CARD' as const,
  createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  expiresAt: getExpiredDate(),
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
  await page.route('**/api/users/me', (route) => {
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

  await page.route(`**/api/purchases/pending?journeyId=${TEST_COURSE_ID}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockExpiredPendingPurchase),
    });
  });
}

test.describe('Purchase Expiration Handling', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupApiMocks(page);
  });

  test('should not show pending purchase banner for expired purchase and allow new purchase', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}`);

    await expect(page.getByTestId('pending-purchase-banner')).not.toBeVisible();

    await expect(page.getByTestId('purchase-button')).toBeVisible();
  });
});
