const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const { login, logout } = require('../utils/auth');

/**
 * Navigation Tests (Beginner Friendly)
 * - No fixtures
 * - Simple steps
 */
test.describe('Navigation Tests (Beginner Friendly)', () => {
  test('should block dashboard without login', async ({ page }) => {
    await page.goto('dashboard.php');
    await expect(page).toHaveURL(/index\.php/i);
  });

  test('should login and reach dashboard', async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
    await expect(page).toHaveURL(/dashboard\.php/i);
  });

  test('admin should see Settings and Add New Site, and user pill should show name/initial', async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
    // Settings menu visible for admin
    const settings = page.getByRole('link', { name: 'Settings ▾' });
    await expect(settings).toBeVisible();

    // Hover to reveal dropdown and ensure Add New Site is present
    await settings.hover();
    const addNewSite = page.getByRole('link', { name: '+ Add New Site' });
    await expect(addNewSite).toBeVisible();

    // User pill should contain full name and initial avatar
    const userPill = page.locator('.user-pill');
    await expect(userPill).toContainText(testUsers.admin.fullName);
    const initial = testUsers.admin.fullName.trim()[0].toUpperCase();
    await expect(userPill.locator('.user-avatar')).toHaveText(initial);
  });

  test('should logout and go back to login page', async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
    await logout(page);
    await expect(page).toHaveURL(/index\.php/i);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
