import { test, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

for (const file of ['topology.html', 'delivery.html']) {
  test(`${file}: batches observer notifications and avoids repeated iframe layout writes`, async () => {
    const html = await readFile(`${process.cwd()}/src/business/docs/${file}`, 'utf8');
    const fitScript = await readFile(`${process.cwd()}/src/business/docs/assets/archify-frame-fit.js`, 'utf8');
    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    const { window } = dom;
    try {
      await new Promise((done) => window.document.addEventListener('DOMContentLoaded', done, { once: true }));
      const queued = new Map();
      let nextFrameId = 1;
      const observers = [];
      window.requestAnimationFrame = (callback) => {
        const id = nextFrameId++;
        queued.set(id, callback);
        return id;
      };
      window.cancelAnimationFrame = (id) => queued.delete(id);
      const frames = [...window.document.querySelectorAll('iframe')];
      const docs = frames.map(() => ({
        documentElement: { scrollHeight: 1200, offsetHeight: 1200 },
        body: { scrollHeight: 1100, offsetHeight: 1100 },
      }));
      frames.forEach((frame, index) => {
        Object.defineProperty(frame, 'contentDocument', { value: docs[index] });
        Object.defineProperty(frame, 'offsetHeight', { get: () => Number.parseFloat(frame.style.height) || 0 });
        Object.defineProperty(frame, 'clientHeight', { get: () => Number.parseFloat(frame.style.height) || 0 });
        frame.contentWindow.ResizeObserver = class {
          constructor(callback) { observers.push(callback); }
          observe() {}
        };
      });
      window.eval(fitScript);
      frames.forEach((frame) => frame.dispatchEvent(new window.Event('load')));
      observers.forEach((notify) => { notify(); notify(); });
      expect(queued.size).toBe(frames.length);
      expect(frames.every((frame) => frame.style.height === '')).toBe(true);
      const flushFrames = () => {
        const callbacks = [...queued.values()];
        queued.clear();
        callbacks.forEach((callback) => callback());
      };
      flushFrames();
      expect(frames.every((frame) => frame.style.height === '1200px')).toBe(true);
      const changed = [];
      const mutation = new window.MutationObserver((records) => changed.push(...records));
      frames.forEach((frame) => mutation.observe(frame, { attributes: true, attributeFilter: ['style'] }));
      observers.forEach((notify) => { notify(); notify(); });
      flushFrames();
      await Promise.resolve();
      expect(changed).toHaveLength(0);
      docs.forEach((doc) => {
        doc.documentElement.scrollHeight = 1500;
        doc.documentElement.offsetHeight = 1500;
      });
      observers.forEach((notify) => notify());
      expect(frames.every((frame) => frame.style.height === '1200px')).toBe(true);
      flushFrames();
      expect(frames.every((frame) => frame.style.height === '1500px')).toBe(true);
      mutation.disconnect();
    } finally { window.close(); }
  });
}
