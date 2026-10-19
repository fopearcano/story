// Structure infographics: value arc, five-part bar, rhythm, idea/counter-idea
// zig-zag, plot swimlanes, setup/payoff arcs, motif strip, exposition map.
import { html } from '../lib.js';
import { t, tn, num } from '../i18n.js';
import { ChartFrame, Legend, trunc, chargeColor, fmtCharge } from './frame.js';
import { timeline, acts, hasCharge, turnOf, MARKERS, EXPOSITION_METHODS, sceneIndex, endingType } from '../model.js';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const markerShort = (m) => (MARKERS.find((x) => x.id === m) || {}).short || '';

function sceneTip(s, i, extra = '') {
  const turn = hasCharge(s.open) && hasCharge(s.close) ? `${s.value || t('Value')}: ${fmtCharge(s.open)} → ${fmtCharge(s.close)}` : t('Charges not set');
  const mk = s.marker ? (MARKERS.find((m) => m.id === s.marker) || {}).label : '';
  return [`${i + 1}. ${s.title || t('Untitled scene')}`, turn, mk, extra].filter(Boolean).join('\n');
}

// ---- Value arc -------------------------------------------------------------
export function ArcChart({ story, height = 340, onSelect, selected, compact }) {
  const { items, total } = timeline(story);
  const actList = acts(story);
  const decl = story.values.declension;
  const W = 1000;
  const ml = compact ? 34 : 128; const mr = 16; const mt = compact ? 14 : 36; const mb = compact ? 10 : 30;
  const iw = W - ml - mr; const ih = height - mt - mb;
  const x = (at) => ml + (at / total) * iw;
  const y = (v) => mt + ((3 - Number(v)) / 6) * ih;
  if (!items.length) return html`<div class="empty"><div class="empty-title">${t('No scenes yet')}</div><p>${t('Add scenes with opening and closing charges to see the story’s value arc.')}</p></div>`;

  const yLabels = [
    [3, decl.positive || t('Positive')], [0, t('± Mixed')], [-1, decl.contrary || t('Contrary')],
    [-2, decl.contradictory || t('Contradictory')], [-3, decl.negation || t('Negation of the Negation')],
  ];
  const curve = items.filter((it) => hasCharge(it.scene.close)).map((it) => `${x(it.start + it.len / 2).toFixed(1)},${y(it.scene.close).toFixed(1)}`).join(' ');
  const labelEvery = items.length > 45 ? 5 : items.length > 25 ? 2 : 1;

  return html`<${ChartFrame} label=${t('Value arc of the story')} scroll=${!compact}>
    <svg viewBox=${`0 0 ${W} ${height}`} role="img">
      ${actList.map((a, i) => html`<g>
        ${i % 2 === 1 && html`<rect x=${x(a.start)} y=${mt - (compact ? 4 : 22)} width=${x(a.end) - x(a.start)} height=${ih + (compact ? 4 : 22)} fill="var(--surface-2)" />`}
        ${!compact && html`<text x=${x(a.start) + 6} y=${mt - 8} font-size="11" font-weight="700" letter-spacing="0.08em" class="t-muted">${t('ACT {n} · {pct}%', { n: ROMAN[a.n] || a.n, pct: Math.round((a.endPct - a.startPct) * 100) })}</text>`}
      </g>`)}
      ${[3, 2, 1, 0, -1, -2, -3].map((v) => html`<line x1=${ml} x2=${W - mr} y1=${y(v)} y2=${y(v)} class=${v === 0 ? 'axis-line' : 'grid-line'} />`)}
      ${!compact && yLabels.map(([v, label]) => html`<text x=${ml - 8} y=${y(v) + 4} text-anchor="end" font-size="11.5" class=${v === 3 || v === -3 ? 'y-label t-ink' : 'y-label'}>${trunc(label, 20)}</text>`)}
      ${compact && [3, 0, -3].map((v) => html`<text x=${ml - 6} y=${y(v) + 4} text-anchor="end" font-size="11">${v > 0 ? '+3' : v === 0 ? '0' : '−3'}</text>`)}
      ${!compact && html`<g>
        <line x1=${x(total * 0.25)} x2=${x(total * 0.25)} y1=${mt} y2=${mt + ih} class="grid-line" />
        <text x=${x(total * 0.25) + 4} y=${mt + ih - 6} font-size="10.5" class="t-muted">25%</text>
      </g>`}
      ${selected && items.filter((it) => it.scene.id === selected).map((it) => html`<rect x=${x(it.start)} y=${mt} width=${Math.max(2, x(it.end) - x(it.start))} height=${ih} fill="var(--pos-wash)" />`)}
      <polyline points=${curve} fill="none" stroke="var(--ink-2)" stroke-opacity="0.55" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      ${items.map((it) => {
        const s = it.scene;
        const cx = x(it.start + it.len / 2);
        const d = turnOf(s);
        if (!hasCharge(s.close)) return null;
        const y1 = hasCharge(s.open) ? y(s.open) : y(s.close);
        const y2 = y(s.close);
        const dir = d == null ? 0 : Math.sign(d);
        return html`<g>
          ${dir !== 0 && html`<line x1=${cx} x2=${cx} y1=${y1} y2=${y2 + (dir > 0 ? 6 : -6)} stroke=${chargeColor(dir)} stroke-width="2" stroke-opacity="0.8" stroke-linecap="round" />
            <path d=${dir > 0 ? `M${cx - 4},${y2 + 7} L${cx},${y2 + 1} L${cx + 4},${y2 + 7}` : `M${cx - 4},${y2 - 7} L${cx},${y2 - 1} L${cx + 4},${y2 - 7}`} fill="none" stroke=${chargeColor(dir)} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`}
          ${d === 0
            ? html`<circle cx=${cx} cy=${y2} r="5" fill="var(--surface)" stroke="var(--warning)" stroke-width="2.5" />`
            : html`<circle cx=${cx} cy=${y2} r=${s.marker && s.marker !== 'resolution' ? 6 : 4.5} fill=${chargeColor(s.close)} class="ring" />`}
          ${s.marker && !compact && s.marker !== 'resolution' && html`<g transform=${`translate(${cx},${Number(s.close) >= 2 ? y2 + 16 : y2 - 20})`}>
            <rect x="-12" y="-8" width="24" height="15" rx="4" fill="var(--ink)" />
            <text x="0" y="3.5" text-anchor="middle" font-size="9.5" font-weight="700" style="fill:var(--surface)">${markerShort(s.marker)}</text>
          </g>`}
        </g>`;
      })}
      ${!compact && items.map((it, i) => (i % labelEvery === 0 || it.scene.marker) && html`<text x=${x(it.start + it.len / 2)} y=${height - 10} text-anchor="middle" font-size="10.5" class="t-muted">${i + 1}</text>`)}
      ${items.map((it, i) => html`<rect class="hit" x=${x(it.start)} y=${mt} width=${Math.max(4, x(it.end) - x(it.start))} height=${ih}
        tabindex=${compact ? -1 : 0} data-tip=${sceneTip(it.scene, i, turnOf(it.scene) === 0 ? t('⚠ Non-event: the value does not change') : '')}
        onClick=${() => onSelect && onSelect(it.scene.id)} />`)}
    </svg>
    ${!compact && html`<${Legend} items=${[
      { color: 'var(--pos)', label: t('Turns positive'), shape: '' },
      { color: 'var(--neg)', label: t('Turns negative'), shape: '' },
      { color: 'var(--warning)', label: t('Doesn’t turn (non-event)'), shape: 'hollow' },
      { color: 'var(--ink-2)', label: t('Closing-value curve'), shape: '' },
    ]} />`}
  </${ChartFrame}>`;
}

