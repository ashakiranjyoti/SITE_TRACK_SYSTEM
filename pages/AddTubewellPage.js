const BasePage = require('./BasePage');

class AddTubewellPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      heading: 'h2:has-text("Add Tubewell")',
      zone: 'input[placeholder="Enter zone name"]',
      name: 'input[placeholder="Enter tubewell name"]',
      incharge: 'input[placeholder="Enter incharge name"]',
      contact: 'input[placeholder="Enter incharge contact"]',
      address: 'input[placeholder="Enter tubewell address"]',
      sim: 'input[placeholder="Enter SIM number"]',
      lat: 'input[placeholder="Enter latitude"]',
      lng: 'input[placeholder="Enter longitude"]',
      installationDate: 'input[name="installation_date"]',
      submit: 'button:has-text("Add Tubewell & Continue")'
    };
  }

  async navigate(siteId) {
    await this.goto(`add_tubewell.php?site_id=${siteId}`);
    await this.waitForElement(this.selectors.heading);
  }

  async fillForm(data) {
    await this.fill(this.selectors.zone, data.zone || '');
    await this.fill(this.selectors.name, data.name || '');
    await this.fill(this.selectors.incharge, data.incharge || '');
    await this.fill(this.selectors.contact, data.contact || '');
    await this.fill(this.selectors.address, data.address || '');
    await this.fill(this.selectors.sim, data.sim || '');
    await this.fill(this.selectors.lat, data.lat || '');
    await this.fill(this.selectors.lng, data.lng || '');
    if (data.installationDate) {
      await this.fill(this.selectors.installationDate, data.installationDate);
    }
  }

  async submitAndWaitEither() {
    const pre = new URL(this.page.url());
    const siteId = pre.searchParams.get('site_id');
    await this.click(this.selectors.submit);
    await this.page.waitForURL(url => /add_tubewell\.php/i.test(url.toString()) || /dashboard\.php.*tubewells_added/i.test(url.toString()), { timeout: 15000 });
    return { siteId };
  }
}

module.exports = AddTubewellPage;
