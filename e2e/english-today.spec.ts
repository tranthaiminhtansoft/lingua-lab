import { expect, test } from '@playwright/test';

test('English Today shows daily topics and a start timer popup', async ({ page }) => {
  await page.goto('english');
  await expect(page.getByRole('heading', { name: /Hôm nay có các chủ đề này/ })).toBeVisible();
  await expect(page.locator('.english-today-topic').count()).resolves.toBeGreaterThanOrEqual(6);

  await page.locator('.english-today-topic').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/Thời gian làm bài/)).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu làm bài' }).click();

  await expect(page).toHaveURL(/\/english\/.+/);
  await expect(page.locator('.english-topic-timer')).toBeVisible();
});

test('English Today refreshes content from the JSON bank', async ({ page }) => {
  await page.goto('english');
  await expect(page.getByText(/Bản đang dùng:/)).toBeVisible();
  await page.getByRole('button', { name: 'Kiểm tra bản mới' }).click();
  await expect(page.getByText(/Bạn đang dùng bản nội dung mới nhất|Đã cập nhật nội dung/)).toBeVisible();
});

test('English Today grammar section shows formula and pronunciation', async ({ page }) => {
  await page.goto('english');
  await page.locator('.english-today-topic').first().click();
  await page.getByRole('button', { name: 'Bắt đầu làm bài' }).click();
  await expect(page.locator('.english-today-formula').first()).toBeVisible();
  await expect(page.locator('.english-today-formula code').first()).toBeVisible();
});
