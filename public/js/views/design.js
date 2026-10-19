// Part 3 — Story design: inciting incident, acts & arc, gap lab, crisis/climax,
// subplots and composition.
import { html, useMemo, useState, cx } from '../lib.js';
import { t, tn } from '../i18n.js';
import { useStory } from '../store.js';
import { Page, Card, Field, Select, Slider, Toggle, Segmented, Principle, Cite, ListEditor, Btn, SceneSelect, href, go, Meter, ChargeChip, TurnArrow, rich } from '../ui.js';
import { ArcChart, FivePartBar, fivePart, RhythmChart, Swimlanes } from '../charts/structure.js';
import { GapLadder, QuestDiagram, DilemmaTriangle } from '../charts/diagrams.js';
import { ChartFrame, Legend } from '../charts/frame.js';
import { acts, timeline, protagonist, uid, sceneLabel, hasCharge, turnOf, endingType, PLOT_RELATIONS, MODES, PALETTE } from '../model.js';
import { chargeLabel } from '../kb/values.js';
import { LEVELS, IRONIC_PATTERNS, TRANSITION_HINGES, PROGRESSION_TECHNIQUES } from '../kb/principles.js';
import { AssistButton } from '../ai/assist.js';

const STAGE_LABELS = { positive: t('Positive'), contrary: t('Contrary'), contradictory: t('Contradictory'), negation: t('Negation of the Negation') };

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
// endingType() returns an id; the Climax card shows it as a sentence.
const READS_AS = { idealistic: t('Reads as idealistic'), pessimistic: t('Reads as pessimistic'), ironic: t('Reads as ironic') };

