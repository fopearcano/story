// HTTP API tests: story CRUD, validation, import/duplicate, static app.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server.js';

let server; let base; let dataDir;

before(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'story-api-'));
  const { app } = await createApp({ dataDir });
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await fs.rm(dataDir, { recursive: true, force: true });
});

const json = async (method, url, body) => {
  const res = await fetch(`${base}${url}`, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json() };
};

test('seeds the worked example', async () => {
  const { body } = await json('GET', '/api/stories');
  assert.equal(body.length, 1);
  assert.equal(body[0].id, 'christmas-carol');
});

test('create, update, read, duplicate, delete', async () => {
  const created = await json('POST', '/api/stories', { title: 'Night Ferry' });
  assert.equal(created.status, 201);
  const id = created.body.id;
  assert.match(id, /^[a-z0-9]+$/);
  const story = created.body;
  story.premise = 'What if the ferryman could not stop?';
  const put = await json('PUT', `/api/stories/${id}`, story);
  assert.equal(put.status, 200);
  const got = await json('GET', `/api/stories/${id}`);
  assert.equal(got.body.premise, 'What if the ferryman could not stop?');
  const dup = await json('POST', `/api/stories/${id}/duplicate`);
  assert.equal(dup.status, 201);
  assert.notEqual(dup.body.id, id);
  assert.equal(dup.body.title, 'Night Ferry (copy)');
  assert.equal((await json('DELETE', `/api/stories/${id}`)).status, 200);
  assert.equal((await json('GET', `/api/stories/${id}`)).status, 404);
});

test('rejects invalid ids and bodies', async () => {
  assert.equal((await json('GET', '/api/stories/..%2F..%2Fetc')).status, 400);
  assert.equal((await json('GET', '/api/stories/BAD_ID')).status, 400);
  assert.equal((await json('PUT', '/api/stories/christmas-carol', [1, 2])).status, 400);
  assert.equal((await json('GET', '/api/nope')).status, 404);
});

test('import never overwrites an existing story', async () => {
  const sample = (await json('GET', '/api/stories/christmas-carol')).body;
  const imp = await json('POST', '/api/stories/import', sample);
  assert.equal(imp.status, 201);
  assert.notEqual(imp.body.id, 'christmas-carol');
  assert.equal(imp.body.scenes.length, 21);
  const copy = await json('POST', '/api/stories', { template: 'sample' });
  assert.equal(copy.body.title, 'A Christmas Carol (copy)');
});

test('serves the app shell and vendored UI runtime', async () => {
  const html = await (await fetch(`${base}/`)).text();
  assert.match(html, /<div id="app">/);
  const vendor = await fetch(`${base}/vendor/htm-preact.js`);
  assert.equal(vendor.status, 200);
  assert.match(await vendor.text(), /export\{/);
  const spa = await fetch(`${base}/some/client/route`);
  assert.match(await spa.text(), /<div id="app">/);
});