// ---- Five-part design ------------------------------------------------------
export function fivePart(story) {
  const { items, total } = timeline(story);
  const find = (id) => items.find((it) => it.scene.id === id);
  const byMarker = (m) => items.find((it) => it.scene.plotline === 'main' && it.scene.marker === m);
  const inc = (story.inciting.sceneId && find(story.inciting.sceneId)) || byMarker('inciting');
  const crisis = (story.crisis.sceneId && find(story.crisis.sceneId)) || byMarker('crisis');
  const climax = (story.climax.sceneId && find(story.climax.sceneId)) || byMarker('climax');
  return { items, total, inc, crisis, climax };
}

export function FivePartBar({ story, width = 720 }) {
  const { total, inc, crisis, climax, items } = fivePart(story);
  const W = width; const H = 134; const ml = 4; const mr = 4; const by = 48; const bh = 22;
  const x = (at) => ml + (at / total) * (W - ml - mr);
  if (!items.length) return html`<p class="muted small">${t('Add scenes and mark the Inciting Incident, Crisis and Climax to see the five-part design.')}</p>`;
  const segs = [];
  const incStart = inc ? inc.start : null;
  if (inc) segs.push({ name: t('Setup'), from: 0, to: inc.start, c: 'var(--o1)' });
  if (inc) segs.push({ name: t('Inciting Incident'), from: inc.start, to: inc.end, c: 'var(--o2)' });
  const compEnd = crisis ? crisis.start : climax ? climax.start : total;
  if (inc) segs.push({ name: t('Progressive Complications'), from: inc.end, to: compEnd, c: 'var(--o3)' });
  if (crisis && climax && crisis.end <= climax.start) segs.push({ name: t('Crisis'), from: crisis.start, to: climax.start, c: 'var(--o4)' });
  else if (crisis && (!climax || crisis.start >= climax.start)) segs.push({ name: t('Crisis'), from: crisis.start, to: crisis.end, c: 'var(--o4)' });
  if (climax) segs.push({ name: t('Climax'), from: climax.start, to: climax.end, c: 'var(--o5)' });
  if (climax) segs.push({ name: t('Resolution'), from: climax.end, to: total, c: 'var(--o1)' });
  const actList = acts(story);
  return html`<${ChartFrame} label=${t('Five-part story design')}>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <rect x=${ml} y=${by} width=${W - ml - mr} height=${bh} rx="4" fill="var(--surface-3)" />
      ${segs.filter((s) => s.to > s.from).map((s, i) => {
        const x0 = x(s.from) + (i ? 1 : 0); const x1 = x(s.to) - 1;
        const w = Math.max(2, x1 - x0);
        const pctTxt = `${Math.round((s.from / total) * 100)}%`;
        const tooNarrow = w < 70;
        return html`<g>
          <rect x=${x0} y=${by} width=${w} height=${bh} rx="4" fill=${s.c} data-tip=${`${s.name}\n${t('from {from} to {to} of the telling', { from: pctTxt, to: `${Math.round((s.to / total) * 100)}%` })}`} tabindex="0" />
          <text x=${tooNarrow ? x0 + w / 2 : x0 + 2} y=${i % 2 ? by - 24 : by - 8} font-size="12.5" text-anchor=${tooNarrow ? 'middle' : 'start'} class="t-ink" font-weight="600">${s.name}</text>
          ${!tooNarrow && html`<text x=${x0 + 2} y=${by + bh + 15} font-size="11.5" class="t-muted">${pctTxt}</text>`}
        </g>`;
      })}
      ${!inc && html`<text x=${W / 2} y=${by + 15} text-anchor="middle" font-size="13">${t('Mark an Inciting Incident to divide the telling')}</text>`}
      ${incStart != null && html`<g><line x1=${x(total * 0.25)} x2=${x(total * 0.25)} y1=${by - 4} y2=${by + bh + 4} stroke="var(--ink)" stroke-width="1" /></g>`}
      ${(() => {
        let lastX = -999; let row = 0;
        return actList.map((a) => {
          if (!a.climax) return null;
          const ax = x(a.end);
          row = ax - lastX < 64 ? (row + 1) % 2 : 0;
          lastX = ax;
          return html`<g>
            <path d=${`M${ax - 5},${by + bh + 28} L${ax},${by + bh + 21} L${ax + 5},${by + bh + 28}`} fill="var(--ink-2)" />
            <text x=${ax} y=${by + bh + 44 + row * 14} text-anchor=${a.end / total > 0.95 ? 'end' : 'middle'} font-size="11.5">${t('Act {n}', { n: ROMAN[a.n] || a.n })}</text>
          </g>`;
        });
      })()}
    </svg>
  </${ChartFrame}>`;
}

