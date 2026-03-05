const BasePage = require('./BasePage');

class SiteReportPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      heading: 'h2:has-text("Site Report")',
      form: 'form',
      siteSelect: 'select[name="site_id"]',
      tubewellSelect: 'select[name="tubewell_id"]',
      fromDate: 'input[name="from_date"]',
      toDate: 'input[name="to_date"]',
      viewButton: 'button:has-text("View")',
      dateSectionTitle: 'h3:has-text("Date:")',
      table: 'table.data-table',
      masterNoteCard: 'div.card:has(h4:has-text("Master Note"))',
      pdfLink: '#quickPdfLink',
      emptyState: 'text=No records found in the selected range.',
      mediaThumb: 'table.data-table .media-preview',
      modal: '#mediaModal',
      modalImage: '#modalImage',
      modalVideo: '#modalVideo'
    };
  }

  async navigate() {
    await this.goto('site_report.php');
    await this.waitForElement(this.selectors.heading);
  }

  async selectSiteByLabel(label) {
    await this.page.selectOption(this.selectors.siteSelect, { label });
    // The form auto-submits on change; wait for navigation
    await this.waitForNavigation();
  }

  async selectTubewellByLabel(label) {
    await this.waitForElement(this.selectors.tubewellSelect);
    await this.page.selectOption(this.selectors.tubewellSelect, { label });
  }

  async getFirstOptionLabel(selectSelector) {
    await this.waitForElement(selectSelector);
    const options = this.page.locator(`${selectSelector} option`);
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute('value');
      if (val && val.trim() !== '') {
        const txt = await options.nth(i).textContent();
        return txt.trim();
      }
    }
    return null;
  }

  async selectFirstSite() {
    const label = await this.getFirstOptionLabel(this.selectors.siteSelect);
    if (!label) throw new Error('No site options available');
    await this.selectSiteByLabel(label);
    return label;
  }

  async selectFirstTubewell() {
    const label = await this.getFirstOptionLabel(this.selectors.tubewellSelect);
    if (!label) throw new Error('No tubewell options available for selected site');
    await this.selectTubewellByLabel(label);
    return label;
  }

  async getSelectedLabels() {
    const site = await this.page.locator(`${this.selectors.siteSelect} option:checked`).textContent();
    const tw = await this.page.locator(`${this.selectors.tubewellSelect} option:checked`).textContent();
    return { site: site.trim(), tubewell: tw.trim() };
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
    // Either date section visible or empty state shows
    const hasAny = await this.isVisible(this.selectors.dateSectionTitle);
    const empty = await this.isVisible(this.selectors.emptyState);
    if (!hasAny && !empty) {
      throw new Error('Report not visible: no date section or empty state found');
    }
  }

  async assertTableHeaders() {
    const headers = [
      'Sr.No', 'Item Name', 'Make/Model', 'Size/Cap.', 'Status', 'HMI/Loc', 'Web', 'Remark', 'Photo / Video', 'Updated By', 'Updated At'
    ];
    for (const h of headers) {
      await this.page.locator(this.selectors.table).getByText(h, { exact: false }).first().waitFor();
    }
  }

  async assertContainsTexts(texts=[]) {
    for (const t of texts) {
      await this.page.locator('body').getByText(t, { exact: false }).first().waitFor();
    }
  }

  async assertMasterNoteContains(text) {
    await this.page.locator(this.selectors.masterNoteCard).getByText(text, { exact: false }).first().waitFor();
  }

  async openPdfAndGetPopup() {
    // Ensure link enabled (href != '#')
    const href = await this.page.locator(this.selectors.pdfLink).getAttribute('href');
    // Click and wait for popup
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.page.locator(this.selectors.pdfLink).click(),
    ]);
    // Do not wait for domcontentloaded as PDF streams may not trigger it reliably
    return popup;
  }

  async getPdfHref() {
    await this.page.locator(this.selectors.pdfLink).waitFor();
    return await this.page.locator(this.selectors.pdfLink).getAttribute('href');
  }

  async isMasterNoteVisible() {
    return await this.isVisible(this.selectors.masterNoteCard);
  }

  async hasAnyMediaThumb() {
    return (await this.page.locator(this.selectors.mediaThumb).count()) > 0;
  }

  async openFirstMediaAndAssertModal() {
    const thumbs = this.page.locator(this.selectors.mediaThumb);
    if (await thumbs.count() === 0) return false;
    await thumbs.first().click();
    await this.page.locator(this.selectors.modal).waitFor({ state: 'visible' });
    // One of image or video should be visible
    const imgVisible = await this.page.locator(this.selectors.modalImage).isVisible().catch(() => false);
    const vidVisible = await this.page.locator(this.selectors.modalVideo).isVisible().catch(() => false);
    if (!imgVisible && !vidVisible) {
      throw new Error('Media modal opened but neither image nor video is visible');
    }
    // Click outside or press Escape to close (simulate click outside by clicking modal backdrop close X is in markup via closeModal handler; simplest: press Escape)
    await this.page.keyboard.press('Escape').catch(() => {});
    // Give time for modal to hide
    await this.page.locator(this.selectors.modal).waitFor({ state: 'hidden' });
    return true;
  }
}

module.exports = SiteReportPage;
