// Shared UI components.
import { html, useState, useRef, useEffect, cx, initials } from './lib.js';
import { useStory } from './store.js';
import { principleById, chapterLabel } from './kb/principles.js';
import { CHARGES, chargeClass, chargeLabel } from './kb/values.js';
import { hasCharge, sceneLabel } from './model.js';

export const href = (storyId, view = 'dashboard', sub = '') => `#/s/${storyId}/${view}${sub ? `/${sub}` : ''}`;
export const go = (h) => { location.hash = h; };

export function useHref() {
  const { story } = useStory();
  return (view, sub) => href(story.id, view, sub);
}

export function Icon({ name, size = 18 }) {
  const paths = {
    plus: 'M12 5v14M5 12h14',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    up: 'M12 19V5M6 11l6-6 6 6',
    down: 'M12 5v14M6 13l6 6 6-6',
    copy: 'M8 8h11v11H8zM5 16V5h11',
    spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
    close: 'M6 6l12 12M18 6L6 18',
    undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3',
    redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3',
    sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5M12 8a4 4 0 100 8 4 4 0 000-8z',
    moon: 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',
    menu: 'M4 6h16M4 12h16M4 18h16',
    book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16',
    check: 'M5 12l5 5 9-10',
    warn: 'M12 3l10 18H2zM12 10v5M12 18v.5',
    x: 'M7 7l10 10M17 7L7 17',
    dot: 'M12 9a3 3 0 100 6 3 3 0 000-6z',
    send: 'M4 12l16-8-6 16-2-6z',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    upload: 'M12 20V9M7 14l5-5 5 5M5 4h14',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
    play: 'M7 5l12 7-12 7z',
    left: 'M15 6l-6 6 6 6',
    right: 'M9 6l6 6-6 6',
    key: 'M15 7a4 4 0 11-3.5 6H8v3H5v-3H3v-3h8.5A4 4 0 0115 7z',
  };
  return html`<svg class="icon" width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${paths[name] || paths.dot} /></svg>`;
}

export function Cite({ id, ids }) {
  const { story } = useStory() || {};
  const list = (ids || [id]).map(principleById).filter(Boolean);
  if (!list.length) return null;
  return html`<span class="cites">${list.map((p) => html`
    <a class="cite" href=${story ? href(story.id, 'library', p.id) : '#'} title=${`${p.term} — ${p.text}`}>
      <${Icon} name="book" size=${12} /> ${chapterLabel(p.chapter)} · ${p.term}
    </a>`)}</span>`;
}

export function Principle({ id, compact }) {
  const p = principleById(id);
  if (!p) return null;
  return html`<div class=${cx('principle', compact && 'compact')}>
    <div class="principle-head"><span class="principle-term">${p.term}</span><span class="principle-ch">McKee · ${chapterLabel(p.chapter)} ${p.chapterTitle}</span></div>
    <p>${p.text}</p>
  </div>`;
}

export function Page({ kicker, title, intro, cites, actions, children, wide }) {
  return html`<div class=${cx('page', wide && 'wide')}>
    <header class="page-head">
      <div>
        ${kicker && html`<div class="kicker">${kicker}</div>`}
        <h1>${title}</h1>
        ${intro && html`<p class="intro">${intro}</p>`}
        ${cites && html`<${Cite} ids=${cites} />`}
      </div>
      ${actions && html`<div class="page-actions">${actions}</div>`}
    </header>
    ${children}
  </div>`;
}

export function Card({ title, kicker, cite, actions, children, class: cls, tone }) {
  return html`<section class=${cx('card', cls, tone && `tone-${tone}`)}>
    ${(title || actions) && html`<div class="card-head">
      <div>${kicker && html`<div class="kicker">${kicker}</div>`}${title && html`<h2>${title}</h2>`}</div>
      <div class="card-actions">${cite && html`<${Cite} ids=${Array.isArray(cite) ? cite : [cite]} />`}${actions}</div>
    </div>`}
    ${children}
  </section>`;
}

