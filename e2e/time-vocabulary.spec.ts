import { expect, test } from '@playwright/test';
const timePath = 'nihongo-o-benkyuo/vocabulary/time';

test('Time opens from Vocabulary, keeps the sample date on refresh, and links to the existing question group', async ({ page }) => {
  await page.clock.install({ time: new Date('2032-02-03T10:00:00Z') });
  await page.goto('nihongo-o-benkyuo/vocabulary');
  await page.getByRole('link', { name: /Explore Time/ }).click();
  await expect(page).toHaveURL(/\/vocabulary\/time$/);
  await expect(page.locator('.time-sample-today')).toHaveAttribute('data-day', '15');
  await expect(page.locator('.time-sample-today')).toContainText('Today');
  await expect(page.locator('[data-day="13"]')).toContainText('The night before last');
  await expect(page.locator('[data-day="17"]')).toContainText('The night after next');
  await page.reload();
  await expect(page.locator('.time-sample-today')).toHaveAttribute('data-day', '15');
  await page.getByRole('link', { name: 'When & what time? →' }).click();
  await expect(page.locator('#when')).toBeVisible();
  await page.goto(timePath);
  await page.getByRole('link', { name: '← Vocabulary topics' }).click();
  await expect(page).toHaveURL(/\/vocabulary$/);
});

test('all calendar and clock readings remain accessible on desktop and narrow screens', async ({ page }) => {
  await page.goto(timePath);
  await expect(page.locator('.time-calendar thead th')).toHaveCount(7);
  await expect(page.locator('.time-calendar td[data-day]')).toHaveCount(31);
  await expect(page.locator('.time-months > div')).toHaveCount(12);
  await expect(page.getByLabel('Hour readings').locator(':scope > .time-reading')).toHaveCount(12);
  await expect(page.getByLabel('Minute readings').locator(':scope > .time-reading')).toHaveCount(10);
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.locator('.time-months > div, .time-clock-grid > span, .time-clock-words > span').evaluateAll((elements) => elements.every((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= window.innerWidth && element.scrollWidth <= element.clientWidth + 1;
    }))).toBe(true);
    const scroller = page.getByRole('region', { name: /October 2026 calendar/ });
    await scroller.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    await scroller.evaluate((element) => { element.scrollTop = 600; });
    await expect.poll(async () => {
      const header = await page.locator('.time-calendar th').last().boundingBox();
      const frame = await scroller.boundingBox();
      return Math.abs(header!.y - frame!.y - 1);
    }).toBeLessThan(2);
    const sunday = page.locator('.time-calendar th').last();
    const sundayBounds = await sunday.boundingBox();
    const scrollBounds = await scroller.boundingBox();
    expect(sundayBounds!.x + sundayBounds!.width).toBeLessThanOrEqual(scrollBounds!.x + scrollBounds!.width + 1);
    await page.locator('#time-dates').evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: test.info().outputPath(`time-calendar-${width}.png`) });
    await page.locator('#time-clock').evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: test.info().outputPath(`time-clock-${width}.png`) });
  }
});

test('floating section menu navigates, closes on Escape, and Top returns to the page heading', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(timePath);
  const trigger = page.getByRole('button', { name: 'Open time sections' });
  await trigger.click();
  const menu = page.getByRole('navigation', { name: 'Time sections' });
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'Hours & minutes' }).click();
  await expect(page).toHaveURL(/#time-clock$/);
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Back to top' })).toBeVisible();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Back to top' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole('button', { name: 'Back to top' })).toHaveCount(0);
});

test('clock hands, keyboard controls, and combined readings stay synchronized', async ({ page }) => {
  await page.goto(timePath);
  const clock = page.locator('.time-interactive-clock');
  await clock.scrollIntoViewIfNeeded();
  await expect(page.getByLabel('Selected time')).toHaveText('4:30 p.m.');
  await expect(clock.locator('.time-combined-reading [aria-label="gogo yoji han"]')).toHaveCount(1);
  const minuteInput = page.getByRole('slider', { name: 'Minute hand', exact: true });
  await minuteInput.focus();
  await page.keyboard.press('Home');
  await expect(page.getByLabel('Selected time')).toHaveText('4:00 p.m.');
  await expect(clock.locator('.time-combined-reading [aria-label="gogo yoji"]')).toHaveCount(1);
  await page.keyboard.press('End');
  await expect(page.getByLabel('Selected time')).toHaveText('4:59 p.m.');
  await expect(clock.locator('.time-combined-reading [aria-label="gogo yoji gojūkyūfun"]')).toHaveCount(1);
  await page.getByRole('radio', { name: 'a.m.', exact: true }).check();
  await expect(page.getByLabel('Selected time')).toHaveText('4:59 a.m.');
  const dragHand = async (hand: 'hour' | 'minute', angle: number, radius: number) => {
    await page.locator('.time-clock-face').scrollIntoViewIfNeeded();
    const grip = await clock.locator(`[data-hand="${hand}"] circle`).boundingBox();
    const face = await clock.locator('.time-clock-face').boundingBox();
    await page.mouse.move(grip!.x + grip!.width / 2, grip!.y + grip!.height / 2);
    await page.mouse.down();
    await page.mouse.move(face!.x + face!.width / 2 + Math.sin(angle * Math.PI / 180) * face!.width * radius / 320,
      face!.y + face!.height / 2 - Math.cos(angle * Math.PI / 180) * face!.height * radius / 320, { steps: 8 });
    await page.mouse.up();
  };
  await dragHand('minute', 6, 114);
  await expect(minuteInput).toHaveValue('1');
  await dragHand('hour', 210, 78);
  await expect(page.getByRole('slider', { name: 'Hour hand', exact: true })).toHaveValue('7');
  await expect(page.getByLabel('Selected time')).toHaveText('7:01 a.m.');
  await expect(clock.locator('.time-combined-reading [aria-label="gozen shichiji ippun"]')).toHaveCount(1);
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => clock.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await clock.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: test.info().outputPath(`interactive-clock-${width}.png`), fullPage: false });
  }
});
