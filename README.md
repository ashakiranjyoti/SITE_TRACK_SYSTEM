# SiteTrack Asset Management - Automation Testing (Beginner Friendly)

This directory contains Playwright E2E automation tests for the SiteTrack Asset Management System.

If you are a beginner:
- Start with the **tests/** folder (simple + readable)
- Use the locators: **getByRole / getByLabel / getByPlaceholder**
- Reuse login code from: `utils/auth.js`

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Test Organization](#test-organization)
- [Page Object Model (POM)](#page-object-model-pom)
- [Configuration](#configuration)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- XAMPP or similar PHP server running
- Database `site_asset_db` should be set up with the provided schema

## Installation

1. Navigate to the automation directory:
```bash
cd automation
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install:browsers
```

## Project Structure

```
automation/
├── pages/                  # Page Object Model classes
│   ├── BasePage.js        # Base class for all pages
│   ├── LoginPage.js       # Login page POM
│   ├── DashboardPage.js   # Dashboard page POM
│   ├── CreateSitePage.js  # Create site page POM
│   └── ViewSitePage.js    # View site page POM
├── tests/                 # E2E test files
│   ├── login.spec.js      # Login page tests
│   ├── dashboard.spec.js  # Dashboard tests
│   ├── site-management.spec.js  # Site management tests
│   └── navigation.spec.js  # Navigation and user flow tests
├── utils/                 # Utility files
│   ├── fixtures.js       # Playwright fixtures
│   ├── testData.js       # Test data constants
│   └── helpers.js        # Helper functions
├── playwright.config.js  # Playwright configuration
├── package.json          # npm configuration
└── README.md            # This file
```

## Running Tests

### IMPORTANT (Beginner Tip): baseURL + page.goto()

We have `baseURL` set in `playwright.config.js`.

- ✅ Correct: `await page.goto('index.php')`
- ❌ Wrong: `await page.goto('/index.php')`

Because leading `/` ignores the baseURL and goes to `http://localhost/index.php` (XAMPP dashboard issue).

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests with UI mode
```bash
npm run test:ui
```

### Run specific test suite
```bash
npm run test:login        # Login tests only
npm run test:dashboard    # Dashboard tests only
npm run test:site         # Site management tests only
npm run test:navigation   # Navigation tests only
```

### Run tests on specific browser
```bash
npm run test:chromium     # Chrome/Edge
npm run test:firefox      # Firefox
npm run test:webkit       # Safari
```

### View test report
```bash
npm run report
```

## Test Organization

### Test Suites

1. **login.spec.js** - Tests for login functionality (Beginner friendly)
   - Login page display
   - Successful login
   - Invalid credentials
   - Password visibility toggle
   - Form validation

2. **dashboard.spec.js** - Tests for dashboard (Beginner friendly)
   - Dashboard display
   - Site search functionality
   - Site card display
   - Navigation to site details
   - Menu navigation

3. **site-management.spec.js** - Tests for site management (Beginner friendly)
   - Create new site
   - View site details
   - Site validation
   - Duplicate site handling
   - Site information display

4. **navigation.spec.js** - Tests for navigation and user flows (Beginner friendly)
   - Complete user workflows
   - Menu navigation
   - Session management
   - Protected page access

## Page Object Model (POM)

The project uses Page Object Model pattern for better maintainability.

Beginner note:
- Abhi tests direct `page.getByRole(...)` use karte hain (easy to learn).
- POM files `pages/` me rakhe hain so you can learn step-by-step.

- **BasePage**: Base class with common methods
- **LoginPage**: Methods for login page interactions
- **DashboardPage**: Methods for dashboard interactions
- **CreateSitePage**: Methods for creating sites
- **ViewSitePage**: Methods for viewing site details

### Example Usage

```javascript
const { test } = require('../utils/fixtures');
const LoginPage = require('../pages/LoginPage');

test('login test', async ({ loginPage }) => {
  await loginPage.navigate();
  await loginPage.login('username', 'password');
});
```

## Configuration

### Base URL

The base URL is configured in `playwright.config.js`:
```javascript
baseURL: 'http://localhost/ASSET_MANAGEMENT_AUTOMATION'
```

Update this if your application runs on a different URL.

### Test Data

Test data is stored in `utils/testData.js`:
- User credentials
- Sample site data
- Search terms
- Expected messages

### Fixtures

Custom fixtures are defined in `utils/fixtures.js`:
- `loginPage` - Login page instance
- `dashboardPage` - Dashboard page instance
- `authenticatedPage` - Page with user already logged in
- `authenticatedDashboard` - Dashboard with user logged in

## Test Data

The tests use the following test users (from database):
- **Admin**: username: `Ravi`, password: `123`
- **Operator1**: username: `operator1`, password: `123`
- **Operator2**: username: `operator2`, password: `123`
- **View User**: username: `Ashakiran`, password: `123`

## Best Practices

1. **Page Object Model**: All page interactions are abstracted into page objects
2. **Fixtures**: Use fixtures for common setup (like authenticated sessions)
3. **Test Data**: Centralized test data in `utils/testData.js`
4. **Helpers**: Reusable helper functions in `utils/helpers.js`
5. **Descriptive Names**: Test names clearly describe what they test
6. **Isolation**: Tests are designed to be independent

## Troubleshooting

### Tests fail with connection error
- Ensure XAMPP is running
- Check if the base URL in `playwright.config.js` is correct
- Verify database connection in `db_config.php`

### Tests fail with element not found
- Check if selectors in page objects match the actual HTML
- Verify the application is running and accessible
- Check browser console for JavaScript errors

### Tests are slow
- Tests run sequentially by default to avoid data conflicts
- You can enable parallel execution in `playwright.config.js` if tests are independent

## CI/CD Integration

The project includes a GitHub Actions workflow (`.github/workflows/playwright.yml`) for CI/CD integration.

## Contributing

When adding new tests:
1. Create page objects in `pages/` if needed
2. Add test data to `utils/testData.js`
3. Write tests in `tests/` directory
4. Follow existing naming conventions
5. Update this README if adding new features

## License

ISC
