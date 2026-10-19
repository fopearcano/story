// Part 4 — The writer at work: exposition, setups/payoffs, image systems,
// step-outline / treatment / pitch.
import { html, useState, useEffect, useMemo, cx } from '../lib.js';
import { t, tn } from '../i18n.js';
import { useStory } from '../store.js';
import { Page, Card, Field, Select, Slider, Toggle, Segmented, Principle, Cite, ListEditor, Btn, Icon, SceneSelect, TurnArrow, href, go, Chips, rich } from '../ui.js';
import { ExpositionChart, SetupArcs, MotifStrip } from '../charts/structure.js';
import { acts, uid, sceneLabel, MARKERS, EXPOSITION_METHODS, timeline } from '../model.js';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

// ---- Exposition & backstory --------------------------------------------------------
export function ExpositionView() {
  const { story, update } = useStory();
  const backstory = story.characters.flatMap((c) => (c.backstory || []).map((b) => ({ ...b, who: c.name, cid: c.id })));
  const [before, setBefore] = useState(t('Harry, how long have we known each other? Twenty years, since college.'));
  return html`<${Page} kicker=${t('Writer at work · ch. 15')} title=${t('Exposition & Backstory')} cites=${['show-dont-tell', 'ammunition', 'parse-exposition', 'action-revelation']}
    intro=${t('Dramatize exposition: let characters use what they know as ammunition. Parse it out progressively — least important first, secrets last — and only when the audience wants to know.')} wide>
    <${Card} title=${t('Reveal map')} kicker=${t('When does the audience learn what?')}>
      <${ExpositionChart} story=${story} />
    </${Card}>
    <div class="grid g-side mt">
      <${Card} title=${t('Facts the audience needs')} cite="parse-exposition">
        <${ListEditor} items=${story.exposition} onChange=${(v) => update(['exposition'], v)} make=${() => ({ id: uid('e'), fact: '', importance: 2, secret: false, sceneId: '', method: 'ammunition' })} addLabel=${t('Add fact')}
          empty=${t('List the facts about setting, biography and characterization the audience must know to follow the story.')}
          render=${(e, i, set) => html`<div class="fields">
            <${Field} value=${e.fact} onInput=${(v) => set({ fact: v })} placeholder=${t('Fact')} />
            <div class="fields three">
              <${Select} label=${t('Importance')} value=${e.importance} options=${[{ id: 1, label: t('Background') }, { id: 2, label: t('Important') }, { id: 3, label: t('Critical') }]} onChange=${(v) => set({ importance: Number(v) })} />
              <${SceneSelect} label=${t('Revealed in')} value=${e.sceneId} onChange=${(v) => set({ sceneId: v })} />
              <${Select} label=${t('How')} value=${e.method} options=${EXPOSITION_METHODS} onChange=${(v) => set({ method: v })} />
            </div>
            <${Toggle} label=${t('A secret (painful truth a character doesn’t want known)')} checked=${e.secret} onChange=${(v) => set({ secret: v })} />
            ${e.method === 'told' && html`<p class="small" style="color:var(--serious)">${t('⚠ Told on the nose. Convert it to ammunition.')}</p>`}
          </div>`} />
      </${Card}>
      <div class="stack">
        <${Card} title=${t('Exposition → ammunition')} kicker=${t('Rewrite drill')} cite="ammunition">
          <${Field} label=${t('On-the-nose line (two people telling each other what they both know)')} multiline value=${before} onInput=${setBefore} />
          <div class="callout mt small">
            ${rich('<b>Ask:</b> what does the speaker <i>want</i> from the listener right now? Use the fact as a weapon in that struggle.')}
            <p>${rich('<b>Example:</b> “Harry, look at you. Same hippie haircut, still stoned by noon — the same stunts that got you kicked out of school twenty years ago.” The audience overhears “twenty years” and “school”.')}</p>
          </div>
        </${Card}>
        <${Card} title=${t('Backstory available for revelations')} cite="backstory-def">
          ${!backstory.length ? html`<p class="small muted">${t('Add backstory events on character sheets.')}</p>` : backstory.map((b) => html`<div class="small" style="padding:6px 0;border-bottom:1px solid var(--ring)">
            <b>${b.who}:</b> ${b.event} <span class="muted">— ${b.sceneId ? t('revealed in {scene}', { scene: sceneLabel(story, b.sceneId) }) : t('not yet revealed')}</span></div>`)}
          <p class="tiny muted mt">${t('Revelations from the backstory are your strongest turning points — reserve them for act climaxes.')}</p>
        </${Card}>
        <${Principle} id="flashbacks" compact />
      </div>
    </div>
  </${Page}>`;
}

