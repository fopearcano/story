// App shell: hash router, sidebar navigation, top bar, AI drawer.
import { html, render, useState, useEffect, useMemo, useCallback, cx, safeStorage, setSafeStorage } from './lib.js';
import { api } from './api.js';
import { StoryCtx, useStoryState } from './store.js';
import { AppCtx } from './appctx.js';
import { Icon, href } from './ui.js';
import { diagnose } from './doctor.js';
import { HomeView } from './views/home.js';
import { DashboardView, DoctorView, LibraryView, ExportView } from './views/overview.js';
import { MeaningView, TriangleView, SettingView, GenreView, ValuesView } from './views/elements.js';
import { CharactersView, CastView } from './views/characters.js';
import { IncitingView, StructureView, GapsView, CrisisView, SubplotsView, CompositionView } from './views/design.js';
import { ScenesView } from './views/scenes.js';
import { ExpositionView, SetupsView, ImagesView, OutlineView } from './views/craft.js';
import { ChatDrawer } from './ai/chat.js';

export const NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', view: DashboardView },
    { id: 'doctor', label: 'Story Doctor', view: DoctorView },
  ] },
  { group: 'Elements of Story', note: 'Part 2', items: [
    { id: 'meaning', label: 'Premise & Meaning', view: MeaningView, ch: 6 },
    { id: 'triangle', label: 'Story Triangle', view: TriangleView, ch: 2 },
    { id: 'setting', label: 'Setting & World', view: SettingView, ch: 3 },
    { id: 'genre', label: 'Genre', view: GenreView, ch: 4 },
    { id: 'characters', label: 'Characters', view: CharactersView, ch: 5 },
    { id: 'cast', label: 'Cast Design', view: CastView, ch: 17 },
    { id: 'values', label: 'Values & Antagonism', view: ValuesView, ch: 14 },
  ] },
  { group: 'Story Design', note: 'Part 3', items: [
    { id: 'inciting', label: 'Inciting Incident', view: IncitingView, ch: 8 },
    { id: 'structure', label: 'Acts & Arc', view: StructureView, ch: 9 },
    { id: 'scenes', label: 'Scenes', view: ScenesView, ch: 10 },
    { id: 'gaps', label: 'Gap Lab', view: GapsView, ch: 7 },
    { id: 'crisis', label: 'Crisis · Climax', view: CrisisView, ch: 13 },
    { id: 'subplots', label: 'Subplots', view: SubplotsView, ch: 9 },
    { id: 'composition', label: 'Composition', view: CompositionView, ch: 12 },
  ] },
  { group: 'Writer at Work', note: 'Part 4', items: [
    { id: 'exposition', label: 'Exposition', view: ExpositionView, ch: 15 },
    { id: 'setups', label: 'Setups & Payoffs', view: SetupsView, ch: 10 },
    { id: 'images', label: 'Image Systems', view: ImagesView, ch: 18 },
    { id: 'outline', label: 'Outline · Treatment', view: OutlineView, ch: 19 },
    { id: 'library', label: 'Principles Library', view: LibraryView },
    { id: 'export', label: 'Export', view: ExportView },
  ] },
];
const ALL = NAV.flatMap((g) => g.items);

function parseHash() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 's' && parts[1]) return { storyId: parts[1], view: parts[2] || 'dashboard', sub: parts[3] || '' };
  return { storyId: null, view: 'home', sub: '' };
}

