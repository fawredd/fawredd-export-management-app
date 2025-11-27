/**
 * E2E tests for authentication flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[id="password"]', 'Test123!');
    await page.fill('input[id="confirmPassword"]', 'Test123!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', 'admin@example.com');
    await page.fill('input[id="password"]', 'Admin123!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', 'wrong@example.com');
    await page.fill('input[id="password"]', 'WrongPassword');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});