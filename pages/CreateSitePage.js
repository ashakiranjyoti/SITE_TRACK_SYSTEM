const BasePage = require('./BasePage');

/**
 * CreateSitePage - Page Object Model for Create Site Page
 */
class CreateSitePage extends BasePage {
  constructor(page) {
    super(page);
    // Selectors
    this.selectors = {
      pageTitle: 'h2',
      siteNameInput: 'input[name="site_name"]',
      addressInput: 'textarea[name="address"]',
      divisionNameInput: 'input[name="division_name"]',
      contractorNameInput: 'input[name="contractor_name"]',
      siteInchargeInput: 'input[name="site_incharge"]',
      contactInput: 'input[name="contact"]',
      numberOfTubewellInput: 'input[name="number_of_tubewell"]',
      lcsAvailableSelect: 'select[name="lcs_available"]',
      submitButton: 'button[type="submit"]',
      form: '.site-form',
      errorAlert: '.alert-error',
      progressSteps: '.progress-steps'
    };
  }

  /**
   * Navigate to create site page
   */
  async navigate() {
    await this.goto('create_site.php');
    await this.waitForElement(this.selectors.form);
  }

  /**
   * Fill site name
   * @param {string} siteName - Site name
   */
  async fillSiteName(siteName) {
    await this.fill(this.selectors.siteNameInput, siteName);
  }

  /**
   * Fill address
   * @param {string} address - Address
   */
  async fillAddress(address) {
    await this.fill(this.selectors.addressInput, address);
  }

  /**
   * Fill division name
   * @param {string} divisionName - Division name
   */
  async fillDivisionName(divisionName) {
    await this.fill(this.selectors.divisionNameInput, divisionName);
  }

  /**
   * Fill contractor name
   * @param {string} contractorName - Contractor name
   */
  async fillContractorName(contractorName) {
    await this.fill(this.selectors.contractorNameInput, contractorName);
  }

  /**
   * Fill site incharge
   * @param {string} siteIncharge - Site incharge name
   */
  async fillSiteIncharge(siteIncharge) {
    await this.fill(this.selectors.siteInchargeInput, siteIncharge);
  }

  /**
   * Fill contact
   * @param {string} contact - Contact number
   */
  async fillContact(contact) {
    await this.fill(this.selectors.contactInput, contact);
  }

  /**
   * Fill number of tubewells
   * @param {number} count - Number of tubewells
   */
  async fillNumberOfTubewell(count) {
    await this.fill(this.selectors.numberOfTubewellInput, count.toString());
  }

  /**
   * Set LCS availability via select
   * @param {('0'|'1'|0|1)} value
   */
  async setLcsAvailable(value) {
    const v = String(value);
    await this.selectOption(this.selectors.lcsAvailableSelect, v);
  }

  // Backward-compat helpers to keep existing tests working
  async checkLcsAvailable() { await this.setLcsAvailable('1'); }
  async uncheckLcsAvailable() { await this.setLcsAvailable('0'); }

  /**
   * Click submit button
   */
  async clickSubmit() {
    await this.click(this.selectors.submitButton);
    await this.waitForNavigation();
  }

  /**
   * Fill complete site form
   * @param {Object} siteData - Site data object
   */
  async fillSiteForm(siteData) {
    if (siteData.siteName) await this.fillSiteName(siteData.siteName);
    if (siteData.address) await this.fillAddress(siteData.address);
    if (siteData.divisionName) await this.fillDivisionName(siteData.divisionName);
    if (siteData.contractorName) await this.fillContractorName(siteData.contractorName);
    if (siteData.siteIncharge) await this.fillSiteIncharge(siteData.siteIncharge);
    if (siteData.contact) await this.fillContact(siteData.contact);
    if (siteData.numberOfTubewell) await this.fillNumberOfTubewell(siteData.numberOfTubewell);
    if (siteData.lcsAvailable) {
      await this.checkLcsAvailable();
    }
  }

  /**
   * Create site with all details
   * @param {Object} siteData - Site data object
   */
  async createSite(siteData) {
    await this.fillSiteForm(siteData);
    await this.clickSubmit();
  }

  /**
   * Get error message if any
   * @returns {Promise<string>} Error message
   */
  async getErrorMessage() {
    if (await this.isVisible(this.selectors.errorAlert)) {
      return await this.getText(this.selectors.errorAlert);
    }
    return null;
  }

  /**
   * Check if error is displayed
   * @returns {Promise<boolean>} True if error is visible
   */
  async isErrorVisible() {
    return await this.isVisible(this.selectors.errorAlert);
  }

  /**
   * Get current URL to check if redirected after submission
   * @returns {Promise<string>} Current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }
}

module.exports = CreateSitePage;