// ---- Setups & payoffs -------------------------------------------------------------
export function SetupsView() {
  const { story, update } = useStory();
  const [sel, setSel] = useState('');
  return html`<${Page} kicker=${t('Writer at work · ch. 10')} title=${t('Setups & Payoffs')} cites=${['setups-payoffs', 'retroactive-logic', 'holes']}
    intro=${t('Layer knowledge in so that when a turning point opens the gap, the audience rushes back through the story and finds the answer waiting — with a second, deeper meaning.')} wide>
    <${Card} title=${t('Arcs across the story')} kicker=${t('Each arc links a setup to its payoff')}>
      <${SetupArcs} story=${story} selected=${sel} onSelect=${setSel} />
    </${Card}>
    <div class="grid g-side mt">
      <${Card} title=${t('Setups')}>
        <${ListEditor} items=${story.setups} onChange=${(v) => update(['setups'], v)} make=${() => ({ id: uid('p'), text: '', setupScene: '', payoffScene: '' })} addLabel=${t('Add setup')}
          empty=${t('Plant knowledge early that a later turning point will pay off.')}
          render=${(p, i, set) => {
            const a = story.scenes.findIndex((s) => s.id === p.setupScene);
            const b = story.scenes.findIndex((s) => s.id === p.payoffScene);
            return html`<div class="fields" onfocusin=${() => setSel(p.id)}>
              <${Field} value=${p.text} onInput=${(v) => set({ text: v })} placeholder=${t('What is planted (first meaning) — and what it turns out to mean')} />
              <div class="fields two">
                <${SceneSelect} label=${t('Setup in')} value=${p.setupScene} onChange=${(v) => set({ setupScene: v })} />
                <${SceneSelect} label=${t('Payoff in')} value=${p.payoffScene} onChange=${(v) => set({ payoffScene: v })} />
              </div>
              ${a >= 0 && b >= 0 && b < a && html`<p class="small" style="color:var(--critical)">${t('⚠ The payoff comes before the setup.')}</p>`}
              ${a >= 0 && b < 0 && html`<p class="small muted">${t('Awaiting payoff.')}</p>`}
            </div>`;
          }} />
      </${Card}>
      <div class="stack">
        <${Principle} id="setups-payoffs" compact />
        <${Principle} id="retroactive-logic" compact />
        <${Card} title=${t('Calibrate')}><p class="small">${rich('Turning points fail when we <b>overprepare the obvious</b> and <b>underprepare the unusual</b>. Plant firmly enough to be remembered, subtly enough not to be seen coming.')}</p></${Card}>
      </div>
    </div>
  </${Page}>`;
}

