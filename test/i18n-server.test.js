// Server language handling: the example, default names and messages follow
// the client's interface language (x-story-lang, else Accept-Language).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server.js';

let server; let base; let dataDir;

before(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'story-i18n-'));
  const { app } = await createApp({ dataDir });
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await fs.rm(dataDir, { recursive: true, force: true });
});

const it = { 'x-story-lang': 'it' };
const call = async (method, url, body, headers = {}) => {
  const res = await fetch(`${base}${url}`, { method, headers: { ...(body && { 'Content-Type': 'application/json' }), ...headers }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json() };
};

test('the first Italian client gets the Italian example', async () => {
  const { body } = await call('GET', '/api/stories', undefined, it);
  assert.deepEqual(body.map((s) => s.id), ['canto-di-natale']);
  assert.match(body[0].title, /Canto di Natale/);
  // Later English clients don't trigger a second example.
  assert.equal((await call('GET', '/api/stories')).body.length, 1);
});

test('new stories and copies use Italian default names', async () => {
  const blank = await call('POST', '/api/stories', {}, it);
  assert.equal(blank.body.title, 'Storia senza titolo');
  assert.equal(blank.body.plotlines[0].name, 'Trama principale');
  const copy = await call('POST', `/api/stories/${blank.body.id}/duplicate`, undefined, it);
  assert.equal(copy.body.title, 'Storia senza titolo (copia)');
  const sample = await call('POST', '/api/stories', { template: 'sample' }, it);
  assert.equal(sample.body.title, 'Canto di Natale (copia)');
  assert.equal(sample.body.characters.length, 12);
  assert.equal((await call('POST', '/api/stories', { template: 'sample' })).body.title, 'A Christmas Carol (copy)');
  const english = await call('POST', '/api/stories', {});
  assert.equal(english.body.title, 'Untitled Story');
  assert.equal(english.body.plotlines[0].name, 'Central plot');
});

test('errors follow the language, with Accept-Language as fallback', async () => {
  assert.equal((await call('GET', '/api/stories/nope', undefined, it)).body.error, 'Storia non trovata');
  assert.equal((await call('GET', '/api/stories/nope', undefined, { 'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8' })).body.error, 'Storia non trovata');
  assert.equal((await call('GET', '/api/stories/nope')).body.error, 'Story not found');
});
