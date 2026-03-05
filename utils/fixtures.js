const base = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const CreateSitePage = require('../pages/CreateSitePage');
const ViewSitePage = require('../pages/ViewSitePage');
const { testUsers } = require('./testData');

/**
 * Extend base test with custom fixtures
 */
const test = base.test.extend({
  // Login page fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Dashboard page fixture
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  // Create site page fixture
  createSitePage: async ({ page }, use) => {
    const createSitePage = new CreateSitePage(page);
    await use(createSitePage);
  },

  // View site page fixture
  viewSitePage: async ({ page }, use) => {
    const viewSitePage = new ViewSitePage(page);
    await use(viewSitePage);
  },

  // Authenticated page - automatically logs in before test
  authenticatedPage: async ({ page, loginPage }, use) => {
    await loginPage.navigate();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await use(page);
  },

  // Authenticated dashboard - logs in and navigates to dashboard
  authenticatedDashboard: async ({ page, loginPage, dashboardPage }, use) => {
    await loginPage.navigate();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await dashboardPage.navigate();
    await use(dashboardPage);
  }
});

module.exports = { test, expect: base.expect };
