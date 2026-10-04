import { expect, test } from '@playwright/test';

const kanaPath = 'nihongo-o-benkyuo/kana';
const grammarPath = 'nihongo-o-benkyuo/grammar';
const firstIntroductionsPath = `${grammarPath}/first-introductions`;
const vocabularyPath = 'nihongo-o-benkyuo/vocabulary';

test('Grammar presents a distinct, complete first-introductions learning path', async ({ page }) => {
  await page.goto(grammarPath);
  await expect(page.getByRole('heading', { level: 1, name: /Grammar/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore this topic/ })).toHaveAttribute('href', '/lingua-lab/nihongo-o-benkyuo/grammar/first-introductions');
  await page.getByRole('link', { name: /Explore this topic/ }).click();
  await expect(page).toHaveURL(/\/lingua-lab\/nihongo-o-benkyuo\/grammar\/first-introductions$/);
  await expect(page.getByRole('heading', { name: /First introductions/ })).toBeVisible();
  await expect(page.locator('#opening')).toContainText('はじめまして。');

  await expect(page.locator('#patterns').locator('.grammar-pattern-card')).toHaveCount(4);
  await expect(page.locator('#patterns .grammar-formula-pairs')).toHaveCount(4);
  await expect.poll(() => page.locator('#patterns .grammar-formula-pairs').evaluateAll((formulas) => formulas.every((formula) => Array.from(formula.querySelectorAll('.japanese-romaji-pair')).every((pair) => Boolean(pair.querySelector('[lang="ja"]')?.textContent?.trim() && pair.querySelector('[lang="ja-Latn"]')?.textContent?.trim()))))).toBe(true);
  await expect(page.locator('#patterns')).not.toContainText('Ask a yes-or-no question');
  await expect(page.locator('#patterns')).not.toContainText('Ask who or how old');
  await expect(page.getByRole('link', { name: 'Explore Yes/No and WH questions →' })).toHaveAttribute('href', '/lingua-lab/nihongo-o-benkyuo/grammar/question-types');
  const negativePattern = page.locator('#patterns .grammar-pattern-card').nth(1);
  await expect(negativePattern.locator('.grammar-formula .japanese-romaji-alternative [lang="ja"]')).toHaveText('では');
  await expect(negativePattern.locator('.grammar-formula .japanese-romaji-alternative [lang="ja-Latn"]')).toHaveText('de wa');
  await expect(negativePattern.locator('.grammar-example .japanese-romaji-alternative [lang="ja"]')).toHaveText('では');
  await expect(negativePattern.locator('.grammar-example .japanese-romaji-alternative [lang="ja-Latn"]')).toHaveText('de wa');
  const dialogue = page.locator('#dialogue');
  await expect(dialogue.locator('.dialogue-line')).toHaveCount(10);
  const japaneseDialogue = (await dialogue.locator('[lang="ja"]').allTextContents()).join('');
  expect(japaneseDialogue).toContain('山田新');
  expect(japaneseDialogue).toContain('森若菜');
  expect(japaneseDialogue).toContain('お仕事');
  expect(japaneseDialogue).toContain('エンジニア');
  expect(japaneseDialogue).toContain('技師');
  expect(japaneseDialogue).toContain('またお会い');
  const jobQuestion = dialogue.locator('.dialogue-line').nth(5);
  await expect(jobQuestion).toContainText('nan');
  await expect(jobQuestion).toContainText('What do you do?');
  await expect.poll(() => dialogue.locator('.japanese-romaji-pair').evaluateAll((pairs) => pairs.every((pair) => Boolean(pair.querySelector('[lang="ja"]')?.textContent?.trim() && pair.querySelector('[lang="ja-Latn"]')?.textContent?.trim())))).toBe(true);
  await expect(page.locator('#practice').locator('details')).toHaveCount(2);
});

