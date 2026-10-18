// Single import point for the UI runtime (Preact + htm, vendored, no build step).
export {
  html, render, h, Component, createContext,
  useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useContext, useReducer,
} from '/vendor/htm-preact.js';

export const cx = (...xs) => xs.filter(Boolean).join(' ');

export function debounce(fn, ms) {
  let t;
  const d = (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  d.cancel = () => clearTimeout(t);
  return d;
}

export function safeStorage(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v == null ? fallback : v; } catch { return fallback; }
}

export function setSafeStorage(key, value) {
  try { if (value == null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function initials(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
}

export function pct(x) {
  return `${Math.round(x * 100)}%`;
}
