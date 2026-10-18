// Characters (ch. 5, 7, 17) and Cast Design.
import { html, useState, useEffect, cx } from '../lib.js';
import { useStory } from '../store.js';
import { useApp } from '../appctx.js';
import { Page, Card, Field, Select, Slider, Toggle, Tabs, Principle, Cite, ListEditor, Btn, Avatar, Empty, SceneSelect, href, go, Meter, Segmented } from '../ui.js';
import { MaskHeart, SolarSystem, QuestDiagram } from '../charts/diagrams.js';
import { ChartFrame } from '../charts/frame.js';
import { ROLES, QUALITY_AXES, newCharacter, uid, dimensionCount, sceneLabel } from '../model.js';
import { ARC_PLOTS } from '../kb/genres.js';
import { AssistButton } from '../ai/assist.js';

const INTERVIEW = [
  ['If you could ask them "What do you want?", what would they answer?', 'conscious-desire'],
  ['What do they want without knowing it — the opposite of what they pursue?', 'unconscious-desire'],
  ['What would they never do? What pressure would make them do it?', 'true-character'],
  ['What do they seem to be? What are they at heart?', 'revelation'],
  ['What is the worst thing that happens if they fail?', 'risk'],
  ['Where is the shared humanity that makes us think "like me"?', 'empathy'],
  ['Which two of their qualities contradict each other — consistently?', 'dimension'],
  ['If I were this character in these circumstances, what would I do?', 'inside-out'],
];