// ---- Inciting Incident & Spine --------------------------------------------------
export function IncitingView() {
  const { story, update, mutate } = useStory();
  const inc = story.inciting;
  const prot = protagonist(story);
  const spine = prot && (prot.unconscious || prot.conscious);
  const { inc: incItem, total } = fivePart(story);
  const pct = incItem ? incItem.startPct * 100 : null;
  const linkScene = (id) => mutate((s) => {
    s.inciting.sceneId = id;
    s.scenes.forEach((sc) => { if (sc.marker === 'inciting' && sc.id !== id) sc.marker = ''; });
    const sc = s.scenes.find((x) => x.id === id);
    if (sc && !sc.marker) sc.marker = 'inciting';
  });
  return html`<${Page} kicker=${t('Story design · ch. 8')} title=${t('Inciting Incident & Spine')} cites=${['inciting-incident', 'restore-balance', 'spine', 'onscreen']}
    intro=${t('The first major event radically upsets the balance of the protagonist’s life, arouses the desire to restore it, and launches the quest — raising the Major Dramatic Question and promising the Obligatory Scene.')}
    actions=${html`<${AssistButton} task="inciting" label=${t('Worst thing / best thing')} small=${false} />`}>
    <${Card} title=${t('The Quest')} kicker=${t('From balance to the object of desire')} cite="quest">
      <${QuestDiagram} conscious=${prot && prot.conscious} unconscious=${prot && prot.unconscious} inciting=${inc.event} spineText=${spine ? t('Spine: {desire}', { desire: spine }) : ''} />
      ${prot ? html`<p class="tiny muted">${t('Desires come from {name}’s character sheet.', { name: prot.name })} <a href=${href(story.id, 'characters', prot.id)}>${t('Edit desires')}</a></p>` : html`<p class="small muted">${t('Create a protagonist to define the object of desire.')}</p>`}
    </${Card}>
    <div class="grid g2 mt">
      <${Card} title=${t('The event')} cite="inciting-incident">
        <div class="fields">
          <${Field} label=${t('What happens?')} multiline rows=${3} value=${inc.event} onInput=${(v) => update(['inciting', 'event'], v)} placeholder=${t('A dynamic, fully developed event — not something static or vague.')} />
          <${SceneSelect} label=${t('Scene (central plot)')} value=${inc.sceneId} onChange=${linkScene} />
          <${Segmented} value=${inc.cause} onChange=${(v) => update(['inciting', 'cause'], v)} options=${[
            { id: 'decision-protagonist', label: t('Protagonist’s decision') }, { id: 'decision-other', label: t('Another’s decision') }, { id: 'coincidence', label: t('Coincidence') }]} />
          <${Segmented} value=${inc.shift} onChange=${(v) => update(['inciting', 'shift'], v)} options=${[{ id: -1, label: t('Balance swings negative') }, { id: 1, label: t('Balance swings positive') }]} />
          <${Toggle} label=${t('Happens onscreen')} hint=${t('The central plot’s Inciting Incident must be seen, not told in backstory.')} checked=${inc.onscreen} onChange=${(v) => update(['inciting', 'onscreen'], v)} />
          <${Field} label=${t('The protagonist’s reaction')} multiline value=${inc.reaction} onInput=${(v) => update(['inciting', 'reaction'], v)} placeholder=${t('Any reaction — even refusal — but not for long.')} />
        </div>
      </${Card}>
      <div class="stack">
        <${Card} title=${t('Placement')} kicker=${t('As soon as possible, but not until the moment is ripe')} cite="placement">
          ${pct == null ? html`<p class="small muted">${t('Link the event to a scene to see where it falls.')}</p>` : html`
            <${ChartFrame} label=${t('Inciting incident placement')}><svg viewBox="0 0 600 70">
              <rect x="10" y="26" width="580" height="16" rx="4" fill="var(--surface-3)" />
              <rect x="10" y="26" width=${580 * 0.25} height="16" rx="4" fill="var(--pos-wash)" />
              <line x1=${10 + 580 * 0.25} x2=${10 + 580 * 0.25} y1="20" y2="48" stroke="var(--ink-2)" />
              <text x=${10 + 580 * 0.25} y="62" text-anchor="middle" font-size="11">25%</text>
              <circle cx=${10 + 5.8 * pct} cy="34" r="8" fill=${pct <= 25 ? 'var(--pos)' : 'var(--warning)'} class="ring" data-tip=${t('Inciting Incident at {pct}%\n{start} of {total} pages', { pct: Math.round(pct), start: Math.round(incItem.start), total: Math.round(total) })} tabindex="0" />
              <text x=${10 + 5.8 * pct} y="14" text-anchor="middle" font-size="12" font-weight="700" class="t-ink">${Math.round(pct)}%</text>
            </svg></${ChartFrame}>
            <p class="small">${pct <= 25 ? t('Within the first quarter of the telling.') : t('Late: hold the audience with a setup subplot until the central plot ripens.')}</p>`}
        </${Card}>
        <${Card} title=${t('What it projects')} cite="onscreen">
          <div class="fields">
            <${Field} label=${t('Major Dramatic Question')} value=${inc.mdq} onInput=${(v) => update(['inciting', 'mdq'], v)} placeholder=${t('Will the sheriff kill the shark, or the shark the sheriff?')} />
            <${Field} label=${t('Obligatory Scene (the Crisis it promises)')} multiline value=${inc.obligatory} onInput=${(v) => update(['inciting', 'obligatory'], v)} placeholder=${t('The protagonist face to face with the most powerful forces of antagonism.')} />
          </div>
        </${Card}>
      </div>
    </div>
    <${Card} title=${t('Creating the Inciting Incident')} kicker=${t('The second hardest scene to write')} cite="worst-best" class="mt">
      <div class="grid g2">
        <${Field} label=${t('What is the worst thing that could happen to my protagonist — and how could it become the best?')} multiline rows=${4} value=${inc.worst} onInput=${(v) => update(['inciting', 'worst'], v)} />
        <${Field} label=${t('What is the best thing that could happen — and how could it become the worst?')} multiline rows=${4} value=${inc.best} onInput=${(v) => update(['inciting', 'best'], v)} />
      </div>
      <div class="mt"><${Field} label=${t('Notes')} multiline value=${inc.notes} onInput=${(v) => update(['inciting', 'notes'], v)} /></div>
    </${Card}>
  </${Page}>`;
}

