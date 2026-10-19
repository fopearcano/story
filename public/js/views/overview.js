// Dashboard, Story Doctor, Principles Library and Export.
import { html, useState, useEffect, useMemo, cx } from '../lib.js';
import { useStory } from '../store.js';
import { useApp } from '../appctx.js';
import { Page, Card, Field, Stat, Btn, Icon, Cite, href, go, Segmented, Meter, rich } from '../ui.js';
import { t, lang, num } from '../i18n.js';
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
  const map = { pass: ['check', t('Pass')], warn: ['warn', t('Check')], fail: ['x', t('Problem')], todo: ['dot', t('To do')] };
  const [icon, label] = map[status] || map.todo;
  return html`<span class=${cx('status', status)}><${Icon} name=${icon} size=${14} />${label}</span>`;
}

// The inside-out method (ch. 19) as a progress stepper.
function MethodStepper({ story }) {
  const prot = protagonist(story);
  const steps = [
    { id: 'meaning', label: t('Premise'), done: !!story.premise.trim() },
    { id: 'setting', label: t('World & genre'), done: !!(story.setting.location || story.genres.primary) },
    { id: 'characters', label: t('Protagonist & desire'), done: !!(prot && prot.conscious) },
    { id: 'inciting', label: t('Inciting Incident'), done: !!(story.inciting.event || story.scenes.some((s) => s.marker === 'inciting')) },
    { id: 'outline', label: t('Step-outline'), done: story.scenes.length >= 8 },
    { id: 'crisis', label: t('Crisis & Climax'), done: !!(story.climax.action || story.scenes.some((s) => s.marker === 'climax')) },
    { id: 'meaning', label: t('Controlling Idea'), done: !!(story.meaning.value && story.meaning.cause) },
    { id: 'outline', label: t('Treatment'), done: story.scenes.length > 0 && story.scenes.filter((s) => s.treatment).length >= story.scenes.length / 2 },
  ];
  const doneN = steps.filter((s) => s.done).length;
  return html`<div>
    <div class="row" style="justify-content:space-between"><span class="small muted">${t('Writing from the inside out — {done}/{total} stages', { done: doneN, total: steps.length })}</span><${Cite} id="step-outline" /></div>
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
  const ciKicker = { idealistic: t('Controlling Idea · idealistic'), pessimistic: t('Controlling Idea · pessimistic'), ironic: t('Controlling Idea · ironic') }[ending];
  const design = CORNERS[classifyDesign(story.triangle)];
  const issues = checks.filter((c) => c.status === 'fail').concat(checks.filter((c) => c.status === 'warn'), checks.filter((c) => c.status === 'todo')).slice(0, 6);
  const turnPct = st.scenes ? Math.round((st.turning / st.scenes) * 100) : 0;

  return html`<${Page} kicker=${t('Overview')} title=${t('Story dashboard')} wide>
    <div class="grid g-side">
      <${Card} tone="hero">
        <div class="stack">
          <input class="input title-input" style="font:600 28px/1.2 var(--serif);border-color:transparent;padding:4px 6px;background:transparent" value=${story.title}
            onInput=${(e) => update(['title'], e.target.value)} aria-label=${t('Title')} />
          <${Field} label=${t('Logline')} multiline value=${story.logline} onInput=${(v) => update(['logline'], v)} placeholder=${t('A [protagonist] who wants [desire] must [conflict] before [stakes]…')} />
          <${Field} label=${t('Author')} value=${story.author} onInput=${(v) => update(['author'], v)} />
          <div class="callout">
            <div class="kicker">${ciKicker}</div>
            ${ci ? html`<div class="big-quote">${ci}</div>` : html`<div class="big-quote placeholder">${t('Not yet discovered — the climax will tell you.')}</div>`}
            <div class="row mt"><a class="btn small" href=${href(story.id, 'meaning')}>${t('Premise & meaning')}</a><${Cite} id="controlling-idea" /></div>
          </div>
        </div>
      </${Card}>
      <${Card} title=${t('Story Doctor')} cite="principles-not-rules">
        <div class="row top">
          <${ScoreRing} score=${sc} size=${130} />
          <div class="grow stack" style="gap:6px">
            ${groupScores(checks).map((g) => html`<${Meter} label=${`${g.label} · ${g.score}`} value=${g.score} max=${100} tone=${g.score < 50 ? 'neg' : g.score < 75 ? 'warn' : ''} />`)}
          </div>
        </div>
        <div class="stack mt" style="gap:6px">
          ${issues.map((c) => html`<a href=${href(story.id, c.route)} class="row small" style="text-decoration:none;align-items:flex-start;flex-wrap:nowrap"><${StatusBadge} status=${c.status} /><span><b>${c.title}</b> <span class="muted">${c.detail}</span></span></a>`)}
          ${!issues.length && html`<p class="small">${t('No open findings. Pitch it to someone and watch their eyes.')}</p>`}
        </div>
        <div class="row mt"><a class="btn small" href=${href(story.id, 'doctor')}>${t('All {n} checks', { n: checks.length })}</a></div>
      </${Card}>
    </div>
    <div class="card mt"><div class="stats">
      <${Stat} n=${st.scenes} label=${t('Scenes')} />
      <${Stat} n=${st.sequences} label=${t('Sequences')} />
      <${Stat} n=${st.acts} label=${t('Acts')} />
      <${Stat} n=${`${turnPct}%`} label=${t('Scenes that turn')} />
      <${Stat} n=${st.characters} label=${t('Characters')} />
      <${Stat} n=${st.locations} label=${t('Locations')} />
      <${Stat} n=${num(st.pages)} label=${t('Pages (≈ minutes)')} />
    </div><div class="mt"><${MethodStepper} story=${story} /></div></div>
    <${Card} title=${t('Value arc')} kicker=${t('Every scene a turning point')} cite=${['scene', 'act-rhythm']} class="mt"
      actions=${html`<a class="btn small" href=${href(story.id, 'structure')}>${t('Acts & arc')}</a>`}>
      <${ArcChart} story=${story} onSelect=${(id) => go(href(story.id, 'scenes', id))} />
    </${Card}>
    <div class="grid g3 mt">
      <${Card} title=${t('Five-part design')} cite="five-parts" class="span2">
        <${FivePartBar} story=${story} />
        <div class="kv mt">
          <dt>${t('Inciting Incident')}</dt><dd>${story.inciting.event || html`<span class="muted">—</span>`}</dd>
          <dt>${t('Major Dramatic Q.')}</dt><dd>${story.inciting.mdq || html`<span class="muted">—</span>`}</dd>
          <dt>${t('Crisis decision')}</dt><dd>${story.crisis.choice || html`<span class="muted">—</span>`}</dd>
          <dt>${t('Climax')}</dt><dd>${story.climax.action || html`<span class="muted">—</span>`}</dd>
        </div>
      </${Card}>
      <${Card} title=${t('Design: {name}', { name: design.name })} kicker=${design.sub} cite="formal-contrasts">
        <${TriangleChart} triangle=${story.triangle} title=${story.title} showFilms=${false} small />
      </${Card}>
    </div>
    <div class="grid g2 mt">
      <${Card} title=${t('Cast')} kicker=${t('The protagonist creates the cast')} cite="cast-design" actions=${html`<a class="btn small" href=${href(story.id, 'cast')}>${t('Cast design')}</a>`}>
        <${SolarSystem} story=${story} size=${560} onSelect=${(id) => go(href(story.id, 'characters', id))} />
      </${Card}>
      <${Card} title=${t('Premise')} kicker=${t('What would happen if…?')} cite="premise">
        <${Field} multiline rows=${3} value=${story.premise} onInput=${(v) => update(['premise'], v)} placeholder=${t('What would happen if…')} />
        <div class="mt"><${Field} label=${t('Notes')} multiline rows=${6} value=${story.notes} onInput=${(v) => update(['notes'], v)} /></div>
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
  return html`<${Page} kicker=${t('Overview')} title=${t('Story Doctor')} intro=${t('Your story checked against McKee’s principles. Principles, not rules: a warning is a question to answer, not an order.')}
    actions=${html`<${AssistButton} task="story-doctor" label=${t('Consult on the diagnosis')} small=${false} />`}>
    <div class="grid g-side">
      <div class="stack">
        <${Segmented} value=${filter} onChange=${setFilter} options=${[
          { id: 'open', label: t('Open ({n})', { n: checks.length - counts.pass }) }, { id: 'fail', label: t('Problems ({n})', { n: counts.fail }) },
          { id: 'warn', label: t('Checks ({n})', { n: counts.warn }) }, { id: 'todo', label: t('To do ({n})', { n: counts.todo }) }, { id: 'all', label: t('All ({n})', { n: checks.length }) },
        ]} />
        ${GROUPS.map((g) => {
          const cs = shown.filter((c) => c.group === g.id);
          if (!cs.length) return null;
          return html`<${Card} title=${g.label} kicker=${g.hint}>
            ${cs.map((c) => html`<div class="check">
              <${StatusBadge} status=${c.status} />
              <div><div class="check-title">${c.title}</div><div class="check-detail">${c.detail}</div><div class="mt" style="margin-top:6px"><${Cite} id=${c.principle} /></div></div>
              <a class="btn small" href=${href(story.id, c.route)}>${t('Open')}</a>
            </div>`)}
          </${Card}>`;
        })}
        ${!shown.length && html`<div class="empty"><div class="empty-title">${t('Nothing here')}</div><p>${t('Every check in this filter passes.')}</p></div>`}
      </div>
      <div class="stack sticky">
        <${Card}><div class="row"><${ScoreRing} score=${sc} size=${140} /><div class="grow stack" style="gap:6px">
          ${groupScores(checks).map((g) => html`<${Meter} label=${`${g.label} · ${g.score}`} value=${g.score} max=${100} tone=${g.score < 50 ? 'neg' : g.score < 75 ? 'warn' : ''} />`)}
        </div></div>
        <p class="tiny muted mt">${t('Score: pass = 1, check = ½, problem or to-do = 0. Status is shown with an icon and a label, never color alone.')}</p></${Card}>
        <${Card} title=${t('Legend')}><div class="stack small">
          <div class="row"><${StatusBadge} status="pass" /> ${t('meets the principle')}</div>
          <div class="row"><${StatusBadge} status="warn" /> ${t('worth a second look')}</div>
          <div class="row"><${StatusBadge} status="fail" /> ${t('breaks a principle')}</div>
          <div class="row"><${StatusBadge} status="todo" /> ${t('not designed yet')}</div>
        </div></${Card}>
      </div>
    </div>
  </${Page}>`;
}

