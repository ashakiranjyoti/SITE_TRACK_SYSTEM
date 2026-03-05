/**
 * BasePage - Base class for all page objects
 * Contains common methods and utilities used across all pages
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param {string} path - Path to navigate to (relative to baseURL or full URL)
   */
  async goto(path = '') {
    // Beginner tip:
    // If baseURL is set in playwright.config.js, ALWAYS use relative paths:
    // ✅ 'index.php'  ✅ 'dashboard.php'
    // ❌ '/index.php'  (this ignores baseURL and goes to http://localhost/index.php)
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    await this.page.goto(cleanPath, {
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    // Wait a bit for any dynamic content
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - CSS selector or locator
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = 30000) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
    } catch (error) {
      // Log helpful error message for debugging
      const currentUrl = this.page.url();
      const pageContent = await this.page.content().catch(() => 'Unable to get page content');
      console.error(`Element not found: ${selector}`);
      console.error(`Current URL: ${currentUrl}`);
      console.error(`Page title: ${await this.page.title().catch(() => 'N/A')}`);
      throw new Error(`Element "${selector}" not found on page ${currentUrl}. ${error.message}`);
    }
  }

  /**
   * Click on an element
   * @param {string} selector - CSS selector or locator
   */
  async click(selector) {
    await this.page.click(selector);
  }

  /**
   * Fill input field
   * @param {string} selector - CSS selector or locator
   * @param {string} value - Value to fill
   */
  async fill(selector, value) {
    await this.page.fill(selector, value);
  }

  /**
   * Get text content of an element
   * @param {string} selector - CSS selector or locator
   * @returns {Promise<string>} Text content
   */
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * Check if element is visible
   * @param {string} selector - CSS selector or locator
   * @returns {Promise<boolean>} True if visible
   */
  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation() {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    } catch (e) {
      // If networkidle fails, at least wait for domcontentloaded
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Get current URL
   * @returns {Promise<string>} Current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Wait for specific text to appear
   * @param {string} text - Text to wait for
   */
  async waitForText(text) {
    await this.page.waitForSelector(`text=${text}`, { state: 'visible' });
  }

  /**
   * Select option from dropdown
   * @param {string} selector - Select element selector
   * @param {string} value - Option value to select
   */
  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check checkbox
   * @param {string} selector - Checkbox selector
   */
  async check(selector) {
    await this.page.check(selector);
  }

  /**
   * Uncheck checkbox
   * @param {string} selector - Checkbox selector
   */
  async uncheck(selector) {
    await this.page.uncheck(selector);
  }

  /**
   * Upload file
   * @param {string} selector - File input selector
   * @param {string} filePath - Path to file
   */
  async uploadFile(selector, filePath) {
    await this.page.setInputFiles(selector, filePath);
  }

  /**
   * Get element count
   * @param {string} selector - CSS selector
   * @returns {Promise<number>} Number of elements
   */
  async getElementCount(selector) {
    return await this.page.locator(selector).count();
  }

  /**
   * Wait for element to disappear
   * @param {string} selector - CSS selector
   */
  async waitForElementToDisappear(selector) {
    await this.page.waitForSelector(selector, { state: 'hidden' });
  }
}

module.exports = BasePage;