// ---- Acts & arc ------------------------------------------------------------------
export function StructureView() {
  const { story, update } = useStory();
  const actList = acts(story);
  const tl = timeline(story);
  const decl = story.values.declension;
  const seqs = useMemo(() => {
    const map = new Map();
    story.scenes.forEach((s, i) => {
      if (!s.sequence) return;
      if (!map.has(s.sequence)) map.set(s.sequence, []);
      map.get(s.sequence).push({ s, i });
    });
    return [...map.entries()];
  }, [story.scenes]);
  const climaxes = actList.map((a) => a.climax).filter(Boolean);
  const pen = climaxes[climaxes.length - 2];
  const ult = climaxes[climaxes.length - 1];
  return html`<${Page} kicker=${t('Story design · ch. 2, 9')} title=${t('Acts & Value Arc')} cites=${['three-acts', 'act-rhythm', 'long-second-act', 'sequence']}
    intro=${t('Beats build scenes, scenes build sequences, sequences build acts, acts build the story to an absolute, irreversible climax. Acts are detected from scenes marked as act climax, crisis and story climax.')} wide>
    <${Card} title=${t('Five-part design')} cite="five-parts"><${FivePartBar} story=${story} width=${1100} /></${Card}>
    <${Card} title=${t('Value arc')} kicker=${decl.positive ? t('Primary value: {value}', { value: decl.positive }) : t('Scene by scene')} class="mt" cite="scene">
      <${ArcChart} story=${story} height=${380} onSelect=${(id) => go(href(story.id, 'scenes', id))} />
    </${Card}>
    <div class="grid g2 mt">
      <${Card} title=${t('Acts')} cite="act">
        ${!actList.length ? html`<p class="small muted">${t('No scenes yet.')}</p>` : html`<table class="table">
          <thead><tr><th>${t('Act')}</th><th class="num">${t('Length')}</th><th>${t('Climax scene')}</th><th>${t('Closing charge')}</th><th>${t('Stage')}</th></tr></thead>
          <tbody>${actList.map((a) => html`<tr>
            <td><b>${ROMAN[a.n] || a.n}</b></td>
            <td class="num">${Math.round((a.endPct - a.startPct) * 100)}%</td>
            <td>${a.climax ? html`<a href=${href(story.id, 'scenes', a.climax.id)}>${sceneLabel(story, a.climax.id)}</a>` : html`<span class="muted">${t('unfinished (no act climax yet)')}</span>`}</td>
            <td>${a.climax && html`<${ChargeChip} v=${a.climax.close} /> <span class="tiny muted">${hasCharge(a.climax.close) ? chargeLabel(a.climax.close, decl) : ''}</span>`}</td>
            <td class="small">${STAGE_LABELS[story.values.actStages[a.n]] || story.values.actStages[a.n] || html`<span class="muted">—</span>`}</td>
          </tr>`)}</tbody></table>`}
        ${pen && ult && hasCharge(pen.close) && hasCharge(ult.close) && html`<div class="callout mt">
          <b>${t('Act rhythm:')}</b> ${t('penultimate climax')} <${ChargeChip} v=${pen.close} /> → ${t('story climax')} <${ChargeChip} v=${ult.close} />. ${Math.sign(Number(pen.close)) === Math.sign(Number(ult.close)) && Number(ult.close) !== 0 ? t('The two last climaxes share a charge — the ending will feel halved.') : t('They contrast: the ending lands with full power.')}
        </div>`}
        <p class="tiny muted mt">${t('Total {n} pages. Mark scenes in the Scenes view to change the act structure.', { n: Math.round(tl.total) })}</p>
      </${Card}>
      <${Card} title=${t('Sequences')} kicker=${t('Two to five scenes building to greater impact')} cite="sequence">
        ${!seqs.length ? html`<p class="small muted">${t('Give scenes a sequence title (e.g. “NO JOB → JOB”) in the Scenes view.')}</p>` : html`<table class="table">
          <thead><tr><th>${t('Sequence')}</th><th>${t('Scenes')}</th><th>${t('From → to')}</th></tr></thead>
          <tbody>${seqs.map(([name, list]) => html`<tr>
            <td><b>${name}</b></td>
            <td class="small">${list.map(({ i }) => i + 1).join(', ')}</td>
            <td><${TurnArrow} open=${list[0].s.open} close=${list[list.length - 1].s.close} /></td>
          </tr>`)}</tbody></table>`}
      </${Card}>
    </div>
    <div class="grid g3 mt"><${Principle} id="long-second-act" compact /><${Principle} id="act-rhythm" compact /><${Principle} id="false-ending" compact /></div>
  </${Page}>`;
}

