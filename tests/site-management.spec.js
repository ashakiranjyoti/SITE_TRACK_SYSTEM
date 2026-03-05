const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const fs = require('fs');
const { login } = require('../utils/auth');

/**
 * Site Management Tests (Beginner Friendly)
 *
 * NOTE:
 * Create Site page me labels input se connect nahi hain (label ke andar emoji + text hai).
 * Isliye yaha best locator = getByPlaceholder().
 */
test.describe('Site Management Tests (Beginner Friendly)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should create site with provided data and proceed to Add Tubewell, then add one tubewell', async ({ page }) => {
    await page.goto('create_site.php');

    const uniqueSuffix = Date.now();
    const siteName = `SITE TEST ${uniqueSuffix}`;
    const tubewellCount = 5;

    await page.getByPlaceholder('Enter site name').fill(siteName);
    await page.getByPlaceholder('Enter contractor name').fill('TEST CON');
    await page.getByPlaceholder('Enter complete address').fill('TEST ADDRESS');
    await page.getByPlaceholder('Enter division name').fill('DIV NAME');
    await page.getByPlaceholder('Enter incharge name').fill('TEST INCHARGE');
    await page.getByPlaceholder('Enter contact number').fill('9894534453');
    await page.getByPlaceholder('Enter number of tubewells').fill(String(tubewellCount));

    await page.locator('select[name="lcs_available"]').selectOption('1');

    await page.getByRole('button', { name: 'Create Site & Continue' }).click();

    await expect(page).toHaveURL(/add_tubewell\.php/i);
    await expect(page.getByRole('heading', { name: /Add Tubewell/i })).toBeVisible();
    await expect(page.locator('text=Site:')).toContainText(siteName);
    await expect(page.locator('.badge-info')).toContainText(`Remaining: ${tubewellCount} tubewells to add`);

    // Fill Add Tubewell form
    await page.getByPlaceholder('Enter zone name').fill('ZONE 1');
    await page.getByPlaceholder('Enter tubewell name').fill(`TW 1 ${uniqueSuffix}`);
    await page.getByPlaceholder('Enter incharge name').fill('TEST INCARGE');
    await page.getByPlaceholder('Enter incharge contact').fill('9843477485');
    await page.getByPlaceholder('Enter tubewell address').fill('TEST TW ADDRESS');
    await page.getByPlaceholder('Enter SIM number').fill('9447767867');
    await page.getByPlaceholder('Enter latitude').fill('27.7567');
    await page.getByPlaceholder('Enter longitude').fill('81.8743');
    // Installation date input is type=date and expects yyyy-mm-dd
    await page.locator('input[name="installation_date"]').fill('2026-01-01');

    const filePath = 'C:/Users/Admin/Downloads/video_1.mp4';
    if (fs.existsSync(filePath)) {
      await page.setInputFiles('#media_files', filePath);
    }

    await page.getByRole('button', { name: 'Add Tubewell & Continue' }).click();

    // On success, the page reloads with message=added and Remaining decreased by 1
    await expect(page).toHaveURL(/add_tubewell\.php.*message=added/i);
    await expect(page.locator('.alert-success')).toContainText('Tubewell added successfully');
    await expect(page.locator('.badge-info')).toContainText(`Remaining: ${tubewellCount - 1} tubewells to add`);

    // Now cancel to go back to dashboard
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/dashboard\.php/i);
  });

  test('should show duplicate site name message', async ({ page }) => {
    // Create a unique site first
    await page.goto('create_site.php');
    const baseName = `PW DUP ${Date.now()}`;
    await page.getByPlaceholder('Enter site name').fill(baseName);
    await page.getByPlaceholder('Enter contractor name').fill('TEST CON');
    await page.getByPlaceholder('Enter complete address').fill('TEST ADDRESS');
    await page.getByPlaceholder('Enter division name').fill('DIV NAME');
    await page.getByPlaceholder('Enter incharge name').fill('TEST INCHARGE');
    await page.getByPlaceholder('Enter contact number').fill('9894534453');
    await page.getByPlaceholder('Enter number of tubewells').fill('1');
    await page.locator('select[name="lcs_available"]').selectOption('1');
    await page.getByRole('button', { name: 'Create Site & Continue' }).click();

    // Landed on add_tubewell; go back to dashboard then to create page to attempt duplicate
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/dashboard\.php/i);
    await page.goto('create_site.php');

    // Attempt to create with the same name
    await page.getByPlaceholder('Enter site name').fill(baseName);
    await page.getByPlaceholder('Enter contractor name').fill('TEST CON');
    await page.getByPlaceholder('Enter complete address').fill('TEST ADDRESS');
    await page.getByPlaceholder('Enter division name').fill('DIV NAME');
    await page.getByPlaceholder('Enter incharge name').fill('TEST INCHARGE');
    await page.getByPlaceholder('Enter contact number').fill('9894534453');
    await page.getByPlaceholder('Enter number of tubewells').fill('1');
    await page.locator('select[name="lcs_available"]').selectOption('1');
    await page.getByRole('button', { name: 'Create Site & Continue' }).click();

    // Expect error alert with duplicate message
    const alert = page.locator('.alert.alert-error');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(`A site with the name "${baseName}" already exists`);
  });

  test('should open Create Site page', async ({ page }) => {
    await page.goto('create_site.php');
    await expect(page.getByRole('heading', { name: /Create New Site/i })).toBeVisible();
  });

  test('should create a site (basic happy path)', async ({ page }) => {
    await page.goto('create_site.php');

    // Fill form using placeholders (easy for beginners)
    const uniqueName = `PW Site ${Date.now()}`;
    await page.getByPlaceholder('Enter site name').fill(uniqueName);
    await page.getByPlaceholder('Enter contractor name').fill('Test Contractor');
    await page.getByPlaceholder('Enter complete address').fill('Test Address');
    await page.getByPlaceholder('Enter division name').fill('Test Division');
    await page.getByPlaceholder('Enter incharge name').fill('Test Incharge');
    await page.getByPlaceholder('Enter contact number').fill('9999999999');
    await page.getByPlaceholder('Enter number of tubewells').fill('1');

    // LCS Availability select (simple selector)
    await page.locator('select[name="lcs_available"]').selectOption('0');

    await page.getByRole('button', { name: /Create Site/i }).click();

    // Next page should be add_tubewell.php
    await expect(page).toHaveURL(/add_tubewell\.php/i);
    expect(page.url()).toContain('site_id=');
  });

  test('should open View Details from dashboard (if any)', async ({ page }) => {
    await page.goto('dashboard.php');
    const viewDetails = page.getByRole('link', { name: 'View Details' }).first();
    if (await viewDetails.isVisible()) {
      await viewDetails.click();
      await expect(page).toHaveURL(/view_site\.php/i);
      await expect(page.locator('.site-header')).toBeVisible();
    }
  });
});
