const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const { login } = require('../utils/auth');

/**
 * Items Master CRUD (Beginner Friendly)
 * Covers: add, duplicate validation, edit, delete, and list visibility
 */

test.describe('Items Master CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should add, edit, and delete an item', async ({ page }) => {
    const unique = Date.now();
    const name = `Item ${unique}`;
    const updated = `${name} Updated`;

    // Open Items Master
    await page.goto('add_item_master.php');
    await expect(page.getByRole('heading', { name: /Items Master/i })).toBeVisible();

    // Add item
    await page.getByPlaceholder('Enter item name').fill(name);
    await page.getByPlaceholder('Optional description').fill('Initial description');
    // Active is checked by default, submit
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page).toHaveURL(/add_item_master\.php.*message=created/i);

    // Verify row appears in table
    await expect(page.locator('table')).toContainText(name);

    // Duplicate add should show exists message
    await page.getByPlaceholder('Enter item name').fill(name);
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page).toHaveURL(/add_item_master\.php.*message=exists/i);

    // Click edit icon for our row
    const editLink = page.locator(`a[href^="edit_item_master.php?item_id="]`).filter({ hasText: '✏️' }).first();
    // Narrow to the row that contains our item name
    const row = page.locator('tbody tr').filter({ hasText: name }).first();
    await row.locator('a[href^="edit_item_master.php?item_id="]').click();

    // Edit page
    await expect(page).toHaveURL(/edit_item_master\.php/i);
    await page.locator('input[name="item_name"]').fill(updated);
    await page.locator('textarea[name="description"]').fill('Updated description');
    // Toggle Active off for variety
    const active = page.locator('#is_active');
    if (await active.isChecked()) {
      await active.uncheck();
    }
    await page.getByRole('button', { name: 'Update Item' }).click();

    // Back to list with updated message
    await expect(page).toHaveURL(/add_item_master\.php.*message=updated/i);
    // Row should now contain updated name and Inactive badge
    const updatedRow = page.locator('tbody tr').filter({ hasText: updated }).first();
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText('Inactive');

  });

  test('should delete an item (with confirm)', async ({ page }) => {
    const unique = Date.now();
    const name = `ItemDel ${unique}`;

    await page.goto('add_item_master.php');
    await page.getByPlaceholder('Enter item name').fill(name);
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page).toHaveURL(/add_item_master\.php.*message=created/i);
    const delRow = page.locator('tbody tr').filter({ hasText: name }).first();

    // Intercept confirm dialog
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await delRow.locator('form button:has-text("🗑️")').click();
    await expect(page).toHaveURL(/add_item_master\.php.*message=deleted/i);
    await expect(page.locator('table')).not.toContainText(name);
  });
});
