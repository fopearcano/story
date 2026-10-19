// Static checks for translations. Used by test/i18n.test.js, and runnable on its
// own to list what a file still needs:
//   node test/helpers/i18n-scan.js public/js/views/scenes.js [more files…]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Files whose strings go through t(). Data files (kb/en, kb/it, sample*.js)
// and the dictionaries themselves are checked by parity instead.
export function sourceFiles() {
  const out = [path.join(ROOT, 'server.js')];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) out.push(p);
    }
  };
  walk(path.join(ROOT, 'public/js'));
  walk(path.join(ROOT, 'server'));
  const skip = (p) => /public\/js\/(i18n\/|i18n\.js$|kb\/(en|it)\/|sample(\.it)?\.js$)/.test(p.split(path.sep).join('/'));
  return out.filter((p) => !skip(p));
}

const LIT = String.raw`'((?:[^'\\\n]|\\.)*)'`;
const unquote = (s) => JSON.parse(`"${s.replace(/\\'/g, "'").replace(/"/g, '\\"')}"`);
const lineOf = (src, index) => src.slice(0, index).split('\n').length;

// Every literal key passed to t(), rich(), tn(), tl() or tln().
export function collectKeys(src) {
  const keys = [];
  const add = (key, index) => keys.push({ key: unquote(key), line: lineOf(src, index) });
  for (const m of src.matchAll(new RegExp(String.raw`(?<![\w.$])(?:t|rich)\(\s*${LIT}`, 'g'))) add(m[1], m.index);
  for (const m of src.matchAll(new RegExp(String.raw`(?<![\w.$])tl\(\s*[\w.]+\s*,\s*${LIT}`, 'g'))) add(m[1], m.index);
  for (const m of src.matchAll(new RegExp(String.raw`(?<![\w.$])tn\(\s*[^,'()]+(?:\([^()]*\))?[^,']*,\s*${LIT}\s*,\s*${LIT}`, 'g'))) { add(m[1], m.index); add(m[2], m.index); }
  for (const m of src.matchAll(new RegExp(String.raw`(?<![\w.$])tln\(\s*[\w.]+\s*,\s*[^,']+,\s*${LIT}\s*,\s*${LIT}`, 'g'))) { add(m[1], m.index); add(m[2], m.index); }
  return keys;
}