// ---- Rhythm & tempo (two panels, shared x; never a dual axis) ---------------
export function RhythmChart({ story, onSelect }) {
  const { items, total } = timeline(story);
  if (!items.length) return null;
  const W = 1000; const ml = 70; const mr = 12;
  const iw = W - ml - mr; const slot = iw / items.length;
  const bw = Math.max(3, Math.min(24, slot * 0.72));
  const maxP = Math.max(5, ...items.map((it) => it.len));
  const H1 = 150; const t1 = 12; const h1 = 110;
  const H2 = 110; const t2 = 10; const h2 = 70;
  const cx = (i) => ml + slot * i + slot / 2;
  const yb = (p) => t1 + h1 - (p / maxP) * h1;
  const yt = (v) => t2 + h2 - ((Number(v) - 1) / 4) * h2;
  const actEnds = acts(story).slice(0, -1).map((a) => a.items[a.items.length - 1].index + 1);
  const bar = (i, p) => {
    const x0 = cx(i) - bw / 2; const yTop = yb(p); const base = t1 + h1; const r = Math.min(4, bw / 2, base - yTop);
    return `M${x0},${base} V${yTop + r} Q${x0},${yTop} ${x0 + r},${yTop} H${x0 + bw - r} Q${x0 + bw},${yTop} ${x0 + bw},${yTop + r} V${base} Z`;
  };
  const tempoPts = items.map((it, i) => `${cx(i)},${yt(it.scene.tempo || 3)}`).join(' ');
  const count = items.length;
  return html`<${ChartFrame} label=${t('Scene rhythm and tempo')} scroll>
    <svg viewBox=${`0 0 ${W} ${H1}`}>
      ${[0, maxP / 2, maxP].map((p) => html`<line x1=${ml} x2=${W - mr} y1=${yb(p)} y2=${yb(p)} class=${p === 0 ? 'axis-line' : 'grid-line'} />
        <text x=${ml - 8} y=${yb(p) + 4} text-anchor="end" font-size="11">${Math.round(p * 10) / 10}</text>`)}
      <text x="0" y=${t1 + 10} font-size="11.5" class="t-ink" font-weight="600">${t('Length')}</text>
      <text x="0" y=${t1 + 25} font-size="10.5" class="t-muted">${t('pages ≈ min')}</text>
      ${actEnds.map((n) => html`<line x1=${ml + slot * n} x2=${ml + slot * n} y1=${t1} y2=${t1 + h1} stroke="var(--axis)" />`)}
      ${items.map((it, i) => html`<path d=${bar(i, it.len)} fill=${it.scene.marker && ['act-climax', 'crisis', 'climax', 'mid-act'].includes(it.scene.marker) ? 'var(--o4)' : 'var(--o2)'}
        data-tip=${sceneTip(it.scene, i, t('{pages} pages · tempo {tempo}/5', { pages: num(it.len), tempo: it.scene.tempo || 3 }))} tabindex="0" onClick=${() => onSelect && onSelect(it.scene.id)} />`)}
    </svg>
    <svg viewBox=${`0 0 ${W} ${H2}`}>
      ${[1, 3, 5].map((v) => html`<line x1=${ml} x2=${W - mr} y1=${yt(v)} y2=${yt(v)} class=${v === 1 ? 'axis-line' : 'grid-line'} />
        <text x=${ml - 8} y=${yt(v) + 4} text-anchor="end" font-size="11">${v}</text>`)}
      <text x="0" y=${t2 + 12} font-size="11.5" class="t-ink" font-weight="600">${t('Tempo')}</text>
      <text x="0" y=${t2 + 27} font-size="10.5" class="t-muted">${t('activity 1–5')}</text>
      ${actEnds.map((n) => html`<line x1=${ml + slot * n} x2=${ml + slot * n} y1=${t2} y2=${t2 + h2} stroke="var(--axis)" />`)}
      <polyline points=${tempoPts} fill="none" stroke="var(--s2)" stroke-width="2" stroke-linejoin="round" />
      ${items.map((it, i) => html`<circle cx=${cx(i)} cy=${yt(it.scene.tempo || 3)} r="4" fill="var(--s2)" class="ring" data-tip=${`${t('Tempo {n}/5', { n: it.scene.tempo || 3 })}\n${i + 1}. ${it.scene.title}`} tabindex="0" />`)}
      ${items.map((it, i) => (items.length <= 30 || i % 5 === 0) && html`<text x=${cx(i)} y=${H2 - 4} text-anchor="middle" font-size="10" class="t-muted">${i + 1}</text>`)}
    </svg>
    <${Legend} items=${[{ color: 'var(--o2)', label: t('Scene length'), shape: 'box' }, { color: 'var(--o4)', label: t('Climactic scene'), shape: 'box' }, { color: 'var(--s2)', label: t('Tempo') }]} />
    <p class="tiny muted">${tn(count, 'Total {pages} pages across {n} scene. Vertical rules mark act breaks.', 'Total {pages} pages across {n} scenes. Vertical rules mark act breaks.', { pages: Math.round(total) })}</p>
  </${ChartFrame}>`;
}

