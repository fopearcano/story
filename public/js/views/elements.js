// Part 2 — The Elements of Story: meaning, the triangle, setting, genre,
// values and the principle of antagonism.
import { html, useMemo, cx } from '../lib.js';
import { useStory } from '../store.js';
import { Page, Card, Field, Select, Slider, Toggle, Segmented, Principle, Cite, ListEditor, Btn, href, Meter } from '../ui.js';
import { ZigZag } from '../charts/structure.js';
import { TriangleChart, ConflictRings, DeclensionDiagram } from '../charts/diagrams.js';
import { controllingIdeaSentence, endingType, storyStats, uid, protagonist, acts, hasCharge } from '../model.js';
import { CONTRASTS, CORNERS, classifyDesign, trianglePulls, triangleWeights } from '../kb/triangle.js';
import { GENRES, genreById } from '../kb/genres.js';
import { DECLENSIONS, VALUE_PAIRS } from '../kb/values.js';
import { LEVELS } from '../kb/principles.js';
import { AssistButton } from '../ai/assist.js';

// ---- Premise & Controlling Idea ------------------------------------------------
export function MeaningView() {
  const { story, update } = useStory();
  const m = story.meaning;
  const sentence = controllingIdeaSentence(story);
  const ending = endingType(story);
  const ENDINGS = [
    { id: 'idealistic', title: 'Idealist', sub: 'Up-ending', text: 'Life as we wish it to be: optimism, hope, the positive charge of the human spirit.' },
    { id: 'pessimistic', title: 'Pessimist', sub: 'Down-ending', text: 'Life as we dread it to be but know it so often is: loss, decline, misfortune.' },
    { id: 'ironic', title: 'Ironist', sub: 'Up/down-ending', text: 'Both at once, clearly separated: what’s gained and what’s lost. The hardest to write; the longest-lasting.' },
  ];
  return html`<${Page} kicker="Elements of story · ch. 6" title="Premise & Meaning" cites=${['premise', 'controlling-idea', 'idea-counter-idea']}
    intro="Two ideas bracket the creative process: the open Premise that inspires you, and the Controlling Idea your climax finally proves — Value plus Cause."
    actions=${html`<${AssistButton} task="controlling-idea" label="Find the Controlling Idea" small=${false} />`}>
    <div class="grid g2">
      <${Card} title="Premise" kicker="What would happen if…?" cite="premise">
        <${Field} multiline rows=${4} value=${story.premise} onInput=${(v) => update(['premise'], v)} placeholder="What would happen if a shark swam into a beach resort and devoured a vacationer?" />
        <p class="small muted mt">A premise is not precious. If the story takes a left turn, follow the story.</p>
      </${Card}>
      <${Card} title="Controlling Idea" kicker="One sentence: Value + Cause" cite="controlling-idea">
        <div class="fields">
          <${Segmented} value=${m.charge} onChange=${(v) => update(['meaning', 'charge'], v)} options=${[
            { id: 'positive', label: '+ Positive value' }, { id: 'negative', label: '− Negative value' }, { id: 'ironic', label: '± Ironic' }]} />
          <${Field} label="Value — the charge the climax brings into the protagonist’s world" value=${m.value} onInput=${(v) => update(['meaning', 'value'], v)} placeholder=${m.charge === 'negative' ? 'Tyranny prevails' : 'Justice is restored'} />
          <${Field} label="Cause — the chief reason it changed" value=${m.cause} onInput=${(v) => update(['meaning', 'cause'], v)} placeholder="because the protagonist is more clever than the criminal" />
        </div>
        <div class="callout mt">${sentence ? html`<div class="big-quote">${sentence}</div>` : html`<div class="big-quote placeholder">Your Controlling Idea will appear here.</div>`}</div>
      </${Card}>
    </div>
    <div class="grid g2 mt">
      <${Card} title="Idea vs. Counter-Idea" kicker="The dramatized argument" cite=${['idea-counter-idea', 'didacticism']}>
        <${Field} label="Counter-Idea (the negative voice that argues against your ending)" multiline value=${m.counterIdea} onInput=${(v) => update(['meaning', 'counterIdea'], v)} placeholder="Crime pays because the criminals are brilliant and ruthless." />
        <div class="mt"><${ZigZag} story=${story} /></div>
        <p class="tiny muted">Built from scenes marked as sequence, act and story climaxes. Build both sides with equal truth and energy.</p>
      </${Card}>
      <${Card} title="Idealist, pessimist, ironist" kicker=${`Your climax reads as ${ending}`} cite="idealist-pessimist-ironist">
        <div class="stack">
          ${ENDINGS.map((e) => html`<div class=${cx('callout')} style=${ending === e.id ? 'border-color:var(--ink);box-shadow:inset 3px 0 0 var(--ink)' : ''}>
            <b>${e.title}</b> <span class="muted small">· ${e.sub}</span>${ending === e.id && html` <span class="chip marker">YOUR STORY</span>`}<p>${e.text}</p></div>`)}
        </div>
        <div class="mt"><${Field} label="Is this the truth? Do you believe it?" multiline value=${m.notes} onInput=${(v) => update(['meaning', 'notes'], v)} placeholder="Notes on meaning, self-recognition, what the climax surprised you with…" /></div>
      </${Card}>
    </div>
    <div class="grid g3 mt">
      <${Principle} id="storytelling-proof" /><${Principle} id="didacticism" /><${Principle} id="tell-the-truth" />
    </div>
  </${Page}>`;
}

