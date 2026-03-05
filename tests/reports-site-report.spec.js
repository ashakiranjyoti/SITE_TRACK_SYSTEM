const { test, expect } = require('@playwright/test');
const { login, logout } = require('../utils/auth');
const { testUsers } = require('../utils/testData');

// POMs
const CreateSitePage = require('../pages/CreateSitePage');
const AddTubewellPage = require('../pages/AddTubewellPage');
const ViewSitePage = require('../pages/ViewSitePage');
const DailyStatusEditorPage = require('../pages/DailyStatusEditorPage');
const SiteReportPage = require('../pages/SiteReportPage');

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function provisionData(page) {
  const unique = Date.now();
  const siteName = `SR SITE ${unique}`;
  const twName = `SR TW ${unique}`;

  // Create site
  const createSite = new CreateSitePage(page);
  await createSite.navigate();
  await createSite.fillSiteForm({
    siteName,
    contractorName: 'SR CON',
    address: 'SR ADDRESS',
    divisionName: 'SR DIV',
    siteIncharge: 'SR INCHARGE',
    contact: '9999900000',
    numberOfTubewell: 1,
  });
  await createSite.uncheckLcsAvailable().catch(() => {});
  await createSite.clickSubmit();
  await expect(page).toHaveURL(/add_tubewell\.php/i);

  // Add tubewell
  const atp = new AddTubewellPage(page);
  await atp.fillForm({
    zone: 'SR ZONE',
    name: twName,
    incharge: 'SR INC',
    contact: '9000000000',
    address: 'SR TW ADDRESS',
    sim: '9000011111',
    lat: '11.1111',
    lng: '22.2222',
    installationDate: todayISO(),
  });
  const { siteId } = await atp.submitAndWaitEither();

  // Open Daily Status and add one item + master note for today
  const vs = new ViewSitePage(page);
  await vs.navigate(siteId);
  await page.getByRole('link', { name: '📅 Add Daily Status' }).first().click();
  await expect(page).toHaveURL(/add_parameters\.php\?tubewell_id=/i);

  const dse = new DailyStatusEditorPage(page);
  await dse.assertDateLocked(todayISO());

  const { itemName } = await dse.editFirstItemRow(
    { make: 'SR-Make', size: '5 HP', status: 'Working', hmi: 'ok', web: 'ok', remark: 'All good', contributorsCount: 1 },
    []
  );
  const note = `SR Note ${unique}`;
  await dse.editMasterNote(note, [], 1);

  return { siteName, twName, note, itemName };
}

test.describe('Reports: Site Report', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should select first site/tubewell, set last 7 days, view report and open PDF', async ({ page }) => {
    const sr = new SiteReportPage(page);
    await sr.navigate();

    // Select first available site (auto-submits) and then first tubewell
    const siteLabel = await sr.selectFirstSite();
    const twLabel = await sr.selectFirstTubewell();

    // Date range: from = today - 7 days, to = today
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const fromIso = iso(from);
    const toIso = iso(to);

    await sr.setDateRange(fromIso, toIso);
    await sr.clickView();

    // Log chosen filters to console for debug
    // eslint-disable-next-line no-console
    console.log(`Site Report Filters => Site: ${siteLabel} | Tubewell: ${twLabel} | From: ${fromIso} | To: ${toIso}`);

    await sr.assertReportVisible();
    await sr.assertTableHeaders();

    // Medium priority checks
    // - Master note display (if present)
    const hasMaster = await sr.isMasterNoteVisible();
    // - Media preview modal (if any media shown)
    const opened = await sr.openFirstMediaAndAssertModal().catch(() => false);
    // Log optional state for visibility in CI output
    // eslint-disable-next-line no-console
    console.log(`MasterNoteVisible=${hasMaster} MediaModalOpened=${opened}`);

    // Validate computed PDF href first (more reliable than popup.url for streamed PDFs)
    const href = await sr.getPdfHref();
    expect(href || '').toMatch(/generate_site_report\.php\?site_id=\d+&tubewell_id=\d+&from_date=\d{4}-\d{2}-\d{2}&to_date=\d{4}-\d{2}-\d{2}/);
    // Then open in new tab; don't assert popup URL as some engines return ':' for PDF viewers
    const popup = await sr.openPdfAndGetPopup();
    await popup.close().catch(() => {});
  });
});