// ---- Idea vs Counter-Idea zig-zag -------------------------------------------
const CLIMACTIC = new Set(['seq-climax', 'mid-act', 'act-climax', 'crisis', 'climax']);
export function ZigZag({ story }) {
  const pts = story.scenes.map((s, i) => ({ s, i })).filter(({ s }) => CLIMACTIC.has(s.marker) && hasCharge(s.close));
  const first = story.scenes.find((s) => hasCharge(s.open));
  const W = 1000; const H = 220; const ml = 70; const mr = 150; const mt = 26; const mb = 30;
  const ih = H - mt - mb;
  const nodes = [...(first ? [{ label: t('Premise'), v: Number(first.open), premise: true }] : []), ...pts.map(({ s, i }) => ({ label: `${i + 1}. ${s.title}`, v: Number(s.close), marker: s.marker }))];
  if (nodes.length < 2) return html`<p class="muted small">${t('Mark sequence, act and story climaxes on scenes (with closing charges) to see the argument between Idea and Counter-Idea.')}</p>`;
  const x = (k) => ml + (k / (nodes.length - 1)) * (W - ml - mr);
  const y = (v) => mt + ((3 - v) / 6) * ih;
  const ending = endingType(story);
  const last = nodes[nodes.length - 1];
  return html`<${ChartFrame} label=${t('Idea versus Counter-Idea')} scroll>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <line x1=${ml} x2=${W - mr} y1=${y(0)} y2=${y(0)} class="axis-line" />
      <text x=${ml - 10} y=${y(2) + 4} text-anchor="end" font-size="11" class="t-ink">${t('Idea (+)')}</text>
      <text x=${ml - 10} y=${y(-2) + 4} text-anchor="end" font-size="11" class="t-ink">${t('Counter (−)')}</text>
      <polyline points=${nodes.map((n, k) => `${x(k)},${y(n.v)}`).join(' ')} fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-linejoin="round" />
      ${nodes.map((n, k) => html`<g>
        <circle cx=${x(k)} cy=${y(n.v)} r=${k === nodes.length - 1 ? 8 : 5.5} fill=${chargeColor(n.v)} class="ring" tabindex="0"
          data-tip=${`${n.v > 0 ? t('Idea') : n.v < 0 ? t('Counter-Idea') : t('Irony')} (${fmtCharge(n.v)})\n${n.label}`} />
        <text x=${x(k)} y=${n.v >= 0 ? y(n.v) - 12 : y(n.v) + 20} text-anchor="middle" font-size="12" font-weight="700" class="t-ink">${n.v > 0 ? '+' : n.v < 0 ? '−' : '±'}</text>
      </g>`)}
      <text x=${x(nodes.length - 1) + 16} y=${y(last.v) - 4} font-size="12.5" font-weight="700" class="t-ink">${ending === 'idealistic' ? t('Idealistic') : ending === 'pessimistic' ? t('Pessimistic') : t('Ironic')}</text>
      <text x=${x(nodes.length - 1) + 16} y=${y(last.v) + 12} font-size="11.5">${t('Controlling Idea')}</text>
    </svg>
  </${ChartFrame}>`;
}

