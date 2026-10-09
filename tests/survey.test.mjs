// node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.join(here, 'fixtures', 'app');

test('survey encuentra la marca y los lugares que piden ilustración', () => {
  execFileSync('node', [path.join(here, '..', 'scripts', 'survey.mjs'), app], { stdio: 'pipe' });
  const s = JSON.parse(fs.readFileSync(path.join(app, '.motif', 'survey.json'), 'utf8'));
  fs.rmSync(path.join(app, '.motif'), { recursive: true, force: true });
  assert.equal(s.brand.colors.ink, '#2b4636');
  assert.ok(s.brand.fonts.some((f) => f.includes('Switzer')));
  assert.ok(s.images.brand.includes('public/logo.svg'));
  for (const k of ['empty', 'avatar', 'notFound', 'og', 'placeholder']) assert.ok(s.slots[k].length > 0, `falta ${k}`);
  assert.ok(s.stack.includes('next'));
});