export function CharactersView({ sub }) {
  const { story, update, mutate } = useStory();
  const { openAi } = useApp();
  const [tab, setTab] = useState('heart');
  const current = story.characters.find((c) => c.id === sub) || story.characters[0];
  useEffect(() => { if (!sub && current) history.replaceState(null, '', href(story.id, 'characters', current.id)); }, [sub, current && current.id]);
  const idx = current ? story.characters.indexOf(current) : -1;
  const set = (path, v) => update(['characters', idx, ...path], v);
  const add = (role) => {
    const c = newCharacter({ name: role === 'protagonist' ? 'Protagonist' : 'New character', role });
    mutate((s) => { s.characters.push(c); });
    go(href(story.id, 'characters', c.id));
  };
  const remove = () => {
    if (!confirm(`Remove ${current.name || 'this character'}?`)) return;
    mutate((s) => {
      s.characters = s.characters.filter((c) => c.id !== current.id);
      s.scenes.forEach((sc) => { sc.characters = (sc.characters || []).filter((x) => x !== current.id); });
    });
    go(href(story.id, 'characters'));
  };
  const order = ['protagonist', 'antagonist', 'supporting', 'minor'];

  return html`<${Page} kicker="Elements of story · ch. 5, 7, 17" title="Characters" cites=${['true-character', 'dimension', 'unconscious-desire']}
    intro="Characterization is the mask; true character is revealed only in choices under pressure. Design desire, contradiction and risk — then let structure apply the pressure." wide>
    <div class="grid g-list">
      <div class="stack">
        <${Card}>
          <div class="picker">
            ${order.map((role) => {
              const cs = story.characters.filter((c) => c.role === role);
              if (!cs.length) return null;
              return html`<div class="act-sep">${ROLES.find((r) => r.id === role).label}</div>
                ${cs.map((c) => html`<button class=${cx('pick', current && c.id === current.id && 'on')} onClick=${() => go(href(story.id, 'characters', c.id))}>
                  <${Avatar} c=${c} size=${30} />
                  <span class="pick-main"><div class="pick-title">${c.name || 'Unnamed'}</div><div class="pick-sub">${c.conscious || c.mask || 'No desire defined yet'}</div></span>
                  <span class="chip" title="Dimensions">${dimensionCount(c)}D</span>
                </button>`)}`;
            })}
            ${!story.characters.length && html`<p class="small muted">No characters yet.</p>`}
          </div>
          <div class="row mt">
            ${!story.characters.some((c) => c.role === 'protagonist') && html`<${Btn} kind="primary" small icon="plus" onClick=${() => add('protagonist')}>Protagonist</${Btn}>`}
            <${Btn} small icon="plus" onClick=${() => add('supporting')}>Character</${Btn}>
            <${Btn} small kind="ai" icon="spark" onClick=${() => openAi('', 'Help me create a protagonist from scratch.')}>Create with AI</${Btn}>
          </div>
        </${Card}>
        <${Principle} id="mind-worm" compact />
      </div>
      ${!current ? html`<${Empty} title="Create your first character" text="Start with the protagonist: a willful character with a conscious — and perhaps an unconscious — desire."><${Btn} kind="primary" icon="plus" onClick=${() => add('protagonist')}>Add protagonist</${Btn}></${Empty}>` : html`
      <div class="stack">
        <${Card}>
          <div class="row">
            <${Avatar} c=${current} size=${52} />
            <div class="grow stack" style="gap:6px">
              <input class="input title-input" style="font:600 22px var(--serif);border-color:transparent;padding:2px 6px;background:transparent" value=${current.name} placeholder="Name" onInput=${(e) => set(['name'], e.target.value)} aria-label="Name" />
              <div class="row">
                <${Segmented} size="small" value=${current.role} onChange=${(v) => set(['role'], v)} options=${ROLES.map((r) => ({ id: r.id, label: r.label }))} />
                <input type="color" value=${current.color} onInput=${(e) => set(['color'], e.target.value)} title="Color" style="width:32px;height:28px;border:0;background:none;padding:0" />
              </div>
            </div>
            <${Btn} kind="ai" icon="spark" onClick=${() => openAi(current.id)}>Develop with AI</${Btn}>
            <${Btn} kind="danger" icon="trash" onClick=${remove} title="Remove character" />
          </div>
        </${Card}>
        <${Tabs} value=${tab} onChange=${setTab} tabs=${[
          { id: 'heart', label: 'Mask & heart' }, { id: 'desire', label: 'Desire & risk' },
          { id: 'dimension', label: 'Dimension', badge: dimensionCount(current) }, { id: 'arc', label: 'Arc & choices' },
          { id: 'role', label: 'Role in cast' }, { id: 'interview', label: 'Interview' },
        ]} />
        ${tab === 'heart' && html`<div class="grid g2">
          <${Card} title="Characterization" kicker="The mask: all observable qualities" cite="characterization">
            <div class="fields">
              <${Field} label="In one line, how they appear" multiline value=${current.mask} onInput=${(v) => set(['mask'], v)} placeholder="A charming, successful attorney…" />
              <div class="fields two">
                ${['age', 'occupation', 'look', 'speech', 'home', 'attitudes'].map((k) => html`<${Field} label=${k[0].toUpperCase() + k.slice(1)} value=${current.characterization[k]} onInput=${(v) => set(['characterization', k], v)} />`)}
              </div>
            </div>
          </${Card}>
          <${Card} title="True character" kicker="Revealed by choice under pressure" cite="true-character">
            <${Field} label="At heart, who is this person?" multiline rows=${3} value=${current.core} onInput=${(v) => set(['core'], v)} placeholder="Loving or cruel? Generous or selfish? Strong or weak? Truthful or a liar? Courageous or cowardly?" />
            <div class="mt"><${MaskHeart} c=${current} /></div>
          </${Card}>
          <${Card} title="Mask vs. heart, quality by quality" class="span2" cite="revelation">
            <p class="small muted" style="margin-top:-6px">Each axis runs from −2 (left pole) to +2 (right pole). A gap of 2 or more between mask and heart is a dimension.</p>
            <div class="quality-grid">${QUALITY_AXES.map((q) => {
              const v = current.qualities[q.id];
              const row = (label, key) => html`<label class="quality-row"><span>${label}</span>
                <input type="range" min="-2" max="2" step="1" value=${v[key]} onInput=${(e) => set(['qualities', q.id, key], Number(e.target.value))} aria-label=${`${label}: ${q.neg} to ${q.pos}`} />
                <b>${v[key] > 0 ? `+${v[key]}` : v[key]}</b></label>`;
              return html`<div class="quality"><div class="quality-head"><span>${q.neg}</span><span>${q.pos}</span></div>
                ${row('Mask', 'mask')}${row('Heart', 'core')}</div>`;
            })}</div>
          </${Card}>
        </div>`}
        ${tab === 'desire' && html`<div class="stack">
          <${Card} title="The Quest" kicker="Desire drives the Spine" cite=${['quest', 'spine']}>
            <${QuestDiagram} conscious=${current.conscious} unconscious=${current.unconscious} inciting=${current.role === 'protagonist' ? story.inciting.event : ''}
              spineText=${current.unconscious ? 'The unconscious desire is the Spine' : 'The conscious desire is the Spine'} />
          </${Card}>
          <div class="grid g2">
            <${Card} title="Desire" cite=${['conscious-desire', 'unconscious-desire']}>
              <div class="fields">
                <${Field} label="Conscious desire (object of desire)" multiline value=${current.conscious} onInput=${(v) => set(['conscious'], v)} placeholder="What they’d answer if you asked “What do you want?”" />
                <${Field} label="Unconscious desire (contradicts the conscious)" multiline value=${current.unconscious} onInput=${(v) => set(['unconscious'], v)} placeholder="What they actually but unwittingly want" />
                <${Field} label="Motivation (leave some mystery)" multiline value=${current.motivation} onInput=${(v) => set(['motivation'], v)} cite="desire-motivation" />
              </div>
            </${Card}>
            <${Card} title="Will, capacity, chance, risk" cite=${['capacity-chance', 'risk']}>
              <div class="fields">
                <${Slider} label="Willpower" value=${current.willpower} min=${1} max=${10} step=${1} show=${(v) => `${v}/10`} onInput=${(v) => set(['willpower'], v)} />
                <${Field} label="Capacities that make the pursuit credible" multiline value=${current.capacities} onInput=${(v) => set(['capacities'], v)} />
                <${Field} label="Their chance to succeed" value=${current.chance} onInput=${(v) => set(['chance'], v)} />
                <${Field} label="Risk: the worst thing that happens if they fail" multiline value=${current.risk} onInput=${(v) => set(['risk'], v)} />
              </div>
            </${Card}>
            <${Card} title="Audience bond" cite="empathy" class="span2">
              <div class="fields two">
                <${Field} label="Empathy: the shared humanity (“like me”)" multiline value=${current.empathy} onInput=${(v) => set(['empathy'], v)} />
                <div class="stack"><${Toggle} label="Sympathetic (likable)" hint="Optional — empathy is what matters." checked=${current.sympathetic} onChange=${(v) => set(['sympathetic'], v)} />
                <${Principle} id="empathy" compact /></div>
              </div>
            </${Card}>
          </div>
        </div>`}
        ${tab === 'dimension' && html`<div class="grid g-side">
          <${Card} title="Contradictions" kicker="Dimension = contradiction" cite="dimension">
            <${ListEditor} items=${current.dimensions} onChange=${(v) => set(['dimensions'], v)} make=${() => ({ id: uid('d'), a: '', b: '' })} addLabel="Add contradiction"
              empty="No contradictions yet. Within deep character (guilt-ridden ambition) or mask vs. core (a charming thief)."
              render=${(d, i, s) => html`<div class="row"><${Field} class="grow" value=${d.a} onInput=${(v) => s({ a: v })} placeholder="Ambitious" /><span class="muted">↔</span><${Field} class="grow" value=${d.b} onInput=${(v) => s({ b: v })} placeholder="Guilt-ridden" /></div>`} />
          </${Card}>
          <div class="stack">
            <${DimensionBars} story=${story} current=${current} />
            <${Principle} id="most-dimensional" compact />
          </div>
        </div>`}
        ${tab === 'arc' && html`<div class="grid g2">
          <${Card} title="Character arc" cite="character-arc">
            <div class="fields">
              <${Select} label="Arc plot" value=${current.arc.plot} options=${ARC_PLOTS} onChange=${(v) => set(['arc', 'plot'], v)} />
              <${Field} label="Inner nature at the start" multiline value=${current.arc.from} onInput=${(v) => set(['arc', 'from'], v)} />
              <${Field} label="Inner nature at the climax" multiline value=${current.arc.to} onInput=${(v) => set(['arc', 'to'], v)} />
            </div>
            <${ArcStrip} c=${current} />
          </${Card}>
          <${Card} title="Choices under pressure" kicker="Each reveals true character" cite=${['true-character', 'dilemma']}>
            <${ListEditor} items=${current.choices} onChange=${(v) => set(['choices'], v)} make=${() => ({ id: uid('ch'), sceneId: '', dilemma: '', choice: '', reveals: '' })} addLabel="Add choice"
              empty="Log the dilemmas this character faces and what each choice reveals."
              render=${(c, i, s) => html`<div class="fields">
                <${SceneSelect} value=${c.sceneId} onChange=${(v) => s({ sceneId: v })} />
                <${Field} value=${c.dilemma} onInput=${(v) => s({ dilemma: v })} placeholder="Dilemma: B vs. C" />
                <${Field} value=${c.choice} onInput=${(v) => s({ choice: v })} placeholder="Choice made" />
                <${Field} value=${c.reveals} onInput=${(v) => s({ reveals: v })} placeholder="What it reveals" />
              </div>`} />
          </${Card}>
          <${Card} title="Backstory" kicker="Significant past events to reveal later" cite=${['backstory-def', 'action-revelation']} class="span2">
            <${ListEditor} items=${current.backstory} onChange=${(v) => set(['backstory'], v)} make=${() => ({ id: uid('k'), event: '', sceneId: '' })} addLabel="Add backstory event"
              render=${(b, i, s) => html`<div class="fields two"><${Field} value=${b.event} onInput=${(v) => s({ event: v })} placeholder="Event in the past" /><${SceneSelect} value=${b.sceneId} onChange=${(v) => s({ sceneId: v })} hint="Revealed in" /></div>`} />
          </${Card}>
        </div>`}
        ${tab === 'role' && html`<div class="grid g2">
          <${Card} title="Place in the cast" cite=${['cast-design', 'cast-polarization']}>
            <div class="fields">
              <${Field} label="Attitude toward the story’s central issue (must differ from everyone else’s)" multiline value=${current.attitude} onInput=${(v) => set(['attitude'], v)} />
              ${current.role !== 'protagonist' && html`<${Field} label="Which side of the protagonist do they bring out?" multiline value=${current.bringsOut} onInput=${(v) => set(['bringsOut'], v)} />`}
              <${Field} label="Comic obsession (a blind “humour”), if comic" value=${current.obsession} onInput=${(v) => set(['obsession'], v)} cite="comic-character" />
              <${Field} label="Notes" multiline rows=${4} value=${current.notes} onInput=${(v) => set(['notes'], v)} />
            </div>
          </${Card}>
          <${Card} title="Scenes" kicker="Where this character appears">
            ${story.scenes.filter((s) => (s.characters || []).includes(current.id)).map((s) => html`<div><a href=${href(story.id, 'scenes', s.id)}>${sceneLabel(story, s.id)}</a></div>`)}
            ${!story.scenes.some((s) => (s.characters || []).includes(current.id)) && html`<p class="small muted">Not linked to any scene yet — add them in the Scenes view.</p>`}
            <div class="mt"><${Principle} id="three-tips" compact /></div>
          </${Card}>
        </div>`}
        ${tab === 'interview' && html`<${Card} title="Interview" kicker="Writing from the inside out" cite="inside-out"
            actions=${html`<${Btn} kind="ai" icon="spark" small onClick=${() => openAi(current.id, `Interview ${current.name || 'this character'} with me, one question at a time.`)}>Interview with AI</${Btn}>`}>
          <p class="small muted">Answer as the character, not about them. Each answer saves into the character’s notes.</p>
          <div class="stack mt">${INTERVIEW.map(([q, pid], i) => html`<div class="callout"><div class="row" style="justify-content:space-between"><b>${i + 1}. ${q}</b><${Cite} id=${pid} /></div>
            <textarea class="input mt" rows="2" value=${(current.interview || {})[i] || ''} onInput=${(e) => set(['interview', String(i)], e.target.value)} /></div>`)}</div>
        </${Card}>`}
      </div>`}
    </div>
  </${Page}>`;
}

