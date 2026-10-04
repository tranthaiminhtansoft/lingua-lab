import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { kanaEntries } from '../../src/business/language-home/nihongo/kana/data/kana.ts';

const require = createRequire(import.meta.url);
const strokeData = [...require('kana-svg-data/dist/allHiragana.json'), ...require('kana-svg-data/dist/allKatakana.json')];
export const practiceCases = kanaEntries.flatMap((entry, index) => ['hiragana', 'katakana'].map((script, scriptIndex) => ({
  glyph: entry[script], script: scriptIndex === 0 ? 'Hiragana' : 'Katakana',
  random: [(index + 0.5) / kanaEntries.length, scriptIndex === 0 ? 0.25 : 0.75],
})));

// Runs only in the verification browser. Simulated speech proves the controls and
// utterance arguments, not audible playback on a real device.
function installControls({ unsupported = false, noVoice = false } = {}) {
  const originalRandom = Math.random;
  const state = window.__kanaVerification = { queue: null, utterances: [], cancellations: 0 };
  Math.random = () => {
    if (state.queue === null) return originalRandom();
    if (!state.queue.length) throw new Error('Kana random consumed an unexpected extra draw');
    return state.queue.shift();
  };
  if (unsupported) {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
    return;
  }
  const voice = { lang: 'ja-JP', name: 'Verification Japanese voice', voiceURI: 'verification-ja' };
  const synthesis = new EventTarget();
  let voices = noVoice ? [] : [voice];
  let active;
  synthesis.getVoices = () => voices;
  synthesis.cancel = () => { state.cancellations += 1; active = undefined; };
  synthesis.speak = (utterance) => {
    active = utterance;
    state.utterances.push({ text: utterance.text, lang: utterance.lang, rate: utterance.rate, voiceLang: utterance.voice?.lang });
    queueMicrotask(() => utterance.onstart?.());
  };
  state.finish = () => { const utterance = active; active = undefined; utterance?.onend?.(); };
  state.fail = () => { const utterance = active; active = undefined; utterance?.onerror?.(); };
  state.addJapaneseVoice = () => { voices = [voice]; synthesis.dispatchEvent(new Event('voiceschanged')); };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class {
    constructor(text) { this.text = text; }
  } });
}

function expectedStrokes(glyph) {
  const data = strokeData.find(({ charCode }) => charCode === glyph.codePointAt(0));
  assert.ok(data, `Missing source stroke data for ${glyph}`);
  const medians = data.medians.filter(({ value }) => value.length > 1);
  return {
    shadows: data.strokes.map(({ value }) => value),
    clips: data.strokes.map(({ id, value }) => ({ id: `kana-${data.charCode}-clip-${id}`, path: value })),
    drawn: medians.map(({ id, value }, index) => {
      const number = Number.parseInt(id, 10) || index + 1;
      return {
        path: value.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' '),
        clip: `url(#kana-${data.charCode}-clip-${id})`, delay: `${(number - 1) * 1.5}s`,
        animation: 'writing-guide-stroke-draw', duration: '1.35s',
      };
    }),
    numbers: [...new Set(medians.map(({ id }, index) => String(Number.parseInt(id, 10) || index + 1)))],
  };
}

async function verifyStrokes(page, glyph) {
  const guide = page.locator('#practice svg.writing-guide-svg');
  await guide.waitFor({ state: 'visible' });
  assert.equal(await guide.getAttribute('aria-label'), `Animated stroke guide for ${glyph}`);
  const actual = await guide.evaluate((svg) => ({
    shadows: [...svg.querySelectorAll('.writing-guide-shadow path')].map((path) => path.getAttribute('d')),
    clips: [...svg.querySelectorAll('clipPath')].map((clip) => ({ id: clip.id, path: clip.querySelector('path')?.getAttribute('d') })),
    drawn: [...svg.querySelectorAll('.writing-guide-stroke')].map((path) => ({
      path: path.getAttribute('d'), clip: path.getAttribute('clip-path'), delay: getComputedStyle(path).animationDelay,
      animation: getComputedStyle(path).animationName, duration: getComputedStyle(path).animationDuration,
    })),
    numbers: [...svg.querySelectorAll('.writing-guide-numbers text')].map((label) => label.textContent),
  }));
  assert.deepEqual(actual, expectedStrokes(glyph), `Stroke paths/order do not match ${glyph}`);
  assert.ok(actual.drawn.length > 0, `No drawn strokes for ${glyph}`);
  const animation = await guide.locator('.writing-guide-stroke').first().evaluate(async (path) => {
    const animation = path.getAnimations()[0];
    if (!animation) return null;
    const timing = animation.effect.getTiming();
    const frames = animation.effect.getKeyframes().map((frame) => Number.parseFloat(frame.strokeDashoffset));
    const before = getComputedStyle(path).strokeDashoffset;
    await new Promise((done) => setTimeout(done, 180));
    return { name: animation.animationName, duration: timing.duration, frames, before, after: getComputedStyle(path).strokeDashoffset };
  });
  assert.ok(animation, `Missing stroke animation for ${glyph}`);
  assert.equal(animation.name, 'writing-guide-stroke-draw');
  assert.equal(animation.duration, 1350);
  assert.deepEqual(animation.frames, [3333, 0]);
  assert.notEqual(animation.before, animation.after, 'Stroke animation is not progressing');
}

