import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const questionPath = 'nihongo-o-benkyuo/grammar/question-types';

async function settleQuestionMotion(page: Page) {
  await expect.poll(() => page.locator('.question-workspace').evaluate((element) =>
    element.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running'),
  )).toBe(false);
}

async function chooseType(page: Page, id: string) {
  const group = id.startsWith('yes-no-') ? 'yes-no' : 'wh';
  if (await page.locator(`#${group}`).getAttribute('open') === null) await page.locator(`#${group} > summary`).click();
  await page.locator(`#${id} > summary`).click();
  await expect(page.locator(`#${id} > summary`)).toHaveAttribute('aria-expanded', 'true');
  await settleQuestionMotion(page);
  await expect(page.locator(`#${id} .question-forms`)).toBeVisible();
}

for (const width of [1280, 360]) {
  test(`question topic navigation and centered heading stamp work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(questionPath);
    await expect(page.getByRole('button', { name: 'Back to top' })).toHaveCount(0);
    const stamp = page.locator('.question-reference-stamp');
    await expect(stamp.locator('b')).toHaveText('?');
    expect(await stamp.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return Array.from(element.children).every((child) => {
        const rect = child.getBoundingClientRect();
        return Math.abs(rect.left + rect.width / 2 - box.left - box.width / 2) < 1;
      });
    })).toBe(true);
    expect(await page.locator('h1 > [lang="ja"]').evaluate((element) => {
      const title = element.getBoundingClientRect();
      const reading = element.querySelector('.question-heading-reading')!.getBoundingClientRect();
      return Math.abs(reading.left + reading.width / 2 - title.left - title.width / 2) < 1;
    })).toBe(true);

    const trigger = page.getByRole('button', { name: 'Open grammar sections' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('navigation', { name: 'Grammar sections', exact: true });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link', { name: 'WH questions' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await menu.getByRole('link', { name: 'WH questions' }).click();
    await expect(page).toHaveURL(/#wh$/);
    await expect(page.locator('#wh')).toHaveAttribute('open', '');
    await expect(menu).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Back to top' })).toBeVisible();
    await trigger.click();
    await expect(menu.locator('[aria-current="location"]')).toHaveText('WH questions');
    await page.locator('#wh > summary').click();
    await expect(page.locator('#wh')).not.toHaveAttribute('open', '');
    await trigger.click();
    await menu.getByRole('link', { name: 'WH questions' }).click();
    await expect(page.locator('#wh')).toHaveAttribute('open', '');
    await trigger.click();
    await menu.getByRole('link', { name: 'Yes / No' }).click();
    await expect(page.locator('#yes-no')).toHaveAttribute('open', '');
    await trigger.click();
    await page.locator('.question-detail-panel .question-detail-family-description').click();
    await expect(menu).toHaveCount(0);
    await chooseType(page, 'yes-no-nouns');
    await page.locator('#yes-no-nouns .question-time-card').last().evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.getByRole('button', { name: 'Back to top' }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByRole('button', { name: 'Back to top' })).toHaveCount(0);
    await trigger.click();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (test.info().project.name === 'chromium') await page.screenshot({ path: `/private/tmp/lingua-question-navigation-${width}.png` });
  });
}

test('opens a question family and type, with matching replies across time', async ({ page }) => {
  await page.goto('nihongo-o-benkyuo/grammar');
  await page.getByRole('link', { name: /Explore question types/ }).click();
  await expect(page).toHaveURL(/\/grammar\/question-types$/);
  await expect(page.getByRole('heading', { level: 1, name: /Question types/ })).toBeVisible();
  await expect(page.locator('.question-group')).toHaveCount(2);
  await expect(page.locator('.question-group[open]')).toHaveCount(0);
  await expect(page.getByText('Your turn')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Try it' })).toHaveCount(0);
  await page.locator('#yes-no > summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#yes-no')).toHaveAttribute('open', '');
  await expect(page.locator('.question-group .question-type')).toHaveCount(0);
  await expect(page.locator('#yes-no-questions .question-type')).toHaveCount(3);
  await expect(page.locator('.question-type[open]')).toHaveCount(0);
  await settleQuestionMotion(page);
  const [listBox, detailBox] = await Promise.all([page.locator('#yes-no').boundingBox(), page.locator('.question-detail-panel').boundingBox()]);
  expect(detailBox!.x).toBeCloseTo(listBox!.x + listBox!.width, 1);
  expect(Math.abs(detailBox!.y - listBox!.y)).toBeLessThan(1);
  expect(detailBox!.height).toBeCloseTo(listBox!.height, 1);
  expect(listBox!.width).toBeLessThan(90);
  expect(await page.locator('#yes-no .question-group-title').evaluate((element) => getComputedStyle(element).writingMode)).toBe('vertical-rl');
  await expect(page.locator('#yes-no .japanese-with-romaji-text')).toBeVisible();
  await expect(page.locator('#yes-no .grammar-romaji')).toHaveText('Hai / iie no shitsumon');
  await expect(page.locator('#yes-no .grammar-romaji')).toBeVisible();
  expect((await page.locator('#wh').boundingBox())!.y).toBeGreaterThan(detailBox!.y + detailBox!.height);
  await chooseType(page, 'yes-no-nouns');
  expect((await page.locator('#yes-no').boundingBox())!.width).toBeCloseTo(listBox!.width, 1);
  const expanded = (await page.locator('.question-detail-panel').boundingBox())!;
  expect(expanded.height).toBeGreaterThan(detailBox!.height * 2);
  expect(expanded.height).toBeCloseTo((await page.locator('#yes-no').boundingBox())!.height, 1);
  expect((await page.locator('#wh').boundingBox())!.y).toBeGreaterThan(expanded.y + expanded.height);
  await expect(page.locator('#yes-no-nouns .question-time-card')).toHaveCount(3);
  await expect(page.locator('#yes-no-nouns')).toContainText('Is Min a student?');
  await expect(page.locator('#yes-no-nouns')).toContainText('No, Min isn’t a student.');
  await expect(page.locator('#yes-no-nouns')).toContainText('Yes, that’s right.');
  await expect(page.locator('#yes-no-nouns')).toContainText('No, that’s not right.');
  await expect(page.locator('#yes-no-nouns')).toContainText('Were you a student last year?');
  await expect(page.locator('#yes-no-nouns')).toContainText('No, I wasn’t a student.');
  await expect(page.locator('#yes-no-nouns')).toContainText('Are you still going to be a student next year?');
  await expect(page.locator('#yes-no-nouns')).toContainText('No, I’m going to be a company employee next year.');
  if (test.info().project.name === 'chromium') await page.screenshot({ path: '/private/tmp/lingua-question-side-by-side.png' });
  await chooseType(page, 'yes-no-actions');
  await expect(page.locator('.question-detail-panel')).toHaveCount(1);
  await expect(page.locator('#yes-no-nouns')).not.toHaveAttribute('open', '');
  await expect(page.locator('#yes-no-nouns > summary')).toBeVisible();
  await expect(page.locator('#yes-no-actions .question-time-card')).toHaveCount(5);
  await expect(page.locator('#yes-no-actions')).toContainText('Are you studying Japanese now?');
  await expect(page.locator('#yes-no-actions')).toContainText('No, I’m not studying.');
  await expect(page.locator('#yes-no-actions')).toContainText('Were you studying Japanese last night?');
  await expect(page.locator('#yes-no-actions')).toContainText('No, I wasn’t studying.');
  await page.goBack();
  await expect(page.locator('#yes-no-nouns .question-forms')).toBeVisible();
  await page.getByRole('button', { name: 'Close question details' }).click();
  await expect(page.locator('#yes-no-family .question-detail-slot')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.question-workspace')).not.toHaveClass(/has-selection/);
  await settleQuestionMotion(page);
  expect((await page.locator('#yes-no-family .question-detail-slot').boundingBox())!.height).toBe(0);
  expect((await page.locator('#yes-no').boundingBox())!.width).toBeGreaterThan(listBox!.width * 2);
  expect(await page.locator('#yes-no .question-group-title').evaluate((element) => getComputedStyle(element).writingMode)).toBe('horizontal-tb');
  const [closedYesNo, closedWh] = await Promise.all([page.locator('#yes-no').boundingBox(), page.locator('#wh').boundingBox()]);
  expect(closedWh!.y - closedYesNo!.y - closedYesNo!.height).toBeLessThan(40);
  if (test.info().project.name === 'chromium') await page.screenshot({ path: '/private/tmp/lingua-question-families-collapsed.png' });
});

test('WH types preserve inline alternatives, romaji and question-answer pairs', async ({ page }) => {
  await page.goto(questionPath);
  await page.locator('#wh > summary').click();
  await expect(page.locator('.question-group .question-type')).toHaveCount(0);
  await expect(page.locator('#wh-questions .question-type')).toHaveCount(14);
  await chooseType(page, 'who');
  const whoPresent = page.locator('#who .question-time-card').first();
  await expect(whoPresent.locator('.question-prompt .japanese-romaji-alternative [lang="ja"]')).toHaveText('どなた');
  await expect(whoPresent).toContainText('That’s Tanaka-san.');
  await chooseType(page, 'age');
  const agePresent = page.locator('#age .question-time-card').first();
  await expect(agePresent.locator('.question-prompt .japanese-romaji-alternative [lang="ja"]')).toHaveText('おいくつ');
  await expect(agePresent.locator('.question-reply .grammar-romaji')).toHaveText(['Hatachi', 'desu.']);
  await chooseType(page, 'where');
  await expect(page.locator('#wh > summary')).toBeInViewport();
  expect(await page.locator('#wh .question-group-title').evaluate((element) => getComputedStyle(element).writingMode)).toBe('vertical-rl');
  expect(await page.locator('#yes-no .question-group-title').evaluate((element) => getComputedStyle(element).writingMode)).toBe('horizontal-tb');
  const wherePresent = page.locator('#where .question-time-card').first();
  const question = wherePresent.locator('.question-prompt');
  await expect(question.locator('.japanese-romaji-alternative [lang="ja"]')).toHaveText('どちら');
  await expect(question.locator('.japanese-romaji-alternative [lang="ja-Latn"]')).toHaveText('dochira');
  await expect(question).toContainText('doko');
  await expect(wherePresent.locator('.question-reply')).toContainText('It’s in the meeting room.');
  if (test.info().project.name === 'chromium') await page.screenshot({ path: '/private/tmp/lingua-question-sidebar-wh.png' });
  await chooseType(page, 'which');
  await expect(page.locator('#which')).toContainText('Dore and dono + noun are different structures');
  await expect(page.locator('#which .question-time-card').first().locator('.question-prompt .question-full-alternative [lang="ja"]')).toHaveText(['どれ', 'が', '好（す）き', 'です', 'か。']);
  // Every sentence, formula and inline alternative has a corresponding reading.
  await expect.poll(() => page.locator('.question-types-page .japanese-romaji-pair').evaluateAll((pairs) => pairs.every((pair) => {
    const primary = Boolean(pair.querySelector(':scope > [lang="ja"]')?.textContent?.trim() && pair.querySelector(':scope > [lang="ja-Latn"]')?.textContent?.trim());
    const alternative = pair.querySelector('.japanese-romaji-alternative');
    return primary && (!alternative || Boolean(alternative.querySelector('[lang="ja"]')?.textContent?.trim() && alternative.querySelector('[lang="ja-Latn"]')?.textContent?.trim()));
  }))).toBe(true);
});

test('question family frames keep their closed width across responsive breakpoints', async ({ page }) => {
  for (const width of [1280, 860, 620, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(questionPath);
    const closed = (await page.locator('#yes-no').boundingBox())!;
    await page.locator('#yes-no > summary').click();
    await settleQuestionMotion(page);
    for (const expanded of [false, true]) {
      if (expanded) await chooseType(page, 'yes-no-nouns');
      const [rail, panel] = await Promise.all([page.locator('#yes-no').boundingBox(), page.locator('#yes-no-questions').boundingBox()]);
      expect(rail!.x, `Left edge at ${width}px`).toBeCloseTo(closed.x, 1);
      expect(panel!.x, `Joined edge at ${width}px`).toBeCloseTo(rail!.x + rail!.width, 1);
      expect(panel!.x + panel!.width, `Right edge at ${width}px, subtype expanded: ${expanded}`).toBeCloseTo(closed.x + closed.width, 1);
      expect(panel!.height, `Matching height at ${width}px`).toBeCloseTo(rail!.height, 1);
    }
    await page.getByRole('button', { name: 'Close question details' }).click();
    await settleQuestionMotion(page);
    expect((await page.locator('#yes-no').boundingBox())!.width).toBeCloseTo(closed.width, 1);
  }
});

test('animates family resizing and subtype expansion, including closing and reduced motion', async ({ page }) => {
  await page.goto(questionPath);
  const fullWidth = (await page.locator('#yes-no').boundingBox())!.width;
  const resizing = await page.locator('#yes-no > summary').evaluate(async (element) => {
    (element as HTMLElement).click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    return element.closest('.question-family-row')!.getAnimations().some((animation) =>
      animation instanceof CSSTransition && animation.transitionProperty === 'grid-template-columns' && animation.playState === 'running',
    );
  });
  expect(resizing).toBe(true);
  await settleQuestionMotion(page);
  expect((await page.locator('#yes-no').boundingBox())!.width).toBeLessThan(fullWidth / 2);
  for (const expanded of [true, false, true]) {
    const during = await page.locator('#yes-no-nouns > summary').evaluate(async (element) => {
      (element as HTMLElement).click();
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const body = element.parentElement!.querySelector('.question-disclosure-body')!;
      return { animating: body.getAnimations().some((animation) => animation.playState === 'running'), expanded: element.getAttribute('aria-expanded') };
    });
    expect(during).toEqual({ animating: true, expanded: String(expanded) });
    await settleQuestionMotion(page);
    expect(await page.locator('#yes-no-nouns').evaluate((element) => (element as HTMLDetailsElement).open)).toBe(expanded);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(questionPath);
  await chooseType(page, 'yes-no-nouns');
  expect(await page.locator('.question-workspace').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
});

test('related links reveal nested question content and survive direct refresh', async ({ page }) => {
  await page.goto('nihongo-o-benkyuo/grammar/first-introductions');
  await expect(page.locator('#patterns .grammar-pattern-card')).toHaveCount(4);
  await expect(page.locator('#practice details')).toHaveCount(2);
  await expect(page.locator('#dialogue .dialogue-line')).toHaveCount(10);
  await page.getByRole('link', { name: 'WH about work' }).click();
  await expect(page).toHaveURL(/\/grammar\/question-types#what$/);
  await expect(page.locator('#wh')).toHaveAttribute('open', '');
  await expect(page.locator('#what')).toBeVisible();
  await expect(page.locator('#what .question-prompt').first()).toContainText('What do you do?');
  await page.reload();
  await expect(page.locator('#wh')).toHaveAttribute('open', '');
  await expect(page.locator('#what')).toBeVisible();
  await page.goto(`${questionPath}#age`);
  await expect(page.locator('#age')).toBeVisible();
  await expect(page.locator('#age .question-reply').first()).toContainText('二十歳（はたち）');
});

