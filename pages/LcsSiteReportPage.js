const BasePage = require('./BasePage');

class LcsSiteReportPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      heading: 'h2:has-text("LCS Site Report"), h2:has-text("🧰 LCS Site Report")',
      form: 'form.site-form',
      siteSelect: 'select[name="site_id"]',
      lcsSelect: 'select[name="lcs_id"]',
      fromDate: 'input[name="from_date"]',
      toDate: 'input[name="to_date"]',
      viewButton: 'button:has-text("View")',
      dateSectionTitle: 'h3:has-text("Date:")',
      table: 'table.data-table',
      lcsMasterNoteCard: 'div.card:has(h4:has-text("LCS Master Note"))',
      pdfLink: '#lcsQuickPdfLink',
      emptyState: 'text=No changes found for the selected LCS and date range., text=Select Site, LCS and date range to view the report.',
      mediaThumb: '.media-preview',
      modal: '#mediaModal',
      modalImage: '#modalImage',
      modalVideo: '#modalVideo',
    };
  }

  async navigate() {
    await this.goto('lcs_site_report.php');
    await this.waitForElement(this.selectors.heading);
  }

  async getFirstOptionLabel(selectSelector) {
    await this.waitForElement(selectSelector);
    const options = this.page.locator(`${selectSelector} option`);
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute('value');
      if (val && val.trim() !== '' && val !== '0') {
        const txt = await options.nth(i).textContent();
        return (txt || '').trim();
      }
    }
    return null;
  }

  async selectSiteByLabel(label) {
    await this.page.selectOption(this.selectors.siteSelect, { label });
    await this.waitForNavigation();
  }

  async selectLcsByLabel(label) {
    await this.waitForElement(this.selectors.lcsSelect);
    await this.page.selectOption(this.selectors.lcsSelect, { label });
    // lcs select also auto-submits; wait for navigation
    await this.waitForNavigation();
  }

  async selectFirstSite() {
    const label = await this.getFirstOptionLabel(this.selectors.siteSelect);
    if (!label) throw new Error('No site options available');
    await this.selectSiteByLabel(label);
    return label;
  }

  async selectFirstLcs() {
    const label = await this.getFirstOptionLabel(this.selectors.lcsSelect);
    if (!label) throw new Error('No LCS options available for selected site');
    await this.selectLcsByLabel(label);
    return label;
  }

  async setDateRange(fromIso, toIso) {
    await this.page.fill(this.selectors.fromDate, fromIso);
    await this.page.fill(this.selectors.toDate, toIso);
  }

  async clickView() {
    await this.page.click(this.selectors.viewButton);
    await this.waitForNavigation();
  }

  async assertReportVisible() {
    const hasDate = await this.isVisible(this.selectors.dateSectionTitle);
    const hasEmpty = await this.isVisible(this.selectors.emptyState);
    if (!hasDate && !hasEmpty) {
      throw new Error('Report not visible: neither date sections nor empty state shown');
    }
  }

  async assertTableHeaders() {
    const headers = [
      'Sr.No', 'Item', 'Make/Model', 'Size/Cap.', 'Status', 'Remark', 'Photo / Video', 'Updated By', 'Updated At'
    ];
    for (const h of headers) {
      await this.page.locator(this.selectors.table).getByText(h, { exact: false }).first().waitFor();
    }
  }

  async isMasterNoteVisible() {
    return await this.isVisible(this.selectors.lcsMasterNoteCard);
  }

  async openFirstMediaAndAssertModal() {
    const thumbs = this.page.locator(this.selectors.mediaThumb);
    const count = await thumbs.count();
    if (!count) return false;
    await thumbs.first().click();
    await this.page.locator(this.selectors.modal).waitFor({ state: 'visible' });
    const imgVisible = await this.page.locator(this.selectors.modalImage).isVisible().catch(() => false);
    const vidVisible = await this.page.locator(this.selectors.modalVideo).isVisible().catch(() => false);
    if (!imgVisible && !vidVisible) {
      throw new Error('Media modal opened but neither image nor video is visible');
    }
    // Close with Escape; page implements ESC/backdrop/close button
    await this.page.keyboard.press('Escape').catch(() => {});
    await this.page.locator(this.selectors.modal).waitFor({ state: 'hidden' });
    return true;
  }

  async getPdfHref() {
    await this.page.locator(this.selectors.pdfLink).waitFor();
    return await this.page.locator(this.selectors.pdfLink).getAttribute('href');
  }

  async openPdfAndGetPopup() {
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.page.locator(this.selectors.pdfLink).click(),
    ]);
    // do not wait for domcontentloaded (PDF stream)
    return popup;
  }
}

module.exports = LcsSiteReportPage;
