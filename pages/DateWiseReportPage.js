const BasePage = require('./BasePage');

class DateWiseReportPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      heading: 'h2:has-text("Date-wise Change Report"), h2:has-text("📅 Date-wise Change Report")',
      dateInput: 'input[name="on_date"]',
      viewButton: 'button[type="submit"]:has-text("View")',
      pdfLink: 'a:has-text("Download PDF")',
      twSectionTitle: 'h3.section-title:has-text("Tubewell Item Updates")',
      lcsSectionTitle: 'h3.section-title:has-text("LCS Item Updates")',
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
    await this.goto('date_change_report.php');
    await this.waitForElement(this.selectors.heading);
  }

  async setDate(iso) {
    await this.page.fill(this.selectors.dateInput, iso);
  }

  async clickView() {
    await Promise.all([
      this.waitForNavigation(),
      this.page.click(this.selectors.viewButton),
    ]);
  }

  async assertSectionTitlesContain(dateIso) {
    const checks = { tw: false, lcs: false };
    const twVisible = await this.isVisible(this.selectors.twSectionTitle);
    if (twVisible) {
      const twText = await this.page.locator(this.selectors.twSectionTitle).innerText();
      checks.tw = (twText || '').includes(`(${dateIso})`);
      if (!checks.tw) throw new Error(`Tubewell section title does not include (${dateIso}) -> ${twText}`);
    }
    const lcsVisible = await this.isVisible(this.selectors.lcsSectionTitle);
    if (lcsVisible) {
      const lcsText = await this.page.locator(this.selectors.lcsSectionTitle).innerText();
      checks.lcs = (lcsText || '').includes(`(${dateIso})`);
      if (!checks.lcs) throw new Error(`LCS section title does not include (${dateIso}) -> ${lcsText}`);
    }
    if (!twVisible && !lcsVisible) {
      throw new Error('No sections visible for the selected date');
    }
    return checks;
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
    return popup;
  }

  async openFirstMediaReturnInfo() {
    const thumbs = this.page.locator(this.selectors.mediaThumb);
    const count = await thumbs.count();
    if (!count) return null;
    const first = thumbs.first();
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
}

module.exports = DateWiseReportPage;
