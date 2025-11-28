import { test, expect, Page } from '@playwright/test';

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
};

const MOCK_JOURNEY = {
  id: 'journey-1',
  title: 'Test Journey',
  description: 'A test journey for E2E testing',
  thumbnailUrl: '/test-thumbnail.jpg',
  price: 1990,
  currency: 'TWD',
  isPurchased: false,
  chapters: [],
};

const mockCreatePurchaseResponse = {
  id: 'purchase-123',
  journeyId: 'journey-1',
  journeyTitle: 'Test Journey',
  amount: 1990,
  currency: 'TWD',
  paymentMethod: 'BANK_TRANSFER',
  status: 'PENDING',
  checkoutUrl: 'https://mock-gateway.example.com/checkout/session-456',
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
};

const MOCK_PURCHASE_COMPLETED = {
  id: 'purchase-123',
  journeyId: 'journey-1',
  journeyTitle: 'Test Journey',
  journeyThumbnailUrl: null,
  amount: 1990,
  currency: 'TWD',
  paymentMethod: 'BANK_TRANSFER',
  status: 'COMPLETED',
  createdAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  expiresAt: null,
  failureReason: null,
};

async function setupAuthenticatedUser(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: 'access_token',
      value: 'mock-jwt-token',
      domain: 'localhost',
      path: '/',
    },
  ]);
}

async function setupApiMocks(page: Page): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    });
  });

  await page.route('**/api/journeys/journey-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_JOURNEY),
    });
  });

  await page.route('**/api/journeys/journey-1/pricing', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        journeyId: 'journey-1',
        price: 1990,
        currency: 'TWD',
      }),
    });
  });

  await page.route('**/api/purchases', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockCreatePurchaseResponse),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/purchases/pending/journey/journey-1', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'No pending purchase' }),
    });
  });

  await page.route('**/api/purchases/purchase-123', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PURCHASE_COMPLETED),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe('Purchase Flow - Bank Transfer (Redirect)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await setupApiMocks(page);
  });

  test('should navigate to purchase page and select bank transfer', async ({ page }) => {
    await page.goto('/courses/journey-1');

    await page.getByTestId('purchase-button').click();

    await expect(page).toHaveURL(/\/courses\/journey-1\/purchase/);

    await page.getByTestId('payment-method-BANK_TRANSFER').click();

    await expect(page.getByTestId('proceed-to-payment-button')).toBeEnabled();
  });

  test('should allow user to switch between payment methods', async ({ page }) => {
    await page.goto('/courses/journey-1/purchase');

    await page.getByTestId('payment-method-BANK_TRANSFER').click();
    await expect(page.getByTestId('payment-method-BANK_TRANSFER')).toHaveAttribute(
      'data-selected',
      'true'
    );

    await page.getByTestId('payment-method-CREDIT_CARD').click();
    await expect(page.getByTestId('payment-method-CREDIT_CARD')).toHaveAttribute(
      'data-selected',
      'true'
    );
  });

  test('should handle callback with success status for bank transfer', async ({ page }) => {
    await page.goto(
      '/courses/journey-1/purchase/callback?purchaseId=purchase-123&status=success'
    );

    await expect(page.getByTestId('purchase-success')).toBeVisible({ timeout: 15000 });
  });
});
