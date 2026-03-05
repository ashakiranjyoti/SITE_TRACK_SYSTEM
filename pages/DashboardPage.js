const BasePage = require('./BasePage');

/**
 * DashboardPage - Page Object Model for Dashboard Page
 */
class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    // Selectors
    this.selectors = {
      pageTitle: 'h1',
      searchInput: 'input[name="search"]',
      searchButton: '.search-btn',
      clearButton: '.clear-btn',
      searchForm: '.search-form',
      sitesGrid: '.sites-grid',
      siteCard: '.site-card',
      siteName: '.site-card h3',
      viewDetailsButton: '.btn-primary',
      addNewSiteButton: '.btn-success',
      noSitesMessage: '.card h3',
      header: '.header',
      userPill: '.user-pill',
      navLinks: '.nav-links',
      logoutLink: 'a[href="logout.php"]',
      settingsDropdown: '.dropdown',
      reportsDropdown: 'text=Reports'
    };
  }

  /**
   * Navigate to dashboard
   */
  async navigate() {
    await this.goto('dashboard.php');
    await this.waitForElement(this.selectors.pageTitle);
  }

  /**
   * Check if dashboard is loaded
   * @returns {Promise<boolean>} True if dashboard is loaded
   */
  async isDashboardLoaded() {
    return await this.isVisible(this.selectors.pageTitle);
  }

  /**
   * Search for sites
   * @param {string} searchTerm - Search term
   */
  async searchSites(searchTerm) {
    await this.fill(this.selectors.searchInput, searchTerm);
    await this.click(this.selectors.searchButton);
    await this.waitForNavigation();
  }

  /**
   * Clear search
   */
  async clearSearch() {
    if (await this.isVisible(this.selectors.clearButton)) {
      await this.click(this.selectors.clearButton);
      await this.waitForNavigation();
    }
  }

  /**
   * Get number of site cards displayed
   * @returns {Promise<number>} Number of site cards
   */
  async getSiteCount() {
    return await this.getElementCount(this.selectors.siteCard);
  }

  /**
   * Get site card by index
   * @param {number} index - Index of site card (0-based)
   * @returns {Object} Site card locator
   */
  getSiteCard(index) {
    return this.page.locator(this.selectors.siteCard).nth(index);
  }

  /**
   * Get site name from card
   * @param {number} index - Index of site card
   * @returns {Promise<string>} Site name
   */
  async getSiteName(index) {
    const card = this.getSiteCard(index);
    return await card.locator(this.selectors.siteName).textContent();
  }

  /**
   * Click view details for a site
   * @param {number} index - Index of site card
   */
  async clickViewDetails(index) {
    const card = this.getSiteCard(index);
    await card.locator(this.selectors.viewDetailsButton).click();
    await this.waitForNavigation();
  }

  /**
   * Click add new site button
   */
  async clickAddNewSite() {
    await this.click(this.selectors.addNewSiteButton);
    await this.waitForNavigation();
  }

  /**
   * Check if no sites message is displayed
   * @returns {Promise<boolean>} True if message is visible
   */
  async isNoSitesMessageVisible() {
    return await this.isVisible(this.selectors.noSitesMessage);
  }

  /**
   * Get user name from user pill
   * @returns {Promise<string>} User name
   */
  async getUserName() {
    return await this.getText(this.selectors.userPill);
  }

  /**
   * Click logout
   */
  async clickLogout() {
    await this.click(this.selectors.logoutLink);
    await this.waitForNavigation();
  }

  /**
   * Navigate to settings dropdown
   */
  async hoverSettings() {
    await this.page.hover('text=Settings');
  }

  /**
   * Click on settings menu item
   * @param {string} menuItem - Menu item text
   */
  async clickSettingsMenuItem(menuItem) {
    await this.hoverSettings();
    await this.page.click(`text=${menuItem}`);
    await this.waitForNavigation();
  }

  /**
   * Navigate to reports dropdown
   */
  async hoverReports() {
    await this.page.hover(this.selectors.reportsDropdown);
  }

  /**
   * Click on reports menu item
   * @param {string} menuItem - Menu item text
   */
  async clickReportsMenuItem(menuItem) {
    await this.hoverReports();
    await this.page.click(`text=${menuItem}`);
    await this.waitForNavigation();
  }

  /**
   * Get search input value
   * @returns {Promise<string>} Search input value
   */
  async getSearchValue() {
    return await this.page.inputValue(this.selectors.searchInput);
  }

  /**
   * Check if search results info is displayed
   * @returns {Promise<boolean>} True if search results info is visible
   */
  async isSearchResultsInfoVisible() {
    return await this.isVisible('.search-results-info');
  }
}

module.exports = DashboardPage;