// ---- Gap Lab -----------------------------------------------------------------------
export function GapsView() {
  const { story, update } = useStory();
  const prot = protagonist(story);
  const [sel, setSel] = useState(0);
  const gaps = story.gaps;
  const g = gaps[sel];
  const levelCover = LEVELS.map((l) => ({ ...l, n: gaps.filter((x) => x.level === l.id).length + story.scenes.filter((s) => s.levels && s.levels[l.id]).length }));
  return html`<${Page} kicker=${t('Story design · ch. 7, 9')} title=${t('Gap Lab')} cites=${['the-gap', 'progressive-complications', 'law-of-conflict', 'inside-out']}
    intro=${t('The substance of story is the gap between what a character expects when he acts and what actually happens. Chart each escalating action: every gap is a point of no return.')}
    actions=${html`<${AssistButton} task="opposite" label=${t('What’s the opposite of that?')} input=${g ? t('Action: {action}\nExpectation: {expect}', { action: g.action, expect: g.expect }) : ''} small=${false} />`} wide>
    <${Card} title=${t('Progressive complications')} kicker=${prot ? t('{name}’s ladder of risk', { name: prot.name }) : t('The protagonist’s ladder of risk')}>
      <${GapLadder} gaps=${gaps} objectText=${prot && prot.conscious} />
    </${Card}>
    <div class="grid g-side mt">
      <${Card} title=${t('Actions, expectations, results')}>
        <${ListEditor} items=${gaps} onChange=${(v) => update(['gaps'], v)} make=${() => ({ id: uid('g'), action: '', expect: '', result: '', level: 'extra', risk: Math.min(10, (Number((gaps[gaps.length - 1] || {}).risk) || 0) + 1), sceneId: '' })} addLabel=${t('Add action')}
          empty=${t('Start with the minimum, conservative action your protagonist takes after the Inciting Incident.')}
          render=${(x, i, set) => html`<div class="fields" onfocusin=${() => setSel(i)}>
            <div class="row"><b>${i + 1}.</b><${Field} class="grow" value=${x.action} onInput=${(v) => set({ action: v })} placeholder=${t('The action taken')} /></div>
            <div class="fields two">
              <${Field} label=${t('Expected reaction')} value=${x.expect} onInput=${(v) => set({ expect: v })} />
              <${Field} label=${t('What actually happens (the gap)')} value=${x.result} onInput=${(v) => set({ result: v })} />
            </div>
            <div class="fields three">
              <${Select} label=${t('Gap opens from')} value=${x.level} options=${LEVELS.map((l) => ({ id: l.id, label: l.long }))} onChange=${(v) => set({ level: v })} />
              <${Slider} label=${t('Risk')} value=${x.risk} min=${0} max=${10} step=${1} show=${(v) => `${v}/10`} onInput=${(v) => set({ risk: v })} />
              <${SceneSelect} label=${t('Scene')} value=${x.sceneId} onChange=${(v) => set({ sceneId: v })} />
            </div>
            ${i > 0 && Number(x.risk) <= Number(gaps[i - 1].risk) && html`<p class="small" style="color:var(--serious)">${t('⚠ Not riskier than the previous action: the story retreats. Points of no return rule out actions of lesser magnitude.')}</p>`}
          </div>`} />
      </${Card}>
      <div class="stack">
        <${Card} title=${t('Pry open the gap')} cite="inside-out">
          <ol class="small" style="padding-left:18px;margin:0">
            <li>${rich('Enter the character: <i>“If I were this character in these circumstances, what would I do?”</i>')}</li>
            <li>${t('Find the minimum, conservative action they believe will work.')}</li>
            <li>${rich('Step outside and ask: <i>“What is the opposite of that?”</i> Let the world react differently or more powerfully.')}</li>
            <li>${t('Back inside: what riskier action does the new reality demand?')}</li>
          </ol>
        </${Card}>
        <${Card} title=${t('Complexity')} kicker=${t('Conflict on all three levels')} cite="complexity">
          <div class="stack">${levelCover.map((l) => html`<${Meter} label=${`${l.long}: ${l.n}`} value=${Math.min(l.n, 10)} max=${10} />`)}</div>
          <p class="tiny muted mt">${t('Counts gaps above plus scenes tagged with each level. Conflict on only one level is mere complication.')}</p>
        </${Card}>
        <${Principle} id="risk" compact />
      </div>
    </div>
  </${Page}>`;
}

