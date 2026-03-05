const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const { login, logout } = require('../utils/auth');

/**
 * Login Page E2E Tests
 */
test.describe('Login Page Tests (Beginner Friendly)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('index.php');
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /SiteTrack/i })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
    await expect(page).toHaveURL(/dashboard\.php/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Dashboard/i);
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.getByLabel('Username').fill(testUsers.invalidUser.username);
    await page.getByLabel('Password').fill(testUsers.invalidUser.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.error-box')).toBeVisible();
    await expect(page.locator('.error-box')).toContainText(/Invalid username or password/i);
  });

  test('should show browser validation for empty username', async ({ page }) => {
    const username = page.getByLabel('Username');
    const password = page.getByLabel('Password');

    await password.fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Browser required validation message (easy + stable)
    const msg = await username.evaluate((el) => el.validationMessage);
    expect(msg).not.toBe('');
  });

  test('should show browser validation for empty password', async ({ page }) => {
    const username = page.getByLabel('Username');
    const password = page.getByLabel('Password');

    await username.fill(testUsers.admin.username);
    await page.getByRole('button', { name: 'Login' }).click();

    const msg = await password.evaluate((el) => el.validationMessage);
    expect(msg).not.toBe('');
  });

  test('should toggle password visibility', async ({ page }) => {
    const password = page.getByLabel('Password');
    const toggleIcon = page.locator('#togglePassword i'); // click the visible icon inside the button

    await password.fill('testpassword');
    await expect(password).toHaveAttribute('type', 'password');

    // Ensure the icon is scrolled into view and visible before clicking
    await toggleIcon.scrollIntoViewIfNeeded();
    await toggleIcon.click();
    await expect(password).toHaveAttribute('type', 'text');

    await toggleIcon.click();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('should login with different users', async ({ page }) => {
    await login(page, testUsers.operator1.username, testUsers.operator1.password);
    await expect(page).toHaveURL(/dashboard\.php/);

    await logout(page);

    await login(page, testUsers.operator2.username, testUsers.operator2.password);
    await expect(page).toHaveURL(/dashboard\.php/);
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
    await expect(page).toHaveURL(/dashboard\.php/i);
  });
});