function useAutoGrow(ref, value) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(600, el.scrollHeight + 2)}px`;
  }, [value]);
}

export function Field({ label, value, onInput, multiline, rows = 2, placeholder, hint, cite, type = 'text', class: cls, autofocus }) {
  const ref = useRef(null);
  useAutoGrow(multiline ? ref : { current: null }, value);
  useEffect(() => { if (autofocus && ref.current) ref.current.focus(); }, []);
  const common = {
    ref, value: value ?? '', placeholder,
    onInput: (e) => onInput(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value),
  };
  return html`<label class=${cx('field', cls)}>
    ${label && html`<span class="field-label">${label}${cite && html` <${Cite} id=${cite} />`}</span>`}
    ${multiline ? html`<textarea rows=${rows} ...${common} />` : html`<input type=${type} ...${common} />`}
    ${hint && html`<span class="field-hint">${hint}</span>`}
  </label>`;
}

export function Select({ label, value, options, onChange, hint, class: cls }) {
  return html`<label class=${cx('field', cls)}>
    ${label && html`<span class="field-label">${label}</span>`}
    <select value=${value ?? ''} onChange=${(e) => onChange(e.target.value)}>
      ${options.map((o) => html`<option value=${o.id} selected=${String(o.id) === String(value ?? '')}>${o.label}</option>`)}
    </select>
    ${hint && html`<span class="field-hint">${hint}</span>`}
  </label>`;
}

export function Slider({ label, value, min = 0, max = 1, step = 0.05, onInput, left, right, hint, show }) {
  return html`<label class="field slider">
    ${label && html`<span class="field-label">${label}${show && html` <b>${show(value)}</b>`}</span>`}
    <div class="slider-row">
      ${left && html`<span class="slider-end">${left}</span>`}
      <input type="range" min=${min} max=${max} step=${step} value=${value ?? 0} onInput=${(e) => onInput(Number(e.target.value))} />
      ${right && html`<span class="slider-end right">${right}</span>`}
    </div>
    ${hint && html`<span class="field-hint">${hint}</span>`}
  </label>`;
}

export function Toggle({ label, checked, onChange, hint }) {
  return html`<label class="toggle">
    <input type="checkbox" checked=${!!checked} onChange=${(e) => onChange(e.target.checked)} />
    <span class="toggle-track"><span class="toggle-thumb" /></span>
    <span class="toggle-label">${label}${hint && html`<small>${hint}</small>`}</span>
  </label>`;
}

export function Segmented({ value, options, onChange, size }) {
  return html`<div class=${cx('segmented', size)} role="radiogroup">
    ${options.map((o) => html`<button type="button" role="radio" aria-checked=${value === o.id} class=${cx(value === o.id && 'on', o.tone && `tone-${o.tone}`)} onClick=${() => onChange(o.id)} title=${o.hint || ''}>${o.label}</button>`)}
  </div>`;
}

export function ChargePicker({ value, onChange, decl, label }) {
  return html`<div class="field">
    ${label && html`<span class="field-label">${label} <b class=${cx('charge-text', hasCharge(value) && chargeClass(value))}>${hasCharge(value) ? chargeLabel(value, decl) : 'not set'}</b></span>`}
    <div class="charge-picker">
      ${CHARGES.slice().reverse().map((c) => html`<button type="button" class=${cx('charge-btn', chargeClass(c.v), Number(value) === c.v && hasCharge(value) && 'on')}
        title=${chargeLabel(c.v, decl)} onClick=${() => onChange(Number(value) === c.v && hasCharge(value) ? null : c.v)}>${c.v > 0 ? `+${c.v}` : c.v === 0 ? '±' : c.v}</button>`)}
    </div>
  </div>`;
}

export function ChargeChip({ v }) {
  if (!hasCharge(v)) return html`<span class="chip charge mix dim">?</span>`;
  const n = Number(v);
  return html`<span class=${cx('chip charge', chargeClass(n))}>${n > 0 ? `+${n}` : n === 0 ? '±' : n}</span>`;
}

export function TurnArrow({ open, close }) {
  if (!hasCharge(open) || !hasCharge(close)) return html`<span class="turn none">—</span>`;
  const d = Number(close) - Number(open);
  return html`<span class=${cx('turn', d > 0 ? 'pos' : d < 0 ? 'neg' : 'flat')}><${ChargeChip} v=${open} /><span class="turn-arrow">${d === 0 ? '→' : d > 0 ? '↗' : '↘'}</span><${ChargeChip} v=${close} /></span>`;
}

export function Avatar({ c, size = 32 }) {
  return html`<span class="avatar" style=${`--c:${c.color || '#888'};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px`} title=${c.name}>${initials(c.name)}</span>`;
}

export function Empty({ title, text, children }) {
  return html`<div class="empty"><div class="empty-title">${title}</div>${text && html`<p>${text}</p>`}${children}</div>`;
}

export function Stat({ n, label, tone }) {
  return html`<div class=${cx('stat', tone && `tone-${tone}`)}><div class="stat-n">${n}</div><div class="stat-label">${label}</div></div>`;
}

export function Btn({ children, onClick, kind = 'ghost', icon, title, disabled, type = 'button', small }) {
  return html`<button type=${type} class=${cx('btn', kind, small && 'small')} onClick=${onClick} title=${title} disabled=${disabled}>
    ${icon && html`<${Icon} name=${icon} size=${small ? 14 : 16} />`}${children && html`<span>${children}</span>`}
  </button>`;
}

export function SceneSelect({ label, value, onChange, allowEmpty = true, hint }) {
  const { story } = useStory();
  const options = [
    ...(allowEmpty ? [{ id: '', label: '— none —' }] : []),
    ...story.scenes.map((s) => ({ id: s.id, label: sceneLabel(story, s.id) })),
  ];
  return html`<${Select} label=${label} value=${value} options=${options} onChange=${onChange} hint=${hint} />`;
}

export function CharacterSelect({ label, value, onChange, allowEmpty = true }) {
  const { story } = useStory();
  const options = [...(allowEmpty ? [{ id: '', label: '— none —' }] : []), ...story.characters.map((c) => ({ id: c.id, label: c.name || 'Unnamed' }))];
  return html`<${Select} label=${label} value=${value} options=${options} onChange=${onChange} />`;
}

// Generic editable list: items rendered via `render(item, i, set)`; set(patch) merges into the item.
export function ListEditor({ items, onChange, render, make, addLabel = 'Add', empty, reorder = true, class: cls }) {
  const set = (i) => (patch) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, k) => k !== i));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return html`<div class=${cx('list-editor', cls)}>
    ${!items.length && empty && html`<div class="list-empty">${empty}</div>`}
    ${items.map((it, i) => html`<div class="list-row" key=${it.id || i}>
      <div class="list-body">${render(it, i, set(i))}</div>
      <div class="list-tools">
        ${reorder && html`<button type="button" class="icon-btn" title="Move up" onClick=${() => move(i, -1)} disabled=${i === 0}><${Icon} name="up" size=${14} /></button>
        <button type="button" class="icon-btn" title="Move down" onClick=${() => move(i, 1)} disabled=${i === items.length - 1}><${Icon} name="down" size=${14} /></button>`}
        <button type="button" class="icon-btn danger" title="Remove" onClick=${() => remove(i)}><${Icon} name="trash" size=${14} /></button>
      </div>
    </div>`)}
    <${Btn} icon="plus" small onClick=${() => onChange([...items, make()])}>${addLabel}</${Btn}>
  </div>`;
}

export function Tabs({ tabs, value, onChange }) {
  return html`<div class="tabs" role="tablist">${tabs.map((t) => html`<button role="tab" aria-selected=${value === t.id} class=${cx('tab', value === t.id && 'on')} onClick=${() => onChange(t.id)}>${t.label}${t.badge ? html` <span class="tab-badge">${t.badge}</span>` : ''}</button>`)}</div>`;
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  return html`<div class="modal-back" onClick=${(e) => e.target === e.currentTarget && onClose()}>
    <div class=${cx('modal', wide && 'wide')} role="dialog" aria-modal="true" aria-label=${title}>
      <div class="modal-head"><h2>${title}</h2><button class="icon-btn" onClick=${onClose} title="Close"><${Icon} name="close" /></button></div>
      <div class="modal-body">${children}</div>
    </div>
  </div>`;
}

export function Meter({ value, max = 1, label, tone }) {
  const w = Math.max(0, Math.min(1, value / max));
  return html`<div class=${cx('meter', tone && `tone-${tone}`)}>${label && html`<span class="meter-label">${label}</span>`}<div class="meter-track"><div class="meter-fill" style=${`width:${w * 100}%`} /></div></div>`;
}

export function Chips({ items, value = [], onToggle }) {
  return html`<div class="chips">${items.map((it) => html`<button type="button" class=${cx('chip toggle-chip', value.includes(it.id) && 'on')} style=${it.color ? `--c:${it.color}` : ''} onClick=${() => onToggle(it.id)}>${it.label}</button>`)}</div>`;
}

export function Collapsible({ title, children, open: initial = false }) {
  const [open, setOpen] = useState(initial);
  return html`<div class=${cx('collapsible', open && 'open')}>
    <button type="button" class="collapsible-head" onClick=${() => setOpen(!open)}><span class="caret">${open ? '▾' : '▸'}</span>${title}</button>
    ${open && html`<div class="collapsible-body">${children}</div>`}
  </div>`;
}
