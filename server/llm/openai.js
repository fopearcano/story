// Any service that speaks the OpenAI Chat Completions API: OpenAI, OpenRouter,
// Gemini, Mistral, Groq, DeepSeek, xAI, and local servers such as Ollama,
// LM Studio and llama.cpp. Plain fetch + SSE, so quirks of small local servers
// (no model chosen, no tool support, non-streamed replies) can be handled.
//
// The conversation is stored in the Anthropic content-block format; it is
// converted on every request, so a chat can move between providers.
import { LLMError } from './errors.js';
import { uid } from '../../public/js/model.js';

const noTools = new Set(); // provider|url|model combinations that rejected tools
const firstModel = new Map(); // url -> model used when none is chosen

// ---- Conversion --------------------------------------------------------------

function textOf(content) {
  if (typeof content === 'string') return content;
  return (content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
}

// Ids the OpenAI side accepts; Mistral insists on exactly 9 letters/digits.
export function toolCallId(provider, id) {
  if (provider.id !== 'mistral') return id;
  if (/^[a-zA-Z0-9]{9}$/.test(id)) return id;
  let a = 0x811c9dc5;
  let b = 7;
  for (const ch of String(id)) {
    a = Math.imul(a ^ ch.charCodeAt(0), 16777619);
    b = (Math.imul(b, 31) + ch.charCodeAt(0)) | 0;
  }
  return `${(a >>> 0).toString(36)}${(b >>> 0).toString(36)}000000000`.slice(0, 9);
}

// Canonical (Anthropic-style) messages to Chat Completions messages. Thinking
// blocks are dropped. With `plain`, tool calls and results are left out and
// same-role turns merged, for models that can't take tools (some local chat
// templates also require strictly alternating roles).
export function toOpenAIMessages(messages, provider, { plain = false } = {}) {
  const out = [];
  const push = (msg) => {
    const last = out[out.length - 1];
    if (plain && last && last.role === msg.role) last.content = `${last.content}\n\n${msg.content}`;
    else out.push(msg);
  };
  for (const m of messages) {
    if (typeof m.content === 'string') { push({ role: m.role, content: m.content }); continue; }
    if (m.role === 'assistant') {
      const text = textOf(m.content);
      const calls = plain ? [] : m.content.filter((b) => b.type === 'tool_use').map((b) => ({
        id: toolCallId(provider, b.id), type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) },
      }));
      if (text || calls.length) push({ role: 'assistant', content: text, ...(calls.length && { tool_calls: calls }) });
    } else {
      if (!plain) {
        for (const r of m.content.filter((b) => b.type === 'tool_result')) {
          out.push({ role: 'tool', tool_call_id: toolCallId(provider, r.tool_use_id), content: `${r.is_error ? 'Error: ' : ''}${textOf(r.content)}` });
        }
      }
      const text = m.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      if (text) push({ role: 'user', content: text });
    }
  }
  return out;
}

// JSON Schema subset most providers accept (Gemini rejects additionalProperties
// and empty enum values). Inputs are validated on the server anyway.
function cleanSchema(s) {
  if (Array.isArray(s)) return s.map(cleanSchema);
  if (!s || typeof s !== 'object') return s;
  const out = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === 'additionalProperties') continue;
    out[k] = k === 'enum' && Array.isArray(v) ? v.filter((x) => x !== '') : cleanSchema(v);
  }
  return out;
}

export function toOpenAITools(tools) {
  return tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: cleanSchema(t.input_schema) } }));
}

const safeId = (id) => String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_') || `call_${uid()}`;

// ---- HTTP --------------------------------------------------------------------

async function httpError(res) {
  const raw = await res.text().catch(() => '');
  let message = raw;
  try {
    const j = JSON.parse(raw);
    const e = Array.isArray(j) ? j[0]?.error : j.error;
    message = (typeof e === 'string' ? e : e?.message) || j.message || j.detail || raw;
  } catch { /* not JSON */ }
  message = String(message || res.statusText || 'error').slice(0, 400);
  const s = res.status;
  if (/tool|function/i.test(message) && /support|jinja|not enabled|not available|unsupported/i.test(message)) return new LLMError('tools_unsupported', message, { status: s });
  const kind = { 401: 'auth', 403: 'forbidden', 404: 'not_found', 429: 'rate_limit', 400: 'bad_request', 422: 'bad_request' }[s] || 'api';
  return new LLMError(kind, message, { status: s });
}

async function* sseData(body) {
  const decoder = new TextDecoder();
  let buf = '';
  for await (const chunk of body) {
    buf += decoder.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).replace(/\r$/, '');
      buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') return;
      try { yield JSON.parse(data); } catch { /* keep-alive or comment */ }
    }
  }
}

