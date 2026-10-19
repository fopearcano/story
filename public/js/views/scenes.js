// Scenes: list + five-step scene analysis editor (ch. 2, 10, 11).
import { html, useState, useMemo, cx } from '../lib.js';
import { t } from '../i18n.js';
import { useStory } from '../store.js';
import { Page, Card, Field, Select, Slider, Toggle, Segmented, Principle, Cite, ListEditor, Btn, Icon, ChargePicker, TurnArrow, Chips, Empty, href, go, rich } from '../ui.js';
import { ArcChart } from '../charts/structure.js';
import { ChartFrame, chargeColor, fmtCharge } from '../charts/frame.js';
import { acts, newScene, uid, turnOf, hasCharge, MARKERS, MODES, sceneLabel } from '../model.js';
import { VALUE_PAIRS, chargeLabel } from '../kb/values.js';
import { LEVELS } from '../kb/principles.js';
import { AssistButton } from '../ai/assist.js';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function TurnScale({ open, close, decl }) {
  const W = 760; const H = 74; const ml = 24; const mr = 24;
  const x = (v) => ml + ((Number(v) + 3) / 6) * (W - ml - mr);
  const d = hasCharge(open) && hasCharge(close) ? Number(close) - Number(open) : null;
  return html`<${ChartFrame} label=${t('Value change across the scene')}>
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <defs><linearGradient id="valgrad" x1="0" x2="1"><stop offset="0" stop-color="var(--neg)" stop-opacity="0.25" /><stop offset="0.5" stop-color="var(--mid-fill)" stop-opacity="0.6" /><stop offset="1" stop-color="var(--pos)" stop-opacity="0.25" /></linearGradient></defs>
      <rect x=${ml} y="30" width=${W - ml - mr} height="10" rx="5" fill="url(#valgrad)" />
      ${[-3, -2, -1, 0, 1, 2, 3].map((v) => html`<text x=${x(v)} y="64" text-anchor="middle" font-size="10.5" class="t-muted">${v > 0 ? `+${v}` : v}</text>`)}
      ${d !== null && d !== 0 && html`<g>
        <line x1=${x(open)} x2=${x(close) + (d > 0 ? -9 : 9)} y1="35" y2="35" stroke=${chargeColor(d)} stroke-width="3" />
        <path d=${d > 0 ? `M${x(close) - 11},28 L${x(close) - 3},35 L${x(close) - 11},42` : `M${x(close) + 11},28 L${x(close) + 3},35 L${x(close) + 11},42`} fill="none" stroke=${chargeColor(d)} stroke-width="2.5" />
      </g>`}
      ${hasCharge(open) && html`<g><circle cx=${x(open)} cy="35" r="7" fill="var(--surface)" stroke="var(--ink-2)" stroke-width="2.5" tabindex="0" data-tip=${`${t('Opening: {charge}', { charge: fmtCharge(open) })}\n${chargeLabel(open, decl)}`} />
        <text x=${x(open)} y="18" text-anchor="middle" font-size="11" font-weight="700">${t('OPEN')}</text></g>`}
      ${hasCharge(close) && html`<g><circle cx=${x(close)} cy="35" r="7" fill=${chargeColor(close)} class="ring" tabindex="0" data-tip=${`${t('Closing: {charge}', { charge: fmtCharge(close) })}\n${chargeLabel(close, decl)}`} />
        <text x=${x(close)} y=${hasCharge(open) && Number(open) === Number(close) ? 10 : 18} text-anchor="middle" font-size="11" font-weight="700" class="t-ink">${t('CLOSE')}</text></g>`}
    </svg>
  </${ChartFrame}>`;
}

// Step 4 verdict: whole sentences per direction and number, so word order can change.
function turnSentence(d, from, to) {
  const n = Math.abs(d);
  if (d > 0) return n === 1 ? rich('<b>The scene turns</b> positive by {n} step: {from} → {to}.', { n, from, to }) : rich('<b>The scene turns</b> positive by {n} steps: {from} → {to}.', { n, from, to });
  return n === 1 ? rich('<b>The scene turns</b> negative by {n} step: {from} → {to}.', { n, from, to }) : rich('<b>The scene turns</b> negative by {n} steps: {from} → {to}.', { n, from, to });
}