function ArcStrip({ c }) {
  const plot = ARC_PLOTS.find((p) => p.id === c.arc.plot);
  const dir = plot ? plot.dir : 0;
  return html`<div class="callout mt">
    <div class="row" style="justify-content:space-between;align-items:stretch">
      <div style="flex:1"><div class="kicker">Start</div>${c.arc.from || html`<span class="muted">—</span>`}</div>
      <div style="font-size:26px;align-self:center;color:${dir > 0 ? 'var(--pos)' : dir < 0 ? 'var(--neg)' : 'var(--muted)'}">${dir > 0 ? '↗' : dir < 0 ? '↘' : '→'}</div>
      <div style="flex:1;text-align:right"><div class="kicker">Climax</div>${c.arc.to || html`<span class="muted">—</span>`}</div>
    </div>
  </div>`;
}

function DimensionBars({ story, current }) {
  const rows = [...story.characters].map((c) => ({ c, d: dimensionCount(c) })).sort((a, b) => b.d - a.d);
  const max = Math.max(3, ...rows.map((r) => r.d));
  const W = 420; const rowH = 26; const ml = 130;
  const H = rows.length * rowH + 10;
  return html`<${Card} title="Dimensions across the cast" kicker="The protagonist must lead">
    <${ChartFrame} label="Dimension count by character">
      <svg viewBox=${`0 0 ${W} ${H}`}>
        ${rows.map((r, i) => {
          const y = 4 + i * rowH; const w = ((W - ml - 30) * r.d) / max;
          const isP = r.c.role === 'protagonist';
          return html`<g>
            <text x=${ml - 8} y=${y + 15} text-anchor="end" font-size="12" class=${r.c.id === current.id ? 't-strong' : ''}>${(r.c.name || 'Unnamed').slice(0, 18)}</text>
            <path d=${`M${ml},${y + 4} h${Math.max(0, w - 4)} q4,0 4,4 v8 q0,4 -4,4 h-${Math.max(0, w - 4)} z`} fill=${isP ? 'var(--ink)' : 'var(--o2)'} data-tip=${`${r.d} dimension${r.d === 1 ? '' : 's'}\n${r.c.name}`} tabindex="0" />
            <text x=${ml + w + 6} y=${y + 15} font-size="11.5">${r.d}</text>
          </g>`;
        })}
      </svg>
    </${ChartFrame}>
    <p class="tiny muted">Counted from contradictions, mask/heart gaps of 2+ and a conscious/unconscious split.</p>
  </${Card}>`;
}

