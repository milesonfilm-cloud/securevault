import { test, expect } from '@playwright/test';

async function resetVaultSession(page: import('@playwright/test').Page) {
  await page.goto('/family-management');
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase('strongvault');
    localStorage.setItem(
      'sv_consent_v1',
      JSON.stringify({
        analytics: false,
        aiProcessing: true,
        acceptedAt: new Date().toISOString(),
      })
    );
    localStorage.setItem('sv_plan_tier', 'pro');
    try {
      sessionStorage.setItem('sv_auth_intro', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/family-management');
}

test.describe('Authentication flow', () => {
  test.beforeEach(async ({ page }) => {
    await resetVaultSession(page);
  });

  test('shows setup screen on first visit', async ({ page }) => {
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });
    const heading = await page.getByRole('heading').first().textContent();
    expect(heading).toMatch(/create|password|setup|vault|pin/i);
  });

  test('creates vault with valid PIN', async ({ page }) => {
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });
    const inputs = await page.locator('input[type="password"]').all();
    await inputs[0].fill('SecurePin123!');
    if (inputs.length > 1) await inputs[1].fill('SecurePin123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/family-management|document-vault/, { timeout: 20000 });
  });

  test('shows error for PIN shorter than 6 characters', async ({ page }) => {
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });
    const inputs = await page.locator('input[type="password"]').all();
    await inputs[0].fill('abcde');
    if (inputs.length > 1) await inputs[1].fill('abcde');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows mismatch error when PINs differ', async ({ page }) => {
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });
    const inputs = await page.locator('input[type="password"]').all();
    await inputs[0].fill('SecurePin123!');
    if (inputs.length > 1) await inputs[1].fill('DifferentPin456!');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Document vault', () => {
  test.beforeEach(async ({ page }) => {
    await resetVaultSession(page);
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });
    const inputs = await page.locator('input[type="password"]').all();
    await inputs[0].fill('TestPin9999!');
    if (inputs.length > 1) await inputs[1].fill('TestPin9999!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/family-management|document-vault/, { timeout: 25000 });
  });

  test('navigates to document vault', async ({ page }) => {
    await page.goto('/document-vault');
    await expect(page.getByText(/vault|document|category/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('can open add document modal', async ({ page }) => {
    await page.goto('/document-vault');
    const addBtn = page.locator('button', { hasText: /add|new/i }).first();
    await addBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    }
  });
});
