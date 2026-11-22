import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const englishContentFile = new URL(
  './src/business/language-home/english/content/englishContent.json',
  import.meta.url,
);

/**
 * Serves the editable English content bank during development and copies it
 * into the build output so the running site can refresh content from JSON.
 */
function englishContentPlugin(): Plugin {
  return {
    name: 'english-content-json',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        if (!pathname.endsWith('/content/english-content.json')) return next();
        readFile(englishContentFile, 'utf8')
          .then((body) => {
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.setHeader('Cache-Control', 'no-store');
            response.end(body);
          })
          .catch(next);
      });
    },
    async generateBundle() {
      const source = await readFile(englishContentFile, 'utf8');
      const bank = JSON.parse(source) as { version?: unknown; topics?: unknown };
      if (typeof bank.version !== 'string' || !Array.isArray(bank.topics)) {
        throw new Error('englishContent.json must contain a version string and a topics array.');
      }
      this.emitFile({ type: 'asset', fileName: 'content/english-content.json', source });
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/lingua-lab/' : '/',
  plugins: [react(), englishContentPlugin()],
});
