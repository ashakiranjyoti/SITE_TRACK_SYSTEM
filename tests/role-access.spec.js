const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const { login, logout } = require('../utils/auth');

/**
 * Role-based visibility and permissions (Beginner Friendly)
 * - Admin should see Settings, + Add New Site, Edit Site, Edit Tubewell
 * - Non-admin (role: user) should NOT see these edit/admin controls
 */

test.describe('Role-based visibility (admin vs user)', () => {
  async function createSiteAndGetId(page) {
    const unique = Date.now();
    const siteName = `ROLE TEST ${unique}`;

    await page.goto('create_site.php');
    await page.getByPlaceholder('Enter site name').fill(siteName);
    await page.getByPlaceholder('Enter contractor name').fill('R-TEST CON');
    await page.getByPlaceholder('Enter complete address').fill('R-TEST ADDRESS');
    await page.getByPlaceholder('Enter division name').fill('R-DIV');
    await page.getByPlaceholder('Enter incharge name').fill('R-INCHARGE');
    await page.getByPlaceholder('Enter contact number').fill('9999912345');
    await page.getByPlaceholder('Enter number of tubewells').fill('1');
    await page.locator('select[name="lcs_available"]').selectOption('0');
    await page.getByRole('button', { name: 'Create Site & Continue' }).click();
    await expect(page).toHaveURL(/add_tubewell\.php/i);

    // Add a minimal tubewell (required fields)
    await page.getByPlaceholder('Enter zone name').fill('R-ZONE');
    await page.getByPlaceholder('Enter tubewell name').fill(`R-TW ${unique}`);
    // Capture site_id before submitting (it may go to dashboard if remaining becomes 0)
    const preUrl = new URL(page.url());
    const siteId = preUrl.searchParams.get('site_id');
    await page.getByRole('button', { name: 'Add Tubewell & Continue' }).click();
    await page.waitForURL(
      url => /add_tubewell\.php/i.test(url.toString()) || /dashboard\.php.*tubewells_added/i.test(url.toString()),
      { timeout: 15000 }
    );

    return { siteId, siteName };
  }

  test('admin sees admin controls on header and view page', async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);

    // Header: Settings and + Add New Site
    const settings = page.getByRole('link', { name: 'Settings ▾' });
    await expect(settings).toBeVisible();
    await settings.hover();
    await expect(page.getByRole('link', { name: '+ Add New Site' })).toBeVisible();

    // Create site and go to view page
    const { siteId } = await createSiteAndGetId(page);
    await page.goto(`view_site.php?site_id=${siteId}`);

    // Edit Site and Edit Tubewell buttons should be visible
    await expect(page.getByRole('link', { name: /Edit Site/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Edit Tubewell/i }).first()).toBeVisible();
  });

  test('non-admin user should not see admin controls', async ({ page }) => {
    // Create a site as admin to have something to view
    await login(page, testUsers.admin.username, testUsers.admin.password);
    const { siteId } = await createSiteAndGetId(page);
    await logout(page);

    // Login as non-admin (from DB: USER_2 has role=user, access_type=view)
    await login(page, 'USER_2', '123');

    // Header: Settings and + Add New Site should NOT be visible
    await expect(page.getByRole('link', { name: 'Settings ▾' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: '+ Add New Site' })).toHaveCount(0);

    // On view_site: Edit Site and Edit Tubewell should NOT be visible
    await page.goto(`view_site.php?site_id=${siteId}`);
    await expect(page.getByRole('link', { name: /Edit Site/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Edit Tubewell/i })).toHaveCount(0);
  });
});
