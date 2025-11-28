import { test, expect, Page } from '@playwright/test';

interface PendingPurchaseResponse {
  id: string;
  journeyId: string;
  journeyTitle: string;
  journeyThumbnailUrl: string | null;
  amount: number;
  currency: string;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER';
  status: 'PENDING';
  checkoutUrl: string;
  createdAt: string;
  expiresAt: string;
}

async function mockAuthenticatedUser(page: Page) {
  await page.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
      }),
    });
  });
}

async function mockJourneyDetail(page: Page, journeyId: string) {
  await page.route(`**/api/journeys/${journeyId}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: journeyId,
        title: 'Test Journey',
        description: 'A test journey description',
        thumbnailUrl: null,
        isPurchased: false,
        price: 1990,
        currency: 'TWD',
        chapterCount: 2,
        lessonCount: 5,
        chapters: [
          {
            id: 'chapter-1',
            title: 'Chapter 1',
            order: 1,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Lesson 1',
                lessonType: 'VIDEO',
                order: 1,
                isFree: true,
                isCompleted: false,
              },
            ],
          },
        ],
      }),
    });
  });
}

function createPendingPurchase(journeyId: string): PendingPurchaseResponse {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

  return {
    id: 'purchase-1',
    journeyId,
    journeyTitle: 'Test Journey',
    journeyThumbnailUrl: null,
    amount: 1990,
    currency: 'TWD',
    paymentMethod: 'CREDIT_CARD',
    status: 'PENDING',
    checkoutUrl: 'https://mock-gateway.example.com/checkout/session-123',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

test.describe('Pending Purchase Banner (Redirect Flow)', () => {
  const journeyId = 'journey-1';

  test('displays pending purchase banner with checkout URL', async ({ page }) => {
    await mockAuthenticatedUser(page);
    await mockJourneyDetail(page, journeyId);

    const pendingPurchase = createPendingPurchase(journeyId);
    await page.route(`**/api/purchases/pending/journey/${journeyId}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pendingPurchase),
      });
    });

    await page.goto(`/courses/${journeyId}`);

    const banner = page.getByTestId('pending-purchase-banner');
    await expect(banner).toBeVisible();

    await expect(banner).toContainText('您有一筆未完成的購買');
    await expect(banner).toContainText('Test Journey');
    await expect(banner).toContainText('$1,990');

    const continueButton = page.getByTestId('continue-purchase-button');
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toHaveText('繼續購買');
  });

  test('shows expiration countdown in banner', async ({ page }) => {
    await mockAuthenticatedUser(page);
    await mockJourneyDetail(page, journeyId);

    const pendingPurchase = createPendingPurchase(journeyId);
    await page.route(`**/api/purchases/pending/journey/${journeyId}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pendingPurchase),
      });
    });

    await page.goto(`/courses/${journeyId}`);

    const banner = page.getByTestId('pending-purchase-banner');
    await expect(banner).toContainText(/\d+:\d+|剩餘/);
  });

  test('shows pending purchase banner on purchase page', async ({ page }) => {
    await mockAuthenticatedUser(page);
    await mockJourneyDetail(page, journeyId);

    const pendingPurchase = createPendingPurchase(journeyId);
    await page.route(`**/api/purchases/pending/journey/${journeyId}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pendingPurchase),
      });
    });

    await page.route(`**/api/journeys/${journeyId}/pricing`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          journeyId,
          price: 1990,
          currency: 'TWD',
        }),
      });
    });

    await page.goto(`/courses/${journeyId}/purchase`);

    const banner = page.getByTestId('pending-purchase-banner');
    await expect(banner).toBeVisible();
  });
});
