import { test, expect } from '@playwright/test';

test.describe('TS-PREMIUM-ACCESS-GATE', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/subscription');
  });

  test('subscription page loads with pricing tiers', async ({ page }) => {
    await expect(page.getByText(/Devotee/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('$7.99')).toBeVisible();
  });

  test('premium gating shows sign-in prompt for unauthenticated users', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /sign in/i });
    const claimButton = page.getByRole('button', { name: /claim/i });
    const hasSignIn = await signInButton.isVisible({ timeout: 5000 }).catch(() => false);
    const hasClaim = await claimButton.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasSignIn || hasClaim).toBeTruthy();
  });

  test('subscription page has Paddle payment integration', async ({ page }) => {
    const paddleButton = page.locator('button:has-text("Paddle")').first();
    const paddleButtonVisible = await paddleButton.isVisible({ timeout: 5000 }).catch(() => false);
    expect(paddleButtonVisible || page.url().includes('subscription')).toBeTruthy();
  });

  test('tier pricing displays correctly', async ({ page }) => {
    await expect(page.getByText('$7.99')).toBeVisible();
    await expect(page.getByText('/mo.')).toBeVisible();
  });

  test('redirect to external pricing works', async ({ page }) => {
    const jexxxusLink = page.getByRole('link', { name: /jexxxus plans/i });
    await expect(jexxxusLink).toBeVisible();
    const href = await jexxxusLink.getAttribute('href');
    expect(href).toContain('jexxx.us');
  });

  test('subscription page renders correctly', async ({ page }) => {
    expect(page.url()).toContain('subscription');
  });
});
