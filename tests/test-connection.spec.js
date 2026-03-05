const { test, expect } = require('@playwright/test');

/**
 * Connection Test - Verify the application is accessible
 * Run this first to check if base URL is correct
 */
test.describe('Connection Test (Beginner Friendly)', () => {
  
  test('should be able to access the application', async ({ page }) => {
    // Try to navigate to the base URL
    try {
      // baseURL set hai, so just use relative path (no leading /)
      await page.goto('index.php', { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Wait a bit for any redirects
      await page.waitForTimeout(2000);
      
      // Check if page loaded
      const url = page.url();
      const title = await page.title();
      
      console.log('Current URL:', url);
      console.log('Page Title:', title);
      
      // Check if we got redirected to XAMPP dashboard
      if (url.includes('/dashboard/') || title.includes('XAMPP')) {
        console.error('\n❌ ERROR: Redirected to XAMPP dashboard!');
        console.error('This means the application path is incorrect.');
        console.error('\nPlease check:');
        console.error('1. Is your project folder name exactly: ASSET_MANAGEMENT_AUTOMATION');
        console.error('2. Is it in: C:\\xampp\\htdocs\\ASSET_MANAGEMENT_AUTOMATION');
        console.error('3. Try accessing manually: http://localhost/ASSET_MANAGEMENT_AUTOMATION/index.php');
        console.error('4. If manual access works, check the baseURL in playwright.config.js');
        throw new Error('Application not found - redirected to XAMPP dashboard');
      }
      
      // Verify we're on the login page
      expect(url).toMatch(/index\.php/i);
      
      // Check if any form exists on the page
      const formExists = await page.locator('form').count() > 0;
      expect(formExists).toBe(true);
      
      console.log('✅ Successfully connected to application!');
      
    } catch (error) {
      console.error('\n❌ Connection failed!');
      console.error('Error:', error.message);
      console.error('\nTroubleshooting steps:');
      console.error('1. XAMPP is running');
      console.error('2. Apache is started');
      console.error('3. Check folder name matches: ASSET_MANAGEMENT_AUTOMATION');
      console.error('4. Try accessing manually: http://localhost/ASSET_MANAGEMENT_AUTOMATION/index.php');
      console.error('5. If manual access works, the baseURL in playwright.config.js might need adjustment');
      throw error;
    }
  });

  test('should see login form elements', async ({ page }) => {
    await page.goto('index.php', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait a bit for page to render
    await page.waitForTimeout(2000);
    
    // Check current URL to ensure we're on the right page
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard/')) {
      throw new Error('Redirected to XAMPP dashboard - application not found at expected path');
    }
    
    // Check for username input
    await expect(page.getByLabel('Username')).toBeVisible({ timeout: 10000 });
    
    // Check for password input
    await expect(page.getByLabel('Password')).toBeVisible({ timeout: 10000 });
    
    // Check for login button
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10000 });
    
    console.log('✅ All login form elements found!');
  });
});
