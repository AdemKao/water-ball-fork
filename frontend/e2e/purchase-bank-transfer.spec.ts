import { test, expect, Page } from '@playwright/test'

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
}

const MOCK_JOURNEY = {
  id: 'journey-1',
  title: 'Test Journey',
  description: 'A test journey for E2E testing',
  thumbnailUrl: '/test-thumbnail.jpg',
  price: 1990,
  currency: 'TWD',
}

const MOCK_PURCHASE_RESPONSE = {
  purchaseId: 'purchase-123',
  amount: 1990,
  currency: 'TWD',
}

async function setupAuthenticatedUser(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: 'access_token',
      value: 'mock-jwt-token',
      domain: 'localhost',
      path: '/',
    },
  ])
}

async function setupApiMocks(page: Page): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    })
  })

  await page.route('**/api/journeys/journey-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_JOURNEY),
    })
  })

  await page.route('**/api/journeys/journey-1/pricing', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        journeyId: MOCK_JOURNEY.id,
        price: MOCK_JOURNEY.price,
        currency: MOCK_JOURNEY.currency,
      }),
    })
  })

  await page.route('**/api/purchases', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PURCHASE_RESPONSE),
      })
    } else {
      await route.continue()
    }
  })

  await page.route('**/api/purchases/purchase-123/pay', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        purchaseId: 'purchase-123',
        status: 'COMPLETED',
      }),
    })
  })
}

test.describe('Purchase Flow - Bank Transfer', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page)
    await setupApiMocks(page)
  })

  test('should complete purchase with bank transfer payment method', async ({ page }) => {
    await page.goto('/courses/journey-1')

    await page.getByTestId('purchase-button').click()

    await page.getByTestId('payment-method-BANK_TRANSFER').click()

    await page.getByTestId('next-step-button').click()

    await page.getByTestId('bank-code').fill('012')
    await page.getByTestId('account-number').fill('1234567890123')
    await page.getByTestId('account-name').fill('Test User')

    await page.getByTestId('confirm-purchase-button').click()

    await expect(page.getByTestId('purchase-success')).toBeVisible()
  })

  test('should display validation errors for empty bank transfer fields', async ({ page }) => {
    await page.goto('/courses/journey-1')

    await page.getByTestId('purchase-button').click()
    await page.getByTestId('payment-method-BANK_TRANSFER').click()
    await page.getByTestId('next-step-button').click()

    await page.getByTestId('confirm-purchase-button').click()

    await expect(page.getByTestId('bank-code')).toHaveAttribute('aria-invalid', 'true')
  })

  test('should allow user to go back and change payment method', async ({ page }) => {
    await page.goto('/courses/journey-1')

    await page.getByTestId('purchase-button').click()
    await page.getByTestId('payment-method-BANK_TRANSFER').click()
    await page.getByTestId('next-step-button').click()

    await page.goBack()

    await expect(page.getByTestId('payment-method-BANK_TRANSFER')).toBeVisible()
  })
})
