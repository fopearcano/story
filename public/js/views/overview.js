// Dashboard, Story Doctor, Principles Library and Export.
import { html, useState, useEffect, useMemo, cx } from '../lib.js';
import { useStory } from '../store.js';
import { useApp } from '../appctx.js';
import { Page, Card, Field, Stat, Btn, Icon, Cite, href, go, Segmented, Meter } from '../ui.js';
import { ArcChart, FivePartBar } from '../charts/structure.js';
import { TriangleChart, SolarSystem, ScoreRing } from '../charts/diagrams.js';
import { diagnose, score, groupScores, GROUPS } from '../doctor.js';
import { storyStats, controllingIdeaSentence, endingType, protagonist } from '../model.js';
import { CHAPTERS, PARTS, PRINCIPLES, chapterLabel } from '../kb/principles.js';
import { CORNERS, classifyDesign } from '../kb/triangle.js';
import { storyToMarkdown } from '../export.js';
import { markdownToHtml } from '../markdown.js';
import { api } from '../api.js';
import { AssistButton } from '../ai/assist.js';

export function StatusBadge({ status }) {
  const map = { pass: ['check', 'Pass'], warn: ['warn', 'Check'], fail: ['x', 'Problem'], todo: ['dot', 'To do'] };
  const [icon, label] = map[status] || map.todo;
  return html`<span class=${cx('status', status)}><${Icon} name=${icon} size=${14} />${label}</span>`;
}

// The inside-out method (ch. 19) as a progress stepper.
function MethodStepper({ story }) {
  const prot = protagonist(story);
  const steps = [
    { id: 'meaning', label: 'Premise', done: !!story.premise.trim() },
    { id: 'setting', label: 'World & genre', done: !!(story.setting.location || story.genres.primary) },
    { id: 'characters', label: 'Protagonist & desire', done: !!(prot && prot.conscious) },
    { id: 'inciting', label: 'Inciting Incident', done: !!(story.inciting.event || story.scenes.some((s) => s.marker === 'inciting')) },
    { id: 'outline', label: 'Step-outline', done: story.scenes.length >= 8 },
    { id: 'crisis', label: 'Crisis & Climax', done: !!(story.climax.action || story.scenes.some((s) => s.marker === 'climax')) },
    { id: 'meaning', label: 'Controlling Idea', done: !!(story.meaning.value && story.meaning.cause) },
    { id: 'outline', label: 'Treatment', done: story.scenes.length > 0 && story.scenes.filter((s) => s.treatment).length >= story.scenes.length / 2 },
  ];
  const doneN = steps.filter((s) => s.done).length;
  return html`<div>
    <div class="row" style="justify-content:space-between"><span class="small muted">Writing from the inside out — ${doneN}/${steps.length} stages</span><${Cite} id="step-outline" /></div>
    <ol style="list-style:none;padding:0;margin:10px 0 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px">
      ${steps.map((s, i) => html`<li><a href=${href(story.id, s.id)} style="text-decoration:none;display:flex;flex-direction:column;gap:6px">
        <span style=${`height:6px;border-radius:999px;background:${s.done ? 'var(--pos)' : 'var(--surface-3)'}`} />
        <span class="tiny" style=${s.done ? 'color:var(--ink);font-weight:600' : 'color:var(--muted)'}>${i + 1}. ${s.label}</span>
      </a></li>`)}
    </ol>
  </div>`;
}

