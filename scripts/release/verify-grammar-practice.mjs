import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { questionGroups, timeLabels } from '../../src/business/language-home/nihongo/grammar/content/questionTypes.ts';
import { alignQuestionParts } from '../../src/business/language-home/nihongo/grammar/content/questionAlignment.ts';

export const grammarCases = questionGroups.flatMap((group) => group.types.map((type) => ({ group: group.id, ...type })));
const topicPath = 'nihongo-o-benkyuo/grammar/question-types';
const expectedWord = (word) => ({
  japanese: word.japanese, romaji: word.romaji, gloss: word.gloss,
  ...(word.alternative ? { alternative: expectedWord(word.alternative) } : {}),
});
async function settle(page) {
  await page.waitForFunction(() => !document.querySelector('.question-workspace')?.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running'));
}
async function choose(page, entry) {
  if (await page.locator(`#${entry.group} > summary`).getAttribute('aria-expanded') !== 'true') await page.locator(`#${entry.group} > summary`).click();
  await page.locator(`#${entry.id} > summary`).click();
  await settle(page);
  assert.equal(await page.locator(`#${entry.id} > summary`).getAttribute('aria-expanded'), 'true');
  await page.locator(`#${entry.id} .question-forms`).waitFor({ state: 'visible' });
  assert.equal(new URL(page.url()).hash, `#${entry.id}`);
}

async function verifyContent(page, entry) {
  const cards = page.locator(`#${entry.id} .question-time-card`);
  assert.equal(await cards.count(), entry.forms.length, `${entry.id}: time forms`);
  for (const [index, form] of entry.forms.entries()) {
    const card = cards.nth(index);
    assert.equal(await card.locator('h3').textContent(), timeLabels[form.time]);
    const translations = form.examples.flatMap((example) => [example.question.translation, ...example.answers.map((answer) => answer.sentence.translation)]);
    assert.deepEqual(await card.locator('.grammar-example-translation').allTextContents(), translations, `${entry.id}/${form.time}: question/answer translations`);
    const sentences = [form.formula, ...form.examples.flatMap((example) => [example.question.parts, ...example.answers.map((answer) => answer.sentence.parts)])];
    const actual = await card.locator('.question-aligned').evaluateAll((sentences) => sentences.map((sentence) => {
      function word(pair) {
        const ja = pair.querySelector(':scope > [lang="ja"]').cloneNode(true);
        ja.querySelectorAll('.question-kana-reading').forEach((reading) => reading.remove());
        const alternative = pair.querySelector(':scope > .japanese-romaji-alternative');
        return { japanese: ja.textContent, romaji: pair.querySelector(':scope > [lang="ja-Latn"]').textContent,
          gloss: pair.querySelector(':scope > [lang="en"]').textContent,
          ...(alternative ? { alternative: word(alternative) } : {}) };
      }
      return [...sentence.querySelectorAll(':scope > .question-aligned-line, :scope > .question-full-alternative > .question-aligned-line')].map((line) => [...line.children].map(word));
    }));
    const expected = sentences.map((parts) => {
      const { words, fullAlternatives } = alignQuestionParts(parts);
      return [words, ...fullAlternatives].map((line) => line.map(expectedWord));
    });
    assert.deepEqual(actual, expected, `${entry.id}/${form.time}: Japanese, romaji, gloss and alternatives`);
    assert.ok(await card.locator('.question-grammar-emphasis').count() > 0, `${entry.id}/${form.time}: grammar emphasis missing`);
  }
}

export async function verifyGrammarPractice(browser, deploymentUrl, { evidenceDirectory = 'release-verification-evidence' } = {}) {
  const results = [];
  const cases = [];
  let screenshots = 0;
  await mkdir(evidenceDirectory, { recursive: true });
  async function check(name, run, options) {
    const page = await browser.newPage(options);
    page.setDefaultTimeout(10_000);
    try { results.push({ name, passed: true, detail: await run(page) }); }
    catch (error) {
      results.push({ name, passed: false, detail: error.message.replace(/\s+/g, ' ').slice(0, 900) });
      await page.screenshot({ path: resolve(evidenceDirectory, `grammar-failure-${++screenshots}.png`), fullPage: true, timeout: 5000 }).catch(() => {});
    } finally { await page.close(); }
  }
  await check('Grammar question navigation and related links', async (page) => {
    await page.goto(new URL('nihongo-o-benkyuo/grammar', deploymentUrl).href, { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /Explore question types/ }).click();
    assert.equal(new URL(page.url()).pathname, new URL(topicPath, deploymentUrl).pathname);
    await page.getByRole('heading', { level: 1, name: /Question types/ }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Open grammar sections' }).click();
    await page.getByRole('navigation', { name: 'Grammar sections', exact: true }).getByRole('link', { name: 'WH questions', exact: true }).click();
    await settle(page);
    assert.equal(await page.locator('#wh > summary').getAttribute('aria-expanded'), 'true');
    await page.getByRole('button', { name: 'Close question details' }).click();
    await settle(page);
    assert.equal(new URL(page.url()).hash, '');
    assert.equal(await page.locator('#wh-family .question-detail-slot').getAttribute('aria-hidden'), 'true');
    for (const [label, id] of [['Explore Yes/No and WH questions →', ''], ['Yes/No about nationality', 'yes-no-nouns'], ['WH about work', 'what']]) {
      await page.goto(new URL('nihongo-o-benkyuo/grammar/first-introductions', deploymentUrl).href, { waitUntil: 'networkidle' });
      await page.getByRole('link', { name: label, exact: true }).click();
      assert.equal(new URL(page.url()).pathname, new URL(topicPath, deploymentUrl).pathname);
      assert.equal(new URL(page.url()).hash, id ? `#${id}` : '');
      if (id) await page.locator(`#${id} .question-forms`).waitFor({ state: 'visible' });
    }
    return 'Grammar index, section menu, close/reset and all 3 First introductions links checked';
  });
  await check('Grammar question content and accordions: all types', async (page) => {
    await page.goto(new URL(topicPath, deploymentUrl).href, { waitUntil: 'networkidle' });
    for (const entry of grammarCases) {
      await choose(page, entry);
      await verifyContent(page, entry);
      await page.locator(`#${entry.id} > summary`).click();
      await settle(page);
      assert.equal(await page.locator(`#${entry.id}`).getAttribute('open'), null, `${entry.id}: close accordion`);
      assert.equal(await page.locator(`#${entry.id} .question-disclosure-body`).getAttribute('aria-hidden'), 'true');
      cases.push({ id: entry.id, content: true, accordion: true });
    }
    return `${cases.length}/${grammarCases.length} types: all time forms, question/answer pairs, Japanese, romaji, glosses, alternatives and close/open`;
  });
  await check('Grammar question deep links and refresh: all types', async (page) => {
    for (const entry of grammarCases) {
      const url = new URL(`${topicPath}#${entry.id}`, deploymentUrl);
      await page.goto(url.href, { waitUntil: 'networkidle' });
      for (const refresh of [false, true]) {
        if (refresh) await page.reload({ waitUntil: 'networkidle' });
        await page.locator(`#${entry.id} .question-forms`).waitFor({ state: 'visible' });
        assert.equal(new URL(page.url()).hash, url.hash);
        assert.equal(new URL(page.url()).pathname, url.pathname);
        assert.equal(await page.locator(`#${entry.group} > summary`).getAttribute('aria-expanded'), 'true');
        assert.equal(await page.locator(`#${entry.id} > summary`).getAttribute('aria-expanded'), 'true');
      }
    }
    return `${grammarCases.length}/${grammarCases.length} type hashes survive direct open and refresh`;
  });
  await check('Grammar question mobile layout: all types', async (page) => {
    await page.goto(new URL(topicPath, deploymentUrl).href, { waitUntil: 'networkidle' });
    for (const entry of grammarCases) {
      await choose(page, entry);
      const overflows = await page.locator(`#${entry.id} .question-time-card, #${entry.id} .question-sentence .japanese-with-romaji`).evaluateAll((elements) => elements.filter((element) => {
        const rect = element.getBoundingClientRect();
        return !rect.width || rect.left < 0 || rect.right > window.innerWidth + 1 || element.scrollWidth > element.clientWidth + 1;
      }).length);
      assert.equal(overflows, 0, `${entry.id}: mobile content overflow`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${entry.id}: horizontal page overflow`);
    }
    return `${grammarCases.length}/${grammarCases.length} types fit 360px viewport`;
  }, { viewport: { width: 360, height: 800 } });
  await writeFile(resolve(evidenceDirectory, 'grammar-results.json'), JSON.stringify({ results, cases, expected: grammarCases.length }, null, 2));
  return results;
}
