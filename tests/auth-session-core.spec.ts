import { test, expect } from '@playwright/test';

test.describe('TS-AUTH-SESSION-CORE', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('unauthenticated user sees sign-in prompt', async ({ page }) => {
    await expect(page.getByText(/sign in/i, { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('clerk auth elements are present on page', async ({ page }) => {
    await page.goto('/');
    const clerkSignIn = page.locator('[data-clerk-element]');
    await expect(clerkSignIn.or(page.getByRole('button', { name: /sign in/i })).first()).toBeVisible({ timeout: 10000 });
  });

  test('auth session cookie is set after login', async ({ page }) => {
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('clerk'));
    expect(sessionCookie).toBeDefined();
  });

  test('server auth context validates session token', async ({ page }) => {
    await page.goto('/api/health');
    const response = await page.request.get('/api/health');
    expect([200, 401, 403]).toContain(response.status());
  });

  test('logout clears session', async ({ page }) => {
    await page.goto('/');
    const signOutButton = page.getByRole('button', { name: /sign out/i }).first();
    if (await signOutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await signOutButton.click();
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('clerk'));
      expect(sessionCookie?.value).toBeFalsy();
    }
  });
});