function useRoute() {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const on = () => { setRoute(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

function useTheme() {
  const [theme, setTheme] = useState(safeStorage('storybuilder.theme', ''));
  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
    setSafeStorage('storybuilder.theme', theme || null);
  }, [theme]);
  const dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  return [dark, () => setTheme(dark ? 'light' : 'dark')];
}

function App() {
  const route = useRoute();
  const [dark, toggleTheme] = useTheme();
  const [ai, setAi] = useState({ envKey: false, model: '', clientKeyAllowed: true });
  const refreshAi = useCallback(() => api.aiStatus().then((s) => setAi({ ...s, rev: Date.now() })).catch(() => {}), []);
  useEffect(() => { refreshAi(); }, []);

  if (!route.storyId) {
    return html`<${AppCtx.Provider} value=${{ ai, refreshAi, openAi: () => {} }}>
      <div class="topbar" style="justify-content:flex-end"><button class="icon-btn" onClick=${toggleTheme} title="Toggle theme"><${Icon} name=${dark ? 'sun' : 'moon'} /></button></div>
      <${HomeView} />
    </${AppCtx.Provider}>`;
  }
  return html`<${StoryShell} route=${route} ai=${ai} refreshAi=${refreshAi} dark=${dark} toggleTheme=${toggleTheme} />`;
}

function StoryShell({ route, ai, refreshAi, dark, toggleTheme }) {
  const store = useStoryState(route.storyId);
  const [drawer, setDrawer] = useState({ open: false, focus: '', seed: '' });
  const [menu, setMenu] = useState(false);
  const { story, status } = store;

  const openAi = useCallback((focus = '', seed = '') => setDrawer({ open: true, focus: focus || '', seed: seed || '' }), []);
  useEffect(() => { setMenu(false); }, [route.view, route.sub]);
  useEffect(() => {
    const k = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !['input', 'textarea'].includes(tag)) {
        e.preventDefault();
        if (e.shiftKey) store.redo(); else store.undo();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [store.undo, store.redo]);

  const checks = useMemo(() => (story ? diagnose(story) : []), [story]);
  const navStatus = useMemo(() => {
    const rank = { fail: 3, warn: 2, todo: 1, pass: 0 };
    const out = {};
    for (const c of checks) if (!(c.route in out) || rank[c.status] > rank[out[c.route]]) out[c.route] = c.status;
    return out;
  }, [checks]);

  if (status === 'missing') return html`<div class="home"><div class="empty"><div class="empty-title">Story not found</div><p><a href="#/">Back to your stories</a></p></div></div>`;
  if (!story) return html`<div class="home"><p class="muted">Loading story…</p></div>`;

  const entry = ALL.find((n) => n.id === route.view) || ALL[0];
  const View = entry.view;
  const statusText = { saved: 'Saved', saving: 'Saving…', dirty: 'Unsaved changes', error: 'Save failed — retrying on next edit', loading: '' }[status];

  return html`<${AppCtx.Provider} value=${{ ai, refreshAi, openAi, checks, route }}>
    <${StoryCtx.Provider} value=${store}>
      <div class=${cx('shell', drawer.open && 'drawer-open')}>
        <nav class=${cx('sidebar', menu && 'open')} aria-label="Story tools">
          <a class="brand" href="#/"><span class="brand-mark">S</span><span><div class="brand-name">Story Builder</div><div class="brand-sub">after McKee’s Story</div></span></a>
          <div class="story-switch"><b title=${story.title}>${story.title}</b><a href="#/">All stories</a></div>
          ${NAV.map((g) => html`<div class="nav-group">
            <div class="nav-group-title"><span>${g.group}</span>${g.note && html`<span>${g.note}</span>`}</div>
            ${g.items.map((it) => html`<a class=${cx('nav-link', route.view === it.id && 'on')} href=${href(story.id, it.id)}>
              <span class=${cx('nav-dot', navStatus[it.id])} title=${navStatus[it.id] ? `Story Doctor: ${navStatus[it.id]}` : ''} />
              ${it.label}${it.ch && html`<span class="nav-num">ch.${it.ch}</span>`}
            </a>`)}
          </div>`)}
        </nav>
        <div class="main">
          <div class="topbar">
            <button class="icon-btn menu-btn" onClick=${() => setMenu(!menu)} title="Menu"><${Icon} name="menu" /></button>
            <div class="crumbs"><a href="#/">Stories</a> / <a href=${href(story.id)}>${story.title}</a> / <b>${entry.label}</b></div>
            <span class=${cx('save-state', status)} title=${statusText}><span class="dot" />${statusText}</span>
            <button class="icon-btn" onClick=${store.undo} disabled=${!store.canUndo} title="Undo (Ctrl+Z)"><${Icon} name="undo" /></button>
            <button class="icon-btn" onClick=${store.redo} disabled=${!store.canRedo} title="Redo (Ctrl+Shift+Z)"><${Icon} name="redo" /></button>
            <button class="icon-btn" onClick=${toggleTheme} title="Toggle theme"><${Icon} name=${dark ? 'sun' : 'moon'} /></button>
            <button class="btn ai small" onClick=${() => (drawer.open ? setDrawer({ ...drawer, open: false }) : openAi(route.view === 'characters' ? route.sub : ''))}><${Icon} name="spark" size=${14} /><span>AI partner</span></button>
          </div>
          <main class="content"><${View} sub=${route.sub} /></main>
        </div>
        ${drawer.open && html`<${ChatDrawer} key=${story.id} focusId=${drawer.focus} seedPrompt=${drawer.seed}
          onFocusChange=${(id) => setDrawer((d) => ({ ...d, focus: id }))} onClose=${() => setDrawer({ ...drawer, open: false })} />`}
      </div>
    </${StoryCtx.Provider}>
  </${AppCtx.Provider}>`;
}

render(html`<${App} />`, document.getElementById('app'));
