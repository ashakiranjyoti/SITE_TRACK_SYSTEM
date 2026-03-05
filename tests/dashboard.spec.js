const { test, expect } = require('@playwright/test');
const { testUsers, searchTerms } = require('../utils/testData');
const { login, logout } = require('../utils/auth');

/**
 * Dashboard Tests (Beginner Friendly)
 * - No fixtures
 * - Simple locators: getByRole / getByPlaceholder
 */
test.describe('Dashboard Page Tests (Beginner Friendly)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should show dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Dashboard/i);
  });

  test('should search sites', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Search sites by name/i);
    await searchBox.fill(searchTerms.partial);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(searchBox).toHaveValue(searchTerms.partial);
  });

  test('should open View Details if any site exists', async ({ page }) => {
    const viewDetails = page.getByRole('link', { name: 'View Details' }).first();
    if (await viewDetails.isVisible()) {
      await viewDetails.click();
      await expect(page).toHaveURL(/view_site\.php/i);
      await expect(page.locator('.site-header')).toBeVisible();
    }
  });

  test('should logout', async ({ page }) => {
    await logout(page);
    await expect(page).toHaveURL(/index\.php/i);
  });
});
