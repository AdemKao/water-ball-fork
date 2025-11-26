import { test, expect } from '@playwright/test';

test.describe('Unauthenticated user purchase redirect', () => {
  test('should redirect to login page with redirect URL when clicking purchase button', async ({ page }) => {
    const courseId = 'test-course-1';

    await page.goto(`/courses/${courseId}`);

    await page.getByTestId('purchase-button').click();

    await expect(page).toHaveURL(`/login?redirect=%2Fcourses%2F${courseId}%2Fpurchase`);
  });
});