// ---- Story triangle ------------------------------------------------------------
export function TriangleView() {
  const { story, update } = useStory();
  const t = story.triangle;
  const design = classifyDesign(t);
  const { m, a } = trianglePulls(t);
  const w = triangleWeights(m, a);
  const audience = t.stasis ? 0.12 : Math.max(0.12, w.arch * 1 + w.mini * 0.45 + w.anti * 0.25);
  return html`<${Page} kicker="Elements of story · ch. 2" title="The Story Triangle" cites=${['archplot', 'miniplot', 'antiplot', 'formal-contrasts']}
    intro="Every story sits somewhere in the triangle of formal possibilities. Slide each of the seven contrasts to locate yours — and to choose it consciously." wide>
    <div class="grid g2">
      <${Card}>
        <${TriangleChart} triangle=${t} title=${story.title} />
        <p class="tiny muted">Grey dots: films McKee places on his triangle (approximate positions), for orientation.</p>
      </${Card}>
      <div class="stack">
        <${Card} title=${`${CORNERS[design].name} — ${CORNERS[design].sub}`} cite=${design === 'arch' ? 'archplot' : design === 'mini' ? 'miniplot' : design === 'anti' ? 'antiplot' : 'nonplot'}>
          <p>${CORNERS[design].desc}</p>
          <div class="grid g3 mt">
            <${Meter} label=${`Archplot ${Math.round(w.arch * 100)}%`} value=${w.arch} />
            <${Meter} label=${`Miniplot ${Math.round(w.mini * 100)}%`} value=${w.mini} />
            <${Meter} label=${`Antiplot ${Math.round(w.anti * 100)}%`} value=${w.anti} />
          </div>
          <div class="mt"><${Meter} label=${`Potential audience — ${audience > 0.7 ? 'wide' : audience > 0.4 ? 'moderate' : 'small, cinephile'}`} value=${audience} tone=${audience < 0.4 ? 'warn' : ''} /></div>
          <p class="tiny muted mt">As design moves away from the Archplot, the audience shrinks — not for lack of quality. <${Cite} id="audience-shrinks" /></p>
        </${Card}>
        <${Card} title="The seven formal contrasts">
          <div class="fields">
            ${CONTRASTS.map((c) => html`<${Slider} label=${c.corner === 'mini' ? 'Toward Miniplot' : 'Toward Antiplot'} value=${t[c.id]} min=${0} max=${1} step=${0.05}
              left=${c.arch} right=${c.other} hint=${c.hint} onInput=${(v) => update(['triangle', c.id], v)} />`)}
            <${Toggle} label="Stasis: life does not change (Nonplot)" hint="The value-charged condition at the end equals the opening — portraiture, not story." checked=${t.stasis} onChange=${(v) => update(['triangle', 'stasis'], v)} />
            <${Field} label="Why this design? Do you believe life is like this?" multiline value=${t.notes} onInput=${(v) => update(['triangle', 'notes'], v)} />
          </div>
        </${Card}>
      </div>
    </div>
  </${Page}>`;
}

