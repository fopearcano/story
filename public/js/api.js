// HTTP client for the Story Builder server, including SSE streaming for AI.
import { safeStorage } from './lib.js';

const KEY_STORAGE = 'storybuilder.anthropicKey';

function aiHeaders() {
  const key = safeStorage(KEY_STORAGE, '');
  return key ? { 'x-anthropic-api-key': key } : {};
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
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
  listChats: (storyId) => request('GET', `/api/ai/chats?storyId=${encodeURIComponent(storyId)}`),
  getChat: (id) => request('GET', `/api/ai/chats/${encodeURIComponent(id)}`),
  deleteChat: (id) => request('DELETE', `/api/ai/chats/${encodeURIComponent(id)}`),
  decideProposal: (chatId, pid, status, note) => request('POST', `/api/ai/chats/${encodeURIComponent(chatId)}/proposals/${encodeURIComponent(pid)}`, { status, note }),
};

export const aiKey = {
  get: () => safeStorage(KEY_STORAGE, ''),
  storageKey: KEY_STORAGE,
};

// POST a JSON body and dispatch server-sent events to onEvent(event, data).
export async function streamSse(url, body, onEvent, { signal } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...aiHeaders() },
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