// ---- Crisis, Climax, Resolution --------------------------------------------------
export function CrisisView() {
  const { story, update } = useStory();
  const cr = story.crisis; const cl = story.climax; const rs = story.resolution;
  const prot = protagonist(story);
  const ending = endingType(story);
  const subs = story.plotlines.filter((p) => p.id !== 'main');
  const TYPES = [{ id: 'irreconcilable', label: t('Irreconcilable goods') }, { id: 'lesser-evil', label: t('Lesser of two evils') }, { id: 'both', label: t('Both at once') }];
  return html`<${Page} kicker=${t('Story design · ch. 13')} title=${t('Crisis · Climax · Resolution')} cites=${['crisis', 'climax', 'inevitable-unexpected', 'resolution']}
    intro=${t('The Crisis is the ultimate decision — danger and opportunity — facing the most powerful forces of antagonism. The Climax is a meaningful, absolute, irreversible change. Meaning produces emotion.')}
    actions=${html`<${AssistButton} task="crisis" label=${t('Design the Crisis dilemma')} small=${false} />`}>
    <${Card} title=${t('The Crisis dilemma')} kicker=${t('A caught between B and C')} cite=${['dilemma', 'crisis']}>
      <div class="row mb"><${Segmented} value=${cr.dilemma} onChange=${(v) => update(['crisis', 'dilemma'], v)} options=${TYPES} /></div>
      <${DilemmaTriangle} type=${TYPES.find((x) => x.id === cr.dilemma).label}
        a=${html`<b>${prot ? prot.name : t('The protagonist')}</b><textarea class="input mt" rows="2" placeholder=${t('The decision made under maximum pressure')} value=${cr.choice} onInput=${(e) => update(['crisis', 'choice'], e.target.value)} />`}
        b=${html`<textarea class="input" rows="3" placeholder=${cr.dilemma === 'lesser-evil' ? t('An evil he wants to avoid…') : t('A good he wants…')} value=${cr.optionB} onInput=${(e) => update(['crisis', 'optionB'], e.target.value)} />`}
        c=${html`<textarea class="input" rows="3" placeholder=${cr.dilemma === 'lesser-evil' ? t('…and another, equally undesirable') : t('…and another he can’t have at the same time')} value=${cr.optionC} onInput=${(e) => update(['crisis', 'optionC'], e.target.value)} />`} />
      <div class="fields two mt">
        <${SceneSelect} label=${t('Crisis scene (the Obligatory Scene)')} value=${cr.sceneId} onChange=${(v) => update(['crisis', 'sceneId'], v)} />
        <${Toggle} label=${t('Crisis and Climax in the same scene')} hint=${t('If not, splice them together on a cut — no subplot in between.')} checked=${cr.sameScene} onChange=${(v) => update(['crisis', 'sameScene'], v)} />
      </div>
      <p class="small muted mt">${t('Freeze the decision: a deliberately static moment the audience suffers through with the protagonist.')} <${Cite} id="crisis-static" /></p>
    </${Card}>
    <div class="grid g2 mt">
      <${Card} title=${t('Climax')} kicker=${READS_AS[ending]} cite=${['climax', 'crisis-within-climax', 'key-image']}>
        <div class="fields">
          <${SceneSelect} label=${t('Story Climax scene')} value=${cl.sceneId} onChange=${(v) => update(['climax', 'sceneId'], v)} />
          <${Field} label=${t('The climactic action (pure, self-evident, needs no explanation)')} multiline value=${cl.action} onInput=${(v) => update(['climax', 'action'], v)} />
          <${Field} label=${t('Turning point within the climax (expectation vs. result one last time)')} multiline value=${cl.turning} onInput=${(v) => update(['climax', 'turning'], v)} />
          <${Field} label=${t('Key image (spectacle and truth)')} multiline value=${cl.keyImage} onInput=${(v) => update(['climax', 'keyImage'], v)} />
          <${Segmented} value=${cl.causedBy} onChange=${(v) => update(['climax', 'causedBy'], v)} options=${[{ id: 'choice', label: t('Caused by the protagonist’s choice') }, { id: 'coincidence', label: t('Caused by coincidence') }]} />
          ${cl.causedBy === 'coincidence' && html`<p class="err">${t('Deus ex machina: an ending by coincidence erases meaning and insults the audience.')} <${Cite} id="coincidence" /></p>`}
        </div>
      </${Card}>
      <div class="stack">
        <${Card} title=${t('Inevitable and unexpected')} cite="inevitable-unexpected">
          <div class="fields">
            <${Field} label=${t('Why, looking back, was this the only possible path?')} multiline value=${cl.inevitable} onInput=${(v) => update(['climax', 'inevitable'], v)} />
            <${Field} label=${t('How does it deliver the promised emotion in a way no one expects?')} multiline value=${cl.unexpected} onInput=${(v) => update(['climax', 'unexpected'], v)} />
          </div>
        </${Card}>
        <${Card} title=${t('Resolution')} cite="resolution">
          <div class="stack">
            <${Toggle} label=${t('Climax a leftover subplot')} checked=${rs.subplot} onChange=${(v) => update(['resolution', 'subplot'], v)} />
            <${Toggle} label=${t('Show the spread of climactic effects across the cast')} checked=${rs.spread} onChange=${(v) => update(['resolution', 'spread'], v)} />
            <${Toggle} label=${t('Slow curtain: let the audience catch its breath')} checked=${rs.curtain} onChange=${(v) => update(['resolution', 'curtain'], v)} />
            <${Field} multiline value=${rs.text} onInput=${(v) => update(['resolution', 'text'], v)} placeholder=${t('What happens after the climax')} />
          </div>
        </${Card}>
        ${subs.length > 0 && html`<${Card} title=${t('Subplot climaxes')} kicker=${t('Inside the central climax if logic allows; otherwise least important first')}>
          ${subs.map((p) => html`<div class="row small"><span class="nav-dot" style=${`background:${p.color}`} /> ${p.name}</div>`)}
        </${Card}>`}
      </div>
    </div>
  </${Page}>`;
}

