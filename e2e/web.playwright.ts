import { test, expect } from '@playwright/test';

test('web page loads and displays UI', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check that main heading exists
  await expect(page.locator('h1')).toContainText('Sync Training Demo');

  // Check that control buttons exist
  await expect(page.getByText('Play')).toBeVisible();
  await expect(page.getByText('Pause')).toBeVisible();
  await expect(page.getByText('Seek 1:00')).toBeVisible();
});