export function DashboardView() {
  const { story, update } = useStory();
  const checks = useMemo(() => diagnose(story), [story]);
  const sc = score(checks);
  const st = storyStats(story);
  const ci = controllingIdeaSentence(story);
  const ending = endingType(story);
  const design = CORNERS[classifyDesign(story.triangle)];
  const issues = checks.filter((c) => c.status === 'fail').concat(checks.filter((c) => c.status === 'warn'), checks.filter((c) => c.status === 'todo')).slice(0, 6);
  const turnPct = st.scenes ? Math.round((st.turning / st.scenes) * 100) : 0;

  return html`<${Page} kicker="Overview" title="Story dashboard" wide>
    <div class="grid g-side">
      <${Card} tone="hero">
        <div class="stack">
          <input class="input title-input" style="font:600 28px/1.2 var(--serif);border-color:transparent;padding:4px 6px;background:transparent" value=${story.title}
            onInput=${(e) => update(['title'], e.target.value)} aria-label="Title" />
          <${Field} label="Logline" multiline value=${story.logline} onInput=${(v) => update(['logline'], v)} placeholder="A [protagonist] who wants [desire] must [conflict] before [stakes]…" />
          <${Field} label="Author" value=${story.author} onInput=${(v) => update(['author'], v)} />
          <div class="callout">
            <div class="kicker">Controlling Idea · ${ending}</div>
            ${ci ? html`<div class="big-quote">${ci}</div>` : html`<div class="big-quote placeholder">Not yet discovered — the climax will tell you.</div>`}
            <div class="row mt"><a class="btn small" href=${href(story.id, 'meaning')}>Premise & meaning</a><${Cite} id="controlling-idea" /></div>
          </div>
        </div>
      </${Card}>
      <${Card} title="Story Doctor" cite="principles-not-rules">
        <div class="row top">
          <${ScoreRing} score=${sc} size=${130} />
          <div class="grow stack" style="gap:6px">
            ${groupScores(checks).map((g) => html`<${Meter} label=${`${g.label} · ${g.score}`} value=${g.score} max=${100} tone=${g.score < 50 ? 'neg' : g.score < 75 ? 'warn' : ''} />`)}
          </div>
        </div>
        <div class="stack mt" style="gap:6px">
          ${issues.map((c) => html`<a href=${href(story.id, c.route)} class="row small" style="text-decoration:none;align-items:flex-start;flex-wrap:nowrap"><${StatusBadge} status=${c.status} /><span><b>${c.title}</b> <span class="muted">${c.detail}</span></span></a>`)}
          ${!issues.length && html`<p class="small">No open findings. Pitch it to someone and watch their eyes.</p>`}
        </div>
        <div class="row mt"><a class="btn small" href=${href(story.id, 'doctor')}>All ${checks.length} checks</a></div>
      </${Card}>
    </div>
    <div class="card mt"><div class="stats">
      <${Stat} n=${st.scenes} label="Scenes" />
      <${Stat} n=${st.sequences} label="Sequences" />
      <${Stat} n=${st.acts} label="Acts" />
      <${Stat} n=${`${turnPct}%`} label="Scenes that turn" />
      <${Stat} n=${st.characters} label="Characters" />
      <${Stat} n=${st.locations} label="Locations" />
      <${Stat} n=${st.pages} label="Pages (≈ minutes)" />
    </div><div class="mt"><${MethodStepper} story=${story} /></div></div>
    <${Card} title="Value arc" kicker="Every scene a turning point" cite=${['scene', 'act-rhythm']} class="mt"
      actions=${html`<a class="btn small" href=${href(story.id, 'structure')}>Acts & arc</a>`}>
      <${ArcChart} story=${story} onSelect=${(id) => go(href(story.id, 'scenes', id))} />
    </${Card}>
    <div class="grid g3 mt">
      <${Card} title="Five-part design" cite="five-parts" class="span2">
        <${FivePartBar} story=${story} />
        <div class="kv mt">
          <dt>Inciting Incident</dt><dd>${story.inciting.event || html`<span class="muted">—</span>`}</dd>
          <dt>Major Dramatic Q.</dt><dd>${story.inciting.mdq || html`<span class="muted">—</span>`}</dd>
          <dt>Crisis decision</dt><dd>${story.crisis.choice || html`<span class="muted">—</span>`}</dd>
          <dt>Climax</dt><dd>${story.climax.action || html`<span class="muted">—</span>`}</dd>
        </div>
      </${Card}>
      <${Card} title=${`Design: ${design.name}`} kicker=${design.sub} cite="formal-contrasts">
        <${TriangleChart} triangle=${story.triangle} title=${story.title} showFilms=${false} small />
      </${Card}>
    </div>
    <div class="grid g2 mt">
      <${Card} title="Cast" kicker="The protagonist creates the cast" cite="cast-design" actions=${html`<a class="btn small" href=${href(story.id, 'cast')}>Cast design</a>`}>
        <${SolarSystem} story=${story} size=${560} onSelect=${(id) => go(href(story.id, 'characters', id))} />
      </${Card}>
      <${Card} title="Premise" kicker="What would happen if…?" cite="premise">
        <${Field} multiline rows=${3} value=${story.premise} onInput=${(v) => update(['premise'], v)} placeholder="What would happen if…" />
        <div class="mt"><${Field} label="Notes" multiline rows=${6} value=${story.notes} onInput=${(v) => update(['notes'], v)} /></div>
      </${Card}>
    </div>
  </${Page}>`;
}