export function CastView() {
  const { story, update } = useStory();
  const others = story.characters.filter((c) => c.role !== 'protagonist');
  const atts = story.characters.map((c) => (c.attitude || '').trim().toLowerCase());
  return html`<${Page} kicker="Elements of story · ch. 8, 17" title="Cast Design" cites=${['cast-design', 'cast-polarization', 'most-dimensional']}
    intro="The protagonist creates the cast. Each supporting role orbits the protagonist and brings out a different side of their contradictions; no two characters react alike."
    actions=${html`<${AssistButton} task="cast" label="Design a polarized cast" small=${false} />`} wide>
    <div class="grid g2">
      <${Card} title="The solar system">
        <${SolarSystem} story=${story} onSelect=${(id) => go(href(story.id, 'characters', id))} />
      </${Card}>
      <div class="stack">
        <${Card} title="The dinner-table test" kicker="Polarization" cite="cast-polarization">
          <p class="small muted" style="margin-top:-6px">Something happens at dinner — spilled wine or a divorce announcement. Would each character react differently?</p>
          <table class="table">
            <thead><tr><th>Character</th><th>Attitude</th><th>Brings out in the protagonist</th></tr></thead>
            <tbody>${story.characters.map((c, i) => {
              const dup = atts[i] && atts.indexOf(atts[i]) !== i;
              const idx = story.characters.indexOf(c);
              return html`<tr class=${!atts[i] || dup ? 'warnrow' : ''}>
                <td><a href=${href(story.id, 'characters', c.id)}>${c.name || 'Unnamed'}</a><div class="tiny muted">${c.role}</div></td>
                <td><input class="input" style="font-size:13px;padding:4px 6px" value=${c.attitude} onInput=${(e) => update(['characters', idx, 'attitude'], e.target.value)} placeholder=${dup ? 'Duplicate attitude!' : 'Attitude…'} /></td>
                <td>${c.role === 'protagonist' ? html`<span class="muted small">—</span>` : html`<input class="input" style="font-size:13px;padding:4px 6px" value=${c.bringsOut} onInput=${(e) => update(['characters', idx, 'bringsOut'], e.target.value)} placeholder="Side revealed…" />`}</td>
              </tr>`;
            })}</tbody>
          </table>
          <p class="tiny muted mt">Highlighted rows: missing or duplicated attitudes — merge, cut or differentiate.</p>
        </${Card}>
        <${Card} title="Cast at a glance">
          <div class="stats">
            ${['protagonist', 'antagonist', 'supporting', 'minor'].map((r) => html`<div class="stat"><div class="stat-n">${story.characters.filter((c) => c.role === r).length}</div><div class="stat-label">${r}</div></div>`)}
          </div>
          <div class="mt"><${Meter} label=${`${others.filter((c) => c.bringsOut).length}/${others.length} roles delineate the protagonist`} value=${others.filter((c) => c.bringsOut).length} max=${Math.max(1, others.length)} /></div>
        </${Card}>
        <${Principle} id="three-tips" compact />
      </div>
    </div>
  </${Page}>`;
}
