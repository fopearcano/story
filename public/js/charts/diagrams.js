// Conceptual infographics from STORY: the story triangle, levels of conflict,
// value declension, the gap ladder, cast solar system, mask vs. heart, the
// quest, a score ring and the dilemma triangle.
import { html } from '../lib.js';
import { t, tn } from '../i18n.js';
import { ChartFrame, Legend, wrap, trunc } from './frame.js';
import { CONTRASTS, CORNERS, REFERENCE_FILMS, triangleWeights, trianglePulls, classifyDesign } from '../kb/triangle.js';
import { LEVELS } from '../kb/principles.js';
import { QUALITY_AXES, dimensionCount } from '../model.js';

const LEVEL_COLOR = { inner: 'var(--inner)', personal: 'var(--personal)', extra: 'var(--extra)' };
// Role names shown in tooltips (lower case, after the character's name).
const ROLE_NAMES = { protagonist: t('protagonist'), antagonist: t('antagonist'), supporting: t('supporting'), minor: t('minor') };

// ---- Story triangle -------------------------------------------------------------
export function TriangleChart({ triangle, title = t('Your story'), showFilms = true, small }) {
  const W = 640; const H = small ? 470 : 520;
  const f = small ? 1.6 : 1.25;
  const A = [W / 2, 52]; const M = [70, 400]; const N = [W - 70, 400];
  const pt = (w) => [A[0] * w.arch + M[0] * w.mini + N[0] * w.anti, A[1] * w.arch + M[1] * w.mini + N[1] * w.anti];
  const { m, a } = trianglePulls(triangle);
  const [sx, sy] = triangle.stasis ? [W / 2 + (a - m) * 160, 445] : pt(triangleWeights(m, a));
  const design = classifyDesign(triangle);
  return html`<${ChartFrame} label=${t('Story triangle')}>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <path d=${`M${A[0]},${A[1]} L${N[0]},${N[1]} L${M[0]},${M[1]} Z`} fill="var(--surface-2)" stroke="var(--axis)" stroke-width="1.5" />
      <line x1=${(A[0] + M[0]) / 2} y1=${(A[1] + M[1]) / 2} x2=${N[0]} y2=${N[1]} class="grid-line" />
      <line x1=${(A[0] + N[0]) / 2} y1=${(A[1] + N[1]) / 2} x2=${M[0]} y2=${M[1]} class="grid-line" />
      <line x1=${A[0]} y1=${A[1]} x2=${W / 2} y2=${M[1]} class="grid-line" />
      <text x=${A[0]} y=${A[1] - 14 - 14 * f} text-anchor="middle" font-size=${15 * f} font-weight="700" class="t-ink">${t('ARCHPLOT')}</text>
      <text x=${A[0]} y=${A[1] - 12} text-anchor="middle" font-size=${12 * f}>${t('Classical design')}</text>
      <text x=${M[0] - 4} y=${M[1] + 26} text-anchor="start" font-size=${15 * f} font-weight="700" class="t-ink">${t('MINIPLOT')}</text>
      <text x=${M[0] - 4} y=${M[1] + 26 + 15 * f} text-anchor="start" font-size=${12 * f}>${t('Minimalism')}</text>
      <text x=${N[0] + 4} y=${N[1] + 26} text-anchor="end" font-size=${15 * f} font-weight="700" class="t-ink">${t('ANTIPLOT')}</text>
      <text x=${N[0] + 4} y=${N[1] + 26 + 15 * f} text-anchor="end" font-size=${12 * f}>${t('Anti-structure')}</text>
      <text x=${W / 2} y=${M[1] - 8} text-anchor="middle" font-size=${10.5 * f} class="t-muted">${t('change ↑ · stasis ↓')}</text>
      <rect x=${W / 2 - 120} y="428" width="240" height="34" rx="6" fill=${triangle.stasis ? 'var(--neg-wash)' : 'transparent'} stroke="var(--axis)" />
      <text x=${W / 2} y="450" text-anchor="middle" font-size=${12 * f} font-weight="600" class=${triangle.stasis ? 't-ink' : 't-muted'}>${t('NONPLOT (stasis)')}</text>
      ${showFilms && REFERENCE_FILMS.map((film) => {
        const [fx, fy] = pt(triangleWeights(film.m, film.a));
        return html`<g>
          <circle cx=${fx} cy=${fy} r="4" fill="var(--axis)" class="ring" data-tip=${`${film.title}\n${t('Reference placement (after McKee’s diagram)')}`} tabindex="0" />
          ${!small && html`<text x=${fx + 7} y=${fy + 4} font-size="13" class="t-muted">${film.title}</text>`}
        </g>`;
      })}
      <circle cx=${sx} cy=${sy} r="16" fill="var(--pos-wash)" />
      <circle cx=${sx} cy=${sy} r="8" fill="var(--ink)" class="ring" data-tip=${`${title}\n${CORNERS[design].name} — ${CORNERS[design].sub}`} tabindex="0" />
      <text x=${sx} y=${sy - 18} text-anchor="middle" font-size=${13 * f} font-weight="700" class="t-ink">${trunc(title, small ? 22 : 30)}</text>
    </svg>
  </${ChartFrame}>`;
}