export function DoctorView() {
  const { story } = useStory();
  const checks = useMemo(() => diagnose(story), [story]);
  const [filter, setFilter] = useState('open');
  const sc = score(checks);
  const shown = checks.filter((c) => filter === 'all' || (filter === 'open' ? c.status !== 'pass' : c.status === filter));
  const counts = { pass: 0, warn: 0, fail: 0, todo: 0 };
  checks.forEach((c) => counts[c.status]++);
  return html`<${Page} kicker="Overview" title="Story Doctor" intro="Your story checked against McKee’s principles. Principles, not rules: a warning is a question to answer, not an order."
    actions=${html`<${AssistButton} task="story-doctor" label="Consult on the diagnosis" small=${false} />`}>
    <div class="grid g-side">
      <div class="stack">
        <${Segmented} value=${filter} onChange=${setFilter} options=${[
          { id: 'open', label: `Open (${checks.length - counts.pass})` }, { id: 'fail', label: `Problems (${counts.fail})` },
          { id: 'warn', label: `Checks (${counts.warn})` }, { id: 'todo', label: `To do (${counts.todo})` }, { id: 'all', label: `All (${checks.length})` },
        ]} />
        ${GROUPS.map((g) => {
          const cs = shown.filter((c) => c.group === g.id);
          if (!cs.length) return null;
          return html`<${Card} title=${g.label} kicker=${g.hint}>
            ${cs.map((c) => html`<div class="check">
              <${StatusBadge} status=${c.status} />
              <div><div class="check-title">${c.title}</div><div class="check-detail">${c.detail}</div><div class="mt" style="margin-top:6px"><${Cite} id=${c.principle} /></div></div>
              <a class="btn small" href=${href(story.id, c.route)}>Open</a>
            </div>`)}
          </${Card}>`;
        })}
        ${!shown.length && html`<div class="empty"><div class="empty-title">Nothing here</div><p>Every check in this filter passes.</p></div>`}
      </div>
      <div class="stack sticky">
        <${Card}><div class="row"><${ScoreRing} score=${sc} size=${140} /><div class="grow stack" style="gap:6px">
          ${groupScores(checks).map((g) => html`<${Meter} label=${`${g.label} · ${g.score}`} value=${g.score} max=${100} tone=${g.score < 50 ? 'neg' : g.score < 75 ? 'warn' : ''} />`)}
        </div></div>
        <p class="tiny muted mt">Score: pass = 1, check = ½, problem or to-do = 0. Status is shown with an icon and a label, never color alone.</p></${Card}>
        <${Card} title="Legend"><div class="stack small">
          <div class="row"><${StatusBadge} status="pass" /> meets the principle</div>
          <div class="row"><${StatusBadge} status="warn" /> worth a second look</div>
          <div class="row"><${StatusBadge} status="fail" /> breaks a principle</div>
          <div class="row"><${StatusBadge} status="todo" /> not designed yet</div>
        </div></${Card}>
      </div>
    </div>
  </${Page}>`;
}

