const { test, expect } = require('@playwright/test');
const { login } = require('../utils/auth');
const LcsSiteReportPage = require('../pages/LcsSiteReportPage');
const { testUsers } = require('../utils/testData');

// POMs
const CreateSitePage = require('../pages/CreateSitePage');
const AddTubewellPage = require('../pages/AddTubewellPage');
const ViewSitePage = require('../pages/ViewSitePage');
const DailyStatusEditorPage = require('../pages/DailyStatusEditorPage');
const SiteReportPage = require('../pages/SiteReportPage');

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

test.describe('Reports: LCS Site Report', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should select first site/LCS, set last 7 days, view report, verify UI, and open PDF', async ({ page }) => {
    const lcs = new LcsSiteReportPage(page);
    await lcs.navigate();

    // Select first site (auto-submits) and then first LCS (auto-submits)
    const siteLabel = await lcs.selectFirstSite();
    const lcsLabel = await lcs.selectFirstLcs();

    // Last 7 days
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    await lcs.setDateRange(iso(from), iso(to));
    await lcs.clickView();

    // Log chosen filters for CI visibility
    // eslint-disable-next-line no-console
    console.log(`LCS Site Report Filters => Site: ${siteLabel} | LCS: ${lcsLabel} | From: ${iso(from)} | To: ${iso(to)}`);

    // Must checks
    await lcs.assertReportVisible();
    await lcs.assertTableHeaders();

    // Should checks (best-effort)
    const hasMaster = await lcs.isMasterNoteVisible();
    const opened = await lcs.openFirstMediaAndAssertModal().catch(() => false);
    // eslint-disable-next-line no-console
    console.log(`LcsMasterNoteVisible=${hasMaster} MediaModalOpened=${opened}`);

    // PDF: validate href first, then open popup without URL assertion
    const href = await lcs.getPdfHref();
    expect(href || '').toMatch(/generate_lcs_site_report\.php\?site_id=\d+&lcs_id=\d+&from_date=\d{4}-\d{2}-\d{2}&to_date=\d{4}-\d{2}-\d{2}/);
    const popup = await lcs.openPdfAndGetPopup();
    await popup.close().catch(() => {});
  });
});