// ---- Setting & world -------------------------------------------------------------
export function SettingView() {
  const { story, update } = useStory();
  const st = story.setting;
  const stats = storyStats(story);
  const WORLD = [
    ['work', 'How do my characters make a living? Play? Pray? Make love?'],
    ['politics', 'Politics: how is power distributed — in society, at work, in the family, in love?'],
    ['rituals', 'Rituals: meals, ceremonies, private rites'],
    ['values', 'Values: what is good, evil, right, wrong, legal? What is worth living or dying for?'],
    ['biographies', 'Biographies: how has life shaped them, from birth to the opening scene?'],
    ['laws', 'Laws of probability: how and why do things happen in this world?'],
  ];
  return html`<${Page} kicker="Elements of story · ch. 3 & 8" title="Setting & World" cites=${['setting-4d', 'creative-limitation', 'laws-of-probability']}
    intro="Cliché comes from not knowing the world of your story. Define it in four dimensions, make it small enough to know like a god, and research it from memory, imagination and fact.">
    <div class="grid g4">
      <${Card} title="Period" kicker="Place in time"><${Field} multiline value=${st.period} onInput=${(v) => update(['setting', 'period'], v)} placeholder="Contemporary? History? A hypothetical future?" /></${Card}>
      <${Card} title="Duration" kicker="Length through time"><${Field} multiline value=${st.duration} onInput=${(v) => update(['setting', 'duration'], v)} placeholder="Decades? A year? One night?" /></${Card}>
      <${Card} title="Location" kicker="Place in space"><${Field} multiline value=${st.location} onInput=${(v) => update(['setting', 'location'], v)} placeholder="Which town, street, building, room?" /></${Card}>
      <${Card} title="Level of conflict" kicker="The human dimension">
        <div class="stack">${LEVELS.map((l) => html`<${Toggle} label=${l.long} hint=${l.hint} checked=${st.levels[l.id]} onChange=${(v) => update(['setting', 'levels', l.id], v)} />`)}</div>
      </${Card}>
    </div>
    <div class="grid g-side mt">
      <${Card} title="The world of the story" kicker="Questions every writer asks" cite="world-questions">
        <div class="fields">${WORLD.map(([k, q]) => html`<${Field} label=${q} multiline value=${st.world[k]} onInput=${(v) => update(['setting', 'world', k], v)} />`)}</div>
      </${Card}>
      <div class="stack">
        <${Card} title="A small, knowable world" cite="creative-limitation">
          <div class="stats"><div class="stat"><div class="stat-n">${stats.characters}</div><div class="stat-label">characters</div></div><div class="stat"><div class="stat-n">${stats.locations}</div><div class="stat-label">locations (from scenes)</div></div></div>
          <div class="mt"><${Meter} label="Breadth of world" value=${Math.min(1, (stats.characters + stats.locations) / 40)} tone=${stats.characters + stats.locations > 40 ? 'warn' : ''} /></div>
          <p class="small muted mt">The larger the world, the thinner your knowledge and the more clichéd the choices. Don’t proliferate characters or locations.</p>
        </${Card}>
        <${Card} title="Rules of this world" kicker="Once set, never broken" cite="laws-of-probability">
          <${ListEditor} items=${st.rules.map((r, i) => ({ id: String(i), text: r }))} onChange=${(items) => update(['setting', 'rules'], items.map((x) => x.text))}
            make=${() => ({ text: '' })} addLabel="Add rule" empty="No rules recorded yet."
            render=${(it, i, set) => html`<${Field} value=${it.text} onInput=${(v) => set({ text: v })} placeholder="e.g. No human can catch Roger — he can turn two-dimensional." />`} />
        </${Card}>
        <${Card} title="Research" kicker="Memory · imagination · fact" cite="research">
          <div class="fields">
            <${Field} label="Memory: what do I know from experience?" multiline value=${st.research.memory} onInput=${(v) => update(['setting', 'research', 'memory'], v)} />
            <${Field} label="Imagination: living my character’s life hour by hour" multiline value=${st.research.imagination} onInput=${(v) => update(['setting', 'research', 'imagination'], v)} />
            <${Field} label="Fact: what have I studied?" multiline value=${st.research.fact} onInput=${(v) => update(['setting', 'research', 'fact'], v)} />
          </div>
        </${Card}>
      </div>
    </div>
  </${Page}>`;
}