export function ScenesView({ sub }) {
  const { story, update, mutate } = useStory();
  const [filter, setFilter] = useState({ plotline: '', character: '' });
  const [showArc, setShowArc] = useState(true);
  const found = story.scenes.findIndex((s) => s.id === sub);
  const idx = found >= 0 ? found : story.scenes.length ? 0 : -1;
  const current = idx >= 0 ? story.scenes[idx] : null;
  const actList = useMemo(() => acts(story), [story]);
  const decl = story.values.declension;
  const set = (path, v) => update(['scenes', idx, ...path], v);

  const addScene = (after = story.scenes.length - 1) => {
    const prev = story.scenes[after];
    const s = newScene({ title: t('New scene'), plotline: prev ? prev.plotline : 'main', sequence: prev ? prev.sequence : '', open: prev && hasCharge(prev.close) ? prev.close : null });
    mutate((st) => { st.scenes.splice(after + 1, 0, s); });
    go(href(story.id, 'scenes', s.id));
  };
  const move = (d) => mutate((st) => {
    const j = idx + d;
    if (j < 0 || j >= st.scenes.length) return;
    [st.scenes[idx], st.scenes[j]] = [st.scenes[j], st.scenes[idx]];
  });
  const duplicate = () => {
    const copy = { ...structuredClone(current), id: uid('s'), title: t('{title} (copy)', { title: current.title }) };
    mutate((st) => { st.scenes.splice(idx + 1, 0, copy); });
    go(href(story.id, 'scenes', copy.id));
  };
  const remove = () => {
    if (!confirm(t('Delete scene "{title}"?', { title: current.title }))) return;
    const next = story.scenes[idx + 1] || story.scenes[idx - 1];
    mutate((st) => {
      st.scenes = st.scenes.filter((s) => s.id !== current.id);
      st.setups.forEach((p) => { if (p.setupScene === current.id) p.setupScene = ''; if (p.payoffScene === current.id) p.payoffScene = ''; });
      st.images.forEach((im) => { im.scenes = im.scenes.filter((x) => x !== current.id); });
    });
    go(href(story.id, 'scenes', next ? next.id : ''));
  };

  const visible = (s) => (!filter.plotline || s.plotline === filter.plotline) && (!filter.character || (s.characters || []).includes(filter.character));
  const d = current ? turnOf(current) : null;
  const valueOptions = [...new Set([...(decl.positive ? [`${decl.positive} / ${decl.contradictory || t('its opposite')}`] : []), ...story.values.secondary, ...VALUE_PAIRS])];

  return html`<${Page} kicker=${t('Story design · ch. 2, 10, 11')} title=${t('Scenes')} cites=${['scene', 'turning-point', 'subtext']}
    intro=${t('A scene is an action through conflict that turns a value at stake. Analyse each with McKee’s five steps: conflict, opening value, beats, closing value, turning point.')} wide
    actions=${html`<${Btn} kind="primary" icon="plus" onClick=${() => addScene(idx >= 0 ? idx : story.scenes.length - 1)}>${t('Add scene')}</${Btn}><${Btn} icon="eye" onClick=${() => setShowArc(!showArc)}>${showArc ? t('Hide arc') : t('Show arc')}</${Btn}>`}>
    ${showArc && story.scenes.length > 0 && html`<${Card} class="mb"><${ArcChart} story=${story} height=${260} selected=${current && current.id} onSelect=${(id) => go(href(story.id, 'scenes', id))} /></${Card}>`}
    <div class="grid g-list">
      <div class="stack">
        <${Card}>
          <div class="fields two">
            <${Select} value=${filter.plotline} onChange=${(v) => setFilter({ ...filter, plotline: v })} options=${[{ id: '', label: t('All plotlines') }, ...story.plotlines.map((p) => ({ id: p.id, label: p.name }))]} />
            <${Select} value=${filter.character} onChange=${(v) => setFilter({ ...filter, character: v })} options=${[{ id: '', label: t('All characters') }, ...story.characters.map((c) => ({ id: c.id, label: c.name || t('Unnamed') }))]} />
          </div>
          <div class="picker mt">
            ${actList.map((a) => html`<div class="act-sep">${a.climax ? t('Act {n}', { n: ROMAN[a.n] || a.n }) : t('Act {n} (open)', { n: ROMAN[a.n] || a.n })}</div>
              ${a.items.filter((it) => visible(it.scene)).map((it) => {
                const s = it.scene;
                const mk = MARKERS.find((m) => m.id === s.marker);
                return html`<button class=${cx('pick', current && s.id === current.id && 'on')} onClick=${() => go(href(story.id, 'scenes', s.id))}>
                  <span class="pick-num">${it.index + 1}</span>
                  <span class="pick-main"><div class="pick-title">${s.title || t('Untitled scene')}</div><div class="pick-sub">${s.summary || s.value || t('No summary')}</div></span>
                  ${mk && mk.short && html`<span class="chip marker" title=${mk.label}>${mk.short}</span>`}
                  <${TurnArrow} open=${s.open} close=${s.close} />
                </button>`;
              })}`)}
            ${!story.scenes.length && html`<p class="small muted">${t('No scenes yet.')}</p>`}
          </div>
          <div class="row mt"><${Btn} small icon="plus" onClick=${() => addScene()}>${t('Add scene at end')}</${Btn}></div>
        </${Card}>
        <${Principle} id="step3" compact />
      </div>
      ${!current ? html`<${Empty} title=${story.scenes.length ? t('Select a scene') : t('Create your first scene')} text=${t('Every scene should turn a value from positive to negative or negative to positive.')}>
          ${!story.scenes.length && html`<${Btn} kind="primary" icon="plus" onClick=${() => addScene()}>${t('Add scene')}</${Btn}>`}</${Empty}>` : html`
      <div class="stack">
        <${Card}>
          <div class="row">
            <span class="chip" style="font-size:13px">#${idx + 1}</span>
            <input class="input grow title-input" style="font:600 20px var(--serif);border-color:transparent;padding:2px 6px;background:transparent" value=${current.title} placeholder=${t('Scene title')} onInput=${(e) => set(['title'], e.target.value)} aria-label=${t('Scene title')} />
            <button class="icon-btn" title=${t('Move up')} onClick=${() => move(-1)} disabled=${idx === 0}><${Icon} name="up" /></button>
            <button class="icon-btn" title=${t('Move down')} onClick=${() => move(1)} disabled=${idx === story.scenes.length - 1}><${Icon} name="down" /></button>
            <button class="icon-btn" title=${t('Duplicate')} onClick=${duplicate}><${Icon} name="copy" /></button>
            <button class="icon-btn danger" title=${t('Delete')} onClick=${remove}><${Icon} name="trash" /></button>
          </div>
          <div class="fields three mt">
            <${Select} label=${t('Structural role')} value=${current.marker} options=${MARKERS} onChange=${(v) => set(['marker'], v)} />
            <${Select} label=${t('Plotline')} value=${current.plotline} options=${story.plotlines.map((p) => ({ id: p.id, label: p.name }))} onChange=${(v) => set(['plotline'], v)} />
            <${Field} label=${t('Sequence (title it: NO JOB → JOB)')} value=${current.sequence} onInput=${(v) => set(['sequence'], v)} />
          </div>
          <div class="row mt"><${AssistButton} task="alternatives" label=${t('Cliché breaker: 10 alternatives')} sceneId=${current.id} /><${AssistButton} task="scene-doctor" label=${t('Analyse this scene')} sceneId=${current.id} /></div>
        </${Card}>
        <${Card} title=${t('Step-outline card')} kicker=${t('One or two sentences: how it builds and turns')} cite="step-outline">
          <div class="fields two">
            <${Field} label=${t('Front: what happens')} multiline value=${current.summary} onInput=${(v) => set(['summary'], v)} placeholder=${t('He enters expecting to find her at home, but instead discovers her note saying she’s left for good.')} />
            <${Field} label=${t('Back: its function in the design')} multiline value=${current.func} onInput=${(v) => set(['func'], v)} placeholder=${t('Act One climax; sets up…')} />
          </div>
        </${Card}>
        <${Card} title=${t('Scene analysis')} kicker=${t('Five steps')} cite=${['step1', 'step2', 'step3', 'step4', 'step5']}>
          <div class="stack">
            <div><div class="kicker">${t('Step 1 · Define conflict')}</div>
              <div class="fields two">
                <${Field} label=${t('Who drives the scene?')} value=${current.driver} onInput=${(v) => set(['driver'], v)} />
                <${Field} label=${t('What do they want? (to…)')} value=${current.desire} onInput=${(v) => set(['desire'], v)} placeholder=${t('to win her back')} />
                <${Field} label=${t('What forces block them?')} value=${current.antagonist} onInput=${(v) => set(['antagonist'], v)} />
                <${Field} label=${t('What do those forces want? (to… / not to…)')} value=${current.antagonistDesire} onInput=${(v) => set(['antagonistDesire'], v)} placeholder=${t('to keep the affair in the past')} />
              </div>
            </div>
            <div><div class="kicker">${t('Step 2 · Note opening value')}</div>
              <div class="fields two">
                <label class="field"><span class="field-label">${t('Value at stake')}</span>
                  <input list="value-options" value=${current.value} onInput=${(e) => set(['value'], e.target.value)} placeholder=${t('love / hate')} />
                  <datalist id="value-options">${valueOptions.map((v) => html`<option value=${v} />`)}</datalist>
                </label>
                <${ChargePicker} label=${t('Opening charge')} value=${current.open} decl=${decl} onChange=${(v) => set(['open'], v)} />
              </div>
            </div>
            <div><div class="kicker">${t('Step 3 · Break into beats (action / reaction, as gerunds)')}</div>
              <${ListEditor} items=${current.beats} onChange=${(v) => set(['beats'], v)} make=${() => ({ id: uid('b'), action: '', reaction: '' })} addLabel=${t('Add beat')}
                empty=${t('A beat is an exchange of behaviour in action/reaction. A new beat begins only when behaviour clearly changes.')}
                render=${(b, i, s) => html`<div class="row top">
                  <label title=${t('Turning point')} style="padding-top:8px"><input type="radio" name="tp" checked=${current.turningBeat === i} onChange=${() => set(['turningBeat'], i)} /></label>
                  <b style="padding-top:8px">${i + 1}</b>
                  <${Field} class="grow" value=${b.action} onInput=${(v) => s({ action: v })} placeholder=${t('Groveling at her feet')} />
                  <span class="muted" style="padding-top:8px">/</span>
                  <${Field} class="grow" value=${b.reaction} onInput=${(v) => s({ reaction: v })} placeholder=${t('Ignoring the plea')} />
                </div>`} />
              ${current.beats.length > 0 && html`<p class="tiny muted">${t('The radio button marks the beat where the turning point happens.')}</p>`}
            </div>
            <div><div class="kicker">${t('Step 4 · Note closing value and compare')}</div>
              <div class="fields two">
                <${ChargePicker} label=${t('Closing charge')} value=${current.close} decl=${decl} onChange=${(v) => set(['close'], v)} />
                <div class=${cx('callout')} style=${d === 0 ? 'border-color:var(--warning)' : ''}>
                  ${d === null ? t('Set both charges to compare.') : d === 0 ? rich('<b>Non-event.</b> The value doesn’t change — why is this scene in the story? Make it turn or cut it, weaving its exposition elsewhere.') : turnSentence(d, chargeLabel(current.open, decl), chargeLabel(current.close, decl))}
                </div>
              </div>
              <${TurnScale} open=${current.open} close=${current.close} decl=${decl} />
            </div>
            <div><div class="kicker">${t('Step 5 · Locate the turning point')}</div>
              <div class="fields two">
                <${Segmented} value=${current.turn} onChange=${(v) => set(['turn'], v)} options=${[{ id: 'action', label: t('Turns on action') }, { id: 'revelation', label: t('Turns on revelation') }]} />
                <${Toggle} label=${t('Turns by coincidence')} hint=${t('Allowed early; never after the midpoint, never to end the story.')} checked=${current.coincidence} onChange=${(v) => set(['coincidence'], v)} />
                <${Field} label=${t('Expectation (what the character thought would happen)')} multiline value=${current.gapExpect} onInput=${(v) => set(['gapExpect'], v)} />
                <${Field} label=${t('Result (what actually happened — the gap)')} multiline value=${current.gapResult} onInput=${(v) => set(['gapResult'], v)} />
                <${Field} class="span2" label=${t('Choice under pressure (if any): B vs. C, and the choice made')} multiline value=${current.choice} onInput=${(v) => set(['choice'], v)} />
              </div>
            </div>
          </div>
        </${Card}>
        <div class="grid g2">
          <${Card} title=${t('Subtext')} kicker=${t('The scene is not about what it seems to be about')} cite="subtext">
            <${Field} multiline rows=${4} value=${current.subtext} onInput=${(v) => set(['subtext'], v)} placeholder=${t('What are they really doing behind their masks? (Two people change a tire; boy has met girl.)')} />
          </${Card}>
          <${Card} title=${t('Staging')} cite=${['rhythm-tempo', 'mystery-suspense-irony']}>
            <div class="fields">
              <div class="fields two">
                <${Field} label=${t('Location')} value=${current.location} onInput=${(v) => set(['location'], v)} />
                <${Field} label=${t('Time')} value=${current.time} onInput=${(v) => set(['time'], v)} />
              </div>
              <div class="fields two">
                <${Slider} label=${t('Length (pages ≈ minutes)')} value=${current.pages} min=${0.5} max=${10} step=${0.5} show=${(v) => v} onInput=${(v) => set(['pages'], v)} />
                <${Slider} label=${t('Tempo (activity)')} value=${current.tempo} min=${1} max=${5} step=${1} show=${(v) => `${v}/5`} onInput=${(v) => set(['tempo'], v)} />
              </div>
              <${Segmented} value=${current.mode} onChange=${(v) => set(['mode'], v)} options=${MODES.map((m) => ({ id: m.id, label: m.label, hint: m.hint }))} />
              <div class="row">${LEVELS.map((l) => html`<${Toggle} label=${l.label} checked=${current.levels[l.id]} onChange=${(v) => set(['levels', l.id], v)} />`)}</div>
            </div>
          </${Card}>
        </div>
        <${Card} title=${t('Characters in this scene')}>
          ${story.characters.length ? html`<${Chips} items=${story.characters.map((c) => ({ id: c.id, label: c.name || t('Unnamed'), color: c.color }))} value=${current.characters}
            onToggle=${(id) => set(['characters'], current.characters.includes(id) ? current.characters.filter((x) => x !== id) : [...current.characters, id])} />` : html`<p class="small muted">${t('Create characters first.')}</p>`}
        </${Card}>
        <${Card} title=${t('Treatment')} kicker=${t('Present tense, moment by moment, with subtext — no dialogue yet')} cite="treatment">
          <${Field} multiline rows=${6} value=${current.treatment} onInput=${(v) => set(['treatment'], v)} placeholder=${t('Jack leans on the jamb, exhausted…')} />
        </${Card}>
        <div class="row"><${Btn} icon="left" onClick=${() => story.scenes[idx - 1] && go(href(story.id, 'scenes', story.scenes[idx - 1].id))} disabled=${idx === 0}>${t('Previous')}</${Btn}>
          <span class="grow" />
          <${Btn} icon="plus" onClick=${() => addScene(idx)}>${t('Insert scene after')}</${Btn}>
          <${Btn} icon="right" onClick=${() => story.scenes[idx + 1] && go(href(story.id, 'scenes', story.scenes[idx + 1].id))} disabled=${idx === story.scenes.length - 1}>${t('Next')}</${Btn}></div>
      </div>`}
    </div>
  </${Page}>`;
}
