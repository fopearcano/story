// Chart wrapper with a shared hover/focus tooltip. Marks opt in with
// data-tip="Title\nline\nline"; text is rendered as text nodes (never HTML).
import { html, useState, useRef, cx } from '../lib.js';

export function ChartFrame({ children, class: cls, scroll, label }) {
  const [tip, setTip] = useState(null);
  const ref = useRef(null);

  const show = (target, clientX, clientY) => {
    const el = target && target.closest ? target.closest('[data-tip]') : null;
    if (!el || !ref.current) { setTip(null); return; }
    const box = ref.current.getBoundingClientRect();
    let x = clientX;
    let y = clientY;
    if (x == null) {
      const r = el.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top;
    }
    const lines = el.getAttribute('data-tip').split('\n');
    const left = Math.min(Math.max(8, x - box.left + 14), Math.max(8, box.width - 240));
    setTip({ lines, left, top: y - box.top + 14 });
  };

  const body = html`<div class=${cx('chart', cls)} ref=${ref} role="figure" aria-label=${label}
      onPointerMove=${(e) => show(e.target, e.clientX, e.clientY)}
      onPointerLeave=${() => setTip(null)}
      onfocusin=${(e) => show(e.target)}
      onfocusout=${() => setTip(null)}>
    ${children}
    ${tip && html`<div class="tip" style=${`left:${tip.left}px;top:${tip.top}px`}>
      <b>${tip.lines[0]}</b>${tip.lines.slice(1).map((l) => html`<span>${l}</span>`)}
    </div>`}
  </div>`;
  return scroll ? html`<div class="chart-scroll">${body}</div>` : body;
}

export function Legend({ items }) {
  return html`<div class="legend">${items.map((it) => html`<span><i class=${it.shape || ''} style=${`--c:${it.color}`} />${it.label}</span>`)}</div>`;
}

// Word-wrap text into lines of at most `max` characters.
export function wrap(text, max = 24, maxLines = 3) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s*\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

export const trunc = (s, n = 28) => (String(s || '').length > n ? `${String(s).slice(0, n - 1)}…` : String(s || ''));

export function chargeColor(v) {
  const n = Number(v);
  if (n > 0) return 'var(--pos)';
  if (n < 0) return 'var(--neg)';
  return 'var(--mid)';
}

export const fmtCharge = (v) => (v == null || v === '' ? '?' : Number(v) > 0 ? `+${v}` : Number(v) === 0 ? '±0' : String(v));
