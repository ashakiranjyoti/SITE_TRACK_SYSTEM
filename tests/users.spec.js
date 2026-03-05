const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const { login } = require('../utils/auth');

/**
 * Users CRUD (Beginner Friendly)
 * Covers: add, duplicate validation, edit (with/without password), delete, and cannot delete self
 */

test.describe('Users CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should add user and prevent duplicate username', async ({ page }) => {
    const unique = Date.now();
    const uname = `u_${unique}`;

    await page.goto('add_user.php');
    await expect(page.getByRole('heading', { name: '+ Add User' })).toBeVisible();

    // Add new user
    await page.locator('input[name="username"]').fill(uname);
    await page.locator('input[name="full_name"]').fill('User Full');
    await page.locator('select[name="role"]').selectOption('user');
    await page.locator('select[name="access_type"]').selectOption('view');
    await page.locator('input[name="password"]').fill('123');
    await page.locator('input[name="confirm_password"]').fill('123');
    await page.getByRole('button', { name: 'Create User' }).click();

    await expect(page).toHaveURL(/users\.php.*message=created/i);
    await expect(page.locator('table')).toContainText(uname);

    // Attempt duplicate creation
    await page.goto('add_user.php');
    await page.locator('input[name="username"]').fill(uname);
    await page.locator('input[name="password"]').fill('123');
    await page.locator('input[name="confirm_password"]').fill('123');
    await page.getByRole('button', { name: 'Create User' }).click();
    // Expect inline error
    await expect(page.locator('.alert.alert-error')).toContainText('Username already exists');
  });

  test('should edit user with and without changing password', async ({ page }) => {
    const unique = Date.now();
    const uname = `edit_${unique}`;

    // Create user to edit
    await page.goto('add_user.php');
    await page.locator('input[name="username"]').fill(uname);
    await page.locator('input[name="password"]').fill('123');
    await page.locator('input[name="confirm_password"]').fill('123');
    await page.getByRole('button', { name: 'Create User' }).click();
    await expect(page).toHaveURL(/users\.php.*message=created/i);

    // Open edit from users list
    const row = page.locator('tbody tr').filter({ hasText: uname }).first();
    await row.locator('a[href^="edit_user.php?user_id="]').click();
    await expect(page).toHaveURL(/edit_user\.php/i);

    // Update without password
    await page.locator('input[name="full_name"]').fill('Edited Name');
    await page.locator('select[name="role"]').selectOption('admin');
    await page.locator('select[name="access_type"]').selectOption('full');
    await page.getByRole('button', { name: 'Update User' }).click();
    await expect(page).toHaveURL(/users\.php.*message=updated/i);

    // Re-open edit and now update with new password
    await page.locator('tbody tr').filter({ hasText: uname }).first()
      .locator('a[href^="edit_user.php?user_id="]').click();
    await expect(page).toHaveURL(/edit_user\.php/i);
    await page.locator('input[name="password"]').fill('456');
    await page.locator('input[name="confirm_password"]').fill('456');
    await page.getByRole('button', { name: 'Update User' }).click();
    await expect(page).toHaveURL(/users\.php.*message=updated/i);
  });

  test('should not allow deleting the currently logged-in user', async ({ page }) => {
    await page.goto('users.php');
    // Find the row for the logged-in admin (Ravi)
    const row = page.locator('tbody tr').filter({ hasText: testUsers.admin.username }).first();
    // Attempt delete and accept confirm
    page.once('dialog', async (dialog) => { await dialog.accept(); });
    await row.locator('form button:has-text("🗑️")').click();
    await expect(page).toHaveURL(/users\.php.*error=cannot_delete_self/i);
  });

  test('should delete a non-self user', async ({ page }) => {
    const unique = Date.now();
    const uname = `del_${unique}`;

    // Create user to delete
    await page.goto('add_user.php');
    await page.locator('input[name="username"]').fill(uname);
    await page.locator('input[name="password"]').fill('123');
    await page.locator('input[name="confirm_password"]').fill('123');
    await page.getByRole('button', { name: 'Create User' }).click();
    await expect(page).toHaveURL(/users\.php.*message=created/i);

    const delRow = page.locator('tbody tr').filter({ hasText: uname }).first();
    page.once('dialog', async (dialog) => { await dialog.accept(); });
    await delRow.locator('form button:has-text("🗑️")').click();
    await expect(page).toHaveURL(/users\.php.*message=deleted/i);
    await expect(page.locator('table')).not.toContainText(uname);
  });
});