test('Grammar lesson fits narrow screens without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(firstIntroductionsPath);
  await expect(page.getByRole('heading', { name: /First introductions/ })).toBeVisible();
  const sectionMenu = page.getByRole('button', { name: 'Open grammar sections' });
  await expect(sectionMenu).toBeVisible();
  await sectionMenu.click();
  await expect(page.getByRole('navigation', { name: 'Grammar sections' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Grammar sections' }).getByRole('link', { name: 'Sentence patterns' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Vocabulary route exposes the first-introductions topic and word groups', async ({ page }) => {
  await page.goto(vocabularyPath);
  await expect(page.getByRole('heading', { level: 1, name: /Vocabulary/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore this topic/ })).toHaveAttribute('href', '/lingua-lab/nihongo-o-benkyuo/vocabulary/first-introductions');
  await page.getByRole('link', { name: /Explore this topic/ }).click();
  await expect(page).toHaveURL(/\/lingua-lab\/nihongo-o-benkyuo\/vocabulary\/first-introductions$/);
  await expect(page.getByRole('heading', { name: /First introductions/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'People & names' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Work & identity' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Countries & origins' })).toBeVisible();
  await expect(page.locator('#meeting-phrases')).toContainText('どうぞよろしくお願いします');
  await expect.poll(() => page.locator('.vocabulary-group dt').evaluateAll((terms) => terms.length > 0 && terms.every((term) => term.querySelector('small[lang="ja-Latn"]')?.textContent?.trim()))).toBe(true);
});

test('mobile host navigation remains keyboard accessible and Kana does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(kanaPath);

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
  await page.goto(kanaPath);

  const soundSpeakers = page.locator('.kana-page .sound-speaker');
  await expect(soundSpeakers).not.toHaveCount(0);
  await expect.poll(() => soundSpeakers.evaluateAll((buttons) => buttons.every((button) => {
    const styles = window.getComputedStyle(button);
    return Number.parseFloat(styles.width) >= 44 && Number.parseFloat(styles.height) >= 44;
  }))).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Kana section edge menu is keyboard reachable and closes on Escape or outside click', async ({ page }) => {
  await page.goto(kanaPath);

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
  await page.goto(kanaPath);
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
    'Yōon 拗音',
    'Sokuon 促音',
    'Chōon 長音',
  ]);
  await expect(page.locator('#tables')).toBeVisible();
  const referenceTables = page.locator('#tables [role="table"]');
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

test('language constellation and Nihongo lobby link to Grammar and Kana', async ({ page }) => {
  await page.goto('.');
  await expect(page.getByRole('heading', { name: 'Find your language.' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore Nihongo learning path' }).click();
  await expect(page).toHaveURL(/\/lingua-lab\/nihongo-o-benkyuo$/);
  await expect(page.getByRole('heading', { name: 'Nihongo O Benkyou' })).toBeVisible();
  await page.getByRole('link', { name: 'Start Grammar' }).click();
  await expect(page).toHaveURL(/\/lingua-lab\/nihongo-o-benkyuo\/grammar$/);
  await expect(page.getByRole('heading', { level: 1, name: /Grammar/ })).toBeVisible();
  await page.goto('nihongo-o-benkyuo');
  await page.getByRole('link', { name: 'Start Kana' }).click();
  await expect(page).toHaveURL(/\/lingua-lab\/nihongo-o-benkyuo\/kana$/);
  await expect(page.getByRole('heading', { level: 1, name: /Kana/ })).toBeVisible();
});

test('GitHub Pages fallback preserves the direct Kana URL through refresh', async ({ page }) => {
  await page.goto(kanaPath);
  await expect(page).toHaveURL(/\/lingua-lab\/nihongo-o-benkyuo\/kana$/);
  await expect(page.getByRole('heading', { level: 1, name: /Kana/ })).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/lingua-lab\/nihongo-o-benkyuo\/kana$/);
  await expect(page.getByRole('heading', { level: 1, name: /Kana/ })).toBeVisible();
});

test('legacy Kana URL redirects to the canonical Nihongo route', async ({ page }) => {
  await page.goto('lessons/kana');
  await expect(page).toHaveURL(/\/lingua-lab\/nihongo-o-benkyuo\/kana$/);
  await expect(page.getByRole('heading', { level: 1, name: /Kana/ })).toBeVisible();
});
