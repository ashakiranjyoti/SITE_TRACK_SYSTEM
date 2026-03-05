/**
 * LoginPage (Beginner Friendly POM)
 * - No BasePage
 * - Uses getByLabel / getByRole
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('index.php');
    await this.page.getByRole('button', { name: 'Login' }).waitFor({ state: 'visible' });
  }

  async login(username, password) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async togglePassword() {
    await this.page.locator('#togglePassword').click();
  }

  errorBox() {
    return this.page.locator('.error-box');
  }
}

module.exports = { LoginPage };