// ---- Genre ----------------------------------------------------------------------
export function GenreView() {
  const { story, update } = useStory();
  const g = story.genres;
  const pick = (id) => {
    if (g.primary === id) update(['genres', 'primary'], '');
    else if (!g.primary) update(['genres', 'primary'], id);
    else if (g.secondary.includes(id)) update(['genres', 'secondary'], g.secondary.filter((x) => x !== id));
    else update(['genres', 'secondary'], [...g.secondary, id]);
  };
  const chosen = [g.primary, ...g.secondary].filter(Boolean).map(genreById).filter(Boolean);
  const groups = [['basic', 'Genres'], ['mega', 'Mega-genres'], ['supra', 'Supra-genres']];
  const TT = [['character', 'a character'], ['setting', 'the setting'], ['theme', 'the theme'], ['genre', 'the genre']];
  return html`<${Page} kicker="Elements of story · ch. 4" title="Genre" cites=${['genre-conventions', 'convention-vs-cliche', 'mixing-genres']}
    intro="We are all genre writers. Identify your genre (or blend), master its conventions, and fulfil them in ways the audience has never seen. First click sets the primary genre; further clicks mix in others.">
    <${Card} title="The screenwriter’s genre system" kicker="25 genres" cite="genre-study">
      ${groups.map(([grp, label]) => html`<div class="kicker" style="margin:10px 0 6px">${label}</div>
        <div class="genre-grid">${GENRES.filter((x) => x.group === grp).map((x) => html`<button type="button" class=${cx('genre-btn', g.primary === x.id && 'primary', g.secondary.includes(x.id) && 'secondary')} onClick=${() => pick(x.id)} title=${x.summary}>
          <b>${x.n}. ${x.name}</b><span>${g.primary === x.id ? 'Primary' : g.secondary.includes(x.id) ? 'Mixed in' : x.sub.slice(0, 2).join(', ') || x.summary.slice(0, 40)}</span>
        </button>`)}</div>`)}
    </${Card}>
    ${chosen.length ? html`<div class="grid g2 mt">
      ${chosen.map((x) => html`<${Card} title=${x.name} kicker=${g.primary === x.id ? 'Primary genre' : 'Mixed genre'}>
        <p class="small">${x.summary}</p>
        ${x.sub.length > 0 && html`<p class="tiny muted">Subgenres: ${x.sub.join(' · ')}</p>`}
        <div class="kicker mt">Conventions — and how you’ll make each fresh</div>
        ${x.conventions.map((cv, i) => {
          const key = `${x.id}:${i}`;
          return html`<div class="conv">
            <input type="checkbox" checked=${!!g.checks[key]} onChange=${(e) => update(['genres', 'checks', key], e.target.checked)} aria-label=${cv} />
            <div class="stack" style="gap:4px"><span class="small">${cv}</span>
              <input class="input" style="font-size:13px;padding:5px 8px" placeholder="My fresh take…" value=${g.fresh[key] || ''} onInput=${(e) => update(['genres', 'fresh', key], e.target.value)} /></div>
          </div>`;
        })}
        ${x.cliches.length > 0 && html`<div class="callout mt"><b>Clichés to avoid:</b> ${x.cliches.join('; ')}</div>`}
      </${Card}>`)}
    </div>` : html`<p class="muted mt">Pick a genre above to see its conventions.</p>`}
    <div class="grid g2 mt">
      <${Card} title="Genre study" kicker="Works like yours — successes and failures" cite="genre-study">
        <${ListEditor} items=${g.comparables} onChange=${(v) => update(['genres', 'comparables'], v)} make=${() => ({ id: uid('w'), title: '', notes: '' })} addLabel="Add a comparable work"
          render=${(it, i, set) => html`<div class="fields two"><${Field} value=${it.title} onInput=${(v) => set({ title: v })} placeholder="Title" /><${Field} value=${it.notes} onInput=${(v) => set({ notes: v })} placeholder="Setting, role, event, value — what it always does" /></div>`} />
        <div class="mt"><${Field} label="Subgenre / blend in your words" value=${g.sub} onInput=${(v) => update(['genres', 'sub'], v)} /></div>
      </${Card}>
      <${Card} title="Title test" kicker="Does your title name something solid?" cite="titles">
        <${Field} label="Working title" value=${g.title || story.title} onInput=${(v) => update(['genres', 'title'], v)} />
        <div class="stack mt">${TT.map(([k, label]) => html`<${Toggle} label=${`It names ${label}`} checked=${g.titleTest[k]} onChange=${(v) => update(['genres', 'titleTest', k], v)} />`)}</div>
        <p class="tiny muted mt">The best titles name several at once: JAWS names a character, a setting, a theme and a genre.</p>
      </${Card}>
    </div>
  </${Page}>`;
}

