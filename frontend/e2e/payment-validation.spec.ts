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

  await page.route(`**/api/purchases/pending/journey/${TEST_COURSE_ID}`, (route) => {
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'No pending purchase' }),
    });
  });
}

async function navigateToPaymentForm(page: Page): Promise<void> {
  await page.goto(`/courses/${TEST_COURSE_ID}`);
  await page.getByTestId('purchase-button').click();
  await page.getByTestId('payment-method-CREDIT_CARD').click();
  await page.getByTestId('next-step-button').click();
  await expect(page.getByTestId('card-number')).toBeVisible();
}

test.describe('Payment Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupApiMocks(page);
  });

  test('should show error message for invalid credit card number', async ({ page }) => {
    await navigateToPaymentForm(page);

    await page.getByTestId('card-number').fill('1234567890123456');
    await page.getByTestId('expiry-date').fill('12/25');
    await page.getByTestId('cvv').fill('123');
    await page.getByTestId('cardholder-name').fill('Test User');

    await page.getByTestId('confirm-purchase-button').click();

    await expect(page.getByTestId('card-number-error')).toBeVisible();
  });

  test('should show error message for expired date', async ({ page }) => {
    await navigateToPaymentForm(page);

    await page.getByTestId('card-number').fill('4111111111111111');
    await page.getByTestId('expiry-date').fill('01/20');
    await page.getByTestId('cvv').fill('123');
    await page.getByTestId('cardholder-name').fill('Test User');

    await page.getByTestId('confirm-purchase-button').click();

    await expect(page.getByTestId('expiry-date-error')).toBeVisible();
  });

  test('should enable submit button when all fields are valid', async ({ page }) => {
    await navigateToPaymentForm(page);

    await page.getByTestId('card-number').fill('4111111111111111');
    await page.getByTestId('expiry-date').fill('12/25');
    await page.getByTestId('cvv').fill('123');
    await page.getByTestId('cardholder-name').fill('Test User');

    await expect(page.getByTestId('confirm-purchase-button')).toBeEnabled();
  });
});
