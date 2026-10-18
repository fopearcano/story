// Story state: loading, immutable updates, undo/redo, debounced autosave.
import { createContext, useContext, useEffect, useRef, useState, useCallback } from './lib.js';
import { api } from './api.js';
import { setIn, normalizeStory } from './model.js';

export const StoryCtx = createContext(null);
export const useStory = () => useContext(StoryCtx);

const SAVE_DELAY = 700;
const COALESCE_MS = 900;

export function useStoryState(id) {
  const [story, setStory] = useState(null);
  const [status, setStatus] = useState('loading');
  const latest = useRef(null);
  const saved = useRef(null);
  const timer = useRef(null);
  const inflight = useRef(null);
  const hist = useRef({ past: [], future: [], last: 0, key: '' });
  const [, bump] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setStory(null);
    hist.current = { past: [], future: [], last: 0, key: '' };
    api.getStory(id).then((s) => {
      if (!alive) return;
      const n = normalizeStory(s);
      latest.current = n; saved.current = n;
      setStory(n); setStatus('saved');
    }).catch(() => alive && setStatus('missing'));
    return () => { alive = false; };
  }, [id]);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    if (inflight.current) await inflight.current.catch(() => {});
    const snapshot = latest.current;
    if (!snapshot || snapshot === saved.current) { setStatus('saved'); return; }
    setStatus('saving');
    inflight.current = api.saveStory(snapshot);
    try {
      await inflight.current;
      saved.current = snapshot;
      setStatus(latest.current === snapshot ? 'saved' : 'dirty');
      if (latest.current !== snapshot) timer.current = setTimeout(save, SAVE_DELAY);
    } catch {
      setStatus('error');
    } finally {
      inflight.current = null;
    }
  }, []);

  // Consecutive edits to the same field (e.g. typing) merge into one undo step.
  const commit = useCallback((next, key = '') => {
    const prev = latest.current;
    if (!prev || next === prev) return;
    const h = hist.current;
    const now = Date.now();
    if (!key || key !== h.key || now - h.last > COALESCE_MS) {
      h.past.push(prev);
      if (h.past.length > 100) h.past.shift();
    }
    h.key = key;
    h.last = key ? now : 0;
    h.future = [];
    latest.current = next;
    setStory(next);
    setStatus('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(save, SAVE_DELAY);
  }, [save]);

  const update = useCallback((path, value) => commit(setIn(latest.current, path, value), path.join('.')), [commit]);
  const mutate = useCallback((fn) => {
    const draft = structuredClone(latest.current);
    const result = fn(draft);
    commit(result || draft, '');
  }, [commit]);
  const replace = useCallback((next) => commit(normalizeStory(next), ''), [commit]);

  const undo = useCallback(() => {
    const h = hist.current;
    if (!h.past.length) return;
    h.future.push(latest.current);
    const prev = h.past.pop();
    latest.current = prev; h.last = 0; h.key = '';
    setStory(prev); setStatus('dirty'); bump((x) => x + 1);
    clearTimeout(timer.current); timer.current = setTimeout(save, SAVE_DELAY);
  }, [save]);

  const redo = useCallback(() => {
    const h = hist.current;
    if (!h.future.length) return;
    h.past.push(latest.current);
    const next = h.future.pop();
    latest.current = next; h.last = 0; h.key = '';
    setStory(next); setStatus('dirty'); bump((x) => x + 1);
    clearTimeout(timer.current); timer.current = setTimeout(save, SAVE_DELAY);
  }, [save]);

  // Save on tab close if there are unsaved edits.
  useEffect(() => {
    const onUnload = () => {
      if (latest.current && latest.current !== saved.current) {
        try {
          fetch(`/api/stories/${encodeURIComponent(latest.current.id)}`, {
            method: 'PUT', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(latest.current),
          });
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return {
    story, status, update, mutate, replace, undo, redo, flush: save,
    canUndo: hist.current.past.length > 0, canRedo: hist.current.future.length > 0,
    get: () => latest.current,
  };
}