async function verifySpeech(page, glyph) {
  const play = page.locator('#practice').getByRole('button', { name: `Play Japanese pronunciation for ${glyph}`, exact: true });
  assert.equal(await play.isEnabled(), true);
  const before = await page.evaluate(() => ({ count: window.__kanaVerification.utterances.length, cancellations: window.__kanaVerification.cancellations }));
  await play.click();
  const stop = page.locator('#practice').getByRole('button', { name: 'Stop Japanese playback', exact: true });
  await stop.waitFor({ state: 'visible' });
  const utterances = await page.evaluate(() => window.__kanaVerification.utterances);
  assert.equal(utterances.length, before.count + 1);
  assert.deepEqual(utterances.at(-1), { text: glyph, lang: 'ja-JP', rate: 0.75, voiceLang: 'ja-JP' });
  await stop.click();
  await play.waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => window.__kanaVerification.cancellations), before.cancellations + 2);
  assert.match(await page.locator('#practice [role="status"]').innerText(), /Japanese voice is ready/);
}

export async function verifyKanaPractice(browser, deploymentUrl, { evidenceDirectory = 'release-verification-evidence' } = {}) {
  const groups = [
    { name: 'Kana random: all practice glyphs', errors: [] },
    { name: 'Kana stroke guides: all practice glyphs', errors: [] },
    { name: 'Kana speech controls: simulated Japanese voice', errors: [] },
    { name: 'Kana speech fallback and recovery', errors: [] },
  ];
  const evidence = [];
  const glyphResults = [];
  const page = await browser.newPage({ reducedMotion: 'no-preference' });
  page.setDefaultTimeout(5000);
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  const fail = async (group, label, error, currentPage = page) => {
    const detail = `${label}: ${error.message.replace(/\s+/g, ' ').slice(0, 800)}`;
    console.error(`FAIL: ${group.name} — ${detail}`);
    group.errors.push(detail);
    evidence.push({ check: group.name, detail, error: error.message, url: currentPage.url() });
    await mkdir(evidenceDirectory, { recursive: true });
    if (evidence.length <= 10) await currentPage.screenshot({ path: resolve(evidenceDirectory, `kana-failure-${evidence.length}.png`), fullPage: true, timeout: 5000 }).catch(() => {});
  };
  const url = new URL('nihongo-o-benkyuo/kana', deploymentUrl).toString();
  let checked = 0;
  try {
    await page.addInitScript(installControls);
    await page.goto(url, { waitUntil: 'networkidle' });
    const glyph = page.getByTestId('practice-glyph');
    await glyph.waitFor({ state: 'visible' });
    const renderedPairs = await page.locator('#tables .kana-pair').allTextContents();
    assert.deepEqual(renderedPairs, kanaEntries.map(({ hiragana, katakana }) => `${hiragana}/${katakana}`), 'Deployed Kana pool differs from the trusted source');
    const initial = await glyph.innerText();
    const initialIndex = practiceCases.findIndex(({ glyph }) => glyph === initial);
    assert.notEqual(initialIndex, -1, `Unexpected initial glyph ${initial}`);
    const ordered = [...practiceCases.slice(initialIndex + 1), ...practiceCases.slice(0, initialIndex + 1)];
    await page.getByRole('slider', { name: 'Speech rate' }).fill('0.75');
    let previous = practiceCases[initialIndex];
    for (const [index, entry] of ordered.entries()) {
      const result = { glyph: entry.glyph, script: entry.script, random: false, strokes: false, speech: false };
      glyphResults.push(result);
      try {
        // First draw deliberately repeats the previous glyph; the selector must retry.
        await page.evaluate((queue) => { window.__kanaVerification.queue = queue; }, index === 0 ? [...previous.random, ...entry.random] : [...entry.random]);
        await page.getByRole('button', { name: 'Random practice', exact: true }).click();
        await page.waitForFunction((expected) => document.querySelector('[data-testid="practice-glyph"]')?.textContent === expected, entry.glyph, { timeout: 3000 });
        assert.equal(await page.locator('#practice .eyebrow').textContent(), entry.script);
        assert.equal(await page.evaluate(() => window.__kanaVerification.queue.length), 0, 'Random did not consume the expected draws');
        assert.notEqual(await glyph.innerText(), previous.glyph, 'Random repeated the previous glyph');
        checked += 1;
        result.random = true;
      } catch (error) {
        await fail(groups[0], entry.glyph, error);
        break;
      } finally {
        await page.evaluate(() => { window.__kanaVerification.queue = null; });
      }
      try { await verifyStrokes(page, entry.glyph); result.strokes = true; } catch (error) { await fail(groups[1], entry.glyph, error); }
      try { await verifySpeech(page, entry.glyph); result.speech = true; } catch (error) { await fail(groups[2], entry.glyph, error); }
      previous = entry;
    }
    // End/error callbacks, retry, and both slider limits are also exercised.
    for (const rate of ['0.1', '1']) {
      await page.getByRole('slider', { name: 'Speech rate' }).fill(rate);
      await page.locator('#practice .speaker').click();
      await page.locator('#practice').getByRole('button', { name: 'Stop Japanese playback', exact: true }).waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => window.__kanaVerification.utterances.at(-1).rate), Number(rate));
      await page.evaluate(() => window.__kanaVerification.finish());
      await page.locator('#practice').getByRole('button', { name: /Play Japanese pronunciation for/ }).waitFor({ state: 'visible' });
    }
    await page.locator('#practice .speaker').click();
    await page.locator('#practice').getByRole('button', { name: 'Stop Japanese playback', exact: true }).waitFor({ state: 'visible' });
    await page.evaluate(() => window.__kanaVerification.fail());
    await page.getByText('Speech failed. Please try again.', { exact: true }).waitFor({ state: 'visible' });
    await page.locator('#practice .speaker').click();
    await page.locator('#practice').getByRole('button', { name: 'Stop Japanese playback', exact: true }).waitFor({ state: 'visible' });
    await page.evaluate(() => window.__kanaVerification.finish());
  } catch (error) {
    for (const group of groups.slice(0, 3)) await fail(group, 'Practice verification', error);
  } finally {
    await page.close();
  }

  for (const [mode, message] of [[{ unsupported: true }, 'Speech is not supported by this browser.'], [{ noVoice: true }, 'No Japanese voice is available on this device.']]) {
    const fallbackPage = await browser.newPage();
    fallbackPage.setDefaultTimeout(5000);
    try {
      await fallbackPage.addInitScript(installControls, mode);
      await fallbackPage.goto(url, { waitUntil: 'networkidle' });
      await fallbackPage.getByText(message, { exact: true }).waitFor({ state: 'visible' });
      assert.equal(await fallbackPage.locator('#practice .speaker').isDisabled(), true);
      if (mode.noVoice) {
        await fallbackPage.evaluate(() => window.__kanaVerification.addJapaneseVoice());
        await fallbackPage.locator('#practice [role="status"]').filter({ hasText: 'Japanese voice is ready.' }).waitFor({ state: 'visible' });
        assert.equal(await fallbackPage.locator('#practice .speaker').isEnabled(), true);
      }
    } catch (error) { await fail(groups[3], message, error, fallbackPage); } finally { await fallbackPage.close(); }
  }
  if (checked !== practiceCases.length) {
    for (const group of groups.slice(0, 3)) group.errors.push(`Incomplete coverage: ${checked}/${practiceCases.length} glyphs`);
  }
  if (runtimeErrors.length) groups[0].errors.push(...runtimeErrors.map((message) => `Browser error: ${message}`));
  const results = groups.map(({ name, errors }, index) => ({
    name, passed: errors.length === 0,
    detail: errors.length ? errors.slice(0, 3).join('; ') : index < 3 ? `${checked}/${practiceCases.length} glyphs checked${index === 2 ? '; simulated speech only, audible playback requires a device check' : ''}` : 'Unsupported speech, missing Japanese voice, and voice recovery checked',
  }));
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(resolve(evidenceDirectory, 'kana-results.json'), JSON.stringify({ url, checked, total: practiceCases.length, results, glyphResults, evidence, runtimeErrors }, null, 2));
  return results;
}