// ---- Values & antagonism ----------------------------------------------------------
export function ValuesView() {
  const { story, update, mutate } = useStory();
  const v = story.values;
  const d = v.declension;
  const prot = protagonist(story);
  const counts = useMemo(() => {
    const c = { positive: 0, contrary: 0, contradictory: 0, negation: 0 };
    for (const s of story.scenes) {
      if (!hasCharge(s.close)) continue;
      const n = Number(s.close);
      if (n >= 2) c.positive++; else if (n === -1) c.contrary++; else if (n === -2) c.contradictory++; else if (n <= -3) c.negation++;
    }
    return c;
  }, [story.scenes]);
  const actList = acts(story);
  const forces = story.antagonism.forces;
  const totalForce = forces.reduce((s, f) => s + (Number(f.strength) || 0), 0);
  const capacity = prot ? (Number(prot.willpower) || 5) * 3 : 15;
  const applyPreset = (id) => {
    const p = DECLENSIONS.find((x) => x.id === id);
    if (!p) { update(['values', 'presetId'], ''); return; }
    mutate((s) => { s.values.presetId = id; s.values.declension = { positive: p.positive, contrary: p.contrary, contradictory: p.contradictory, negation: p.negation }; });
  };
  const STAGES = [{ id: '', label: '—' }, { id: 'positive', label: 'Positive' }, { id: 'contrary', label: 'Contrary' }, { id: 'contradictory', label: 'Contradictory' }, { id: 'negation', label: 'Negation of the Negation' }];
  return html`<${Page} kicker="Elements of story · ch. 14" title="Values & Antagonism" cites=${['principle-antagonism', 'negation-of-negation', 'declension-acts']}
    intro="A protagonist and story can only be as compelling as the forces of antagonism make them. Take the primary value through its full declension to the end of the line."
    actions=${html`<${AssistButton} task="negation" label="Take it to the end of the line" input=${d.positive || ''} small=${false} />`}>
    <div class="grid g-side">
      <${Card} title="Primary value declension" kicker="Positive → Contrary → Contradictory → Negation of the Negation">
        <${DeclensionDiagram} decl=${d} counts=${counts} />
        <div class="fields two mt">
          <${Field} label="Positive" value=${d.positive} onInput=${(x) => update(['values', 'declension', 'positive'], x)} placeholder="Justice" />
          <${Field} label="Contrary (somewhat negative)" value=${d.contrary} onInput=${(x) => update(['values', 'declension', 'contrary'], x)} placeholder="Unfairness" />
          <${Field} label="Negation of the Negation (qualitatively worse)" value=${d.negation} onInput=${(x) => update(['values', 'declension', 'negation'], x)} placeholder="Tyranny" />
          <${Field} label="Contradictory (direct opposite)" value=${d.contradictory} onInput=${(x) => update(['values', 'declension', 'contradictory'], x)} placeholder="Injustice" />
        </div>
        <p class="tiny muted">Counts show how many scenes close at each level (+2/+3 = positive, −1 contrary, −2 contradictory, −3 negation).</p>
      </${Card}>
      <div class="stack">
        <${Card} title="Start from McKee’s declensions">
          <${Select} value=${v.presetId} onChange=${applyPreset} options=${[{ id: '', label: 'Custom…' }, ...DECLENSIONS.map((p) => ({ id: p.id, label: `${p.positive} → ${p.negation}` }))]} />
          <p class="tiny muted mt">Choosing a preset replaces the four values; edit them to fit your story.</p>
        </${Card}>
        <${Card} title="Progression by act" cite="declension-acts">
          ${actList.length ? html`<div class="stack">${actList.map((a) => html`<div class="row"><b style="width:56px">Act ${a.n}</b><${Select} class="grow" value=${v.actStages[a.n] || ''} options=${STAGES} onChange=${(x) => update(['values', 'actStages', String(a.n)], x)} /></div>`)}</div>
            <p class="tiny muted mt">Typically Contrary in Act One, Contradictory in later acts, Negation of the Negation in the last act — then tragedy, or a return to the positive with a profound difference.</p>`
            : html`<p class="small muted">Mark act climaxes on scenes to plan the progression by act.</p>`}
        </${Card}>
        <${Card} title="Secondary values" kicker="Other values scenes turn on">
          <div class="chips">${VALUE_PAIRS.map((p) => html`<button type="button" class=${cx('chip toggle-chip', v.secondary.includes(p) && 'on')} onClick=${() => update(['values', 'secondary'], v.secondary.includes(p) ? v.secondary.filter((x) => x !== p) : [...v.secondary, p])}>${p}</button>`)}</div>
        </${Card}>
      </div>
    </div>
    <div class="grid g2 mt">
      <${Card} title="Forces of antagonism" kicker="Inner · personal · extra-personal" cite=${['levels-of-conflict', 'complexity']}>
        <${ConflictRings} forces=${forces} center=${prot ? prot.name : 'Protagonist'} />
      </${Card}>
      <${Card} title="Is the protagonist an underdog?" cite="principle-antagonism">
        <div class="stack">
          <${Meter} label=${`Total forces of antagonism: ${totalForce}`} value=${totalForce} max=${Math.max(totalForce, capacity, 1)} tone="neg" />
          <${Meter} label=${`Protagonist capacity (willpower × 3): ${capacity}`} value=${capacity} max=${Math.max(totalForce, capacity, 1)} />
          <p class="small">${totalForce > capacity ? 'The forces outweigh the protagonist: he has only a chance — good.' : 'The protagonist looks stronger than everything against him. Build the negative side.'}</p>
        </div>
        <div class="mt">
          <${ListEditor} items=${forces} onChange=${(x) => update(['antagonism', 'forces'], x)} make=${() => ({ id: uid('f'), name: '', level: 'extra', strength: 5, description: '' })} addLabel="Add force"
            render=${(f, i, set) => html`<div class="fields">
              <div class="fields two"><${Field} value=${f.name} onInput=${(x) => set({ name: x })} placeholder="Force (person, institution, inner flaw, nature…)" />
              <${Select} value=${f.level} onChange=${(x) => set({ level: x })} options=${LEVELS.map((l) => ({ id: l.id, label: l.long }))} /></div>
              <${Slider} label="Strength" value=${f.strength} min=${1} max=${10} step=${1} show=${(x) => `${x}/10`} onInput=${(x) => set({ strength: x })} />
              <${Field} value=${f.description} onInput=${(x) => set({ description: x })} placeholder="How it opposes the protagonist’s desire" />
            </div>`} />
        </div>
      </${Card}>
    </div>
  </${Page}>`;
}