// ---- Plotline swimlanes -------------------------------------------------------
export function Swimlanes({ story, onSelect }) {
  const { items, total } = timeline(story);
  const lanes = story.plotlines;
  const W = 1000; const ml = 170; const mr = 12; const laneH = 46; const mt = 8;
  const H = mt + lanes.length * laneH + 26;
  const x = (at) => ml + (at / total) * (W - ml - mr);
  return html`<${ChartFrame} label=${t('Plotlines across the telling')} scroll>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      ${[0, 0.25, 0.5, 0.75, 1].map((p) => html`<line x1=${x(total * p)} x2=${x(total * p)} y1=${mt} y2=${H - 22} class="grid-line" />
        <text x=${x(total * p)} y=${H - 6} text-anchor=${p === 1 ? 'end' : p === 0 ? 'start' : 'middle'} font-size="10.5" class="t-muted">${Math.round(p * 100)}%</text>`)}
      ${lanes.map((pl, li) => {
        const ly = mt + li * laneH;
        const its = items.filter((it) => (it.scene.plotline || 'main') === pl.id);
        return html`<g>
          <line x1=${ml} x2=${W - mr} y1=${ly + laneH - 4} y2=${ly + laneH - 4} class="grid-line" />
          <circle cx="10" cy=${ly + 24} r="5" fill=${pl.color || 'var(--s1)'} />
          <text x="22" y=${ly + 28} font-size="12.5" class="t-ink" font-weight="600">${trunc(pl.name, 20)}</text>
          ${its.map((it) => html`<g>
            <rect x=${x(it.start) + 1} y=${ly + 18} width=${Math.max(3, x(it.end) - x(it.start) - 2)} height="14" rx="4" fill=${pl.color || 'var(--s1)'}
              tabindex="0" data-tip=${sceneTip(it.scene, it.index)} onClick=${() => onSelect && onSelect(it.scene.id)} />
            ${it.scene.marker && it.scene.marker !== 'resolution' && html`<text x=${x(it.start + it.len / 2)} y=${ly + 13} text-anchor="middle" font-size="9.5" font-weight="700" class="t-ink">${markerShort(it.scene.marker)}</text>`}
          </g>`)}
          ${!its.length && html`<text x=${ml + 6} y=${ly + 29} font-size="11.5" class="t-muted">${t('No scenes assigned yet')}</text>`}
        </g>`;
      })}
    </svg>
  </${ChartFrame}>`;
}

