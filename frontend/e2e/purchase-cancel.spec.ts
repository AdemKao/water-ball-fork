import { test, expect } from '@playwright/test';
import type { PendingPurchase } from '../src/types/purchase';

const TEST_JOURNEY_ID = 'journey-123';
const TEST_PURCHASE_ID = 'purchase-456';

const mockPendingPurchase: PendingPurchase = {
  id: TEST_PURCHASE_ID,
  journeyId: TEST_JOURNEY_ID,
  journeyTitle: 'Test Journey',
  journeyThumbnailUrl: null,
  amount: 1000,
  currency: 'TWD',
  paymentMethod: 'CREDIT_CARD',
  status: 'PENDING',
  checkoutUrl: 'https://mock-gateway.example.com/checkout/session-789',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
};

test.describe('Cancel Pending Purchase', () => {
  test('should cancel pending purchase and show purchase button again', async ({ page }) => {
    let isCancelled = false;

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
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

    await page.route(`**/api/purchases/pending/journey/${TEST_JOURNEY_ID}`, async (route) => {
      if (isCancelled) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(null),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockPendingPurchase),
        });
      }
    });

    await page.route(`**/api/purchases/${TEST_PURCHASE_ID}/cancel`, async (route) => {
      if (route.request().method() === 'POST') {
        isCancelled = true;
        await route.fulfill({
          status: 200,
        });
      } else {
        await route.continue();
      }
    });

    await page.route(`**/api/journeys/${TEST_JOURNEY_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: TEST_JOURNEY_ID,
          title: 'Test Journey',
          description: 'A test journey',
          thumbnailUrl: null,
          price: 1000,
          currency: 'TWD',
          isPurchased: false,
          chapterCount: 2,
          lessonCount: 5,
          chapters: [],
        }),
      });
    });

    await page.route(`**/api/journeys/${TEST_JOURNEY_ID}/pricing`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          journeyId: TEST_JOURNEY_ID,
          price: 1000,
          currency: 'TWD',
        }),
      });
    });

    await page.goto(`/courses/${TEST_JOURNEY_ID}`);

    const banner = page.getByTestId('pending-purchase-banner');
    await expect(banner).toBeVisible();

    const cancelButton = page.getByTestId('cancel-purchase-button');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    await expect(banner).not.toBeVisible();

    const purchaseButton = page.getByTestId('purchase-button');
    await expect(purchaseButton).toBeVisible();
  });

  test('should show loading state while cancelling', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
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

    await page.route(`**/api/purchases/pending/journey/${TEST_JOURNEY_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPendingPurchase),
      });
    });

    await page.route(`**/api/purchases/${TEST_PURCHASE_ID}/cancel`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({ status: 200 });
    });

    await page.route(`**/api/journeys/${TEST_JOURNEY_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: TEST_JOURNEY_ID,
          title: 'Test Journey',
          description: 'A test journey',
          thumbnailUrl: null,
          price: 1000,
          currency: 'TWD',
          isPurchased: false,
          chapterCount: 2,
          lessonCount: 5,
          chapters: [],
        }),
      });
    });

    await page.route(`**/api/journeys/${TEST_JOURNEY_ID}/pricing`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          journeyId: TEST_JOURNEY_ID,
          price: 1000,
          currency: 'TWD',
        }),
      });
    });

    await page.goto(`/courses/${TEST_JOURNEY_ID}`);

    const cancelButton = page.getByTestId('cancel-purchase-button');
    await cancelButton.click();

    await expect(cancelButton).toBeDisabled();
  });
});
