// The AI partner on providers other than Claude: OpenAI-compatible services and
// local servers, simulated by a mock, plus moving a conversation between them.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { startMockOpenAI } from './helpers/mock-openai.js';
import { startMockAnthropic } from './helpers/mock-anthropic.js';
import { toOpenAIMessages, toOpenAITools, toolCallId } from '../server/llm/openai.js';
import { providerById } from '../server/llm/providers.js';

let oai; let claude; let server; let base; let dataDir;
let script = [];
let claudeScript = [];

for (const k of ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'STORY_AI_PROVIDER', 'STORY_AI_MODEL', 'STORY_AI_BASE_URL', 'STORY_AI_API_KEY', 'OLLAMA_BASE_URL']) delete process.env[k];

before(async () => {
  oai = await startMockOpenAI((body, n) => (typeof script === 'function' ? script(body, n) : script[n]));
  claude = await startMockAnthropic((body, n) => claudeScript[n]);
  process.env.ANTHROPIC_BASE_URL = claude.url;
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'story-providers-'));
  const { createApp } = await import('../server.js');
  const { app } = await createApp({ dataDir });
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  oai.server.close();
  claude.server.close();
  await fs.rm(dataDir, { recursive: true, force: true });
});

const custom = () => ({ 'x-ai-provider': 'custom', 'x-ai-base-url': `${oai.url}/v1`, 'x-ai-key': 'sk-test', 'x-ai-model': 'story-model' });
const post = (url, body, headers = {}) => fetch(`${base}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

async function readSse(res) {
  const text = await res.text();
  return text.split('\n\n').filter(Boolean).map((c) => {
    const ev = (c.match(/^event: (.*)$/m) || [])[1];
    const data = (c.match(/^data: (.*)$/m) || [])[1];
    return { event: ev, data: data ? JSON.parse(data) : null };
  });
}
const textOf = (events) => events.filter((e) => e.event === 'text').map((e) => e.data.text).join('');

test('status lists cloud and local providers without exposing keys', async () => {
  const s = await (await fetch(`${base}/api/ai/status`)).json();
  assert.equal(s.provider, 'anthropic');
  assert.equal(s.configured, false);
  assert.equal(s.allowClientConfig, true);
  const ids = s.providers.map((p) => p.id);
  for (const id of ['anthropic', 'openai', 'openrouter', 'gemini', 'ollama', 'lmstudio', 'llamacpp', 'custom']) assert.ok(ids.includes(id), id);
  const ollama = s.providers.find((p) => p.id === 'ollama');
  assert.equal(ollama.kind, 'local');
  assert.equal(ollama.needsKey, false);
  assert.equal(ollama.defaultBaseURL, 'http://localhost:11434/v1');
  process.env.DEEPSEEK_API_KEY = 'sk-secret-123';
  try {
    const withKey = await (await fetch(`${base}/api/ai/status`)).json();
    assert.equal(withKey.providers.find((p) => p.id === 'deepseek').envKey, true);
    assert.ok(!JSON.stringify(withKey).includes('sk-secret-123'));
  } finally {
    delete process.env.DEEPSEEK_API_KEY;
  }
});

test('OpenAI-compatible agent: tool calls, proposals, reasoning, request shape', async () => {
  oai.reset();
  script = [
    { reasoning: 'Reading first.', text: 'Let me read your story.', tools: [{ name: 'get_story_overview', args: {} }] },
    { tools: [{ name: 'propose_character_update', args: { character_id: 'c-scrooge', summary: 'Sharpen the wound.', fields: { unconscious: 'To be forgiven by Belle', arc_plot: 'redemption' } } }] },
    { text: 'Accept it if it rings true.' },
  ];
  const events = await readSse(await post('/api/ai/chat', { storyId: 'christmas-carol', characterId: 'c-scrooge', message: 'What does Scrooge want?' }, custom()));
  assert.equal(textOf(events), 'Let me read your story.Accept it if it rings true.');
  assert.ok(events.some((e) => e.event === 'thinking' && e.data.text === 'Reading first.'));
  assert.deepEqual(events.filter((e) => e.event === 'tool').map((e) => e.data.name), ['get_story_overview', 'propose_character_update']);
  const proposal = events.find((e) => e.event === 'proposal').data;
  assert.equal(proposal.payload.fields.unconscious, 'To be forgiven by Belle');
  assert.ok(!events.some((e) => e.event === 'error'), JSON.stringify(events.filter((e) => e.event === 'error')));

  const [first, second] = oai.chats();
  assert.equal(first.headers.authorization, 'Bearer sk-test');
  assert.equal(first.body.model, 'story-model');
  assert.equal(first.body.stream, true);
  assert.equal(first.body.messages[0].role, 'system');
  assert.match(first.body.messages[0].content, /character-development partner/);
  const propose = first.body.tools.find((t) => t.function.name === 'propose_character_update');
  assert.ok(!JSON.stringify(first.body.tools).includes('additionalProperties'));
  assert.ok(!propose.function.parameters.properties.fields.properties.arc_plot.enum.includes(''));
  // The tool result goes back with the call's id.
  const call = second.body.messages.find((m) => m.tool_calls);
  const result = second.body.messages.find((m) => m.role === 'tool');
  assert.equal(result.tool_call_id, call.tool_calls[0].id);
  assert.match(result.content, /Title: A Christmas Carol/);

  // Stored in the canonical format, so the conversation can move to Claude.
  const chatId = events.find((e) => e.event === 'chat').data.chatId;
  const stored = JSON.parse(await fs.readFile(path.join(dataDir, 'chats', `${chatId}.json`), 'utf8'));
  assert.equal(stored.messages[1].content.find((b) => b.type === 'tool_use').name, 'get_story_overview');
  assert.equal(stored.messages[2].content[0].type, 'tool_result');

  claude.reset();
  claudeScript = [{ blocks: [{ thinking: 'Continuing.' }, { text: 'Claude here.' }] }];
  const next = await readSse(await post('/api/ai/chat', { storyId: 'christmas-carol', chatId, message: 'Go on' }, { 'x-ai-provider': 'anthropic', 'x-ai-key': 'sk-ant-test' }));
  assert.equal(textOf(next), 'Claude here.');
  const sent = claude.requests[0].body.messages;
  assert.equal(sent[1].content.find((b) => b.type === 'tool_use').name, 'get_story_overview');
  assert.match(sent.at(-1).content, /Go on/);

  // …and back again: Claude's thinking blocks are dropped for the other side.
  oai.reset();
  script = [{ text: 'Back on the local model.' }];
  await readSse(await post('/api/ai/chat', { storyId: 'christmas-carol', chatId, message: 'Thanks' }, custom()));
  const msgs = oai.chats()[0].body.messages;
  assert.ok(msgs.some((m) => m.role === 'assistant' && m.content === 'Claude here.'));
  assert.ok(!JSON.stringify(msgs).includes('Continuing.'));
});

test('a model without tool support falls back to a plain conversation', async () => {
  oai.reset();
  script = (body) => (body.tools ? { status: 400, message: 'registry.ollama.ai/library/tiny:1b does not support tools' } : { text: 'Here is my advice.' });
  const headers = { ...custom(), 'x-ai-model': 'tiny:1b' };
  const events = await readSse(await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Help me' }, headers));
  assert.equal(textOf(events), 'Here is my advice.');
  assert.match(events.find((e) => e.event === 'notice').data.text, /tiny:1b can’t use tools/);
  const [withTools, plain] = oai.chats();
  assert.ok(withTools.body.tools);
  assert.equal(plain.body.tools, undefined);
  assert.match(plain.body.messages[0].content, /Current story:\nTitle: A Christmas Carol/);
  // Remembered: the next conversation doesn't try tools again.
  oai.reset();
  await readSse(await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Again' }, headers));
  assert.equal(oai.chats().length, 1);
  assert.equal(oai.chats()[0].body.tools, undefined);
});

test('assists stream text, including from servers that answer without streaming', async () => {
  oai.reset();
  script = [{ text: '1. **A knock at midnight**' }, { json: true, text: 'Plain JSON reply.' }];
  let events = await readSse(await post('/api/ai/assist', { task: 'alternatives', storyId: 'christmas-carol', sceneId: 's03' }, custom()));
  assert.equal(textOf(events), '1. **A knock at midnight**');
  assert.match(oai.chats()[0].body.messages[1].content, /Marley/);
  events = await readSse(await post('/api/ai/assist', { task: 'cast', storyId: 'christmas-carol' }, custom()));
  assert.equal(textOf(events), 'Plain JSON reply.');
});

test('local server: bare address gets /v1, first model is used, models are listed', async () => {
  oai.reset();
  script = [{ text: 'Hello from the local model.' }];
  const local = { 'x-ai-provider': 'ollama', 'x-ai-base-url': oai.url };
  const events = await readSse(await post('/api/ai/assist', { task: 'cast', storyId: 'christmas-carol' }, local));
  assert.equal(textOf(events), 'Hello from the local model.');
  assert.equal(oai.chats()[0].body.model, 'model-b');
  assert.equal(oai.chats()[0].headers.authorization, undefined);
  const list = await (await fetch(`${base}/api/ai/models`, { headers: local })).json();
  assert.deepEqual(list.models, ['model-a', 'model-b']);
});

test('readable errors: unreachable server, missing key, rejected key, client config locked', async () => {
  const down = { 'x-ai-provider': 'lmstudio', 'x-ai-base-url': 'http://127.0.0.1:9/v1', 'x-ai-model': 'm' };
  let events = await readSse(await post('/api/ai/assist', { task: 'cast', storyId: 'christmas-carol' }, down));
  assert.match(events.find((e) => e.event === 'error').data.message, /Could not reach LM Studio at http:\/\/127\.0\.0\.1:9\/v1/);

  const nokey = await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Hi' }, { 'x-ai-provider': 'openai' });
  assert.equal(nokey.status, 503);
  assert.match((await nokey.json()).error, /OPENAI_API_KEY/);

  oai.reset();
  script = [{ status: 401, message: 'Incorrect API key provided' }];
  events = await readSse(await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Hi' }, custom()));
  assert.match(events.find((e) => e.event === 'error').data.message, /API key was rejected/);

  const bad = await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Hi' }, { 'x-ai-provider': 'custom', 'x-ai-base-url': 'file:///etc/passwd' });
  assert.equal(bad.status, 503);

  process.env.STORY_AI_ALLOW_CLIENT_CONFIG = 'false';
  try {
    const locked = await post('/api/ai/chat', { storyId: 'christmas-carol', message: 'Hi' }, custom());
    assert.equal(locked.status, 503);
    assert.equal((await (await fetch(`${base}/api/ai/status`)).json()).allowClientConfig, false);
  } finally {
    delete process.env.STORY_AI_ALLOW_CLIENT_CONFIG;
  }
});

test('server configuration picks the default provider from the environment', async () => {
  process.env.OPENROUTER_API_KEY = 'sk-or-test';
  try {
    const s = await (await fetch(`${base}/api/ai/status`)).json();
    assert.equal(s.provider, 'openrouter');
    assert.equal(s.configured, true);
    assert.equal(s.model, 'openrouter/auto');
    assert.equal(s.providers.find((p) => p.id === 'openrouter').envKey, true);
  } finally {
    delete process.env.OPENROUTER_API_KEY;
  }
});

test('conversion: thinking dropped, Mistral-safe ids, plain mode merges turns', () => {
  const history = [
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: [{ type: 'thinking', thinking: 'secret', signature: 's' }, { type: 'text', text: 'Reading.' }, { type: 'tool_use', id: 'toolu_01ABC', name: 'get_story_overview', input: {} }] },
    { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'toolu_01ABC', content: 'Story…', is_error: true }] },
    { role: 'assistant', content: [{ type: 'text', text: 'Done.' }] },
    { role: 'user', content: 'More' },
  ];
  const mistral = providerById('mistral');
  const out = toOpenAIMessages(history, mistral);
  const id = out[1].tool_calls[0].id;
  assert.match(id, /^[a-zA-Z0-9]{9}$/);
  assert.equal(out[2].tool_call_id, id);
  assert.equal(out[2].content, 'Error: Story…');
  assert.ok(!JSON.stringify(out).includes('secret'));
  assert.equal(toolCallId(providerById('openai'), 'toolu_01ABC'), 'toolu_01ABC');

  const plain = toOpenAIMessages(history, providerById('ollama'), { plain: true });
  assert.deepEqual(plain.map((m) => m.role), ['user', 'assistant', 'user']);
  assert.equal(plain[1].content, 'Reading.\n\nDone.');
  assert.equal(toOpenAITools([{ name: 'x', description: 'd', input_schema: { type: 'object', properties: {}, additionalProperties: false } }])[0].function.parameters.additionalProperties, undefined);
});
