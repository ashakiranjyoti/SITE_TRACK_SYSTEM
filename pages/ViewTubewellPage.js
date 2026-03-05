const BasePage = require('./BasePage');

class ViewTubewellPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      latestTable: 'table.data-table',
      dateBadge: '.badge.badge-info',
      masterNoteCard: 'div.card:has(h2:has-text("Master Note"))',
    };
  }

  async assertLatestContains(...texts) {
    for (const t of texts) {
      await this.page.locator(this.selectors.latestTable).getByText(t, { exact: false }).first().waitFor();
    }
  }

  async assertDateBadge(todayIso) {
    await this.page.locator(this.selectors.dateBadge).getByText(todayIso, { exact: false }).first().waitFor();
  }

  async assertMasterNoteContains(text) {
    await this.page.locator(this.selectors.masterNoteCard).getByText(text, { exact: false }).first().waitFor();
  }
}

module.exports = ViewTubewellPage;