// ---- Image systems ----------------------------------------------------------------
export function ImagesView() {
  const { story, update, mutate } = useStory();
  const toggle = (imageId, sceneId) => mutate((s) => {
    const im = s.images.find((x) => x.id === imageId);
    if (!im) return;
    im.scenes = im.scenes.includes(sceneId) ? im.scenes.filter((x) => x !== sceneId) : [...im.scenes, sceneId];
    const order = s.scenes.map((x) => x.id);
    im.scenes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  });
  return html`<${Page} kicker=${t('Writer at work · ch. 12, 18')} title=${t('Image Systems')} cites=${['image-system', 'internal-external', 'symbolic-ascension']}
    intro=${t('A strategy of motifs: a category of imagery repeated from beginning to end with persistence, variation and subtlety, so it works on the audience unconsciously. Never label your symbols.')} wide>
    <${Card} title=${t('Motifs across the scenes')} kicker=${t('Click a cell to toggle an occurrence')}>
      ${story.images.length && story.scenes.length ? html`<${MotifStrip} story=${story} onToggle=${toggle} />` : html`<p class="small muted">${t('Add an image system below (and scenes) to see the strip.')}</p>`}
    </${Card}>
    <div class="grid g-side mt">
      <${Card} title=${t('Image systems')}>
        <${ListEditor} items=${story.images} onChange=${(v) => update(['images'], v)} make=${() => ({ id: uid('i'), name: '', category: '', kind: 'internal', meaning: '', scenes: [] })} addLabel=${t('Add image system')}
          render=${(im, i, set) => {
            const count = im.scenes.length;
            return html`<div class="fields">
            <div class="fields two">
              <${Field} label=${t('Name')} value=${im.name} onInput=${(v) => set({ name: v })} placeholder=${t('Water as death')} />
              <${Field} label=${t('Category (from nature or culture)')} value=${im.category} onInput=${(v) => set({ category: v })} placeholder=${t('Water, light, animals, machines…')} />
            </div>
            <${Segmented} value=${im.kind} onChange=${(v) => set({ kind: v })} options=${[{ id: 'internal', label: t('Internal (new meaning, unique to this story)') }, { id: 'external', label: t('External (borrowed symbol)') }]} />
            <${Field} label=${t('What it comes to mean in this story')} multiline value=${im.meaning} onInput=${(v) => set({ meaning: v })} />
            <div class="tiny muted">${tn(count, '{n} occurrence', '{n} occurrences')}${count < 3 ? ` — ${t('repeat it with variation')}` : ''}${im.kind === 'external' ? ` · ${t('external imagery is the hallmark of the student film; give it a twist')}` : ''}</div>
          </div>`;
          }} />
      </${Card}>
      <div class="stack">
        <${Principle} id="internal-external" compact />
        <${Card} title=${t('Examples from the book')} kicker=${t('Internal imagery')}>
          <ul class="small" style="padding-left:18px;margin:0">
            <li>${rich('<b>Les Diaboliques</b>: water, reversed from purity to death and terror.')}</li>
            <li>${rich('<b>Casablanca</b>: imprisonment; Rick as America; linking Rick and Ilsa while separating Ilsa and Laszlo.')}</li>
            <li>${rich('<b>Chinatown</b>: “blind seeing” — windows, mirrors, broken spectacles.')}</li>
            <li>${rich('<b>Aliens</b>: motherhood.')}</li>
          </ul>
        </${Card}>
      </div>
    </div>
  </${Page}>`;
}