// ---- Setup / payoff arcs ------------------------------------------------------
export function SetupArcs({ story, selected, onSelect }) {
  const n = story.scenes.length;
  if (!n) return null;
  const W = 1000; const ml = 20; const mr = 20; const base = 170; const H = 200;
  const x = (i) => ml + (n === 1 ? 0.5 : i / (n - 1)) * (W - ml - mr);
  const arcs = story.setups.map((p) => {
    const a = sceneIndex(story, p.setupScene); const b = sceneIndex(story, p.payoffScene);
    return { p, a, b };
  });
  return html`<${ChartFrame} label=${t('Setups and payoffs')} scroll>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <line x1=${ml} x2=${W - mr} y1=${base} y2=${base} class="axis-line" />
      ${arcs.map(({ p, a, b }) => {
        if (a < 0) return null;
        const bad = b >= 0 && b < a;
        const dangling = b < 0;
        const x1 = x(a); const x2 = dangling ? Math.min(W - mr, x1 + 60) : x(b);
        const h = Math.min(150, 26 + Math.abs(x2 - x1) * 0.42);
        const color = bad ? 'var(--critical)' : dangling ? 'var(--warning)' : 'var(--s1)';
        const d = `M${x1},${base} C${x1},${base - h} ${x2},${base - h} ${x2},${base}`;
        const tip = [p.text || t('Untitled setup'), t('Setup: scene {n}', { n: a + 1 }), dangling ? t('No payoff yet') : t('Payoff: scene {n}', { n: b + 1 }), bad && t('⚠ Payoff comes before setup')].filter(Boolean).join('\n');
        return html`<g onClick=${() => onSelect && onSelect(p.id)}>
          <path d=${d} fill="none" stroke=${color} stroke-width=${selected === p.id ? 3.5 : 2} stroke-opacity=${selected && selected !== p.id ? 0.35 : 1} />
          ${dangling && html`<text x=${x2 + 4} y=${base - 6} font-size="13" font-weight="700" style=${`fill:${color}`}>?</text>`}
          <path d=${d} fill="none" stroke="transparent" stroke-width="14" data-tip=${tip} tabindex="0" />
        </g>`;
      })}
      ${story.scenes.map((s, i) => html`<g>
        <circle cx=${x(i)} cy=${base} r="4" fill="var(--axis)" class="ring" data-tip=${sceneTip(s, i)} />
        ${(n <= 30 || i % 5 === 0) && html`<text x=${x(i)} y=${base + 18} text-anchor="middle" font-size="10.5" class="t-muted">${i + 1}</text>`}
      </g>`)}
    </svg>
    <${Legend} items=${[{ color: 'var(--s1)', label: t('Paid off') }, { color: 'var(--warning)', label: t('Awaiting payoff') }, { color: 'var(--critical)', label: t('Payoff before setup') }]} />
  </${ChartFrame}>`;
}

