# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd automation
npm install
npm run install:browsers
```

### Step 2: Start Your Server
Make sure XAMPP is running and your PHP application is accessible at:
```
http://localhost/ASSET_MANAGEMENT_AUTOMATION
```

### Step 3: Run Tests
```bash
npm test
```

## 📝 Common Commands

### Run All Tests
```bash
npm test
```

### Run Tests with Browser Visible
```bash
npm run test:headed
```

### Run Specific Test Suite
```bash
npm run test:login      # Login tests
npm run test:dashboard  # Dashboard tests
npm run test:site       # Site management tests
```

### Debug Tests
```bash
npm run test:debug
```

### View Test Report
```bash
npm run report
```

## ⚙️ Configuration

### Update Base URL
If your application runs on a different URL, edit `playwright.config.js`:
```javascript
baseURL: 'http://your-url-here'
```

### ✅ Beginner Tip: baseURL + `page.goto()`

If `baseURL` set hai:
- ✅ `page.goto('index.php')`
- ❌ `page.goto('/index.php')` (leading `/` baseURL ignore kar deta hai)

### Test Users
Test users are defined in `utils/testData.js`. Default users:
- **Admin**: Ravi / 123
- **Operator1**: operator1 / 123
- **Operator2**: operator2 / 123

## 📁 Project Structure

```
automation/
├── pages/          # Page Object Models
├── tests/          # Test files
├── utils/          # Helpers and fixtures
└── playwright.config.js
```

## 🐛 Troubleshooting

**Tests fail to connect?**
- Check if XAMPP is running
- Verify base URL in `playwright.config.js`
- Ensure database is set up

**Element not found errors?**
- Check if selectors match your HTML
- Verify application is running
- Check browser console for errors

## 📚 Next Steps

1. Review `README.md` for detailed documentation
2. Check `tests/` directory for test examples
3. Customize `utils/testData.js` with your test data
4. Add more page objects in `pages/` as needed

Happy Testing! 🎉
