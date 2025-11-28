import { test, expect } from '@playwright/test';

test.describe('Unauthenticated user purchase redirect', () => {
  test('should redirect to login page with redirect URL when clicking purchase button', async ({ page }) => {
    const courseId = 'test-course-1';

    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.route(`**/api/journeys/${courseId}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: courseId,
          title: 'Test Course',
          description: 'A test course',
          thumbnailUrl: null,
          isPurchased: false,
          price: 1990,
          currency: 'TWD',
          chapterCount: 2,
          lessonCount: 5,
          chapters: [],
        }),
      });
    });

    await page.route(`**/api/journeys/${courseId}/pricing`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          journeyId: courseId,
          price: 1990,
          currency: 'TWD',
        }),
      });
    });

    await page.route(`**/api/purchases/pending/journey/${courseId}`, (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.goto(`/courses/${courseId}`);

    await page.getByTestId('purchase-button').click();

    await expect(page).toHaveURL(`/login?redirect=%2Fcourses%2F${courseId}%2Fpurchase`);
  });
});