// Read a streamed (or, from servers that ignore `stream`, a plain JSON) reply
// into text, reasoning and tool calls.
async function readReply(res, { onText, onThinking, onTool }) {
  let text = '';
  let refusal = '';
  let finish = null;
  const calls = [];
  const byIndex = new Map();

  const addCall = (tc) => {
    const indexed = Number.isInteger(tc.index);
    let slot = indexed ? byIndex.get(tc.index) : calls[calls.length - 1];
    if (slot && tc.id && slot.id && tc.id !== slot.id) slot = null;
    if (!slot) {
      slot = { id: '', name: '', args: '' };
      calls.push(slot);
      if (indexed) byIndex.set(tc.index, slot);
    }
    if (tc.id && !slot.id) slot.id = tc.id;
    const fn = tc.function || {};
    if (fn.name && !slot.name) { slot.name = fn.name; onTool(fn.name); }
    if (fn.arguments != null) slot.args += typeof fn.arguments === 'string' ? fn.arguments : JSON.stringify(fn.arguments);
  };
  const take = (choice, delta) => {
    if (!choice) return;
    const reasoning = delta.reasoning_content ?? delta.reasoning;
    if (typeof reasoning === 'string' && reasoning) onThinking(reasoning);
    if (typeof delta.content === 'string' && delta.content) { text += delta.content; onText(delta.content); }
    if (typeof delta.refusal === 'string') refusal += delta.refusal;
    for (const tc of delta.tool_calls || []) addCall(tc);
    if (choice.finish_reason) finish = choice.finish_reason;
  };

  if ((res.headers.get('content-type') || '').includes('application/json')) {
    const j = await res.json();
    if (j.error) throw new LLMError('api', j.error.message || String(j.error));
    const choice = j.choices?.[0];
    take(choice, choice?.message || {});
  } else {
    for await (const chunk of sseData(res.body)) {
      if (chunk.error) throw new LLMError('api', chunk.error.message || String(chunk.error));
      const choice = chunk.choices?.[0];
      take(choice, choice?.delta || {});
    }
  }

  const content = [];
  if (text) content.push({ type: 'text', text });
  for (const c of calls.filter((x) => x.name)) {
    let input;
    try { input = c.args.trim() ? JSON.parse(c.args) : {}; } catch { input = { __invalid_json: c.args.slice(0, 2000) }; }
    if (!input || typeof input !== 'object' || Array.isArray(input)) input = { __invalid_json: String(c.args).slice(0, 2000) };
    content.push({ type: 'tool_use', id: safeId(c.id), name: c.name, input });
  }
  const hasCalls = content.some((b) => b.type === 'tool_use');
  let stop = hasCalls ? 'tool_use' : 'end';
  if (finish === 'length') stop = 'max_tokens';
  if ((refusal && !text) || finish === 'content_filter') stop = 'refusal';
  return { content, stop };
}

// ---- Adapter -----------------------------------------------------------------

export function openaiLLM({ provider, key, baseURL, model }) {
  const headers = {
    'Content-Type': 'application/json',
    ...(key && { Authorization: `Bearer ${key}` }),
    ...(provider.headers || {}),
  };
  let resolved = model;
  const toolKey = () => `${provider.id}|${baseURL}|${resolved}`;

  async function request(path, { body, signal } = {}) {
    let res;
    try {
      res = await fetch(`${baseURL}${path}`, { method: body ? 'POST' : 'GET', headers, body: body && JSON.stringify(body), signal });
    } catch (err) {
      if (signal?.aborted) throw err;
      throw new LLMError('connection', err.cause?.code || err.message);
    }
    if (!res.ok) throw await httpError(res);
    return res;
  }

  async function listModels(signal) {
    const res = await request('/models', { signal });
    const j = await res.json().catch(() => ({}));
    const list = Array.isArray(j) ? j : j.data || j.models || [];
    return list.map((m) => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean);
  }

  // Local servers often have no model configured: use the first one loaded.
  async function prepare(signal) {
    if (resolved) return resolved;
    if (!firstModel.has(baseURL)) {
      const ids = await listModels(signal);
      if (!ids.length) throw new LLMError('no_model', 'no models');
      firstModel.set(baseURL, ids[0]);
    }
    resolved = firstModel.get(baseURL);
    return resolved;
  }

  return {
    provider,
    label: provider.short,
    get model() { return resolved; },
    prepare,
    supportsTools: () => !noTools.has(toolKey()),
    markNoTools: () => noTools.add(toolKey()),

    async agentTurn({ system, tools, messages, signal, onText, onThinking, onTool }) {
      await prepare(signal);
      const body = {
        model: resolved,
        stream: true,
        messages: [{ role: 'system', content: system }, ...toOpenAIMessages(messages, provider, { plain: !tools })],
        ...(tools && { tools: toOpenAITools(tools) }),
      };
      return readReply(await request('/chat/completions', { body, signal }), { onText, onThinking, onTool });
    },

    async complete({ system, prompt, signal, onText }) {
      await prepare(signal);
      const body = { model: resolved, stream: true, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] };
      const { stop } = await readReply(await request('/chat/completions', { body, signal }), { onText, onThinking: () => {}, onTool: () => {} });
      return { stop };
    },

    listModels: () => listModels(),
  };
}
