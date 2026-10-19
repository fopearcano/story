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

test('bad input gets clean 4xx answers, never a crash', async () => {
  const raw = async (method, url, text) => {
    const res = await fetch(`${base}${url}`, { method, headers: { 'Content-Type': 'application/json' }, body: text });
    return { status: res.status, body: await res.json() };
  };
  assert.equal((await raw('POST', '/api/stories', '{"title": ')).body.error, 'The request body is not valid JSON.');
  assert.equal((await json('POST', '/api/stories', [1, 2])).status, 400);
  assert.equal((await json('POST', '/api/stories', { title: { a: 1 } })).body.title, 'Untitled Story');
  const imp = await json('POST', '/api/stories/import', { title: 'Junk', scenes: 'nope', characters: { a: 1 }, plotlines: null, values: 5 });
  assert.equal(imp.status, 201);
  assert.deepEqual(imp.body.scenes, []);
  assert.equal((await json('PUT', '/api/stories/junk-put', { title: null, scenes: 'x' })).status, 200);
  for (const task of ['__proto__', 'constructor', 'toString']) {
    assert.equal((await json('POST', '/api/ai/assist', { task, storyId: 'christmas-carol' })).status, 400, task);
  }
});

test('a damaged file in the data folder does not break the story list', async () => {
  await fs.writeFile(path.join(dataDir, 'stories', 'broken.json'), '{nope');
  await fs.writeFile(path.join(dataDir, 'stories', 'list.json'), '[1, 2]');
  const warn = console.warn;
  console.warn = () => {};
  try {
    const { status, body } = await json('GET', '/api/stories');
    assert.equal(status, 200);
    assert.ok(!body.some((s) => s.id === 'broken' || s.id === 'list'));
    assert.equal((await json('GET', '/api/stories/list')).status, 404);
  } finally {
    console.warn = warn;
    await fs.rm(path.join(dataDir, 'stories', 'broken.json'));
    await fs.rm(path.join(dataDir, 'stories', 'list.json'));
  }
});

