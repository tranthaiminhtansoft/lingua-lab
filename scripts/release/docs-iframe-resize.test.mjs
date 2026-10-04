import { test, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

for (const file of ['topology.html', 'delivery.html']) {
  test(`${file}: batches observer notifications and avoids repeated iframe layout writes`, async () => {
    const html = await readFile(`${process.cwd()}/src/business/docs/${file}`, 'utf8');
    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    const { window } = dom;
    try {
      await new Promise((done) => window.document.addEventListener('DOMContentLoaded', done, { once: true }));
      const queued = [];
      const observers = [];
      window.requestAnimationFrame = (callback) => { queued.push(callback); return queued.length; };
      window.ResizeObserver = class {
        constructor(callback) { observers.push(callback); }
        observe() {}
      };
      const frames = [...window.document.querySelectorAll('iframe')];
      const docs = frames.map(() => ({ documentElement: { scrollHeight: 1200 }, body: { scrollHeight: 1100 } }));
      frames.forEach((frame, index) => Object.defineProperty(frame, 'contentDocument', { value: docs[index] }));
      window.eval(window.document.querySelector('script').textContent);
      window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
      frames.forEach((frame) => frame.dispatchEvent(new window.Event('load')));
      observers.forEach((notify) => { notify(); notify(); });
      expect(queued).toHaveLength(frames.length);
      expect(frames.every((frame) => frame.style.height === '')).toBe(true);
      queued.splice(0).forEach((callback) => callback());
      expect(frames.every((frame) => frame.style.height === '1200px')).toBe(true);
      const changed = [];
      const mutation = new window.MutationObserver((records) => changed.push(...records));
      frames.forEach((frame) => mutation.observe(frame, { attributes: true, attributeFilter: ['style'] }));
      observers.forEach((notify) => { notify(); notify(); });
      queued.splice(0).forEach((callback) => callback());
      await Promise.resolve();
      expect(changed).toHaveLength(0);
      docs.forEach((doc) => { doc.documentElement.scrollHeight = 1500; });
      observers.forEach((notify) => notify());
      expect(frames.every((frame) => frame.style.height === '1200px')).toBe(true);
      queued.splice(0).forEach((callback) => callback());
      expect(frames.every((frame) => frame.style.height === '1500px')).toBe(true);
      mutation.disconnect();
    } finally { window.close(); }
  });
}
