const BasePage = require('./BasePage');
const fs = require('fs');

class DailyStatusEditorPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      heading: 'h2:has-text("Daily Status Editor")',
      dateInput: 'input[name="date"]',
      tableRows: 'table.data-table tbody tr[data-item]',
      spareRow: 'tr.spare-row',
      backLink: 'a.btn.btn-secondary:has-text("← Back")',
      // Master note
      mnEditBtn: '#mnEditBtn',
      mnSaveBtn: '#mnSaveBtn',
      mnTextarea: 'textarea[name="master_note"]',
      mnContrib: 'input.mn-contrib',
      mnMedia: '#masterMediaFiles',
      // Item edit inputs (appear after clicking row edit)
      itemMake: 'input[name="make_model"]',
      itemSize: 'input[name="size_capacity"]',
      itemStatus: 'select[name="status"]',
      itemRemark: 'input[name="remark"]',
      itemHmiOk: '.col-hmi input.hmi-ok',
      itemHmiNo: '.col-hmi input.hmi-no',
      itemWebOk: '.col-web input.web-ok',
      itemWebNo: '.col-web input.web-no',
      itemMedia: 'input[type="file"][name="media_files"]',
      itemSaveBtn: 'button[aria-label="Save"]',
      // Spare selectors
      spareName: 'input.spare-item-name',
      spareMake: 'input.spare-make',
      spareSize: 'input.spare-size',
      spareStatus: 'select.spare-status',
      spareHmiOk: 'input.spare-hmi-ok',
      spareWebOk: 'input.spare-web-ok',
      spareRemark: 'input.spare-remark',
      spareMedia: 'input.spare-media',
      spareSave: 'tr.spare-row button[aria-label="Save"]'
    };
  }

  async navigate(tubewellId) {
    await this.goto(`add_parameters.php?tubewell_id=${tubewellId}`);
    await this.waitForElement(this.selectors.heading);
  }

  async assertDateLocked(todayIso) {
    await this.page.locator(this.selectors.dateInput).waitFor();
    await this.page.waitForFunction((sel, val) => {
      const el = document.querySelector(sel);
      return el && el.value === val && el.hasAttribute('readonly') && el.getAttribute('min') === val && el.getAttribute('max') === val;
    }, this.selectors.dateInput, todayIso);
  }

  async editFirstItemRow(values, mediaPaths = []) {
    const firstRow = this.page.locator(this.selectors.tableRows).first();
    const itemName = (await firstRow.locator('.col-item').innerText()).trim();
    await firstRow.getByRole('button', { name: 'Edit' }).click();

    if (values.make) await firstRow.locator(this.selectors.itemMake).fill(values.make);
    if (values.size) await firstRow.locator(this.selectors.itemSize).fill(values.size);
    if (values.status) await firstRow.locator(this.selectors.itemStatus).selectOption(values.status);
    if (values.hmi === 'ok') await firstRow.locator(this.selectors.itemHmiOk).check();
    if (values.hmi === 'no') await firstRow.locator(this.selectors.itemHmiNo).check();
    if (values.web === 'ok') await firstRow.locator(this.selectors.itemWebOk).check();
    if (values.web === 'no') await firstRow.locator(this.selectors.itemWebNo).check();
    if (values.remark) await firstRow.locator(this.selectors.itemRemark).fill(values.remark);

    if (mediaPaths && mediaPaths.length) {
      const existing = mediaPaths.filter(p => { try { return fs.existsSync(p); } catch { return false; } });
      if (existing.length) {
        await firstRow.locator(this.selectors.itemMedia).setInputFiles(existing);
      }
    }

    // contributors (optional)
    const cboxes = firstRow.locator('.col-actions input.contrib-user');
    const count = await cboxes.count();
    if (values.contributorsCount && count) {
      for (let i = 0; i < Math.min(values.contributorsCount, count); i++) {
        await cboxes.nth(i).check();
      }
    }

    await firstRow.locator(this.selectors.itemSaveBtn).click();
    return { itemName };
  }

  async addSpareItem(spare, mediaPaths = []) {
    const row = this.page.locator(this.selectors.spareRow);
    await row.locator(this.selectors.spareName).fill(spare.name);
    await row.locator(this.selectors.spareMake).fill(spare.make);
    await row.locator(this.selectors.spareSize).fill(spare.size);
    await row.locator(this.selectors.spareStatus).selectOption(spare.status);
    if (spare.hmiOk) await row.locator(this.selectors.spareHmiOk).check();
    if (spare.webOk) await row.locator(this.selectors.spareWebOk).check();
    await row.locator(this.selectors.spareRemark).fill(spare.remark || '');

    if (mediaPaths && mediaPaths.length) {
      const existing = mediaPaths.filter(p => { try { return fs.existsSync(p); } catch { return false; } });
      if (existing.length) {
        await row.locator(this.selectors.spareMedia).setInputFiles(existing);
      }
    }

    await row.locator(this.selectors.spareSave).click();
  }

  async editMasterNote(noteText, mediaPaths = [], contributorsCount = 0) {
    await this.page.locator(this.selectors.mnEditBtn).click();
    await this.page.locator(this.selectors.mnTextarea).fill(noteText);

    const c = this.page.locator(this.selectors.mnContrib);
    const count = await c.count();
    for (let i = 0; i < Math.min(contributorsCount, count); i++) {
      await c.nth(i).check();
    }

    if (mediaPaths && mediaPaths.length) {
      const existing = mediaPaths.filter(p => { try { return fs.existsSync(p); } catch { return false; } });
      if (existing.length) {
        await this.page.locator(this.selectors.mnMedia).setInputFiles(existing);
      }
    }

    await this.page.locator(this.selectors.mnSaveBtn).click();
  }

  async clickBack() {
    await this.page.getByRole('link', { name: '← Back' }).click();
    await this.waitForNavigation();
  }
}

module.exports = DailyStatusEditorPage;
