const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const { login } = require('../utils/auth');

/**
 * LCS Items Master CRUD (Beginner Friendly)
 * Covers: add, duplicate validation, edit, delete, and list visibility
 */

test.describe('LCS Items Master CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should add, edit, and delete an LCS item', async ({ page }) => {
    const unique = Date.now();
    const name = `LCS Item ${unique}`;
    const updated = `${name} Updated`;

    await page.goto('add_lcs_item.php');
    await expect(page.getByRole('heading', { name: /LCS Items Master/i })).toBeVisible();

    // Add LCS item
    await page.getByPlaceholder('Enter item name').fill(name);
    await page.getByPlaceholder('Optional description').fill('Initial LCS description');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page).toHaveURL(/add_lcs_item\.php.*message=created/i);
    await expect(page.locator('table')).toContainText(name);

    // Duplicate should show exists
    await page.getByPlaceholder('Enter item name').fill(name);
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page).toHaveURL(/add_lcs_item\.php.*message=exists/i);

    // Edit the row for this item
    const row = page.locator('tbody tr').filter({ hasText: name }).first();
    await row.locator('a[href^="edit_lcs_item.php?item_id="]').click();

    await expect(page).toHaveURL(/edit_lcs_item\.php/i);
    await page.locator('input[name="item_name"]').fill(updated);
    await page.locator('textarea[name="description"]').fill('Updated LCS description');
    const active = page.locator('#is_active');
    if (await active.isChecked()) {
      await active.uncheck();
    }
    await page.getByRole('button', { name: 'Update Item' }).click();

    await expect(page).toHaveURL(/add_lcs_item\.php.*message=updated/i);
    const updatedRow = page.locator('tbody tr').filter({ hasText: updated }).first();
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText('Inactive');
  });

  test('should delete an LCS item (with confirm)', async ({ page }) => {
    const unique = Date.now();
    const name = `LCS Del ${unique}`;

    await page.goto('add_lcs_item.php');
    await page.getByPlaceholder('Enter item name').fill(name);
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page).toHaveURL(/add_lcs_item\.php.*message=created/i);

    const delRow = page.locator('tbody tr').filter({ hasText: name }).first();
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await delRow.locator('form button:has-text("🗑️")').click();
    await expect(page).toHaveURL(/add_lcs_item\.php.*message=deleted/i);
    await expect(page.locator('table')).not.toContainText(name);
  });
});
