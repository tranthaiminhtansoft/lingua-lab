import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const topicPath = 'nihongo-o-benkyuo/vocabulary/time';

export async function verifyTimeVocabulary(browser, deploymentUrl, { evidenceDirectory = 'release-verification-evidence' } = {}) {
  const results = [];
  let screenshot = 0;
  async function check(name, run) {
    const page = await browser.newPage();
    page.setDefaultTimeout(10_000);
    try {
      results.push({ name, passed: true, detail: await run(page) });
    } catch (error) {
      results.push({ name, passed: false, detail: error.message.replace(/\s+/g, ' ').slice(0, 800) });
      await mkdir(evidenceDirectory, { recursive: true });
      await page.screenshot({ path: resolve(evidenceDirectory, `time-failure-${++screenshot}.png`), fullPage: true, timeout: 5000 }).catch(() => {});
    } finally { await page.close(); }
  }
  const openTopic = async (page) => {
    await page.goto(new URL(topicPath, deploymentUrl).href, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: /^Time / }).waitFor({ state: 'visible' });
  };
  const confirmPath = async (page, path, hash) => {
    const expected = new URL(path, deploymentUrl);
    await page.waitForURL((url) => url.pathname === expected.pathname && url.origin === expected.origin && (hash === undefined || url.hash === hash));
  };
  const assertTime = async (page, value, romaji) => {
    const kanaByTime = { '4:30 p.m.': 'ごごよじさんじゅっぷん', '4:00 p.m.': 'ごごよじ', '4:59 p.m.': 'ごごよじごじゅうきゅうふん', '4:59 a.m.': 'ごぜんよじごじゅうきゅうふん', '7:01 a.m.': 'ごぜんしちじいっぷん' };
    const matches = await page.waitForFunction(({ expected, expectedRomaji, expectedKana }) => {
      const reading = document.querySelector('.time-combined-reading > .time-reading');
      const actualRomaji = Array.from(reading?.querySelectorAll('.time-aligned-part [lang="ja-Latn"]') ?? []).map((part) => part.textContent ?? '').join('');
      const actualKana = Array.from(reading?.querySelectorAll('.time-aligned-part [lang="ja"]') ?? []).map((part) => part.textContent ?? '').join('');
      return document.querySelector('[aria-label="Selected time"]')?.textContent === expected
        && actualRomaji === expectedRomaji.replaceAll(' ', '') && actualKana === expectedKana;
    }, { expected: value, expectedRomaji: romaji, expectedKana: kanaByTime[value] }).then(() => true, () => false);
    if (!matches) {
      const actual = await page.evaluate(() => ({ time: document.querySelector('[aria-label="Selected time"]')?.textContent,
        kana: Array.from(document.querySelectorAll('.time-combined-reading > .time-reading .time-aligned-part [lang="ja"]')).map((part) => part.textContent ?? '').join(''),
        romaji: Array.from(document.querySelectorAll('.time-combined-reading > .time-reading .time-aligned-part [lang="ja-Latn"]')).map((part) => part.textContent ?? '').join('') }));
      throw new Error(`Clock reading mismatch for ${value}: ${JSON.stringify(actual)}`);
    }
  };

  await check('Time navigation, direct route and refresh', async (page) => {
    await page.goto(deploymentUrl.href, { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Explore Nihongo learning path', exact: true }).click();
    await page.getByRole('link', { name: 'Start Vocabulary', exact: true }).click();
    await page.getByRole('link', { name: /Explore Time/ }).click();
    await confirmPath(page, topicPath);
    await page.locator('.time-interactive-clock').waitFor({ state: 'visible' });
    await page.getByRole('link', { name: '← Vocabulary topics' }).click();
    await confirmPath(page, 'nihongo-o-benkyuo/vocabulary');
    await openTopic(page);
    await page.reload({ waitUntil: 'networkidle' });
    await confirmPath(page, topicPath);
    await page.locator('.time-sample-today[data-day="15"]').waitFor({ state: 'visible' });
    await page.getByRole('link', { name: 'When & what time? →' }).click();
    await confirmPath(page, 'nihongo-o-benkyuo/grammar/question-types', '#when');
    await page.locator('#when').waitFor({ state: 'visible' });
    return 'Home → Nihongo → Vocabulary → Time, back link, direct URL, refresh and related question group checked';
  });

  await check('Time calendar content and fixed sample today', async (page) => {
    await page.clock.install({ time: new Date('2040-02-01T10:00:00Z') });
    await openTopic(page);
    const expectedCounts = [['.time-months > div', 12], ['.time-calendar th', 7], ['.time-calendar td[data-day]', 31], ['[aria-label="Hour readings"] > .time-reading', 12], ['[aria-label="Minute readings"] > .time-reading', 10], ['#time-rhythm .time-rhythm-card', 6], ['#time-dayparts .time-dayparts-grid .time-rhythm-card', 5], ['#time-dayparts .time-boundary-grid .time-rhythm-card', 2], ['#time-relative-days .time-relative-timeline-row', 3]];
    for (const [selector, count] of expectedCounts) assert.equal(await page.locator(selector).count(), count, `Time content count: ${selector}`);
    assert.equal(await page.locator('.time-calendar th').first().locator('.time-meaning').textContent(), 'Monday');
    assert.equal(await page.locator('.time-calendar tbody tr').first().locator('td').nth(3).getAttribute('data-day'), '1');
    await page.locator('.time-sample-today[data-day="15"]').waitFor({ state: 'visible' });
    assert.ok((await page.locator('.time-today-note').innerText()).includes('October 15, 2026'));
    const days = ['The day before yesterday', 'Yesterday', 'Today', 'Tomorrow', 'The day after tomorrow'];
    const nights = ['The night before last', 'Last night', 'Tonight', 'Tomorrow night', 'The night after next'];
    for (let index = 0; index < days.length; index++) {
      assert.equal(await page.locator('#time-relative-days .time-relative-timeline-row').nth(1).locator('article').nth(index).locator('.time-meaning').textContent(), days[index]);
      assert.equal(await page.locator('#time-relative-days .time-relative-timeline-row').nth(2).locator('article').nth(index).locator('.time-meaning').textContent(), nights[index]);
    }
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.time-sample-today[data-day="15"]').waitFor({ state: 'visible' });
    return 'October 2026 alignment, fixed October 15, five day/night timeline entries, and vocabulary groups checked';
  });

  await check('Time interactive clock: drag, keyboard and readings', async (page) => {
    await openTopic(page);
    await assertTime(page, '4:30 p.m.', 'gogo yoji sanjuppun');
    assert.equal(await page.locator('.time-combined-reading > .time-reading').count(), 2, 'Half-past alternative should be shown at :30');
    assert.ok((await page.locator('.time-combined-reading > .time-reading').nth(1).innerText()).includes('午後4時半'));
    await page.getByRole('slider', { name: 'Minute hand', exact: true }).focus();
    await page.keyboard.press('Home');
    await assertTime(page, '4:00 p.m.', 'gogo yoji');
    await page.keyboard.press('End');
    await assertTime(page, '4:59 p.m.', 'gogo yoji gojūkyūfun');
    await page.getByRole('radio', { name: 'a.m.', exact: true }).check();
    await assertTime(page, '4:59 a.m.', 'gozen yoji gojūkyūfun');
    async function dragHand(hand, angle, radius) {
      await page.locator('.time-clock-face').scrollIntoViewIfNeeded();
      const face = await page.locator('.time-clock-face').boundingBox();
      const grip = await page.locator(`[data-hand="${hand}"] circle`).boundingBox();
      await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
      await page.mouse.down();
      await page.mouse.move(face.x + face.width / 2 + Math.sin(angle * Math.PI / 180) * face.width * radius / 320,
        face.y + face.height / 2 - Math.cos(angle * Math.PI / 180) * face.height * radius / 320, { steps: 8 });
      await page.mouse.up();
    }
    await dragHand('minute', 6, 114);
    await dragHand('hour', 210, 78);
    await assertTime(page, '7:01 a.m.', 'gozen shichiji ippun');
    assert.equal(await page.getByRole('slider', { name: 'Hour hand', exact: true }).inputValue(), '7');
    assert.equal(await page.getByRole('slider', { name: 'Minute hand', exact: true }).inputValue(), '1');
    assert.ok((await page.locator('.time-hour-callout .time-reading').innerText()).includes('7時'));
    assert.ok((await page.locator('.time-minute-callout .time-reading').innerText()).includes('1分'));
    return 'Both hands dragged; keyboard endpoints, a.m./p.m., on the hour, half past and combined Kana/Romaji checked';
  });

  await check('Time mobile layout, sticky weekdays, menu and Top', async (page) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openTopic(page);
    const trigger = page.getByRole('button', { name: 'Open time sections' });
    await trigger.click();
    await page.getByRole('navigation', { name: 'Time sections' }).getByRole('link', { name: 'Days & nights' }).click();
    const calendar = page.locator('.time-calendar-scroll');
    await calendar.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    assert.ok(await calendar.evaluate((element) => element.scrollLeft > 0), 'Calendar must scroll horizontally on mobile');
    const lastDay = await page.locator('.time-calendar th').last().boundingBox();
    const frame = await calendar.boundingBox();
    assert.ok(lastDay.x + lastDay.width <= frame.x + frame.width + 1, 'Last weekday must be reachable horizontally');
    await trigger.click();
    await page.getByRole('navigation', { name: 'Time sections' }).getByRole('link', { name: 'Hours & minutes' }).click();
    await confirmPath(page, topicPath, '#time-clock');
    await trigger.click();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('navigation', { name: 'Time sections' }).count(), 0, 'Escape must close section menu');
    assert.ok(await page.locator('.time-clock-grid > span, .time-clock-words > span, .time-interactive-clock, .time-hand-reading, .time-combined-reading').evaluateAll((elements) => elements.every((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= window.innerWidth && element.scrollWidth <= element.clientWidth + 1;
    })), 'Time readings must fit mobile viewport');
    await page.getByRole('button', { name: 'Back to top' }).click();
    await page.waitForFunction(() => window.scrollY === 0);
    return '360px layout, horizontal calendar access, section navigation, Escape and Top checked';
  });
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(resolve(evidenceDirectory, 'time-results.json'), JSON.stringify({ results }, null, 2));
  return results;
}
