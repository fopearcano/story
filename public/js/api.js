// HTTP client for the Story Builder server, including SSE streaming for AI.
import { safeStorage, setSafeStorage } from './lib.js';
import { lang } from './i18n.js';

const AI_STORAGE = 'storybuilder.ai';
const LEGACY_KEY = 'storybuilder.anthropicKey';

// The interface language goes with every request: the server uses it for the
// worked example, default names, its messages and the AI partner's replies.
const LANG_HEADER = { 'x-story-lang': lang };

// AI settings chosen in this browser: the provider (empty = the server's
// default) and, per provider, a key, a server address and a model.
export const aiConfig = {
  get() {
    let saved = {};
    try { saved = JSON.parse(safeStorage(AI_STORAGE, '{}')) || {}; } catch { saved = {}; }
    const cfg = { provider: '', ...saved, keys: { ...saved.keys }, baseUrls: { ...saved.baseUrls }, models: { ...saved.models } };
    const legacy = safeStorage(LEGACY_KEY, '');
    if (legacy && !cfg.keys.anthropic) cfg.keys.anthropic = legacy;
    return cfg;
  },
  set(cfg) {
    setSafeStorage(AI_STORAGE, JSON.stringify(cfg));
    setSafeStorage(LEGACY_KEY, null);
  },
  // One provider's settings, as sent with AI requests.
  selection(cfg = aiConfig.get(), provider = cfg.provider) {
    return { provider, key: cfg.keys[provider] || '', baseURL: cfg.baseUrls[provider] || '', model: cfg.models[provider] || '', legacyKey: cfg.keys.anthropic || '' };
  },
};

// Settings travel as headers; the server only uses them if it allows
// browsers to choose (STORY_AI_ALLOW_CLIENT_CONFIG).
function aiHeaders(sel = aiConfig.selection()) {
  if (!sel.provider) return sel.legacyKey ? { 'x-anthropic-api-key': sel.legacyKey } : {};
  return {
    'x-ai-provider': sel.provider,
    ...(sel.key && { 'x-ai-key': sel.key }),
    ...(sel.baseURL && { 'x-ai-base-url': sel.baseURL }),
    ...(sel.model && { 'x-ai-model': sel.model }),
  };
}

async function request(method, url, body, extraHeaders = {}) {
  const res = await fetch(url, {
    method,
    headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...LANG_HEADER, ...extraHeaders },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}

export const api = {
  listStories: () => request('GET', '/api/stories'),
  getStory: (id) => request('GET', `/api/stories/${encodeURIComponent(id)}`),
  createStory: (body) => request('POST', '/api/stories', body),
  importStory: (story) => request('POST', '/api/stories/import', story),
  saveStory: (story) => request('PUT', `/api/stories/${encodeURIComponent(story.id)}`, story),
  duplicateStory: (id) => request('POST', `/api/stories/${encodeURIComponent(id)}/duplicate`),
  deleteStory: (id) => request('DELETE', `/api/stories/${encodeURIComponent(id)}`),
  aiStatus: () => request('GET', '/api/ai/status'),
  // Models for the settings being edited (not yet saved).
  listModels: (sel) => request('GET', '/api/ai/models', undefined, aiHeaders(sel)),
  listChats: (storyId) => request('GET', `/api/ai/chats?storyId=${encodeURIComponent(storyId)}`),
  getChat: (id) => request('GET', `/api/ai/chats/${encodeURIComponent(id)}`),
  deleteChat: (id) => request('DELETE', `/api/ai/chats/${encodeURIComponent(id)}`),
  decideProposal: (chatId, pid, status, note) => request('POST', `/api/ai/chats/${encodeURIComponent(chatId)}/proposals/${encodeURIComponent(pid)}`, { status, note }),
};

// POST a JSON body and dispatch server-sent events to onEvent(event, data).
export async function streamSse(url, body, onEvent, { signal } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...LANG_HEADER, ...aiHeaders() },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `${res.status} ${res.statusText}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let event = 'message';
      const dataLines = [];
      for (const line of chunk.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
      }
      if (!dataLines.length) continue;
      let data;
      try { data = JSON.parse(dataLines.join('\n')); } catch { data = dataLines.join('\n'); }
      onEvent(event, data);
    }
  }
}
