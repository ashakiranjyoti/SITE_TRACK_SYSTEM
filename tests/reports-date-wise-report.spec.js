const { test, expect } = require('@playwright/test');
const { login } = require('../utils/auth');
const { testUsers } = require('../utils/testData');
const DateWiseReportPage = require('../pages/DateWiseReportPage');

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

test.describe('Reports: Date-wise Report', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should open via menu, select today, verify section titles include date, and validate PDF', async ({ page }) => {
    // Navigate via Reports menu -> Date-wise Report
    await page.locator('#reports-menu-button').click();
    await page.getByTestId('date-wise-report-link').click();

    const dr = new DateWiseReportPage(page);
    await dr.waitForElement(dr.selectors.heading);

    // Today
    const today = new Date();
    const todayIso = iso(today);
    await dr.setDate(todayIso);
    await dr.clickView();

    // Assert section titles include (YYYY-MM-DD)
    await dr.assertSectionTitlesContain(todayIso);

    // PDF href pattern and popup
    const href = await dr.getPdfHref();
    expect(href || '').toMatch(/generate_date_change_report\.php\?on_date=\d{4}-\d{2}-\d{2}/);
    const popup = await dr.openPdfAndGetPopup();
    await popup.close().catch(() => {});

    // Best-effort modal checks (if media exists)
    const info = await dr.openFirstMediaReturnInfo();
    if (info) {
      await dr.assertModalDownloadAndCaption(info.src);
      await dr.closeModalByCloseButton();
    }

    // eslint-disable-next-line no-console
    console.log(`DateWiseReport: date=${todayIso} href=${href}`);
  });
});
