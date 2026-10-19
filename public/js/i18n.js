// Interface language. English source strings are the keys (gettext style):
// t('Scenes') returns the translation for the current language, or the English
// text when there is none. Safe to import from Node (the server always uses
// English unless a language is passed explicitly with tl()).
import it from './i18n/it/index.js';

export const LANGS = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'it', label: 'Italiano', short: 'IT' },
];
const DICTS = { en: {}, it };
const STORAGE_KEY = 'storybuilder.lang';

export function normLang(l) {
  const code = String(l || '').toLowerCase().slice(0, 2);
  return Object.hasOwn(DICTS, code) ? code : 'en';
}

function detect() {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && Object.hasOwn(DICTS, saved)) return saved;
  } catch { /* storage blocked */ }
  return normLang((navigator.languages && navigator.languages[0]) || navigator.language);
}

export const lang = detect();
if (typeof document !== 'undefined') document.documentElement.lang = lang;

// Switching reloads the page so every module (labels, knowledge base) is
// rebuilt in the new language; the story store saves pending edits on unload.
export function setLang(id) {
  try { localStorage.setItem(STORAGE_KEY, normLang(id)); } catch { /* ignore */ }
  location.reload();
}

const fill = (s, params) => (params ? s.replace(/\{(\w+)\}/g, (m, k) => (params[k] ?? m)) : s);

// Translate into an explicit language (used by the server).
export const tl = (l, s, params) => fill(DICTS[l]?.[s] || s, params);
export const t = (s, params) => tl(lang, s, params);
// Plurals: tn(n, '{n} scene', '{n} scenes'). English and Italian share the rule.
export const tln = (l, n, one, other, params) => tl(l, n === 1 ? one : other, { n, ...params });
export const tn = (n, one, other, params) => tln(lang, n, one, other, params);

// Locale for dates (the browser's own for English), and number formatting
// that follows the interface language (58.5 / 58,5).
export const locale = lang === 'it' ? 'it-IT' : undefined;
export const num = (n) => Number(n).toLocaleString(lang === 'it' ? 'it-IT' : 'en-US', { maximumFractionDigits: 2 });
