/**
 * Quick script to verify the correct application path
 * Run: node verify-path.js
 */

const http = require('http');

const pathsToCheck = [
  'http://localhost/ASSET_MANAGEMENT_AUTOMATION/index.php',
  'http://localhost/asset_management_automation/index.php',
  'http://localhost/ASSET_MANAGEMENT_AUTOMATION/',
  'http://localhost/asset_management_automation/',
];

console.log('Checking application paths...\n');

async function checkPath(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const isLoginPage = data.includes('loginForm') || 
                           data.includes('username') || 
                           data.includes('SiteTrack');
        resolve({
          url,
          status: res.statusCode,
          isLoginPage,
          redirected: res.headers.location || null
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        error: err.message,
        isLoginPage: false
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        isLoginPage: false
      });
    });
  });
}

async function checkAllPaths() {
  for (const path of pathsToCheck) {
    const result = await checkPath(path);
    console.log(`URL: ${result.url}`);
    console.log(`Status: ${result.status}`);
    if (result.redirected) {
      console.log(`Redirected to: ${result.redirected}`);
    }
    if (result.isLoginPage) {
      console.log('✅ This is the login page!');
    } else if (result.status === 200) {
      console.log('⚠️  Page loaded but not the login page');
    } else if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
    console.log('---\n');
  }
}

checkAllPaths().then(() => {
  console.log('\nDone! Use the URL that shows ✅ in your playwright.config.js');
});