export function TriangleBars({ triangle }) {
  return html`<div class="stack">
    ${CONTRASTS.map((c) => {
      const v = Number(triangle[c.id] || 0);
      return html`<div class="small"><div class="row" style="justify-content:space-between"><span>${c.arch}</span><span class="muted">${c.other}</span></div>
        <div class="meter-track" style="position:relative;background:var(--surface-3)"><div style=${`position:absolute;left:calc(${v * 100}% - 6px);top:-2px;width:12px;height:12px;border-radius:50%;background:var(--ink);box-shadow:0 0 0 2px var(--surface)`} /></div></div>`;
    })}
  </div>`;
}

// ---- Levels of conflict rings -------------------------------------------------------
export function ConflictRings({ forces, center = t('Protagonist'), onSelect, size = 460 }) {
  const W = size; const C = W / 2; const R = [W * 0.15, W * 0.28, W * 0.41];
  const byLevel = (lvl) => forces.filter((f) => f.level === lvl);
  const ringMid = { inner: (0 + R[0]) / 2 + R[0] * 0.25, personal: (R[0] + R[1]) / 2, extra: (R[1] + R[2]) / 2 };
  return html`<${ChartFrame} label=${t('Levels of conflict')}>
    <svg viewBox=${`0 0 ${W} ${W}`}>
      ${[...LEVELS].reverse().map((l, k) => {
        const r = R[2 - k];
        return html`<circle cx=${C} cy=${C} r=${r} fill=${LEVEL_COLOR[l.id]} fill-opacity="0.09" stroke=${LEVEL_COLOR[l.id]} stroke-opacity="0.5" stroke-width="1.5" />`;
      })}
      ${LEVELS.map((l, k) => html`<text x=${C} y=${C - R[k] + 15} text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.06em" class="t-ink">${l.long.toUpperCase()}</text>`)}
      <circle cx=${C} cy=${C} r="30" fill="var(--ink)" />
      ${wrap(center, 11, 2).map((ln, i, arr) => html`<text x=${C} y=${C + 4 + (i - (arr.length - 1) / 2) * 13} text-anchor="middle" font-size="11" font-weight="700" style="fill:var(--surface)">${ln}</text>`)}
      ${LEVELS.map((l) => {
        const fs = byLevel(l.id);
        return fs.map((f, i) => {
          const span = Math.PI * 2 - 1.1;
          const ang = -Math.PI / 2 + 0.55 + ((i + 0.5) / fs.length) * span + (l.id === 'personal' ? 0.22 : l.id === 'extra' ? 0.44 : 0);
          const r = ringMid[l.id];
          const fx = C + Math.cos(ang) * r; const fy = C + Math.sin(ang) * r;
          const rad = 4 + (Number(f.strength) || 5) * 0.55;
          const right = Math.cos(ang) >= 0;
          return html`<g onClick=${() => onSelect && onSelect(f.id)}>
            <circle cx=${fx} cy=${fy} r=${rad} fill=${LEVEL_COLOR[l.id]} class="ring" tabindex="0" data-tip=${`${f.name || t('Force')}\n${t('{level} · strength {n}/10', { level: l.long, n: f.strength || 5 })}${f.description ? `\n${f.description}` : ''}`} />
            <text x=${fx + (right ? rad + 4 : -rad - 4)} y=${fy + 4} text-anchor=${right ? 'start' : 'end'} font-size="11" class="t-ink">${trunc(f.name, 20)}</text>
          </g>`;
        });
      })}
    </svg>
    <${Legend} items=${LEVELS.map((l) => ({ color: LEVEL_COLOR[l.id], label: l.long, shape: 'dot' }))} />
  </${ChartFrame}>`;
}

// ---- Value declension (Principle of Antagonism) ---------------------------------------
export function DeclensionDiagram({ decl, counts = {}, highlight }) {
  const W = 640; const H = 330;
  const closings = (n) => tn(n, '{n} scene closing at this level', '{n} scene closings at this level');
  const scenes = (n) => tn(n, '{n} scene', '{n} scenes');
  const node = (key, label, x, y, color, anchor) => html`<g data-tip=${`${label}: ${decl[key] || '—'}\n${closings(counts[key] || 0)}`} tabindex="0">
    <rect x=${x} y=${y} width="230" height="78" rx="10" fill="var(--surface)" stroke=${highlight === key ? 'var(--ink)' : 'var(--axis)'} stroke-width=${highlight === key ? 2 : 1} />
    <rect x=${x} y=${y} width="6" height="78" rx="3" fill=${color} />
    <text x=${x + 18} y=${y + 20} font-size="10.5" font-weight="700" letter-spacing="0.07em" class="t-muted">${label.toUpperCase()}</text>
    ${wrap(decl[key] || '—', 26, 2).map((ln, i) => html`<text x=${x + 18} y=${y + 40 + i * 17} font-size="15" font-weight="650" class="t-ink">${ln}</text>`)}
    <text x=${x + 222} y=${y + 70} text-anchor="end" font-size="11" class="t-muted">${counts[key] ? scenes(counts[key]) : ''}</text>
  </g>`;
  const arrow = (x1, y1, x2, y2) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - Math.cos(a) * 2; const hy = y2 - Math.sin(a) * 2;
    return html`<g><line x1=${x1} y1=${y1} x2=${hx} y2=${hy} stroke="var(--ink-2)" stroke-width="1.5" />
      <path d=${`M${hx - Math.cos(a - 0.45) * 10},${hy - Math.sin(a - 0.45) * 10} L${hx},${hy} L${hx - Math.cos(a + 0.45) * 10},${hy - Math.sin(a + 0.45) * 10}`} fill="none" stroke="var(--ink-2)" stroke-width="1.5" /></g>`;
  };
  return html`<${ChartFrame} label=${t('Value declension')}>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      ${arrow(260, 60, 380, 60)}
      ${arrow(200, 98, 395, 222)}
      ${arrow(120, 98, 120, 216)}
      <text x="320" y="50" text-anchor="middle" font-size="10.5" class="t-muted">${t('somewhat negative')}</text>
      <text x="318" y="150" text-anchor="middle" font-size="10.5" class="t-muted" transform="rotate(32 318 150)">${t('direct opposite')}</text>
      <text x="134" y="168" font-size="10.5" class="t-muted">${t('qualitatively worse')}</text>
      ${node('positive', t('Positive'), 10, 20, 'var(--pos)')}
      ${node('contrary', t('Contrary'), 400, 20, 'var(--neg-1)')}
      ${node('contradictory', t('Contradictory'), 400, 222, 'var(--neg-2)')}
      ${node('negation', t('Negation of the Negation'), 10, 222, 'var(--neg-3)')}
    </svg>
  </${ChartFrame}>`;
}

// ---- Gap ladder (progressive complications) ---------------------------------------------
export function GapLadder({ gaps, objectText }) {
  const n = gaps.length;
  const W = 1000; const H = 380; const ml = 50; const mr = 210; const mt = 40; const mb = 60;
  const iw = W - ml - mr; const ih = H - mt - mb;
  const x = (i) => ml + (n <= 1 ? 0 : (i / (n - 1)) * iw * 0.92);
  const y = (r) => mt + ih - (Math.max(0, Math.min(10, Number(r) || 0)) / 10) * ih;
  if (!n) return html`<p class="muted small">${t('Add the protagonist’s actions below to build the ladder.')}</p>`;
  return html`<${ChartFrame} label=${t('Progressive complications')} scroll>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      ${[0, 5, 10].map((r) => html`<line x1=${ml} x2=${W - mr + 30} y1=${y(r)} y2=${y(r)} class=${r === 0 ? 'axis-line' : 'grid-line'} />
        <text x=${ml - 8} y=${y(r) + 4} text-anchor="end" font-size="11">${r}</text>`)}
      <text x=${ml - 40} y=${mt - 18} font-size="11.5" font-weight="600" class="t-ink">${t('Risk')}</text>
      <rect x=${W - mr + 40} y=${mt - 26} width="170" height="72" rx="8" fill="var(--surface)" stroke="var(--ink)" />
      <text x=${W - mr + 52} y=${mt - 8} font-size="10.5" font-weight="700" letter-spacing="0.06em" class="t-muted">${t('OBJECT OF DESIRE')}</text>
      ${wrap(objectText || t('Set the protagonist’s conscious desire'), 24, 2).map((ln, i) => html`<text x=${W - mr + 52} y=${mt + 10 + i * 15} font-size="12" class="t-ink">${ln}</text>`)}
      ${gaps.map((g, i) => {
        const gx = x(i); const gy = y(g.risk);
        const retreat = i > 0 && Number(g.risk) <= Number(gaps[i - 1].risk);
        const next = gaps[i + 1];
        const color = LEVEL_COLOR[g.level] || 'var(--ink-2)';
        return html`<g>
          ${next && html`<path d=${`M${gx},${gy} H${(gx + x(i + 1)) / 2} V${y(next.risk)} H${x(i + 1)}`} fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-opacity="0.45" />`}
          ${next && html`<path d=${`M${(gx + x(i + 1)) / 2 - 7},${gy - 8} l4,-4 l3,5 l4,-5 l3,5`} fill="none" stroke=${color} stroke-width="1.8" />`}
          <circle cx=${gx} cy=${gy} r="8" fill=${color} class="ring" tabindex="0"
            data-tip=${[
              t('Action {n}: {action}', { n: i + 1, action: g.action || '—' }),
              t('Expected: {text}', { text: g.expect || '—' }),
              t('Result: {text}', { text: g.result || '—' }),
              t('Risk {n}/10 · {level}', { n: g.risk, level: (LEVELS.find((l) => l.id === g.level) || {}).long || '' }),
              retreat && t('⚠ Not riskier than the previous action'),
            ].filter(Boolean).join('\n')} />
          <text x=${gx} y=${gy + 4} text-anchor="middle" font-size="10" font-weight="700" style="fill:#fff">${i + 1}</text>
          ${wrap(g.action, 20, 2).map((ln, k) => html`<text x=${gx + (i === n - 1 ? 0 : 12)} y=${gy - 16 - (1 - k) * 13} font-size="11" class="t-ink" text-anchor=${i === n - 1 ? 'middle' : 'start'}>${ln}</text>`)}
          ${retreat && html`<text x=${gx} y=${gy + 26} text-anchor="middle" font-size="11" font-weight="700" style="fill:var(--serious)">${t('⚠ retreat')}</text>`}
        </g>`;
      })}
      <text x=${ml} y=${H - 18} font-size="11" class="t-muted">${t('Each action provokes forces of antagonism; the gap between expectation and result forces a riskier next action — a point of no return.')}</text>
    </svg>
    <${Legend} items=${LEVELS.map((l) => ({ color: LEVEL_COLOR[l.id], label: t('Gap from {level}', { level: l.long.toLowerCase() }), shape: 'dot' }))} />
  </${ChartFrame}>`;
}

// ---- Cast solar system -----------------------------------------------------------------
export function SolarSystem({ story, onSelect, size = 640 }) {
  const W = size; const C = W / 2;
  const prot = story.characters.find((c) => c.role === 'protagonist');
  const orbit1 = story.characters.filter((c) => c !== prot && (c.role === 'supporting' || c.role === 'antagonist' || (c.role === 'protagonist')));
  const orbit2 = story.characters.filter((c) => c !== prot && c.role === 'minor');
  const R1 = W * 0.28; const R2 = W * 0.4;
  const roleColor = (c) => (c.role === 'antagonist' ? 'var(--s2)' : c.role === 'minor' ? 'var(--axis)' : 'var(--s1)');
  const place = (list, R, offset) => list.map((c, i) => {
    const ang = -Math.PI / 2 + offset + (i / Math.max(1, list.length)) * Math.PI * 2;
    return { c, x: C + Math.cos(ang) * R, y: C + Math.sin(ang) * R, ang };
  });
  const p1 = place(orbit1, R1, 0.2);
  const p2 = place(orbit2, R2, 0.55);
  const dims = prot ? (prot.dimensions || []).filter((d) => d.a && d.b).slice(0, 4) : [];
  return html`<${ChartFrame} label=${t('Cast design')}>
    <svg viewBox=${`0 0 ${W} ${W}`}>
      <circle cx=${C} cy=${C} r=${R1} fill="none" class="grid-line" />
      <circle cx=${C} cy=${C} r=${R2} fill="none" class="grid-line" />
      ${p1.map((p) => html`<line x1=${C} y1=${C} x2=${p.x} y2=${p.y} stroke="var(--axis)" stroke-width="1" />`)}
      <circle cx=${C} cy=${C} r=${W * 0.13} fill="var(--warning)" fill-opacity="0.16" />
      <circle cx=${C} cy=${C} r=${W * 0.085} fill="var(--ink)" />
      ${prot ? wrap(prot.name || t('Protagonist'), 12, 2).map((ln, i, arr) => html`<text x=${C} y=${C + 5 + (i - (arr.length - 1) / 2) * 15} text-anchor="middle" font-size="13" font-weight="700" style="fill:var(--surface)" onClick=${() => onSelect && onSelect(prot.id)}>${ln}</text>`)
        : wrap(t('No protagonist'), 14, 2).map((ln, i, arr) => html`<text x=${C} y=${C + 4 + (i - (arr.length - 1) / 2) * 14} text-anchor="middle" font-size="12" style="fill:var(--surface)">${ln}</text>`)}
      ${dims.map((d, i) => {
        const ang = -Math.PI / 2 + (i / dims.length) * Math.PI * 2 + Math.PI / dims.length;
        const r = W * 0.165;
        const tx = C + Math.cos(ang) * r; const ty = C + Math.sin(ang) * r;
        return html`<g data-tip=${`${t('Dimension')}\n${d.a} ↔ ${d.b}`} tabindex="0">
          <text x=${tx} y=${ty - 2} text-anchor="middle" font-size="10" class="t-ink">${trunc(d.a, 18)}</text>
          <text x=${tx} y=${ty + 10} text-anchor="middle" font-size="10">↔ ${trunc(d.b, 16)}</text>
        </g>`;
      })}
      ${[...p1, ...p2].map((p) => {
        const right = Math.cos(p.ang) >= -0.1;
        const crowded = p.c.role === 'minor' && p1.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 74);
        const r = p.c.role === 'minor' ? 14 : 20;
        return html`<g onClick=${() => onSelect && onSelect(p.c.id)} style="cursor:pointer">
          <circle cx=${p.x} cy=${p.y} r=${r} fill=${roleColor(p.c)} class="ring" tabindex="0"
            data-tip=${[
              `${p.c.name || t('Unnamed')} (${ROLE_NAMES[p.c.role] || p.c.role})`,
              p.c.bringsOut && t('Brings out: {text}', { text: p.c.bringsOut }),
              p.c.attitude && t('Attitude: {text}', { text: p.c.attitude }),
              t('Dimensions: {n}', { n: dimensionCount(p.c) }),
            ].filter(Boolean).join('\n')} />
          <text x=${p.x} y=${p.y + 4} text-anchor="middle" font-size=${r > 15 ? 11 : 9.5} font-weight="700" style=${p.c.role === 'minor' ? 'fill:var(--ink)' : 'fill:#fff'}>${(p.c.name || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</text>
          ${!crowded && html`<text x=${p.x + (right ? r + 5 : -r - 5)} y=${p.c.role === 'minor' ? p.y + 4 : p.y - 1} text-anchor=${right ? 'start' : 'end'} font-size=${p.c.role === 'minor' ? 10.5 : 11.5} font-weight="600" class="t-ink">${trunc(p.c.name, p.c.role === 'minor' ? 14 : 18)}</text>`}
          ${p.c.bringsOut && p.c.role !== 'minor' && html`<text x=${p.x + (right ? r + 5 : -r - 5)} y=${p.y + 13} text-anchor=${right ? 'start' : 'end'} font-size="10.5" class="t-muted">${trunc(p.c.bringsOut, 22)}</text>`}
        </g>`;
      })}
    </svg>
    <${Legend} items=${[{ color: 'var(--ink)', label: t('Protagonist (the sun)'), shape: 'dot' }, { color: 'var(--s1)', label: t('Supporting'), shape: 'dot' }, { color: 'var(--s2)', label: t('Antagonist / force'), shape: 'dot' }, { color: 'var(--axis)', label: t('Minor (outer orbit)'), shape: 'dot' }]} />
  </${ChartFrame}>`;
}

// ---- Mask vs heart -----------------------------------------------------------------------
export function MaskHeart({ c }) {
  const W = 420; const rowH = 32; const ml = 84; const mr = 84; const mt = 16;
  const H = mt + QUALITY_AXES.length * rowH + 8;
  const x = (v) => ml + ((Number(v) + 2) / 4) * (W - ml - mr);
  return html`<${ChartFrame} label=${t('Characterization versus true character')}>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <line x1=${x(0)} x2=${x(0)} y1=${mt - 6} y2=${H - 6} class="axis-line" />
      ${QUALITY_AXES.map((q, i) => {
        const y = mt + i * rowH + rowH / 2;
        const v = c.qualities[q.id] || { mask: 0, core: 0 };
        const gap = Math.abs((v.mask || 0) - (v.core || 0));
        return html`<g>
          <line x1=${ml} x2=${W - mr} y1=${y} y2=${y} class="grid-line" />
          <text x=${ml - 10} y=${y + 4} text-anchor="end" font-size="12" class=${(v.mask || 0) < 0 || (v.core || 0) < 0 ? 't-ink' : ''}>${q.neg}</text>
          <text x=${W - mr + 10} y=${y + 4} font-size="12" class=${(v.mask || 0) > 0 || (v.core || 0) > 0 ? 't-ink' : ''}>${q.pos}</text>
          <line x1=${x(v.mask || 0)} x2=${x(v.core || 0)} y1=${y} y2=${y} stroke=${gap >= 2 ? 'var(--s7)' : 'var(--ink-2)'} stroke-width=${gap >= 2 ? 3 : 2} />
          <circle cx=${x(v.mask || 0)} cy=${y} r="7" fill="var(--surface)" stroke="var(--ink-2)" stroke-width="2" tabindex="0" data-tip=${`${t('Mask: {n}', { n: v.mask || 0 })}\n${t('{pos} / {neg} — how they appear', { pos: q.pos, neg: q.neg })}`} />
          <circle cx=${x(v.core || 0)} cy=${y} r="6" fill="var(--ink)" class="ring" tabindex="0" data-tip=${`${t('Heart: {n}', { n: v.core || 0 })}\n${t('{pos} / {neg} — revealed under pressure', { pos: q.pos, neg: q.neg })}${gap >= 2 ? `\n${t('Contradiction = dimension')}` : ''}`} />
        </g>`;
      })}
    </svg>
    <${Legend} items=${[{ color: 'var(--ink-2)', label: t('Mask (characterization)'), shape: 'hollow' }, { color: 'var(--ink)', label: t('Heart (true character)'), shape: 'dot' }, { color: 'var(--s7)', label: t('Gap ≥ 2: a dimension') }]} />
  </${ChartFrame}>`;
}

// ---- The Quest (inciting incident, desires, spine) ---------------------------------------------
export function QuestDiagram({ conscious, unconscious, inciting, spineText }) {
  const W = 1000; const H = 296;
  const zig = Array.from({ length: 9 }, (_, i) => `${40 + i * 20},${150 + (i % 2 ? -22 : 22)}`).join(' ');
  return html`<${ChartFrame} label=${t('The Quest')}>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <line x1="30" x2="230" y1="150" y2="150" class="grid-line" />
      <polyline points=${`${zig} 220,150`} fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-linejoin="round" />
      <text x="40" y="104" font-size="11" class="t-muted">${t('life in relative balance')}</text>
      <text x="40" y="214" font-size="11" class="t-muted">${t('± ups and downs')}</text>
      <line x1="230" x2="230" y1="64" y2="236" stroke="var(--ink)" stroke-width="1.5" />
      <text x="230" y="52" text-anchor="middle" font-size="11.5" font-weight="700" class="t-ink">${t('INCITING INCIDENT')}</text>
      ${wrap(inciting || '—', 30, 2).map((ln, i) => html`<text x="230" y=${258 + i * 14} text-anchor="middle" font-size="11">${ln}</text>`)}
      <path d="M232,150 C 380,40 620,40 770,110" fill="none" stroke="var(--pos)" stroke-width="2.5" />
      <path d="M232,150 C 380,260 620,260 770,190" fill="none" stroke="var(--s7)" stroke-width="2.5" stroke-dasharray="7 6" />
      <text x="500" y="22" text-anchor="middle" font-size="11.5" font-weight="700" class="t-ink">${t('conscious desire')}</text>
      ${wrap(conscious || t('not set'), 60, 1).map((ln) => html`<text x="500" y="38" text-anchor="middle" font-size="11">${ln}</text>`)}
      <text x="500" y="266" text-anchor="middle" font-size="11.5" font-weight="700" class="t-ink">${t('unconscious desire')}</text>
      ${wrap(unconscious || t('none (conscious desire is the Spine)'), 60, 1).map((ln) => html`<text x="500" y="282" text-anchor="middle" font-size="11">${ln}</text>`)}
      <line x1="300" x2="700" y1="150" y2="150" stroke="var(--ink)" stroke-width="3" />
      <text x="500" y="124" text-anchor="middle" font-size="12" font-weight="700" class="t-ink">${t('SPINE')}</text>
      ${wrap(spineText || '', 56, 1).map((ln) => html`<text x="500" y="140" text-anchor="middle" font-size="11">${ln}</text>`)}
      ${[['inner', 400, t('inner')], ['personal', 500, t('personal')], ['extra', 600, t('extra-personal')]].map(([k, xx, label]) => html`<g>
        <line x1=${xx} x2=${xx} y1="195" y2="160" stroke=${LEVEL_COLOR[k]} stroke-width="2" />
        <path d=${`M${xx - 5},${168} L${xx},${159} L${xx + 5},${168}`} fill=${LEVEL_COLOR[k]} />
        <text x=${xx} y="208" text-anchor="middle" font-size="10" class="t-muted">${label}</text>
      </g>`)}
      <rect x="772" y="86" width="210" height="128" rx="10" fill="var(--surface)" stroke="var(--ink)" />
      <text x="877" y="112" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.06em" class="t-muted">${t('OBJECT(S) OF DESIRE')}</text>
      ${wrap(conscious || '—', 28, 3).map((ln, i) => html`<text x="877" y=${134 + i * 15} text-anchor="middle" font-size="11.5" class="t-ink">${ln}</text>`)}
    </svg>
    <${Legend} items=${[{ color: 'var(--pos)', label: t('Conscious desire') }, { color: 'var(--s7)', label: t('Unconscious desire (dashed)') }]} />
  </${ChartFrame}>`;
}

// ---- Score ring -------------------------------------------------------------------------
export function scoreBand(score) {
  if (score >= 80) return { color: 'var(--good)', label: t('Strong') };
  if (score >= 60) return { color: 'var(--warning)', label: t('Developing') };
  if (score >= 40) return { color: 'var(--serious)', label: t('Needs work') };
  return { color: 'var(--critical)', label: t('Early draft') };
}

export function ScoreRing({ score, size = 150, label = 'Story Doctor' }) {
  const r = 52; const c = 2 * Math.PI * r;
  const band = scoreBand(score);
  return html`<div class="chart" style=${`width:${size}px`} role="img" aria-label=${t('{label}: {score} of 100, {band}', { label, score, band: band.label })}>
    <svg viewBox="0 0 130 130">
      <circle cx="65" cy="65" r=${r} fill="none" stroke="var(--surface-3)" stroke-width="12" />
      <circle cx="65" cy="65" r=${r} fill="none" stroke=${band.color} stroke-width="12" stroke-linecap="round"
        stroke-dasharray=${`${(score / 100) * c} ${c}`} transform="rotate(-90 65 65)" />
      <text x="65" y="68" text-anchor="middle" font-size="32" font-weight="700" class="t-ink">${score}</text>
      <text x="65" y="88" text-anchor="middle" font-size="11">${band.label}</text>
    </svg>
  </div>`;
}

// ---- Dilemma triangle (HTML nodes + SVG connectors) ----------------------------------------
export function DilemmaTriangle({ a, b, c, labelB = 'B', labelC = 'C', type }) {
  return html`<div class="dilemma">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line x1="25" y1="25" x2="50" y2="82" stroke="var(--axis)" stroke-width="0.6" vector-effect="non-scaling-stroke" />
      <line x1="75" y1="25" x2="50" y2="82" stroke="var(--axis)" stroke-width="0.6" vector-effect="non-scaling-stroke" />
      <line x1="25" y1="25" x2="75" y2="25" stroke="var(--axis)" stroke-width="0.6" vector-effect="non-scaling-stroke" />
    </svg>
    <div class="node"><div class="node-tag">${labelB}</div>${b}</div>
    <div class="node"><div class="node-tag">${labelC}</div>${c}</div>
    <div class="node a"><div class="node-tag">${t('A — the protagonist')}${type ? ` · ${type}` : ''}</div>${a}</div>
  </div>`;
}