export function LibraryView({ sub }) {
  const { story } = useStory();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('chapters');
  useEffect(() => {
    if (!sub) return;
    setTimeout(() => { const el = document.getElementById(`p-${sub}`); if (el) el.scrollIntoView({ block: 'center' }); }, 60);
  }, [sub]);
  const needle = q.trim().toLowerCase();
  const match = (p) => !needle || `${p.term} ${p.text}`.toLowerCase().includes(needle);
  const total = PRINCIPLES.length;
  return html`<${Page} kicker="Reference" title="Principles Library" intro=${`${total} principles from Robert McKee’s Story, paraphrased and linked to the tool where you apply them.`}>
    <div class="row mb">
      <input class="input" style="max-width:360px" placeholder="Search principles (e.g. gap, irony, subtext)" value=${q} onInput=${(e) => setQ(e.target.value)} aria-label="Search principles" />
      <${Segmented} value=${mode} onChange=${setMode} options=${[{ id: 'chapters', label: 'By chapter' }, { id: 'glossary', label: 'Glossary A–Z' }]} />
    </div>
    ${mode === 'glossary' ? html`<${Card}>
      ${[...PRINCIPLES].filter(match).sort((a, b) => a.term.localeCompare(b.term)).map((p) => html`<div class=${cx('lib-principle', sub === p.id && 'hl')} id=${`p-${p.id}`}>
        <h3><span>${p.term}</span><span class="row"><span class="chip">${chapterLabel(p.chapter)}</span><a class="btn small" href=${href(story.id, p.route)}>Apply</a></span></h3><p>${p.text}</p></div>`)}
    </${Card}>` : PARTS.map((part) => {
      const chs = CHAPTERS.filter((c) => c.part === part.n).map((c) => ({ ...c, ps: c.principles.filter(match) })).filter((c) => c.ps.length);
      if (!chs.length) return null;
      return html`<div class="mb">
        <div class="kicker" style="margin:18px 0 8px">Part ${part.n} · ${part.title}</div>
        <div class="stack">${chs.map((c) => html`<${Card} title=${c.n ? `${c.n}. ${c.title}` : c.title} class="lib-ch">
          <p class="muted small" style="margin-top:-6px">${c.summary}</p>
          ${c.ps.map((p) => html`<div class=${cx('lib-principle', sub === p.id && 'hl')} id=${`p-${p.id}`}>
            <h3><span>${p.term}</span><a class="btn small" href=${href(story.id, p.route)}>Apply</a></h3><p>${p.text}</p>
          </div>`)}
        </${Card}>`)}</div>
      </div>`;
    })}
    <p class="tiny muted">Source: Robert McKee, <i>Story: Substance, Structure, Style, and the Principles of Screenwriting</i> (ReganBooks/HarperCollins, 1997). Summaries are paraphrases written for this tool.</p>
  </${Page}>`;
}

function download(name, text, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function ExportView() {
  const { story, flush } = useStory();
  const md = useMemo(() => storyToMarkdown(story), [story]);
  const slug = (story.title || 'story').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'story';
  const del = async () => {
    if (!confirm(`Delete "${story.title}" permanently?`)) return;
    await flush();
    await api.deleteStory(story.id);
    go('#/');
  };
  const printBible = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const doc = w.document;
    doc.title = story.title;
    const style = doc.createElement('style');
    style.textContent = 'body{font:15px/1.55 Georgia,serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}h1,h2,h3{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px}';
    doc.head.appendChild(style);
    const main = doc.createElement('main');
    main.innerHTML = markdownToHtml(md);
    doc.body.appendChild(main);
    w.print();
  };
  return html`<${Page} kicker="Writer at work" title="Export" intro="Take your story bible with you: a Markdown document with every element, or the full JSON for backup and re-import.">
    <div class="grid g-side">
      <${Card} title="Story bible preview">
        <div class="prose" style="max-height:70vh;overflow:auto" dangerouslySetInnerHTML=${{ __html: markdownToHtml(md) }} />
      </${Card}>
      <div class="stack">
        <${Card} title="Download">
          <div class="stack">
            <${Btn} kind="primary" icon="download" onClick=${() => download(`${slug}.md`, md, 'text/markdown')}>Story bible (.md)</${Btn}>
            <${Btn} icon="download" onClick=${() => download(`${slug}.json`, JSON.stringify(story, null, 2), 'application/json')}>Full data (.json)</${Btn}>
            <${Btn} icon="eye" onClick=${printBible}>Print / save as PDF</${Btn}>
          </div>
        </${Card}>
        <${Card} title="Danger zone"><${Btn} kind="danger" icon="trash" onClick=${del}>Delete this story</${Btn}></${Card}>
      </div>
    </div>
  </${Page}>`;
}
