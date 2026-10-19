// App shell: hash router, sidebar navigation, top bar, AI drawer.
import { html, render, useState, useEffect, useMemo, useCallback, cx, safeStorage, setSafeStorage } from './lib.js';
import { api } from './api.js';
import { StoryCtx, useStoryState } from './store.js';
import { AppCtx } from './appctx.js';
import { Icon, href, LangSwitch } from './ui.js';
import { t } from './i18n.js';
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
  { group: t('Overview'), items: [
    { id: 'dashboard', label: t('Dashboard'), view: DashboardView },
    { id: 'doctor', label: t('Story Doctor'), view: DoctorView },
  ] },
  { group: t('Elements of Story'), note: t('Part {n}', { n: 2 }), items: [
    { id: 'meaning', label: t('Premise & Meaning'), view: MeaningView, ch: 6 },
    { id: 'triangle', label: t('Story Triangle'), view: TriangleView, ch: 2 },
    { id: 'setting', label: t('Setting & World'), view: SettingView, ch: 3 },
    { id: 'genre', label: t('Genre'), view: GenreView, ch: 4 },
    { id: 'characters', label: t('Characters'), view: CharactersView, ch: 5 },
    { id: 'cast', label: t('Cast Design'), view: CastView, ch: 17 },
    { id: 'values', label: t('Values & Antagonism'), view: ValuesView, ch: 14 },
  ] },
  { group: t('Story Design'), note: t('Part {n}', { n: 3 }), items: [
    { id: 'inciting', label: t('Inciting Incident'), view: IncitingView, ch: 8 },
    { id: 'structure', label: t('Acts & Arc'), view: StructureView, ch: 9 },
    { id: 'scenes', label: t('Scenes'), view: ScenesView, ch: 10 },
    { id: 'gaps', label: t('Gap Lab'), view: GapsView, ch: 7 },
    { id: 'crisis', label: t('Crisis · Climax'), view: CrisisView, ch: 13 },
    { id: 'subplots', label: t('Subplots'), view: SubplotsView, ch: 9 },
    { id: 'composition', label: t('Composition'), view: CompositionView, ch: 12 },
  ] },
  { group: t('Writer at Work'), note: t('Part {n}', { n: 4 }), items: [
    { id: 'exposition', label: t('Exposition'), view: ExpositionView, ch: 15 },
    { id: 'setups', label: t('Setups & Payoffs'), view: SetupsView, ch: 10 },
    { id: 'images', label: t('Image Systems'), view: ImagesView, ch: 18 },
    { id: 'outline', label: t('Outline · Treatment'), view: OutlineView, ch: 19 },
    { id: 'library', label: t('Principles Library'), view: LibraryView },
    { id: 'export', label: t('Export'), view: ExportView },
  ] },
];
const ALL = NAV.flatMap((g) => g.items);

// Tooltip on the sidebar dot for each Story Doctor status.
const DOCTOR_TIP = {
  pass: t('Story Doctor: pass'),
  warn: t('Story Doctor: warn'),
  fail: t('Story Doctor: fail'),
  todo: t('Story Doctor: todo'),
};

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

// Light/dark (or follow the system) and the visual style: the classic look or
// the minimal terminal one. Terminal defaults to dark unless light is chosen.
function useTheme() {
  const [theme, setTheme] = useState(safeStorage('storybuilder.theme', ''));
  const [style, setStyle] = useState(safeStorage('storybuilder.style', ''));
  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
    setSafeStorage('storybuilder.theme', theme || null);
  }, [theme]);
  useEffect(() => {
    if (style) document.documentElement.setAttribute('data-style', style);
    else document.documentElement.removeAttribute('data-style');
    setSafeStorage('storybuilder.style', style || null);
  }, [style]);
  const terminal = style === 'terminal';
  const dark = theme ? theme === 'dark' : terminal || window.matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    dark, terminal,
    toggleTheme: () => setTheme(dark ? 'light' : 'dark'),
    toggleStyle: () => setStyle(terminal ? '' : 'terminal'),
  };
}