// ---- Image-system motif strip (click to toggle occurrences) ------------------
const SLOTS = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)', 'var(--s6)', 'var(--s7)', 'var(--s8)'];
export function MotifStrip({ story, onToggle }) {
  const n = story.scenes.length; const rows = story.images;
  if (!n || !rows.length) return null;
  const W = 1000; const ml = 190; const mr = 40; const rowH = 34; const mt = 24;
  const H = mt + rows.length * rowH + 8;
  const slot = (W - ml - mr) / n;
  const cx = (i) => ml + slot * i + slot / 2;
  return html`<${ChartFrame} label=${t('Image systems across scenes')} scroll>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      ${story.scenes.map((s, i) => (n <= 30 || i % 5 === 0) && html`<text x=${cx(i)} y="14" text-anchor="middle" font-size="10.5" class="t-muted">${i + 1}</text>`)}
      ${rows.map((im, r) => {
        const y = mt + r * rowH + rowH / 2;
        const color = SLOTS[r % SLOTS.length];
        const set = new Set(im.scenes || []);
        return html`<g>
          <line x1=${ml} x2=${W - mr} y1=${y} y2=${y} class="grid-line" />
          <circle cx="10" cy=${y} r="5" fill=${color} />
          <text x="22" y=${y + 4} font-size="12.5" class="t-ink" font-weight="600">${trunc(im.name || t('Untitled'), 22)}</text>
          ${story.scenes.map((s, i) => html`<g onClick=${() => onToggle && onToggle(im.id, s.id)}>
            ${set.has(s.id) ? html`<circle cx=${cx(i)} cy=${y} r="6" fill=${color} class="ring" />` : html`<circle cx=${cx(i)} cy=${y} r="2" fill="var(--axis)" />`}
            <rect class="hit" x=${cx(i) - slot / 2} y=${y - rowH / 2} width=${slot} height=${rowH} tabindex="-1"
              data-tip=${`${im.name}: ${set.has(s.id) ? t('present') : t('absent')}\n${i + 1}. ${s.title}\n${t('Click to toggle')}`} />
          </g>`)}
          <text x=${W - mr + 8} y=${y + 4} font-size="11.5">${set.size}</text>
        </g>`;
      })}
    </svg>
  </${ChartFrame}>`;
}

