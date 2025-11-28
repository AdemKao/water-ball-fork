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
      body: JSON.stringify({ message: 'No pending purchase' }),
    });
  });
}

test.describe('Payment Method Selection Validation', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupApiMocks(page);
  });

  test('should show both payment method options', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}/purchase`);

    await expect(page.getByTestId('payment-method-CREDIT_CARD')).toBeVisible();
    await expect(page.getByTestId('payment-method-BANK_TRANSFER')).toBeVisible();

    await expect(page.getByText(/支援 Visa/)).toBeVisible();
    await expect(page.getByText(/ATM 轉帳/)).toBeVisible();
  });

  test('should disable proceed button when no payment method selected', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}/purchase`);

    const proceedButton = page.getByTestId('proceed-to-payment-button');
    await expect(proceedButton).toBeDisabled();
  });

  test('should enable proceed button after selecting payment method', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}/purchase`);

    await page.getByTestId('payment-method-CREDIT_CARD').click();

    await expect(page.getByTestId('proceed-to-payment-button')).toBeEnabled();
  });

  test('should highlight selected payment method', async ({ page }) => {
    await page.goto(`/courses/${TEST_COURSE_ID}/purchase`);

    await page.getByTestId('payment-method-CREDIT_CARD').click();
    await expect(page.getByTestId('payment-method-CREDIT_CARD')).toHaveAttribute(
      'data-selected',
      'true'
    );

    await page.getByTestId('payment-method-BANK_TRANSFER').click();
    await expect(page.getByTestId('payment-method-BANK_TRANSFER')).toHaveAttribute(
      'data-selected',
      'true'
    );
    await expect(page.getByTestId('payment-method-CREDIT_CARD')).toHaveAttribute(
      'data-selected',
      'false'
    );
  });
});