// ---- Subplots --------------------------------------------------------------------
export function SubplotsView() {
  const { story, update, mutate } = useStory();
  const counts = Object.fromEntries(story.plotlines.map((p) => [p.id, story.scenes.filter((s) => (s.plotline || 'main') === p.id).length]));
  const remove = (id) => mutate((s) => {
    s.plotlines = s.plotlines.filter((p) => p.id !== id);
    s.scenes.forEach((sc) => { if (sc.plotline === id) sc.plotline = 'main'; });
  });
  return html`<${Page} kicker=${t('Story design · ch. 9')} title=${t('Subplots & Multiple Plots')} cites=${['subplots', 'long-second-act']}
    intro=${t('A subplot must contradict the Controlling Idea (irony), resonate it (variation), set up a late central plot, or complicate the central plot. One that merely runs alongside splits the story in two.')} wide>
    <${Card} title=${t('Plotlines across the telling')}>
      <${Swimlanes} story=${story} onSelect=${(id) => go(href(story.id, 'scenes', id))} />
      <p class="tiny muted">${t('Assign scenes to plotlines in the Scenes view. Labels mark inciting incidents (II), act climaxes (AC), crisis (CR) and climax (CL).')}</p>
    </${Card}>
    <div class="grid g2 mt">
      ${story.plotlines.map((p, i) => html`<${Card} title=${p.name || t('Untitled plotline')} kicker=${p.id === 'main' ? t('Central plot') : tn(counts[p.id], 'Subplot · {n} scene', 'Subplot · {n} scenes')}
        actions=${p.id !== 'main' && html`<${Btn} small kind="danger" icon="trash" onClick=${() => remove(p.id)} title=${t('Remove plotline')} />`}>
        <div class="fields">
          <div class="row"><input type="color" value=${p.color} onInput=${(e) => update(['plotlines', i, 'color'], e.target.value)} style="width:34px;height:30px;border:0;background:none" title=${t('Color')} />
          <${Field} class="grow" value=${p.name} onInput=${(v) => update(['plotlines', i, 'name'], v)} /></div>
          ${p.id !== 'main' && html`<${Select} label=${t('Relationship to the central plot')} value=${p.relation} options=${PLOT_RELATIONS.filter((r) => r.id !== 'central')} onChange=${(v) => update(['plotlines', i, 'relation'], v)} />`}
          ${p.id !== 'main' && !p.relation && html`<p class="small" style="color:var(--serious)">${t('⚠ Runs alongside: give it a structural or thematic job, or cut it.')}</p>`}
          <${Field} label=${t('Protagonist & desire')} value=${p.protagonist || ''} onInput=${(v) => update(['plotlines', i, 'protagonist'], v)} />
        </div>
      </${Card}>`)}
    </div>
    <div class="row mt"><${Btn} kind="primary" icon="plus" onClick=${() => mutate((s) => { s.plotlines.push({ id: uid('pl'), name: t('New subplot'), relation: 'complicate', color: PALETTE[s.plotlines.length % PALETTE.length] }); })}>${t('Add subplot')}</${Btn}></div>
  </${Page}>`;
}

