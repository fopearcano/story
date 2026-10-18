// Exercises the AI agent loop end to end against a mock Messages API.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { startMockAnthropic } from './helpers/mock-anthropic.js';

let mock; let server; let base; let dataDir;
let script = [];

async function readSse(res) {
  const text = await res.text();
  return text.split('\n\n').filter(Boolean).map((chunk) => {
    const ev = (chunk.match(/^event: (.*)$/m) || [])[1];
    const data = (chunk.match(/^data: (.*)$/m) || [])[1];
    return { event: ev, data: data ? JSON.parse(data) : null };
  });
}

before(async () => {
  mock = await startMockAnthropic((body, n) => script[n]);
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_BASE_URL = mock.url;
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'story-ai-'));
  const { createApp } = await import('../server.js');
  const { app } = await createApp({ dataDir });
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  mock.server.close();
  await fs.rm(dataDir, { recursive: true, force: true });
});

const post = (url, body, headers = {}) => fetch(`${base}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('character agent: reads the story, proposes a validated change, stays append-only', async () => {
  mock.reset();
  script = [
    { blocks: [{ thinking: 'Reading the story first.' }, { text: 'Let me look at your story.' }, { tool: { name: 'get_story_overview', input: {} } }] },
    { blocks: [{ thinking: '' }, { tool: { name: 'get_character', input: { character_id: 'c-scrooge' } } }] },
    { blocks: [{ text: 'Here is a proposal.' }, { tool: { name: 'propose_character_update', input: {
      character_id: 'c-scrooge', summary: 'Sharpen the unconscious desire.',
      fields: { unconscious: 'To be forgiven by Belle', willpower: 12, bogus: 'ignored', qualities: { brave: { mask: 2, core: -5 } } },
      add_dimensions: [{ a: 'Proud', b: 'Ashamed' }],
    } } }] },
    { blocks: [{ text: 'Accept it if it rings true.' }] },
  ];
  const res = await post('/api/ai/chat', { storyId: 'christmas-carol', characterId: 'c-scrooge', message: 'What does Scrooge really want?' });
  assert.equal(res.status, 200);
  const events = await readSse(res);
  const names = events.map((e) => e.event);
  assert.ok(names.includes('chat'));
  assert.ok(names.includes('thinking'));
  assert.equal(names.filter((n) => n === 'tool').length, 3);
  const text = events.filter((e) => e.event === 'text').map((e) => e.data.text).join('');
  assert.equal(text, 'Let me look at your story.Here is a proposal.Accept it if it rings true.');
  assert.ok(!names.includes('error'), JSON.stringify(events.filter((e) => e.event === 'error')));

  const proposal = events.find((e) => e.event === 'proposal').data;
  assert.equal(proposal.id, 'p1');
  assert.equal(proposal.payload.fields.unconscious, 'To be forgiven by Belle');
  assert.equal(proposal.payload.fields.willpower, 10, 'clamped to 1..10');
  assert.equal(proposal.payload.fields.bogus, undefined, 'unknown fields dropped');
  assert.deepEqual(proposal.payload.qualities.brave, { mask: 2, core: -2 });
  assert.deepEqual(proposal.payload.add_dimensions, [{ a: 'Proud', b: 'Ashamed' }]);

  // Request shape: model, fallbacks, thinking display, effort, caching, eager tools.
  const first = mock.requests[0];
  assert.match(first.url, /\/v1\/messages/);
  assert.equal(first.body.model, 'claude-opus-5-5');
  assert.equal(first.body.fallbacks, 'default');
  assert.deepEqual(first.body.thinking, { type: 'adaptive', display: 'updates' });
  assert.equal(first.body.output_config.effort, 'medium');
  assert.equal(first.body.cache_control.type, 'ephemeral');
  assert.equal(first.body.stream, true);
  assert.ok(first.body.tools.every((t) => t.eager_input_streaming === true));
  const betas = first.headers['anthropic-beta'] || '';
  assert.match(betas, /server-side-fallback-2026-07-01/);
  assert.match(betas, /thinking-display-updates-2026-08-18/);
  assert.match(first.body.messages[0].content, /The writer is looking at character "Ebenezer Scrooge"/);

  // Append-only history: each request extends the previous one unchanged.
  for (let i = 1; i < mock.requests.length; i++) {
    const prev = mock.requests[i - 1].body.messages;
    const cur = mock.requests[i].body.messages;
    assert.deepEqual(cur.slice(0, prev.length), prev);
  }
  const second = mock.requests[1].body.messages;
  const assistantBlocks = second[1].content;
  assert.equal(assistantBlocks[0].type, 'thinking');
  assert.equal(assistantBlocks[0].signature, 'sig_1_0', 'thinking blocks passed back unchanged');
  const toolResult = second[2].content[0];
  assert.equal(toolResult.type, 'tool_result');
  assert.match(toolResult.content, /Title: A Christmas Carol/);
  const charResult = mock.requests[2].body.messages[4].content[0];
  assert.match(charResult.content, /Ebenezer Scrooge/);

  // The writer accepts; the decision is reported at the start of the next turn.
  const chatId = events.find((e) => e.event === 'chat').data.chatId;
  const dec = await post(`/api/ai/chats/${chatId}/proposals/p1`, { status: 'accepted' });
  assert.equal(dec.status, 200);
  script.push({ blocks: [{ text: 'Noted.' }] });
  const res2 = await post('/api/ai/chat', { storyId: 'christmas-carol', chatId, message: 'Thanks. Next?' });
  await readSse(res2);
  const lastReq = mock.requests[mock.requests.length - 1].body.messages;
  assert.match(lastReq[lastReq.length - 1].content, /^\[Writer decisions since your last turn: p1 accepted\]/);

  const saved = await (await fetch(`${base}/api/ai/chats/${chatId}`)).json();
  assert.equal(saved.display.length, 4);
  assert.deepEqual(saved.display[1].parts.map((p) => p.type), ['text', 'text', 'proposal', 'text'].filter((t, i, a) => !(t === 'text' && a[i - 1] === 'text')));
  assert.equal(saved.proposals[0].status, 'accepted');
});

test('invalid tool input is returned to the model as an error result', async () => {
  mock.reset();
  script = [
    { blocks: [{ tool: { name: 'propose_character_update', input: { character_id: 'c-scrooge', summary: 'nothing' } } }] },
    { blocks: [{ text: 'Sorry, let me fix that.' }] },
  ];
  const events = await readSse(await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Propose something' }));
  assert.ok(!events.some((e) => e.event === 'proposal'));
  const result = mock.requests[1].body.messages.at(-1).content[0];
  assert.equal(result.is_error, true);
  assert.match(result.content, /INVALID_INPUT/);
});

test('API errors surface as readable SSE errors', async () => {
  mock.reset();
  script = [{ status: 401, errorType: 'authentication_error', message: 'invalid x-api-key' }];
  const events = await readSse(await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Hi' }));
  const err = events.find((e) => e.event === 'error');
  assert.ok(err, 'error event emitted');
  assert.match(err.data.message, /API key was rejected/);
});

test('assist task streams text built from the story', async () => {
  mock.reset();
  script = [{ blocks: [{ thinking: '' }, { text: '1. **The ghost knocks twice**' }] }];
  const events = await readSse(await post('/api/ai/assist', { task: 'alternatives', storyId: 'christmas-carol', sceneId: 's03' }));
  assert.equal(events.filter((e) => e.event === 'text').map((e) => e.data.text).join(''), '1. **The ghost knocks twice**');
  assert.ok(events.some((e) => e.event === 'done'));
  const body = mock.requests[0].body;
  assert.match(body.messages[0].content, /Marley/);
  assert.match(body.system, /story consultant/);
  assert.equal(body.tools, undefined);
});

test('unknown assist task and missing key are rejected cleanly', async () => {
  const bad = await post('/api/ai/assist', { task: 'nope', storyId: 'christmas-carol' });
  assert.equal(bad.status, 400);
  const key = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const res = await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Hi' });
    assert.equal(res.status, 503);
    const status = await (await fetch(`${base}/api/ai/status`)).json();
    assert.equal(status.envKey, false);
  } finally {
    process.env.ANTHROPIC_API_KEY = key;
  }
});
