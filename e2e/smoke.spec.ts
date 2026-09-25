import { expect, test } from '@playwright/test';

test('mobile host navigation remains keyboard accessible and Kana does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('lessons/kana');

  const menu = page.getByRole('button', { name: /menu/i });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Kana', { exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('Kana', { exact: true })).not.toHaveAttribute('href', /./);
  await expect(page.getByRole('button', { name: /Random practice/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('mobile Kana sound pronunciation controls retain 44px hit targets without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('lessons/kana');

  const soundSpeakers = page.locator('.kana-page .sound-speaker');
  await expect(soundSpeakers).not.toHaveCount(0);
  await expect.poll(() => soundSpeakers.evaluateAll((buttons) => buttons.every((button) => {
    const styles = window.getComputedStyle(button);
    return Number.parseFloat(styles.width) >= 44 && Number.parseFloat(styles.height) >= 44;
  }))).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Kana section edge menu is keyboard reachable and closes on Escape or outside click', async ({ page }) => {
  await page.goto('lessons/kana');

  const trigger = page.locator('.kana-section-menu-trigger');
  await expect(trigger).toHaveAccessibleName('Open Kana sections');
  await expect(trigger).toHaveAttribute('aria-controls', 'kana-section-menu');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAccessibleName('Close Kana sections');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Kana sections' })).toBeVisible();
  const active = page.locator('[aria-current="location"]');
  await expect(active).toHaveText('Basics');
  await expect(active).toHaveAttribute('aria-disabled', 'true');
  await expect(active).not.toHaveAttribute('href', /./);
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.locator('h1').click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('Kana route presents the source sections and real Japanese speech controls', async ({ page }) => {
  await page.goto('lessons/kana');
  await expect(page.getByText('Learn one sound at a time')).toBeVisible();
  const basics = page.locator('#basics');
  await expect(basics).toBeVisible();
  await expect(basics.getByRole('heading', { name: /Learn the basics/i })).toHaveText(/基本を学ぶ/);
  await expect(basics.locator('dt')).toHaveText([
    'Hiragana ひらがな',
    'Katakana カタカナ',
    'Romaji ローマ字',
    'Dakuten 濁点（゛）',
    'Handakuten 半濁点（゜）',
  ]);
  await expect(page.locator('#tables')).toBeVisible();
  const referenceTables = page.locator('#tables table');
  await expect(referenceTables).toHaveCount(3);
  await expect(referenceTables.nth(0)).toHaveAccessibleName(/Basic kana/i);
  await expect(page.getByText('71 complete pairs')).toBeVisible();
  await expect(page.locator('#yoon')).toBeVisible();
  await expect(page.locator('#sokuon')).toBeVisible();
  await expect(page.locator('#choon')).toBeVisible();

  const glyph = page.getByTestId('practice-glyph');
  const before = await glyph.textContent();
  const rate = page.getByRole('slider', { name: 'Speech rate' });
  await expect(rate).toHaveValue('0.1');
  await page.keyboard.press('ArrowRight');
  await expect(glyph).not.toHaveText(before ?? '');
  const advancedGlyph = await glyph.textContent();
  await rate.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Control+ArrowRight');
  await expect(glyph).toHaveText(advancedGlyph ?? '');
  await page.getByRole('button', { name: /Random practice/i }).click();
  await expect(glyph).not.toHaveText(advancedGlyph ?? '');

  const speakers = page.getByRole('button', { name: /Play Japanese pronunciation for/ });
  await expect(speakers).toHaveCount(47);
  await expect(rate).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Japanese voice' })).toHaveCount(0);
  await rate.fill('0.75');
  await expect(page.getByText('0.75×')).toBeVisible();
  const status = page.getByRole('status');
  await expect(status).not.toHaveText(/Mock audio|no sound is connected/i);
  await expect(status).toHaveText(/Checking Japanese voice availability|Speech is not supported by this browser|No Japanese voice is available on this device|Japanese voice is ready/);
  if (await speakers.first().isEnabled()) {
    await speakers.first().click();
    await expect(status).toHaveText(/Japanese voice is ready|Speaking the Kana/);
  }
});

test('lobby links to the source-faithful Kana lesson', async ({ page }) => {
  await page.goto('.');
  await expect(page.getByRole('heading', { name: 'Nihongo O Benkyou' })).toBeVisible();
  await page.getByRole('link', { name: 'Start Kana' }).click();
  await expect(page).toHaveURL(/\/lingua-lab\/lessons\/kana$/);
  await expect(page.getByRole('heading', { level: 1, name: /Kana/ })).toBeVisible();
});

test('GitHub Pages fallback preserves the direct Kana URL through refresh', async ({ page }) => {
  await page.goto('lessons/kana');
  await expect(page).toHaveURL(/\/lingua-lab\/lessons\/kana$/);
  await expect(page.getByRole('heading', { level: 1, name: /Kana/ })).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/lingua-lab\/lessons\/kana$/);
  await expect(page.getByRole('heading', { level: 1, name: /Kana/ })).toBeVisible();
});
