const BasePage = require('./BasePage');

/**
 * ViewSitePage - Page Object Model for View Site Page
 */
class ViewSitePage extends BasePage {
  constructor(page) {
    super(page);
    // Selectors
    this.selectors = {
      siteHeader: '.site-header',
      siteName: '.site-header h1',
      infoGrid: '.info-grid',
      infoCard: '.info-card',
      tubewellCard: '.tubewell-card',
      addTubewellButton: 'a:has-text("Add Tubewell")',
      editSiteButton: 'a:has-text("Edit Site")',
      backToDashboard: 'a:has-text("Back to Dashboard")',
      lcsSection: '.lcs-section',
      lcsCard: '.lcs-card'
    };
  }

  /**
   * Navigate to view site page
   * @param {number} siteId - Site ID
   */
  async navigate(siteId) {
    await this.goto(`view_site.php?site_id=${siteId}`);
    await this.waitForElement(this.selectors.siteHeader);
  }

  /**
   * Get site name
   * @returns {Promise<string>} Site name
   */
  async getSiteName() {
    return await this.getText(this.selectors.siteName);
  }

  /**
   * Get number of tubewells displayed
   * @returns {Promise<number>} Number of tubewells
   */
  async getTubewellCount() {
    return await this.getElementCount(this.selectors.tubewellCard);
  }

  /**
   * Get tubewell card by index
   * @param {number} index - Index of tubewell card
   * @returns {Object} Tubewell card locator
   */
  getTubewellCard(index) {
    return this.page.locator(this.selectors.tubewellCard).nth(index);
  }

  /**
   * Click add tubewell button
   */
  async clickAddTubewell() {
    await this.click(this.selectors.addTubewellButton);
    await this.waitForNavigation();
  }

  /**
   * Click edit site button
   */
  async clickEditSite() {
    await this.click(this.selectors.editSiteButton);
    await this.waitForNavigation();
  }

  /**
   * Click back to dashboard
   */
  async clickBackToDashboard() {
    await this.click(this.selectors.backToDashboard);
    await this.waitForNavigation();
  }

  /**
   * Check if LCS section is visible
   * @returns {Promise<boolean>} True if LCS section is visible
   */
  async isLcsSectionVisible() {
    return await this.isVisible(this.selectors.lcsSection);
  }

  /**
   * Get site information from info cards
   * @returns {Promise<Object>} Site information object
   */
  async getSiteInfo() {
    const infoCards = await this.page.locator(this.selectors.infoCard).all();
    const info = {};
    
    for (const card of infoCards) {
      const text = await card.textContent();
      // Parse the text to extract key-value pairs
      // This is a basic implementation, adjust based on actual HTML structure
      if (text.includes('Address:')) {
        info.address = text.split('Address:')[1]?.trim();
      }
      if (text.includes('Contractor:')) {
        info.contractor = text.split('Contractor:')[1]?.trim();
      }
      if (text.includes('Incharge:')) {
        info.incharge = text.split('Incharge:')[1]?.trim();
      }
      if (text.includes('Contact:')) {
        info.contact = text.split('Contact:')[1]?.trim();
      }
    }
    
    return info;
  }

  /**
   * Check if site details are loaded
   * @returns {Promise<boolean>} True if site details are loaded
   */
  async isSiteDetailsLoaded() {
    return await this.isVisible(this.selectors.siteHeader);
  }
}

module.exports = ViewSitePage;
