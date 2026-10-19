// Translation checks: every t() key has an Italian entry, the Italian data
// files mirror the English ones, and the Italian example matches the English.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { report, conflicts, parity } from './helpers/i18n-scan.js';
import { sampleStory } from '../public/js/sample.js';
import { tl, tln } from '../public/js/i18n.js';
import { FRAGMENTS } from '../public/js/i18n/it/index.js';

test('every translatable string has an Italian translation', async () => {
  const rows = await report();
  assert.deepEqual(rows.map((r) => `${r.file}:${r.line} ${r.kind} ${JSON.stringify(r.key)}`), []);
});

test('dictionary fragments agree on shared keys', async () => {
  const c = await conflicts();
  assert.deepEqual(c.map((x) => `${x.key}: ${x.a.name}="${x.a.value}" vs ${x.b.name}="${x.b.value}"`), []);
});

test('Italian entries are translated', () => {
  const same = [];
  for (const [name, frag] of Object.entries(FRAGMENTS)) {
    for (const [k, v] of Object.entries(frag)) {
      if (typeof v !== 'string' || !v.trim()) same.push(`${name}: empty "${k}"`);
      else if (k === v && k.split(/\s+/).length >= 4) same.push(`${name}: "${k}"`);
    }
  }
  assert.deepEqual(same, []);
});

for (const name of ['principles', 'genres', 'values', 'triangle']) {
  test(`kb/it/${name}.js mirrors kb/en/${name}.js`, async () => {
    const en = await import(`../public/js/kb/en/${name}.js`);
    const it = await import(`../public/js/kb/it/${name}.js`);
    assert.deepEqual(parity({ ...en }, { ...it }), []);
  });
}

test('the Italian example has the same structure as the English one', () => {
  const strip = ({ id, createdAt, updatedAt, ...rest }) => rest;
  const en = sampleStory('en');
  const it = sampleStory('it');
  assert.equal(it.id, 'canto-di-natale');
  assert.deepEqual(parity(strip(en), strip(it)), []);
});

test('t() helpers fill placeholders and plurals', () => {
  assert.equal(tl('it', '{title} (copy)', { title: 'X' }), 'X (copia)');
  assert.equal(tl('it', 'no such key {n}', { n: 3 }), 'no such key 3');
  assert.equal(tl('en', 'Central plot'), 'Central plot');
  assert.equal(tl('it', 'Central plot'), 'Trama principale');
  assert.equal(tln('en', 1, '{n} scene', '{n} scenes'), '1 scene');
  assert.equal(tln('en', 0, '{n} scene', '{n} scenes'), '0 scenes');
});
