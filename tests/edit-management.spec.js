const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const { login } = require('../utils/auth');

/**
 * Edit Flows Tests (Beginner Friendly)
 * - Creates a unique site and one tubewell per test
 * - Verifies view page shows correct data
 * - Edits site and tubewell, verifies updates reflect on view page
 */

test.describe('Edit Flows (Site and Tubewell)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  async function createSiteAndGoToAddTubewell(page, siteName, twCount) {
    await page.goto('create_site.php');
    await page.getByPlaceholder('Enter site name').fill(siteName);
    await page.getByPlaceholder('Enter contractor name').fill('TEST CON');
    await page.getByPlaceholder('Enter complete address').fill('TEST ADDRESS');
    await page.getByPlaceholder('Enter division name').fill('DIV NAME');
    await page.getByPlaceholder('Enter incharge name').fill('TEST INCHARGE');
    await page.getByPlaceholder('Enter contact number').fill('9894534453');
    await page.getByPlaceholder('Enter number of tubewells').fill(String(twCount));
    await page.locator('select[name="lcs_available"]').selectOption('0');
    await page.getByRole('button', { name: 'Create Site & Continue' }).click();
    await expect(page).toHaveURL(/add_tubewell\.php/i);
  }

  async function addOneTubewell(page, siteName, unique) {
    await expect(page.getByRole('heading', { name: /Add Tubewell/i })).toBeVisible();
    await expect(page.locator('text=Site:')).toContainText(siteName);
    const twName = `TW ${unique}`;
    await page.getByPlaceholder('Enter zone name').fill(`ZONE ${unique}`);
    await page.getByPlaceholder('Enter tubewell name').fill(twName);
    await page.getByPlaceholder('Enter incharge name').fill('EDIT TEST INCARGE');
    await page.getByPlaceholder('Enter incharge contact').fill('9876543210');
    await page.getByPlaceholder('Enter tubewell address').fill('EDIT TEST TW ADDRESS');
    await page.getByPlaceholder('Enter SIM number').fill('9000000000');
    await page.getByPlaceholder('Enter latitude').fill('11.1111');
    await page.getByPlaceholder('Enter longitude').fill('22.2222');
    await page.locator('input[name="installation_date"]').fill('2026-01-01');
    // Capture site_id before submitting (in case it redirects to dashboard when remaining becomes 0)
    const preUrl = new URL(page.url());
    const siteId = preUrl.searchParams.get('site_id');
    await page.getByRole('button', { name: 'Add Tubewell & Continue' }).click();
    await page.waitForURL(
      url => /add_tubewell\.php/i.test(url.toString()) || /dashboard\.php.*tubewells_added/i.test(url.toString()),
      { timeout: 15000 }
    );
    return { siteId, twName };
  }

  test('view and edit Site details should reflect on view page', async ({ page }) => {
    const unique = Date.now();
    const siteName = `EDIT SITE ${unique}`;

    await createSiteAndGoToAddTubewell(page, siteName, 1);
    const { siteId } = await addOneTubewell(page, siteName, unique);

    // Go to view_site
    await page.goto(`view_site.php?site_id=${siteId}`);

    // Verify heading has site name and address
    await expect(page.locator('.site-header h1')).toHaveText(siteName);
    await expect(page.locator('.site-header p')).toContainText('TEST ADDRESS');

    // Edit Site
    await page.getByRole('link', { name: /Edit Site/i }).click();
    await expect(page).toHaveURL(/edit_site\.php/i);
    // Change contractor, address, and incharge
    await page.locator('input[name="contractor_name"]').fill('UPDATED CON');
    await page.locator('textarea[name="address"]').fill('UPDATED ADDRESS');
    await page.locator('input[name="site_incharge"]').fill('UPDATED INCHARGE');
    await page.getByRole('button', { name: 'Update Site' }).click();

    // Back to view_site
    await expect(page).toHaveURL(/view_site\.php/i);
    await expect(page.locator('.site-header h1')).toHaveText(siteName);
    await expect(page.locator('.site-header p')).toContainText('UPDATED ADDRESS');
    // Division Information card contains contractor
    await expect(page.locator('.info-card').nth(0)).toContainText('UPDATED CON');
    // Contact Information card contains site incharge
    await expect(page.locator('.info-card').nth(1)).toContainText('UPDATED INCHARGE');
  });

  test('edit Tubewell should update values on view page', async ({ page }) => {
    const unique = Date.now();
    const siteName = `EDIT TW SITE ${unique}`;

    await createSiteAndGoToAddTubewell(page, siteName, 1);
    const { siteId, twName } = await addOneTubewell(page, siteName, unique);

    // Go to view_site
    await page.goto(`view_site.php?site_id=${siteId}`);
    await expect(page.getByRole('heading', { name: /Tubewells/i })).toBeVisible();

    // Open first Edit Tubewell
    const editTw = page.getByRole('link', { name: /Edit Tubewell/i }).first();
    await expect(editTw).toBeVisible();
    await editTw.click();
    await expect(page).toHaveURL(/edit_tubewell\.php/i);

    // Update some fields
    await page.locator('input[name="zone_name"]').fill(`ZONE UPDATED ${unique}`);
    const newTwName = `${twName} UPDATED`;
    await page.locator('input[name="tubewell_name"]').fill(newTwName);
    await page.locator('textarea[name="tw_address"]').fill('TW UPDATED ADDRESS');
    await page.locator('input[name="incharge_contact"]').fill('9123456789');
    await page.getByRole('button', { name: 'Update Tubewell' }).click();

    // Redirects to view_site with confirmation; verify updated values appear in tubewell card
    await expect(page).toHaveURL(/view_site\.php/i);
    const twCard = page.locator('.tubewell-card').first();
    await expect(twCard).toContainText(newTwName);
    await expect(twCard).toContainText('TW UPDATED ADDRESS');
    await expect(twCard).toContainText('9123456789');
  });
});
