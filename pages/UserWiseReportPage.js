const BasePage = require('./BasePage');

class UserWiseReportPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      heading: 'h2:has-text("User-wise Report"), h2:has-text("👤 User-wise Report")',
      userSelect: 'select[name="user"]',
      fromDate: 'input[name="from_date"]',
      toDate: 'input[name="to_date"]',
      viewButton: 'button[type="submit"]:has-text("View")',
      pdfLink: 'a:has-text("Download PDF")',
      container: '.container',
      twSectionTitle: 'h3:has-text("Tubewell Item Updates")',
      lcsSectionTitle: 'h3:has-text("LCS Item Updates")',
      dataTable: 'table.data-table',
      mediaThumb: '.media-preview',
      modal: '#mediaModal',
      modalImage: '#modalImage',
      modalVideo: '#modalVideo',
      modalClose: '.modal-close',
      modalDownload: '#downloadMedia',
      modalCaption: '#modalCaption',
    };
  }

  async navigate() {
    await this.goto('user_wise_report.php');
    await this.waitForElement(this.selectors.heading);
  }

  async getFirstUserLabel() {
    await this.waitForElement(this.selectors.userSelect);
    const options = this.page.locator(`${this.selectors.userSelect} option`);
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute('value');
      if (val && val.trim() !== '') {
        const txt = await options.nth(i).textContent();
        return (txt || '').trim();
      }
    }
    return null;
  }

  async selectUserByLabel(label) {
    await this.page.selectOption(this.selectors.userSelect, { label });
  }

  async selectFirstUser() {
    const label = await this.getFirstUserLabel();
    if (!label) throw new Error('No user options available');
    await this.selectUserByLabel(label);
    return label;
  }

  async setDateRange(fromIso, toIso) {
    await this.page.fill(this.selectors.fromDate, fromIso);
    await this.page.fill(this.selectors.toDate, toIso);
  }

  async clickView() {
    await Promise.all([
      this.waitForNavigation(),
      this.page.click(this.selectors.viewButton),
    ]);
  }

  async assertReportVisible() {
    const hasTw = await this.isVisible(this.selectors.twSectionTitle);
    const hasLcs = await this.isVisible(this.selectors.lcsSectionTitle);
    const hasPdf = await this.isVisible(this.selectors.pdfLink);
    if (!hasTw && !hasLcs && !hasPdf) {
      throw new Error('No report sections or PDF link visible after applying filters');
    }
  }

  async assertTubewellTableHeaders() {
    const hasSection = await this.isVisible(this.selectors.twSectionTitle);
    if (!hasSection) return false;
    const headers = [
      'Sr.No', 'Site', 'Tubewell', 'Item', 'Make/Model', 'Size/Cap.', 'Status', 'HMI/Local', 'Web', 'Remark', 'Photo / Video', 'Updated By', 'Updated At'
    ];
    try {
      for (const h of headers) {
        await this.page
          .locator(this.selectors.dataTable)
          .getByText(h, { exact: false })
          .first()
          .waitFor({ state: 'visible', timeout: 3000 });
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  async assertLcsTableHeaders() {
    const hasSection = await this.isVisible(this.selectors.lcsSectionTitle);
    if (!hasSection) return false;
    const headers = [
      'Sr.No', 'Site', 'LCS', 'Item', 'Make/Model', 'Size/Cap.', 'Status', 'Remark', 'Photo / Video', 'Updated By', 'Updated At'
    ];
    try {
      for (const h of headers) {
        await this.page
          .locator(this.selectors.dataTable)
          .getByText(h, { exact: false })
          .first()
          .waitFor({ state: 'visible', timeout: 3000 });
      }
      return true;
    } catch (_) {
      return false;
    }
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
    await this.page.keyboard.press('Escape').catch(() => {});
    await this.page.locator(this.selectors.modal).waitFor({ state: 'hidden' });
    return true;
  }

  async openFirstMediaReturnInfo() {
    const thumbs = this.page.locator(this.selectors.mediaThumb);
    const count = await thumbs.count();
    if (!count) return null;
    const first = thumbs.first();
    // Read src from the thumb element or its source child (for video)
    let type = 'image';
    let src;
    const tag = await first.evaluate(el => el.tagName.toLowerCase());
    if (tag === 'img') {
      type = 'image';
      src = await first.getAttribute('src');
    } else {
      type = 'video';
      const source = first.locator('source');
      if (await source.count()) {
        src = await source.first().getAttribute('src');
      }
    }
    await first.click();
    await this.page.locator(this.selectors.modal).waitFor({ state: 'visible' });
    return { type, src };
  }

  async assertModalDownloadAndCaption(expectedSrc) {
    await this.page.locator(this.selectors.modal).waitFor({ state: 'visible' });
    const href = await this.page.locator(this.selectors.modalDownload).getAttribute('href');
    if (expectedSrc) {
      if (!(href || '').includes(expectedSrc.split('/').pop())) {
        throw new Error(`Download href does not point to media: ${href} vs ${expectedSrc}`);
      }
    }
    const caption = await this.page.locator(this.selectors.modalCaption).textContent();
    if (!caption || caption.trim().length === 0) {
      throw new Error('Modal caption (filename) is empty');
    }
    // Ensure body scroll locked
    const overflow = await this.page.evaluate(() => document.body.style.overflow);
    if (overflow !== 'hidden') {
      throw new Error(`Body scroll not locked, overflow=${overflow}`);
    }
  }

  async closeModalByCloseButton() {
    await this.page.locator(this.selectors.modalClose).click();
    await this.page.locator(this.selectors.modal).waitFor({ state: 'hidden' });
    const overflow = await this.page.evaluate(() => document.body.style.overflow);
    if (overflow !== 'auto' && overflow !== '') {
      throw new Error('Body scroll not restored after closing modal by button');
    }
  }

  async reopenModalAndCloseByEsc() {
    const info = await this.openFirstMediaReturnInfo();
    if (!info) return false;
    await this.page.keyboard.press('Escape');
    await this.page.locator(this.selectors.modal).waitFor({ state: 'hidden' });
    return true;
  }

  async reopenModalAndCloseByBackdrop() {
    const info = await this.openFirstMediaReturnInfo();
    if (!info) return false;
    // Click on the backdrop area (modal element), not the content
    await this.page.locator(this.selectors.modal).click({ position: { x: 10, y: 10 } });
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
    return popup; // no domcontentloaded wait (PDF stream)
  }

  async pageContainsUsername(username) {
    // Robust: search innerText of container to avoid visibility quirks of nested text nodes
    const foundInContainer = await this.page.evaluate(({ sel, name }) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      return (el.innerText || '').toLowerCase().includes(String(name).toLowerCase());
    }, { sel: this.selectors.container, name: username });

    if (foundInContainer) return true;

    // Also check master note info blocks explicitly if present
    const infoBlocks = this.page.locator('.alert.alert-info');
    const cnt = await infoBlocks.count().catch(() => 0);
    for (let i = 0; i < cnt; i++) {
      const txt = (await infoBlocks.nth(i).innerText().catch(() => '')) || '';
      if (txt.toLowerCase().includes(String(username).toLowerCase())) return true;
    }
    return false;
  }
}

module.exports = UserWiseReportPage;