// Accent- and case-insensitive text, for search and glossary letters.
const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const sortKey = (term) => term.replace(/^[^\p{L}\p{N}]+/u, '');
const initial = (term) => { const c = fold(sortKey(term)).charAt(0).toUpperCase(); return /\p{L}/u.test(c) ? c : '#'; };

// A–Z glossary: terms in the interface language, sorted and grouped by first letter.
const GLOSSARY = [...PRINCIPLES].sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term), lang)).reduce((groups, p) => {
  const letter = initial(p.term);
  if (!groups.length || groups[groups.length - 1].letter !== letter) groups.push({ letter, ps: [] });
  groups[groups.length - 1].ps.push(p);
  return groups;
}, []);

// A principle's term, with the book's English term when the interface is translated.
function Term({ p }) {
  return html`<span>${p.term}${p.original && html` <span class="principle-orig">(${p.original})</span>`}</span>`;
}

export function LibraryView({ sub }) {
  const { story } = useStory();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('chapters');
  useEffect(() => {
    if (!sub) return;
    setTimeout(() => { const el = document.getElementById(`p-${sub}`); if (el) el.scrollIntoView({ block: 'center' }); }, 60);
  }, [sub]);
  const needle = fold(q.trim());
  const match = (p) => !needle || fold(`${p.term} ${p.original || ''} ${p.text}`).includes(needle);
  const total = PRINCIPLES.length;
  return html`<${Page} kicker=${t('Reference')} title=${t('Principles Library')} intro=${t('{n} principles from Robert McKee’s Story, paraphrased and linked to the tool where you apply them.', { n: total })}>
    <div class="row mb">
      <input class="input" style="max-width:360px" placeholder=${t('Search principles (e.g. gap, irony, subtext)')} value=${q} onInput=${(e) => setQ(e.target.value)} aria-label=${t('Search principles')} />
      <${Segmented} value=${mode} onChange=${setMode} options=${[{ id: 'chapters', label: t('By chapter') }, { id: 'glossary', label: t('Glossary A–Z') }]} />
    </div>
    ${mode === 'glossary' ? html`<${Card}>
      ${GLOSSARY.map((g) => ({ ...g, ps: g.ps.filter(match) })).filter((g) => g.ps.length).map((g, i) => html`<div>
        <div class="kicker" style=${`font-size:13px;margin:${i ? 16 : 0}px 0 0`}>${g.letter}</div>
        ${g.ps.map((p) => html`<div class=${cx('lib-principle', sub === p.id && 'hl')} id=${`p-${p.id}`}>
          <h3><${Term} p=${p} /><span class="row"><span class="chip">${chapterLabel(p.chapter)}</span><a class="btn small" href=${href(story.id, p.route)}>${t('Apply')}</a></span></h3><p>${p.text}</p></div>`)}
      </div>`)}
    </${Card}>` : PARTS.map((part) => {
      const chs = CHAPTERS.filter((c) => c.part === part.n).map((c) => ({ ...c, ps: PRINCIPLES.filter((p) => p.chapter === c.id && match(p)) })).filter((c) => c.ps.length);
      if (!chs.length) return null;
      return html`<div class="mb">
        <div class="kicker" style="margin:18px 0 8px">${t('Part {n} · {title}', { n: part.n, title: part.title })}</div>
        <div class="stack">${chs.map((c) => html`<${Card} title=${c.n ? `${c.n}. ${c.title}` : c.title} class="lib-ch">
          <p class="muted small" style="margin-top:-6px">${c.summary}</p>
          ${c.ps.map((p) => html`<div class=${cx('lib-principle', sub === p.id && 'hl')} id=${`p-${p.id}`}>
            <h3><${Term} p=${p} /><a class="btn small" href=${href(story.id, p.route)}>${t('Apply')}</a></h3><p>${p.text}</p>
          </div>`)}
        </${Card}>`)}</div>
      </div>`;
    })}
    <p class="tiny muted">${rich('Source: Robert McKee, <i>Story: Substance, Structure, Style, and the Principles of Screenwriting</i> (ReganBooks/HarperCollins, 1997). Summaries are paraphrases written for this tool.')}</p>
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
  const slug = (story.title || 'story').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'story';
  const del = async () => {
    if (!confirm(t('Delete "{title}" permanently?', { title: story.title }))) return;
    await flush();
    await api.deleteStory(story.id);
    go('#/');
  };
  const printBible = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const doc = w.document;
    doc.title = story.title;
    doc.documentElement.lang = lang;
    const style = doc.createElement('style');
    style.textContent = 'body{font:15px/1.55 Georgia,serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}h1,h2,h3{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px}';
    doc.head.appendChild(style);
    const main = doc.createElement('main');
    main.innerHTML = markdownToHtml(md);
    doc.body.appendChild(main);
    w.print();
  };
  return html`<${Page} kicker=${t('Writer at work')} title=${t('Export')} intro=${t('Take your story bible with you: a Markdown document with every element, or the full JSON for backup and re-import.')}>
    <div class="grid g-side">
      <${Card} title=${t('Story bible preview')}>
        <div class="prose" style="max-height:70vh;overflow:auto" dangerouslySetInnerHTML=${{ __html: markdownToHtml(md) }} />
      </${Card}>
      <div class="stack">
        <${Card} title=${t('Download')}>
          <div class="stack">
            <${Btn} kind="primary" icon="download" onClick=${() => download(`${slug}.md`, md, 'text/markdown')}>${t('Story bible (.md)')}</${Btn}>
            <${Btn} icon="download" onClick=${() => download(`${slug}.json`, JSON.stringify(story, null, 2), 'application/json')}>${t('Full data (.json)')}</${Btn}>
            <${Btn} icon="eye" onClick=${printBible}>${t('Print / save as PDF')}</${Btn}>
          </div>
        </${Card}>
        <${Card} title=${t('Danger zone')}><${Btn} kind="danger" icon="trash" onClick=${del}>${t('Delete this story')}</${Btn}></${Card}>
      </div>
    </div>
  </${Page}>`;
}