test('aligns each Japanese phrase with its romaji and English gloss, with visible grammar emphasis', async ({ page }) => {
  await page.goto(`${questionPath}#yes-no-actions`);
  await settleQuestionMotion(page);
  const example = page.locator('#yes-no-actions .question-time-card').nth(3).locator('.question-prompt');
  await expect(example.locator('[data-kanji="日本語"] .question-kana-reading')).toHaveText('（にほんご）');
  await expect(example.locator('[lang="ja"] .question-grammar-emphasis')).toHaveText(['を', 'います', 'か。']);
  await expect(example.locator('[lang="ja-Latn"] .question-grammar-emphasis')).toHaveText(['o', 'imasu', 'ka?']);
  const assertWordAlignment = async () => {
    await expect.poll(() => example.locator('.question-aligned-line > .japanese-romaji-pair').evaluateAll((pairs) => pairs.every((pair) => {
      const tiers = ['ja', 'ja-Latn', 'en'].map((lang) => pair.querySelector(`:scope > [lang="${lang}"]`));
      if (tiers.some((tier) => !tier?.textContent?.trim())) return false;
      const [ja, ro, en] = tiers.map((tier) => tier!.getBoundingClientRect());
      return Math.abs(ja.x - ro.x) < 1 && Math.abs(ja.x - en.x) < 1
        && ro.y >= ja.bottom && en.y >= ro.bottom;
    }))).toBe(true);
  };
  await assertWordAlignment();
  if (test.info().project.name === 'chromium') {
    await page.locator('#yes-no-actions .question-time-card').nth(3).evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: '/private/tmp/lingua-question-annotations-desktop.png' });
    await page.setViewportSize({ width: 360, height: 800 });
    await assertWordAlignment();
    await page.locator('#yes-no-actions .question-time-card').nth(3).evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: '/private/tmp/lingua-question-annotations-mobile.png' });
  }
  for (const { id, card, reading } of [{ id: 'when', card: 1, reading: 'ni' }, { id: 'yes-no-nouns', card: 0, reading: 'wa' }]) {
    await page.goto(`${questionPath}#${id}`);
    const particle = page.locator(`#${id} .question-time-card`).nth(card).locator('.question-prompt').first().locator('.grammar-romaji .question-grammar-emphasis', { hasText: new RegExp(`^${reading}$`) });
    await expect(particle).toHaveCount(1);
    await expect.poll(() => particle.evaluate((element) => {
      const emphasis = getComputedStyle(element);
      const normal = getComputedStyle(element.parentElement!);
      return Number(emphasis.fontWeight) > Number(normal.fontWeight) && emphasis.color !== normal.color;
    })).toBe(true);
  }
});