// Calls whose key is not a single-quoted literal cannot be checked.
// A line marked `// i18n-dynamic` is allowed (e.g. a helper that forwards its key).
export function dynamicCalls(src) {
  const bad = [];
  const lines = src.split('\n');
  const allowed = (line) => /i18n-dynamic/.test(lines[line - 1] || '');
  for (const m of src.matchAll(/(?<![\w.$]|function\s)(t|rich)\(\s*(?!')/g)) bad.push({ call: m[1], line: lineOf(src, m.index) });
  for (const m of src.matchAll(/(?<![\w.$]|function\s)tn\(\s*[^,]+,(?!\s*')/g)) bad.push({ call: 'tn', line: lineOf(src, m.index) });
  return bad.filter((b) => !allowed(b.line));
}

// A local variable or parameter named `t` would hide the translate function.
export function shadowing(src) {
  if (!/import\s*\{[^}]*\bt\b[^}]*\}\s*from\s*'[^']*i18n\.js'/.test(src)) return [];
  const bad = [];
  const re = /(?:\b(?:const|let|var|function)\s+t\b|\(\s*t\s*[,)]|,\s*t\s*\)|(?<![\w.$])t\s*=>|\bcatch\s*\(\s*t\s*\))/g;
  for (const m of src.matchAll(re)) bad.push({ line: lineOf(src, m.index), text: m[0] });
  return bad;
}

// Advisory: literal English left in html`` templates (text nodes and common
// text attributes/props). Not every hit is wrong (brand names, symbols).
const TEXT_ATTRS = 'title|placeholder|aria-label|label|hint|intro|kicker|addLabel|empty|text|left|right|alt';
export function literals(src) {
  const out = [];
  const add = (text, index) => { if (/[A-Za-z]{3,}/.test(text) && !/^\s*(Story Builder|McKee|STORY|Claude)\s*$/.test(text)) out.push({ line: lineOf(src, index), text: text.trim().slice(0, 70) }); };
  for (const m of src.matchAll(/>([^<>`]*?)</g)) {
    const text = m[1].replace(/\$\{[^}]*\}/g, ' ');
    if (!/\$\{|\}/.test(m[1]) || text.trim()) add(text, m.index);
  }
  for (const m of src.matchAll(new RegExp(String.raw`\s(?:${TEXT_ATTRS})="([^"]*)"`, 'g'))) add(m[1], m.index);
  return out;
}

export const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

export async function loadFragments() {
  const mod = await import(pathToFileURL(path.join(ROOT, 'public/js/i18n/it/index.js')).href);
  return mod.FRAGMENTS;
}

// Report for a set of files: missing Italian keys, bad calls, placeholder drift.
export async function report(files = sourceFiles()) {
  const fragments = await loadFragments();
  const dict = Object.assign({}, ...Object.values(fragments));
  const out = [];
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);
    for (const { key, line } of collectKeys(src)) {
      if (!(key in dict)) out.push({ file: rel, line, kind: 'missing', key });
      else if (placeholders(key) !== placeholders(dict[key])) out.push({ file: rel, line, kind: 'placeholders', key, value: dict[key] });
    }
    for (const d of dynamicCalls(src)) out.push({ file: rel, line: d.line, kind: 'dynamic', key: `${d.call}(…) without a literal key` });
    for (const s of shadowing(src)) out.push({ file: rel, line: s.line, kind: 'shadowing', key: s.text });
  }
  return out;
}

// Same translation key defined differently in two fragments.
export async function conflicts() {
  const fragments = await loadFragments();
  const seen = new Map();
  const out = [];
  for (const [name, frag] of Object.entries(fragments)) {
    for (const [k, v] of Object.entries(frag)) {
      if (seen.has(k) && seen.get(k).value !== v) out.push({ key: k, a: seen.get(k), b: { name, value: v } });
      else if (!seen.has(k)) seen.set(k, { name, value: v });
    }
  }
  return out;
}

// Structural comparison of an English data module with its translation:
// same shape, same numbers and booleans, same identifier-like strings (ids,
// routes, markers…). Prose may differ, and long prose must differ.
const IDENT = /^(#[0-9a-f]{3,8}|[a-z0-9][a-z0-9:_-]*)$/;
const TEXT_KEYS = new Set(['title', 'summary', 'func', 'text', 'name', 'label', 'long', 'hint', 'desc', 'sub', 'term', 'meaning',
  'category', 'fact', 'value', 'location', 'time', 'sequence', 'notes', 'arch', 'other', 'positive', 'contrary', 'contradictory',
  'negation', 'short', 'action', 'reaction', 'subtext', 'choice', 'link', 'mask', 'core', 'b', 'a', 'pressure', 'reveals', 'event']);
export function parity(en, it, at = '', out = [], key = '') {
  const kind = (x) => (Array.isArray(x) ? 'array' : x === null ? 'null' : typeof x);
  if (kind(en) !== kind(it)) { out.push(`${at}: ${kind(en)} vs ${kind(it)}`); return out; }
  if (Array.isArray(en)) {
    if (en.length !== it.length) out.push(`${at}: ${en.length} items vs ${it.length}`);
    en.forEach((x, i) => i < it.length && parity(x, it[i], `${at}[${i}]`, out, key));
  } else if (kind(en) === 'object') {
    const a = Object.keys(en).sort().join(',');
    const b = Object.keys(it).sort().join(',');
    if (a !== b) out.push(`${at}: keys differ (${a} | ${b})`);
    for (const k of Object.keys(en)) if (k in it) parity(en[k], it[k], `${at}.${k}`, out, k);
  } else if (typeof en === 'string') {
    if (IDENT.test(en) && !TEXT_KEYS.has(key) && en !== it) out.push(`${at}: identifier "${en}" changed to "${it}"`);
    else if (en.split(/\s+/).length >= 4 && en === it) out.push(`${at}: not translated ("${en.slice(0, 50)}…")`);
  } else if (en !== it) out.push(`${at}: ${en} vs ${it}`);
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = process.argv.slice(2).map((f) => path.resolve(f));
  const rows = await report(files.length ? files : undefined);
  for (const r of rows) console.log(`${r.file}:${r.line}  ${r.kind.padEnd(12)} ${JSON.stringify(r.key)}${r.value ? ` -> ${JSON.stringify(r.value)}` : ''}`);
  for (const file of files) {
    for (const l of literals(fs.readFileSync(file, 'utf8'))) console.log(`${path.relative(ROOT, file)}:${l.line}  literal?     ${JSON.stringify(l.text)}`);
  }
  const c = await conflicts();
  for (const x of c) console.log(`conflict     ${JSON.stringify(x.key)}: ${x.a.name}=${JSON.stringify(x.a.value)} vs ${x.b.name}=${JSON.stringify(x.b.value)}`);
  console.log(`${rows.length} issue(s), ${c.length} conflict(s)`);
}
