/**
 * auth.js (Beginner Friendly)
 * Simple login helper so you don't repeat code in every test.
 *
 * NOTE:
 * - baseURL is already set in playwright.config.js
 * - So we use: page.goto('index.php')  ✅
 * - Not: page.goto('/index.php')       ❌ (it ignores baseURL)
 */

async function login(page, username, password) {
  await page.goto('index.php');

  // Using labels is easiest for beginners (because <label for="..."> exists)
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  // Button text is "Login"
  await page.getByRole('button', { name: 'Login' }).click();

  // After login it redirects to dashboard.php
  await page.waitForURL(/dashboard\.php/i, { timeout: 60000 });
}

async function logout(page) {
  // Logout link exists in header
  await page.getByRole('link', { name: /logout/i }).click();
  await page.waitForURL(/index\.php/i, { timeout: 60000 });
}

module.exports = { login, logout };