function ThemeButtons({ look }) {
  return html`<button class=${cx('icon-btn', look.terminal && 'on')} onClick=${look.toggleStyle} aria-pressed=${look.terminal}
      title=${look.terminal ? t('Classic style') : t('Terminal style')}><${Icon} name="terminal" /></button>
    <button class="icon-btn" onClick=${look.toggleTheme} title=${t('Toggle theme')}><${Icon} name=${look.dark ? 'sun' : 'moon'} /></button>`;
}

function App() {
  const route = useRoute();
  const look = useTheme();
  const [ai, setAi] = useState({ envKey: false, model: '', clientKeyAllowed: true });
  const refreshAi = useCallback(() => api.aiStatus().then((s) => setAi({ ...s, rev: Date.now() })).catch(() => {}), []);
  useEffect(() => { refreshAi(); }, []);

  if (!route.storyId) {
    return html`<${AppCtx.Provider} value=${{ ai, refreshAi, openAi: () => {} }}>
      <div class="topbar" style="justify-content:flex-end"><${LangSwitch} /><${ThemeButtons} look=${look} /></div>
      <${HomeView} />
    </${AppCtx.Provider}>`;
  }
  return html`<${StoryShell} route=${route} ai=${ai} refreshAi=${refreshAi} look=${look} />`;
}

function StoryShell({ route, ai, refreshAi, look }) {
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

  if (status === 'missing') return html`<div class="home"><div class="empty"><div class="empty-title">${t('Story not found')}</div><p><a href="#/">${t('Back to your stories')}</a></p></div></div>`;
  if (!story) return html`<div class="home"><p class="muted">${t('Loading story…')}</p></div>`;

  const entry = ALL.find((n) => n.id === route.view) || ALL[0];
  const View = entry.view;
  const statusText = { saved: t('Saved'), saving: t('Saving…'), dirty: t('Unsaved changes'), error: t('Save failed — retrying on next edit'), loading: '' }[status];

  return html`<${AppCtx.Provider} value=${{ ai, refreshAi, openAi, checks, route }}>
    <${StoryCtx.Provider} value=${store}>
      <div class=${cx('shell', drawer.open && 'drawer-open')}>
        <nav class=${cx('sidebar', menu && 'open')} aria-label=${t('Story tools')}>
          <a class="brand" href="#/"><span class="brand-mark">S</span><span><div class="brand-name">Story Builder</div><div class="brand-sub">${t('after McKee’s Story')}</div></span></a>
          <div class="story-switch"><b title=${story.title}>${story.title}</b><a href="#/">${t('All stories')}</a></div>
          ${NAV.map((g) => html`<div class="nav-group">
            <div class="nav-group-title"><span>${g.group}</span>${g.note && html`<span>${g.note}</span>`}</div>
            ${g.items.map((it) => html`<a class=${cx('nav-link', route.view === it.id && 'on')} href=${href(story.id, it.id)}>
              <span class=${cx('nav-dot', navStatus[it.id])} title=${DOCTOR_TIP[navStatus[it.id]] || ''} />
              ${it.label}${it.ch && html`<span class="nav-num">${t('ch.{n}', { n: it.ch })}</span>`}
            </a>`)}
          </div>`)}
        </nav>
        <div class="main">
          <div class="topbar">
            <button class="icon-btn menu-btn" onClick=${() => setMenu(!menu)} title=${t('Menu')}><${Icon} name="menu" /></button>
            <div class="crumbs"><a href="#/">${t('Stories')}</a> / <a href=${href(story.id)}>${story.title}</a> / <b>${entry.label}</b></div>
            <span class=${cx('save-state', status)} title=${statusText}><span class="dot" />${statusText}</span>
            <button class="icon-btn" onClick=${store.undo} disabled=${!store.canUndo} title=${t('Undo (Ctrl+Z)')}><${Icon} name="undo" /></button>
            <button class="icon-btn" onClick=${store.redo} disabled=${!store.canRedo} title=${t('Redo (Ctrl+Shift+Z)')}><${Icon} name="redo" /></button>
            <${LangSwitch} />
            <${ThemeButtons} look=${look} />
            <button class="btn ai small" title=${t('AI partner')} aria-label=${t('AI partner')} onClick=${() => (drawer.open ? setDrawer({ ...drawer, open: false }) : openAi(route.view === 'characters' ? route.sub : ''))}><${Icon} name="spark" size=${14} /><span>${t('AI partner')}</span></button>
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
