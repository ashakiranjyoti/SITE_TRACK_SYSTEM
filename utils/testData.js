/**
 * Test Data - Contains test data for automation tests
 */

// User credentials from database
const testUsers = {
  admin: {
    username: 'Ravi',
    password: '123',
    fullName: 'Ravikumar Shukla',
    role: 'admin',
    accessType: 'full'
  },
  operator1: {
    username: 'operator1',
    password: '123',
    fullName: 'operator 1',
    role: 'admin',
    accessType: 'full'
  },
  operator2: {
    username: 'operator2',
    password: '123',
    fullName: 'operator 2',
    role: 'admin',
    accessType: 'full'
  },
  viewUser: {
    username: 'Ashakiran',
    password: '123',
    fullName: 'Ashakiran Jyoti',
    role: 'admin',
    accessType: 'view'
  },
  nonAdmin: {
    username: 'USER_2',
    password: '123',
    fullName: 'USER 2',
    role: 'user',
    accessType: 'view'
  },
  invalidUser: {
    username: 'invalid_user',
    password: 'wrong_password'
  }
};

// Sample site data for testing
const sampleSiteData = {
  valid: {
    siteName: `Test Site ${Date.now()}`,
    address: '123 Test Street, Test City, Test State',
    divisionName: 'Test Division',
    contractorName: 'Test Contractor Pvt Ltd',
    siteIncharge: 'Test Incharge',
    contact: '9876543210',
    numberOfTubewell: 5,
    lcsAvailable: true
  },
  minimal: {
    siteName: `Minimal Site ${Date.now()}`,
    address: 'Minimal Address',
    divisionName: 'Minimal Division',
    contractorName: 'Minimal Contractor',
    siteIncharge: 'Minimal Incharge',
    contact: '1234567890',
    numberOfTubewell: 1,
    lcsAvailable: false
  },
  duplicate: {
    siteName: 'Duplicate Site Name',
    address: 'Duplicate Address',
    divisionName: 'Duplicate Division',
    contractorName: 'Duplicate Contractor',
    siteIncharge: 'Duplicate Incharge',
    contact: '9999999999',
    numberOfTubewell: 2,
    lcsAvailable: false
  }
};

// Search terms for testing
const searchTerms = {
  valid: 'Test',
  invalid: 'NonExistentSite12345',
  partial: 'Site',
  empty: ''
};

// URLs
const urls = {
  login: '/index.php',
  dashboard: '/dashboard.php',
  createSite: '/create_site.php',
  users: '/users.php',
  siteReport: '/site_report.php',
  lcsSiteReport: '/lcs_site_report.php',
  userWiseReport: '/user_wise_report.php',
  dateChangeReport: '/date_change_report.php'
};

// Timeouts
const timeouts = {
  short: 5000,
  medium: 10000,
  long: 30000
};

// Expected messages
const messages = {
  login: {
    success: 'Dashboard',
    invalidCredentials: 'Invalid username or password',
    emptyFields: 'Please enter both username and password'
  },
  site: {
    created: 'Add Tubewell',
    duplicate: 'already exists',
    required: 'required'
  },
  dashboard: {
    noSites: 'No Sites Found',
    searchNoResults: 'No Matching Sites Found'
  }
};

module.exports = {
  testUsers,
  sampleSiteData,
  searchTerms,
  urls,
  timeouts,
  messages
};
