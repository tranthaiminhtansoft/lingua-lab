import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'src/business/docs');
const out = resolve(root, 'dist/docs');
const pages = ['index.html', 'product.html', 'topology.html', 'delivery.html', 'pre-release.html', 'release.html', 'post-release.html', 'rollback.html'];
const assets = [
  { source: 'topology-diagram.html', destination: 'topology-diagram.html' },
  { source: 'delivery-workflow.html', destination: 'delivery-workflow.html' },
  { source: 'ci-workflow.html', destination: 'ci-workflow.html' },
  { source: 'assets/release-trigger.svg', destination: 'release-trigger.svg' },
  { source: 'assets/release-success.svg', destination: 'release-success.svg' },
];

await mkdir(out, { recursive: true });
for (const page of pages) {
  await cp(resolve(source, page), resolve(out, page));
}
await mkdir(resolve(out, 'assets'), { recursive: true });
for (const asset of assets) {
  await cp(resolve(source, asset.source), resolve(out, 'assets', asset.destination));
}