// ---- Composition -------------------------------------------------------------------
export function CompositionView() {
  const { story, update } = useStory();
  const comp = story.composition;
  const n = story.scenes.length;
  const runs = useMemo(() => {
    const out = new Set();
    let run = [0];
    for (let i = 1; i < n; i++) {
      const a = Math.sign(turnOf(story.scenes[i - 1]) || 0); const b = Math.sign(turnOf(story.scenes[i]) || 0);
      if (b !== 0 && a === b) run.push(i); else { if (run.length >= 3) run.forEach((k) => out.add(k)); run = [i]; }
    }
    if (run.length >= 3) run.forEach((k) => out.add(k));
    return out;
  }, [story.scenes]);
  const modeColor = { suspense: 'var(--s1)', mystery: 'var(--s2)', irony: 'var(--s3)' };
  return html`<${Page} kicker=${t('Story design · ch. 10, 12, 16')} title=${t('Composition')} cites=${['unity', 'pacing', 'rhythm-tempo', 'diminishing-returns', 'transition']}
    intro=${t('Ordering and linking scenes: alternate the charges, pace tension and release, shorten scenes into the act climaxes, and hinge every transition.')} wide>
    <${Card} title=${t('Rhythm & tempo')} kicker=${t('Shorter, brisker scenes into climaxes — then earn the pause')} cite="rhythm-tempo">
      <${RhythmChart} story=${story} onSelect=${(id) => go(href(story.id, 'scenes', id))} />
    </${Card}>
    <div class="grid g2 mt">
      <${Card} title=${t('Emotional transitions')} kicker=${t('Law of Diminishing Returns')} cite=${['emotional-transitions', 'diminishing-returns']}>
        <${ChartFrame} label=${t('Direction of each scene turn')}>
          <svg viewBox=${`0 0 ${Math.max(300, n * 22)} 70`}>
            ${story.scenes.map((s, i) => {
              const d = turnOf(s); const x = i * 22 + 11;
              return html`<g>
                ${runs.has(i) && html`<rect x=${x - 11} y="4" width="22" height="46" fill="color-mix(in srgb, var(--warning) 22%, transparent)" />`}
                <text x=${x} y="34" text-anchor="middle" font-size="18" font-weight="700" style=${`fill:${d > 0 ? 'var(--pos)' : d < 0 ? 'var(--neg)' : 'var(--muted)'}`} tabindex="0"
                  data-tip=${`${i + 1}. ${s.title}\n${d == null ? t('charges not set') : d > 0 ? t('turns positive') : d < 0 ? t('turns negative') : t('does not turn')}${runs.has(i) ? `\n${t('Part of a run of 3+ same-direction turns')}` : ''}`}>${d == null ? '·' : d > 0 ? '↑' : d < 0 ? '↓' : '='}</text>
                <text x=${x} y="64" text-anchor="middle" font-size="9.5" class="t-muted">${i + 1}</text>
              </g>`;
            })}
          </svg>
        </${ChartFrame}>
        <p class="small">${runs.size ? t('Highlighted: runs of three or more turns in the same direction. Unless the contrast is enormous, the third will fall flat — or turn comic.') : t('Charges alternate well between positive and negative transitions.')}</p>
      </${Card}>
      <${Card} title=${t('Mystery · Suspense · Dramatic irony')} kicker=${t('What the audience knows vs. the characters')} cite="mystery-suspense-irony">
        <${ChartFrame} label=${t('Audience knowledge mode by scene')}>
          <svg viewBox=${`0 0 ${Math.max(300, n * 22)} 40`}>
            ${story.scenes.map((s, i) => html`<rect x=${i * 22 + 1} y="6" width="20" height="20" rx="4" fill=${modeColor[s.mode] || 'var(--s1)'} tabindex="0" data-tip=${`${(MODES.find((m) => m.id === s.mode) || MODES[0]).label}\n${i + 1}. ${s.title}`} />`)}
          </svg>
        </${ChartFrame}>
        <${Legend} items=${MODES.map((m) => ({ color: modeColor[m.id], label: `${m.label}: ${m.hint}`, shape: 'box' }))} />
      </${Card}>
    </div>
    <div class="grid g2 mt">
      <${Card} title=${t('Expressing progression')} cite=${['social-progression', 'personal-progression', 'symbolic-ascension', 'ironic-ascension']}>
        <div class="fields">${PROGRESSION_TECHNIQUES.map((pt) => html`<${Field} label=${`${pt.label} — ${pt.hint}`} multiline value=${comp.techniques[pt.id]} onInput=${(v) => update(['composition', 'techniques', pt.id], v)} />`)}</div>
      </${Card}>
      <${Card} title=${t('Ironic patterns')} kicker=${t('Turn progression on irony')} cite="ironic-ascension">
        <div class="stack">${IRONIC_PATTERNS.map((p, i) => html`<label class="conv" style="cursor:pointer">
          <input type="radio" name="irony" checked=${comp.ironicPattern === i} onChange=${() => update(['composition', 'ironicPattern'], i)} />
          <span class="small">${p}</span></label>`)}
          <${Btn} small onClick=${() => update(['composition', 'ironicPattern'], -1)}>${t('None')}</${Btn}>
        </div>
      </${Card}>
    </div>
    <${Card} title=${t('Transitions')} kicker=${t('The hinge between the tail of one scene and the head of the next')} cite="transition" class="mt">
      ${n < 2 ? html`<p class="small muted">${t('Add at least two scenes.')}</p>` : html`<table class="table">
        <thead><tr><th>${t('From → to')}</th><th>${t('Hinge')}</th><th>${t('What they share or oppose')}</th></tr></thead>
        <tbody>${story.scenes.slice(0, -1).map((s, i) => html`<tr>
          <td class="small">${i + 1}. ${s.title || t('Untitled')} → ${i + 2}. ${story.scenes[i + 1].title || t('Untitled')}</td>
          <td style="width:170px"><select class="input" style="font-size:13px;padding:4px" value=${s.transition.hinge} onChange=${(e) => update(['scenes', i, 'transition', 'hinge'], e.target.value)}>
            <option value="">—</option>${TRANSITION_HINGES.map((h) => html`<option value=${h.id} selected=${s.transition.hinge === h.id}>${h.label}</option>`)}
          </select></td>
          <td><input class="input" style="font-size:13px;padding:4px 6px" value=${s.transition.link} onInput=${(e) => update(['scenes', i, 'transition', 'link'], e.target.value)} placeholder=${t('in common / in opposition')} /></td>
        </tr>`)}</tbody></table>`}
    </${Card}>
  </${Page}>`;
}
