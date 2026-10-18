// Scenes: list + five-step scene analysis editor (ch. 2, 10, 11).
import { html, useState, useMemo, cx } from '../lib.js';
import { useStory } from '../store.js';
import { Page, Card, Field, Select, Slider, Toggle, Segmented, Principle, Cite, ListEditor, Btn, Icon, ChargePicker, TurnArrow, Chips, Empty, href, go } from '../ui.js';
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
  return html`<${ChartFrame} label="Value change across the scene">
    <svg viewBox=${`0 0 ${W} ${H}`}>
      <defs><linearGradient id="valgrad" x1="0" x2="1"><stop offset="0" stop-color="var(--neg)" stop-opacity="0.25" /><stop offset="0.5" stop-color="var(--mid-fill)" stop-opacity="0.6" /><stop offset="1" stop-color="var(--pos)" stop-opacity="0.25" /></linearGradient></defs>
      <rect x=${ml} y="30" width=${W - ml - mr} height="10" rx="5" fill="url(#valgrad)" />
      ${[-3, -2, -1, 0, 1, 2, 3].map((v) => html`<text x=${x(v)} y="64" text-anchor="middle" font-size="10.5" class="t-muted">${v > 0 ? `+${v}` : v}</text>`)}
      ${d !== null && d !== 0 && html`<g>
        <line x1=${x(open)} x2=${x(close) + (d > 0 ? -9 : 9)} y1="35" y2="35" stroke=${chargeColor(d)} stroke-width="3" />
        <path d=${d > 0 ? `M${x(close) - 11},28 L${x(close) - 3},35 L${x(close) - 11},42` : `M${x(close) + 11},28 L${x(close) + 3},35 L${x(close) + 11},42`} fill="none" stroke=${chargeColor(d)} stroke-width="2.5" />
      </g>`}
      ${hasCharge(open) && html`<g><circle cx=${x(open)} cy="35" r="7" fill="var(--surface)" stroke="var(--ink-2)" stroke-width="2.5" tabindex="0" data-tip=${`Opening: ${fmtCharge(open)}\n${chargeLabel(open, decl)}`} />
        <text x=${x(open)} y="18" text-anchor="middle" font-size="11" font-weight="700">OPEN</text></g>`}
      ${hasCharge(close) && html`<g><circle cx=${x(close)} cy="35" r="7" fill=${chargeColor(close)} class="ring" tabindex="0" data-tip=${`Closing: ${fmtCharge(close)}\n${chargeLabel(close, decl)}`} />
        <text x=${x(close)} y=${hasCharge(open) && Number(open) === Number(close) ? 10 : 18} text-anchor="middle" font-size="11" font-weight="700" class="t-ink">CLOSE</text></g>`}
    </svg>
  </${ChartFrame}>`;
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
    const s = newScene({ title: 'New scene', plotline: prev ? prev.plotline : 'main', sequence: prev ? prev.sequence : '', open: prev && hasCharge(prev.close) ? prev.close : null });
    mutate((st) => { st.scenes.splice(after + 1, 0, s); });
    go(href(story.id, 'scenes', s.id));
  };
  const move = (d) => mutate((st) => {
    const j = idx + d;
    if (j < 0 || j >= st.scenes.length) return;
    [st.scenes[idx], st.scenes[j]] = [st.scenes[j], st.scenes[idx]];
  });
  const duplicate = () => {
    const copy = { ...structuredClone(current), id: uid('s'), title: `${current.title} (copy)` };
    mutate((st) => { st.scenes.splice(idx + 1, 0, copy); });
    go(href(story.id, 'scenes', copy.id));
  };
  const remove = () => {
    if (!confirm(`Delete scene "${current.title}"?`)) return;
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
  const valueOptions = [...new Set([...(decl.positive ? [`${decl.positive} / ${decl.contradictory || 'its opposite'}`] : []), ...story.values.secondary, ...VALUE_PAIRS])];

  return html`<${Page} kicker="Story design · ch. 2, 10, 11" title="Scenes" cites=${['scene', 'turning-point', 'subtext']}
    intro="A scene is an action through conflict that turns a value at stake. Analyse each with McKee’s five steps: conflict, opening value, beats, closing value, turning point." wide
    actions=${html`<${Btn} kind="primary" icon="plus" onClick=${() => addScene(idx >= 0 ? idx : story.scenes.length - 1)}>Add scene</${Btn}><${Btn} icon="eye" onClick=${() => setShowArc(!showArc)}>${showArc ? 'Hide arc' : 'Show arc'}</${Btn}>`}>
    ${showArc && story.scenes.length > 0 && html`<${Card} class="mb"><${ArcChart} story=${story} height=${260} selected=${current && current.id} onSelect=${(id) => go(href(story.id, 'scenes', id))} /></${Card}>`}
    <div class="grid g-list">
      <div class="stack">
        <${Card}>
          <div class="fields two">
            <${Select} value=${filter.plotline} onChange=${(v) => setFilter({ ...filter, plotline: v })} options=${[{ id: '', label: 'All plotlines' }, ...story.plotlines.map((p) => ({ id: p.id, label: p.name }))]} />
            <${Select} value=${filter.character} onChange=${(v) => setFilter({ ...filter, character: v })} options=${[{ id: '', label: 'All characters' }, ...story.characters.map((c) => ({ id: c.id, label: c.name || 'Unnamed' }))]} />
          </div>
          <div class="picker mt">
            ${actList.map((a) => html`<div class="act-sep">Act ${ROMAN[a.n] || a.n}${a.climax ? '' : ' (open)'}</div>
              ${a.items.filter((it) => visible(it.scene)).map((it) => {
                const s = it.scene;
                const mk = MARKERS.find((m) => m.id === s.marker);
                return html`<button class=${cx('pick', current && s.id === current.id && 'on')} onClick=${() => go(href(story.id, 'scenes', s.id))}>
                  <span class="pick-num">${it.index + 1}</span>
                  <span class="pick-main"><div class="pick-title">${s.title || 'Untitled scene'}</div><div class="pick-sub">${s.summary || s.value || 'No summary'}</div></span>
                  ${mk && mk.short && html`<span class="chip marker" title=${mk.label}>${mk.short}</span>`}
                  <${TurnArrow} open=${s.open} close=${s.close} />
                </button>`;
              })}`)}
            ${!story.scenes.length && html`<p class="small muted">No scenes yet.</p>`}
          </div>
          <div class="row mt"><${Btn} small icon="plus" onClick=${() => addScene()}>Add scene at end</${Btn}></div>
        </${Card}>
        <${Principle} id="step3" compact />
      </div>
      ${!current ? html`<${Empty} title=${story.scenes.length ? 'Select a scene' : 'Create your first scene'} text="Every scene should turn a value from positive to negative or negative to positive.">
          ${!story.scenes.length && html`<${Btn} kind="primary" icon="plus" onClick=${() => addScene()}>Add scene</${Btn}>`}</${Empty}>` : html`
      <div class="stack">
        <${Card}>
          <div class="row">
            <span class="chip" style="font-size:13px">#${idx + 1}</span>
            <input class="input grow title-input" style="font:600 20px var(--serif);border-color:transparent;padding:2px 6px;background:transparent" value=${current.title} placeholder="Scene title" onInput=${(e) => set(['title'], e.target.value)} aria-label="Scene title" />
            <button class="icon-btn" title="Move up" onClick=${() => move(-1)} disabled=${idx === 0}><${Icon} name="up" /></button>
            <button class="icon-btn" title="Move down" onClick=${() => move(1)} disabled=${idx === story.scenes.length - 1}><${Icon} name="down" /></button>
            <button class="icon-btn" title="Duplicate" onClick=${duplicate}><${Icon} name="copy" /></button>
            <button class="icon-btn danger" title="Delete" onClick=${remove}><${Icon} name="trash" /></button>
          </div>
          <div class="fields three mt">
            <${Select} label="Structural role" value=${current.marker} options=${MARKERS} onChange=${(v) => set(['marker'], v)} />
            <${Select} label="Plotline" value=${current.plotline} options=${story.plotlines.map((p) => ({ id: p.id, label: p.name }))} onChange=${(v) => set(['plotline'], v)} />
            <${Field} label="Sequence (title it: NO JOB → JOB)" value=${current.sequence} onInput=${(v) => set(['sequence'], v)} />
          </div>
          <div class="row mt"><${AssistButton} task="alternatives" label="Cliché breaker: 10 alternatives" sceneId=${current.id} /><${AssistButton} task="scene-doctor" label="Analyse this scene" sceneId=${current.id} /></div>
        </${Card}>
        <${Card} title="Step-outline card" kicker="One or two sentences: how it builds and turns" cite="step-outline">
          <div class="fields two">
            <${Field} label="Front: what happens" multiline value=${current.summary} onInput=${(v) => set(['summary'], v)} placeholder="He enters expecting to find her at home, but instead discovers her note saying she’s left for good." />
            <${Field} label="Back: its function in the design" multiline value=${current.func} onInput=${(v) => set(['func'], v)} placeholder="Act One climax; sets up…" />
          </div>
        </${Card}>
        <${Card} title="Scene analysis" kicker="Five steps" cite=${['step1', 'step2', 'step3', 'step4', 'step5']}>
          <div class="stack">
            <div><div class="kicker">Step 1 · Define conflict</div>
              <div class="fields two">
                <${Field} label="Who drives the scene?" value=${current.driver} onInput=${(v) => set(['driver'], v)} />
                <${Field} label="What do they want? (to…)" value=${current.desire} onInput=${(v) => set(['desire'], v)} placeholder="to win her back" />
                <${Field} label="What forces block them?" value=${current.antagonist} onInput=${(v) => set(['antagonist'], v)} />
                <${Field} label="What do those forces want? (to… / not to…)" value=${current.antagonistDesire} onInput=${(v) => set(['antagonistDesire'], v)} placeholder="to keep the affair in the past" />
              </div>
            </div>
            <div><div class="kicker">Step 2 · Note opening value</div>
              <div class="fields two">
                <label class="field"><span class="field-label">Value at stake</span>
                  <input list="value-options" value=${current.value} onInput=${(e) => set(['value'], e.target.value)} placeholder="love / hate" />
                  <datalist id="value-options">${valueOptions.map((v) => html`<option value=${v} />`)}</datalist>
                </label>
                <${ChargePicker} label="Opening charge" value=${current.open} decl=${decl} onChange=${(v) => set(['open'], v)} />
              </div>
            </div>
            <div><div class="kicker">Step 3 · Break into beats (action / reaction, as gerunds)</div>
              <${ListEditor} items=${current.beats} onChange=${(v) => set(['beats'], v)} make=${() => ({ id: uid('b'), action: '', reaction: '' })} addLabel="Add beat"
                empty="A beat is an exchange of behaviour in action/reaction. A new beat begins only when behaviour clearly changes."
                render=${(b, i, s) => html`<div class="row top">
                  <label title="Turning point" style="padding-top:8px"><input type="radio" name="tp" checked=${current.turningBeat === i} onChange=${() => set(['turningBeat'], i)} /></label>
                  <b style="padding-top:8px">${i + 1}</b>
                  <${Field} class="grow" value=${b.action} onInput=${(v) => s({ action: v })} placeholder="Groveling at her feet" />
                  <span class="muted" style="padding-top:8px">/</span>
                  <${Field} class="grow" value=${b.reaction} onInput=${(v) => s({ reaction: v })} placeholder="Ignoring the plea" />
                </div>`} />
              ${current.beats.length > 0 && html`<p class="tiny muted">The radio button marks the beat where the turning point happens.</p>`}
            </div>
            <div><div class="kicker">Step 4 · Note closing value and compare</div>
              <div class="fields two">
                <${ChargePicker} label="Closing charge" value=${current.close} decl=${decl} onChange=${(v) => set(['close'], v)} />
                <div class=${cx('callout')} style=${d === 0 ? 'border-color:var(--warning)' : ''}>
                  ${d === null ? 'Set both charges to compare.' : d === 0 ? html`<b>Non-event.</b> The value doesn’t change — why is this scene in the story? Make it turn or cut it, weaving its exposition elsewhere.` : html`<b>The scene turns</b> ${d > 0 ? 'positive' : 'negative'} by ${Math.abs(d)} step${Math.abs(d) === 1 ? '' : 's'}: ${chargeLabel(current.open, decl)} → ${chargeLabel(current.close, decl)}.`}
                </div>
              </div>
              <${TurnScale} open=${current.open} close=${current.close} decl=${decl} />
            </div>
            <div><div class="kicker">Step 5 · Locate the turning point</div>
              <div class="fields two">
                <${Segmented} value=${current.turn} onChange=${(v) => set(['turn'], v)} options=${[{ id: 'action', label: 'Turns on action' }, { id: 'revelation', label: 'Turns on revelation' }]} />
                <${Toggle} label="Turns by coincidence" hint="Allowed early; never after the midpoint, never to end the story." checked=${current.coincidence} onChange=${(v) => set(['coincidence'], v)} />
                <${Field} label="Expectation (what the character thought would happen)" multiline value=${current.gapExpect} onInput=${(v) => set(['gapExpect'], v)} />
                <${Field} label="Result (what actually happened — the gap)" multiline value=${current.gapResult} onInput=${(v) => set(['gapResult'], v)} />
                <${Field} class="span2" label="Choice under pressure (if any): B vs. C, and the choice made" multiline value=${current.choice} onInput=${(v) => set(['choice'], v)} />
              </div>
            </div>
          </div>
        </${Card}>
        <div class="grid g2">
          <${Card} title="Subtext" kicker="The scene is not about what it seems to be about" cite="subtext">
            <${Field} multiline rows=${4} value=${current.subtext} onInput=${(v) => set(['subtext'], v)} placeholder="What are they really doing behind their masks? (Two people change a tire; boy has met girl.)" />
          </${Card}>
          <${Card} title="Staging" cite=${['rhythm-tempo', 'mystery-suspense-irony']}>
            <div class="fields">
              <div class="fields two">
                <${Field} label="Location" value=${current.location} onInput=${(v) => set(['location'], v)} />
                <${Field} label="Time" value=${current.time} onInput=${(v) => set(['time'], v)} />
              </div>
              <div class="fields two">
                <${Slider} label="Length (pages ≈ minutes)" value=${current.pages} min=${0.5} max=${10} step=${0.5} show=${(v) => v} onInput=${(v) => set(['pages'], v)} />
                <${Slider} label="Tempo (activity)" value=${current.tempo} min=${1} max=${5} step=${1} show=${(v) => `${v}/5`} onInput=${(v) => set(['tempo'], v)} />
              </div>
              <${Segmented} value=${current.mode} onChange=${(v) => set(['mode'], v)} options=${MODES.map((m) => ({ id: m.id, label: m.label, hint: m.hint }))} />
              <div class="row">${LEVELS.map((l) => html`<${Toggle} label=${l.label} checked=${current.levels[l.id]} onChange=${(v) => set(['levels', l.id], v)} />`)}</div>
            </div>
          </${Card}>
        </div>
        <${Card} title="Characters in this scene">
          ${story.characters.length ? html`<${Chips} items=${story.characters.map((c) => ({ id: c.id, label: c.name || 'Unnamed', color: c.color }))} value=${current.characters}
            onToggle=${(id) => set(['characters'], current.characters.includes(id) ? current.characters.filter((x) => x !== id) : [...current.characters, id])} />` : html`<p class="small muted">Create characters first.</p>`}
        </${Card}>
        <${Card} title="Treatment" kicker="Present tense, moment by moment, with subtext — no dialogue yet" cite="treatment">
          <${Field} multiline rows=${6} value=${current.treatment} onInput=${(v) => set(['treatment'], v)} placeholder="Jack leans on the jamb, exhausted…" />
        </${Card}>
        <div class="row"><${Btn} icon="left" onClick=${() => story.scenes[idx - 1] && go(href(story.id, 'scenes', story.scenes[idx - 1].id))} disabled=${idx === 0}>Previous</${Btn}>
          <span class="grow" />
          <${Btn} icon="plus" onClick=${() => addScene(idx)}>Insert scene after</${Btn}>
          <${Btn} icon="right" onClick=${() => story.scenes[idx + 1] && go(href(story.id, 'scenes', story.scenes[idx + 1].id))} disabled=${idx === story.scenes.length - 1}>Next</${Btn}></div>
      </div>`}
    </div>
  </${Page}>`;
}
