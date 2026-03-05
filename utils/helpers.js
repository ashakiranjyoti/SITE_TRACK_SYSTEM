/**
 * Helper Functions - Utility functions for tests
 */

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random number
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function generateRandomNumber(min = 1, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate unique site name
 * @returns {string} Unique site name
 */
function generateUniqueSiteName() {
  return `Test Site ${Date.now()}_${generateRandomString(5)}`;
}

/**
 * Generate unique email
 * @returns {string} Unique email
 */
function generateUniqueEmail() {
  return `test_${Date.now()}_${generateRandomString(5)}@test.com`;
}

/**
 * Generate phone number
 * @returns {string} Phone number
 */
function generatePhoneNumber() {
  return `9${generateRandomNumber(100000000, 999999999)}`;
}

/**
 * Wait for specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after specified time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current timestamp
 * @returns {number} Current timestamp
 */
function getCurrentTimestamp() {
  return Date.now();
}

/**
 * Extract number from string
 * @param {string} str - String containing number
 * @returns {number} Extracted number
 */
function extractNumber(str) {
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Check if string contains substring (case insensitive)
 * @param {string} str - Main string
 * @param {string} substring - Substring to search
 * @returns {boolean} True if contains
 */
function containsIgnoreCase(str, substring) {
  return str.toLowerCase().includes(substring.toLowerCase());
}

/**
 * Generate test site data
 * @param {Object} overrides - Data to override
 * @returns {Object} Site data object
 */
function generateTestSiteData(overrides = {}) {
  return {
    siteName: generateUniqueSiteName(),
    address: `Test Address ${generateRandomString(10)}`,
    divisionName: `Division ${generateRandomString(5)}`,
    contractorName: `Contractor ${generateRandomString(8)}`,
    siteIncharge: `Incharge ${generateRandomString(6)}`,
    contact: generatePhoneNumber(),
    numberOfTubewell: generateRandomNumber(1, 10),
    lcsAvailable: false,
    ...overrides
  };
}

module.exports = {
  generateRandomString,
  generateRandomNumber,
  generateUniqueSiteName,
  generateUniqueEmail,
  generatePhoneNumber,
  wait,
  formatDate,
  getCurrentTimestamp,
  extractNumber,
  containsIgnoreCase,
  generateTestSiteData
};