test('every selected question type fits narrow screens beside its vertical family label', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(questionPath);
  for (const id of ['yes-no-nouns', 'yes-no-actions', 'yes-no-adjectives', 'who', 'what', 'where', 'when', 'which', 'whose', 'age', 'quantity', 'price', 'duration', 'how', 'how-to', 'what-kind', 'why']) {
    await chooseType(page, id);
    await expect.poll(() => page.locator(`#${id} .question-time-card, #${id} .question-sentence .japanese-with-romaji`).evaluateAll((elements) => elements.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.left >= 0 && rect.right <= window.innerWidth && element.scrollWidth <= element.clientWidth + 1
        ? [] : [{ text: element.textContent?.trim().slice(0, 160), width: rect.width, left: rect.left, right: rect.right, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }];
    })), { message: `Question type ${id} should fit the narrow content panel` }).toEqual([]);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  const [label, detail] = await Promise.all([page.locator('#wh').boundingBox(), page.locator('.question-detail-panel').boundingBox()]);
  expect(detail!.x).toBeCloseTo(label!.x + label!.width, 1);
  expect(detail!.height).toBeCloseTo(label!.height, 1);
  expect(label!.width).toBeLessThan(60);
  if (test.info().project.name === 'chromium') {
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    await page.locator('.question-workspace').evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: '/private/tmp/lingua-question-sidebar-mobile.png' });
  }
});
