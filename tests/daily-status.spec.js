const { test, expect } = require('@playwright/test');
const { testUsers } = require('../utils/testData');
const { login } = require('../utils/auth');
const fs = require('fs');
// POMs
const CreateSitePage = require('../pages/CreateSitePage');
const AddTubewellPage = require('../pages/AddTubewellPage');
const ViewSitePage = require('../pages/ViewSitePage');
const DailyStatusEditorPage = require('../pages/DailyStatusEditorPage');
const ViewTubewellPage = require('../pages/ViewTubewellPage');

/**
 * Daily Status Editor (Beginner Friendly)
 * Flow:
 * - Create unique site + tubewell
 * - From view_site -> open 📅 Add Daily Status (add_parameters.php)
 * - Verify date is locked to today
 * - Edit one item row: set values, toggle HMI/Web, add remark, select contributors, upload media, Save
 * - Add a Spare Item row with media and save
 * - Edit Master Note: text, contributors, media, Save
 * - Click ← Back to view_tubewell.php, verify Latest Status and Master Note reflect changes
 */

test.describe('Daily Status Editor', () => {
  async function createSiteAndTubewell(page) {
    const unique = Date.now();
    const siteName = `DS SITE ${unique}`;
    const twName = `DS TW ${unique}`;

    // Create Site via POM
    const createSite = new CreateSitePage(page);
    await createSite.navigate();
    await createSite.fillSiteForm({
      siteName,
      contractorName: 'DS CON',
      address: 'DS ADDRESS',
      divisionName: 'DS DIV',
      siteIncharge: 'DS INCHARGE',
      contact: '9999912345',
      numberOfTubewell: 1
    });
    // Uncheck LCS (selectOption isn't in POM; page uses checkbox/select; ensure unchecked)
    await createSite.uncheckLcsAvailable().catch(() => {});
    await createSite.clickSubmit();
    await expect(page).toHaveURL(/add_tubewell\.php/i);

    // Add Tubewell via POM
    const atp = new AddTubewellPage(page);
    await atp.fillForm({
      zone: 'DS ZONE',
      name: twName,
      incharge: 'DS INC',
      contact: '9876501234',
      address: 'DS TW ADDRESS',
      sim: '9000011111',
      lat: '12.3456',
      lng: '78.9012',
      installationDate: '2026-01-02'
    });
    const { siteId } = await atp.submitAndWaitEither();

    // Navigate to view_site and open Add Daily Status
    const viewSite = new ViewSitePage(page);
    await viewSite.navigate(siteId);
    const addStatus = page.getByRole('link', { name: '📅 Add Daily Status' }).first();
    await expect(addStatus).toBeVisible();
    await addStatus.click();
    await expect(page).toHaveURL(/add_parameters\.php\?tubewell_id=/i);

    return { siteName, twName };
  }

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async function uploadIfExistsTo(inputLocator, paths) {
    const existing = paths.filter(p => {
      try { return fs.existsSync(p); } catch { return false; }
    });
    if (existing.length) {
      await inputLocator.setInputFiles(existing);
    }
  }

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });

  test('should edit daily status, add spare item, edit master note, and verify on view page', async ({ page }) => {
    await createSiteAndTubewell(page);

    // Use POM for Daily Status Editor
    const dse = new DailyStatusEditorPage(page);
    // Verify heading via POM wait
    await dse.waitForElement(dse.selectors.heading);
    await dse.assertDateLocked(todayISO());

    // Edit first item row
    const { itemName } = await dse.editFirstItemRow(
      { make: 'Make-123', size: '10 HP', status: 'Installed', hmi: 'ok', web: 'no', remark: 'Installed and verified', contributorsCount: 2 },
      [
        'C:/Users/Admin/Downloads/vid1.mp4',
        'C:/Users/Admin/Downloads/img3.jpeg',
        'C:/Users/Admin/Downloads/img2.mp4',
        'C:/Users/Admin/Downloads/ime1.jpeg',
        // 'C:/Users/Admin/Downloads/video_1.mp4',
      ],
    );

    // Add Spare item
    await dse.addSpareItem(
      { name: `Spare-${Date.now()}`, make: 'SP-Make', size: 'SP-Size', status: 'Working', hmiOk: true, webOk: true, remark: 'Spare working' },
      ['C:/Users/Admin/Downloads/img3.jpeg']
    );

    // Master Note
    const note = `Note ${Date.now()} - field observation`;
    await dse.editMasterNote(note, ['C:/Users/Admin/Downloads/img3.jpeg'], 2);

    // Back to view tubewell and verify
    await dse.clickBack();
    await expect(page).toHaveURL(/view_tubewell\.php\?tubewell_id=/i);

    const vtp = new ViewTubewellPage(page);
    await vtp.assertLatestContains(itemName, 'Make-123', '10 HP', 'Installed', 'Installed and verified');
    await vtp.assertDateBadge(todayISO());
    await vtp.assertMasterNoteContains(note);
  });

  test.beforeEach(async ({ page }) => {
    // Ensure logged in for each test
    await login(page, testUsers.admin.username, testUsers.admin.password);
  });
});
