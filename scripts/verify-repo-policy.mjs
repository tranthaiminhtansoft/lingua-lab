import { readFile } from 'node:fs/promises';

const config = JSON.parse(
  await readFile(new URL('../.github/profile-reviewers.json', import.meta.url), 'utf8'),
);
const required = [
  'software-engineer',
  'qa-platform-reviewer',
  'ui-ux-reviewer',
  'learning-content-reviewer',
];

if (JSON.stringify(config.requiredProfiles) !== JSON.stringify(required)) {
  throw new Error('profile-reviewers.json must contain the approved required profiles in order');
}
if (!config.identityMapping || typeof config.identityMapping !== 'object') {
  throw new Error('identityMapping must be an object and fails closed until configured');
}
console.log('Repository policy bootstrap configuration is structurally valid.');
console.log('Profile identities remain intentionally unconfigured; release readiness must fail closed.');