// ---- Exposition map -----------------------------------------------------------
export function ExpositionChart({ story }) {
  const { items, total } = timeline(story);
  const facts = story.exposition.filter((e) => e.sceneId);
  if (!items.length) return null;
  const W = 1000; const H = 220; const ml = 110; const mr = 20; const mt = 16; const mb = 34;
  const x = (p) => ml + p * (W - ml - mr);
  const y = (imp) => mt + ((3 - imp) / 2) * (H - mt - mb - 20) + 10;
  const pos = (sceneId) => { const it = items.find((i) => i.scene.id === sceneId); return it ? (it.start + it.len / 2) / total : null; };
  return html`<${ChartFrame} label=${t('Exposition reveal map')} scroll>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <defs><linearGradient id="bestlast" x1="0" x2="1"><stop offset="0" stop-color="var(--pos)" stop-opacity="0" /><stop offset="1" stop-color="var(--pos)" stop-opacity="0.12" /></linearGradient></defs>
      <rect x=${x(0.5)} y=${mt} width=${x(1) - x(0.5)} height=${H - mt - mb} fill="url(#bestlast)" />
      <text x=${x(1) - 6} y=${H - mb - 6} text-anchor="end" font-size="11" class="t-muted">${t('save the best for last →')}</text>
      ${[3, 2, 1].map((imp) => html`<line x1=${ml} x2=${W - mr} y1=${y(imp)} y2=${y(imp)} class="grid-line" />
        <text x=${ml - 10} y=${y(imp) + 4} text-anchor="end" font-size="11.5" class=${imp === 3 ? 't-ink' : ''}>${['', t('Background'), t('Important'), t('Critical')][imp]}</text>`)}
      ${[0, 0.25, 0.5, 0.75, 1].map((p) => html`<text x=${x(p)} y=${H - 12} text-anchor="middle" font-size="10.5" class="t-muted">${Math.round(p * 100)}%</text>`)}
      ${facts.map((e, k) => {
        const p = pos(e.sceneId); if (p == null) return null;
        const right = p > 0.72;
        const up = k % 2 === 0;
        const cx = x(p); const cy = y(Number(e.importance) || 1);
        const method = (EXPOSITION_METHODS.find((m) => m.id === e.method) || {}).label || e.method || '';
        const tip = `${e.fact}\n${t('Revealed at {pct}%', { pct: Math.round(p * 100) })} · ${e.secret ? t('secret') : t('fact')}\n${method}`;
        return html`<g>
          ${e.secret
            ? html`<path d=${`M${cx},${cy - 8} L${cx + 8},${cy} L${cx},${cy + 8} L${cx - 8},${cy} Z`} fill="var(--s2)" class="ring" tabindex="0" data-tip=${tip} />`
            : html`<circle cx=${cx} cy=${cy} r="6" fill="var(--s1)" class="ring" tabindex="0" data-tip=${tip} />`}
          ${(e.secret || Number(e.importance) === 3) && html`<text x=${right ? cx - 11 : cx + 11} y=${up ? cy - 11 : cy + 19} text-anchor=${right ? 'end' : 'start'} font-size="11" class="t-ink">${trunc(e.fact, 30)}</text>`}
        </g>`;
      })}
    </svg>
    <${Legend} items=${[{ color: 'var(--s1)', label: t('Fact'), shape: 'dot' }, { color: 'var(--s2)', label: t('Secret (backstory revelation)'), shape: 'box' }]} />
  </${ChartFrame}>`;
}