// ---- Outline, treatment, pitch -------------------------------------------------------
export function OutlineView() {
  const { story, update } = useStory();
  const [mode, setMode] = useState('cards');
  const [flipped, setFlipped] = useState({});
  const actList = useMemo(() => acts(story), [story]);
  return html`<${Page} kicker=${t('Writer at work · ch. 19')} title=${t('Step-outline · Treatment · Pitch')} cites=${['step-outline', 'pitch', 'treatment', 'outside-in']}
    intro=${t('Write from the inside out: tell the story in steps on cards, pitch it in ten minutes, expand it into a treatment with full subtext — and only then write dialogue.')} wide
    actions=${html`<${Segmented} value=${mode} onChange=${setMode} options=${[{ id: 'cards', label: t('Index cards') }, { id: 'treatment', label: t('Treatment') }, { id: 'pitch', label: t('Pitch mode') }]} />`}>
    ${!story.scenes.length && html`<div class="empty"><div class="empty-title">${t('No steps yet')}</div><p>${t('Add scenes in the Scenes view; each becomes a card here.')}</p><a class="btn primary" href=${href(story.id, 'scenes')}>${t('Go to Scenes')}</a></div>`}
    ${mode === 'cards' && actList.map((a) => {
      const count = a.items.length;
      return html`<div class="outline-act">
      <h3>${t('Act {n}', { n: ROMAN[a.n] || a.n })} <span class="muted small" style="font-family:var(--sans)">· ${tn(count, '{n} scene', '{n} scenes')} · ${Math.round((a.endPct - a.startPct) * 100)}%</span></h3>
      <div class="cards">${a.items.map((it) => {
        const s = it.scene; const f = flipped[s.id];
        const mk = MARKERS.find((m) => m.id === s.marker);
        return html`<button type="button" class=${cx('index-card', f && 'flipped')} onClick=${() => setFlipped({ ...flipped, [s.id]: !f })} aria-label=${t('Card {n}: {title}. Click to flip.', { n: it.index + 1, title: s.title })}>
          <div class="index-card-inner">
            <div class="index-face">
              <div class="ix-title"><span class="muted">${it.index + 1}.</span> ${s.title || t('Untitled')} ${mk && mk.short && html`<span class="chip marker">${mk.short}</span>`}</div>
              <div class="ix-text">${s.summary || html`<span class="muted">${t('No step written yet.')}</span>`}</div>
              <div class="ix-foot"><span>${s.sequence || ''}</span><${TurnArrow} open=${s.open} close=${s.close} /></div>
            </div>
            <div class="index-face back">
              <div class="kicker">${t('Function in the design')}</div>
              <div class="small">${s.func || (mk && mk.id ? mk.label : html`<span class="muted">${t('Write the scene’s function on the back.')}</span>`)}</div>
              <div class="ix-foot"><span>${s.value || ''}</span><a href=${href(story.id, 'scenes', s.id)} onClick=${(e) => e.stopPropagation()}>${t('Edit')}</a></div>
            </div>
          </div>
        </button>`;
      })}</div>
    </div>`;
    })}
    ${mode === 'treatment' && html`<div class="stack">
      <div class="callout">${t('Expand each step into present-tense, moment-by-moment description with the subtext: the true thoughts and feelings beneath what is said and done. Indicate what characters talk about — never the dialogue itself.')}</div>
      ${story.scenes.map((s, i) => html`<${Card} title=${`${i + 1}. ${s.title || t('Untitled')}`} kicker=${s.summary}>
        <${Field} multiline rows=${4} value=${s.treatment} onInput=${(v) => update(['scenes', i, 'treatment'], v)} placeholder=${t('Present tense, moment by moment, with subtext…')} />
        ${s.subtext && html`<p class="tiny muted">${t('Subtext note: {text}', { text: s.subtext })}</p>`}
      </${Card}>`)}
    </div>`}
    ${mode === 'pitch' && story.scenes.length > 0 && html`<${Pitch} story=${story} />`}
  </${Page}>`;
}

function Pitch({ story }) {
  const [i, setI] = useState(-1);
  const [start, setStart] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(timer); }, []);
  useEffect(() => {
    const k = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') setI((x) => Math.max(-1, x - 1));
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const next = () => { if (!start) setStart(Date.now()); setI((x) => Math.min(story.scenes.length, x + 1)); };
  const elapsed = start ? Math.floor((now - start) / 1000) : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0'); const ss = String(elapsed % 60).padStart(2, '0');
  const s = story.scenes[i];
  return html`<div class="card"><div class="pitch">
    <div class="row"><span class="timer" style=${elapsed > 600 ? 'color:var(--critical)' : ''}>${mm}:${ss}</span><span class="muted small">${t('/ 10:00 — can it hook, hold and move a listener?')}</span></div>
    ${i === -1 ? html`<div class="pitch-text">${story.title}</div><div class="pitch-meta">${story.logline}</div>`
      : i >= story.scenes.length ? html`<div class="pitch-text">${t('FADE OUT.')}</div><div class="pitch-meta">${t('Did they fall silent? “Wow” — that’s the reaction you want.')}</div>`
      : html`<div class="pitch-meta">${i + 1} / ${story.scenes.length} · ${s.title}</div><div class="pitch-text">${s.summary || s.title}</div>`}
    <div class="row"><${Btn} icon="left" onClick=${() => setI((x) => Math.max(-1, x - 1))}>${t('Back')}</${Btn}><${Btn} kind="primary" icon="play" onClick=${next}>${i === -1 ? t('Start pitch') : t('Next')}</${Btn}><${Btn} onClick=${() => { setI(-1); setStart(null); }}>${t('Reset')}</${Btn}></div>
    <p class="tiny muted">${t('Use → / space to advance, ← to go back.')}</p>
  </div></div>`;
}
