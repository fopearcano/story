// Story Bible export: Markdown document generated from the story JSON.
import {
  acts, controllingIdeaSentence, protagonist, sceneLabel, hasCharge, endingType, QUALITY_AXES,
} from './model.js';
import { genreById } from './kb/genres.js';
import { CONTRASTS, classifyDesign, CORNERS } from './kb/triangle.js';
import { diagnose, score } from './doctor.js';

const nz = (s) => (s && String(s).trim()) || '';
const line = (label, v) => (nz(v) ? `- **${label}:** ${nz(v)}\n` : '');
const charge = (v) => (hasCharge(v) ? (Number(v) > 0 ? `+${v}` : String(v)) : '?');

export function storyToMarkdown(story) {
  let md = `# ${story.title}\n\n`;
  if (nz(story.author)) md += `*${story.author}*\n\n`;
  if (nz(story.logline)) md += `> ${story.logline}\n\n`;

  md += '## Meaning\n\n';
  md += line('Premise', story.premise);
  const ci = controllingIdeaSentence(story);
  md += line('Controlling Idea', ci);
  md += line('Counter-Idea', story.meaning.counterIdea);
  md += line('Ending', endingType(story));
  md += '\n';

  md += '## Design\n\n';
  const corner = CORNERS[classifyDesign(story.triangle)];
  md += line('Story triangle', `${corner.name} (${corner.sub})`);
  for (const c of CONTRASTS) {
    const v = Number(story.triangle[c.id] || 0);
    md += `  - ${v < 0.34 ? c.arch : v > 0.66 ? c.other : `${c.arch} ↔ ${c.other}`}\n`;
  }
  const g = genreById(story.genres.primary);
  md += line('Genre', [g && g.name, ...story.genres.secondary.map((id) => (genreById(id) || {}).name)].filter(Boolean).join(' + '));
  md += line('Subgenre', story.genres.sub);
  md += '\n';

  const st = story.setting;
  md += '## Setting\n\n';
  md += line('Period', st.period) + line('Duration', st.duration) + line('Location', st.location);
  md += line('Levels of conflict', Object.entries(st.levels).filter(([, v]) => v).map(([k]) => k).join(', '));
  for (const [k, v] of Object.entries(st.world)) md += line(k[0].toUpperCase() + k.slice(1), v);
  if (st.rules.length) md += `- **Rules of this world:**\n${st.rules.map((r) => `  - ${r}`).join('\n')}\n`;
  md += '\n';

  const d = story.values.declension;
  if (nz(d.positive)) {
    md += '## Value & Antagonism\n\n';
    md += `| Positive | Contrary | Contradictory | Negation of the Negation |\n|---|---|---|---|\n| ${d.positive} | ${d.contrary} | ${d.contradictory} | ${d.negation} |\n\n`;
    for (const f of story.antagonism.forces) md += `- *${f.level}* — **${f.name}** (${f.strength}/10) ${nz(f.description)}\n`;
    md += '\n';
  }

  md += '## Characters\n\n';
  const prot = protagonist(story);
  const ordered = [...story.characters].sort((a, b) => (a === prot ? -1 : b === prot ? 1 : 0));
  for (const c of ordered) {
    md += `### ${c.name || 'Unnamed'} — ${c.role}\n\n`;
    md += line('Characterization (mask)', c.mask) + line('True character', c.core);
    md += line('Conscious desire', c.conscious) + line('Unconscious desire', c.unconscious);
    md += line('Motivation', c.motivation) + line('Risk', c.risk) + line('Empathy', c.empathy);
    if (c.dimensions.length) md += `- **Dimensions:** ${c.dimensions.map((x) => `${x.a} / ${x.b}`).join('; ')}\n`;
    const gaps = QUALITY_AXES.filter((q) => Math.abs((c.qualities[q.id]?.mask || 0) - (c.qualities[q.id]?.core || 0)) >= 2);
    if (gaps.length) md += `- **Mask vs. heart:** ${gaps.map((q) => q.pos + '/' + q.neg).join(', ')}\n`;
    if (nz(c.arc.from) || nz(c.arc.to)) md += line('Arc', `${c.arc.from} → ${c.arc.to}`);
    md += line('Brings out in the protagonist', c.bringsOut) + line('Attitude', c.attitude);
    md += '\n';
  }

  md += '## Five-part design\n\n';
  const inc = story.inciting;
  md += line('Inciting Incident', inc.event) + line('Major Dramatic Question', inc.mdq) + line('Obligatory scene', inc.obligatory);
  const cr = story.crisis;
  md += line('Crisis', cr.optionB && cr.optionC ? `${cr.optionB} — vs. — ${cr.optionC}` : '') + line('Crisis decision', cr.choice);
  const cl = story.climax;
  md += line('Climax', cl.action) + line('Turning point within the climax', cl.turning) + line('Key image', cl.keyImage);
  md += line('Resolution', story.resolution.text);
  md += '\n';

  md += '## Step-outline\n\n';
  for (const act of acts(story)) {
    md += `### Act ${act.n}\n\n`;
    for (const it of act.items) {
      const s = it.scene;
      md += `${it.index + 1}. **${s.title || 'Untitled'}**${s.marker ? ` _[${s.marker}]_` : ''} — ${nz(s.summary)}`;
      if (hasCharge(s.open) || hasCharge(s.close)) md += ` _(${nz(s.value) || 'value'}: ${charge(s.open)} → ${charge(s.close)})_`;
      md += '\n';
      if (nz(s.treatment)) md += `\n   ${s.treatment.replace(/\n/g, '\n   ')}\n\n`;
    }
    md += '\n';
  }

  if (story.setups.length) {
    md += '## Setups & payoffs\n\n';
    for (const p of story.setups) md += `- ${p.text}: ${sceneLabel(story, p.setupScene) || '?'} → ${sceneLabel(story, p.payoffScene) || '(no payoff yet)'}\n`;
    md += '\n';
  }
  if (story.images.length) {
    md += '## Image systems\n\n';
    for (const i of story.images) md += `- **${i.name}** (${i.kind}, ${i.category}): ${nz(i.meaning)} — ${i.scenes.length} occurrences\n`;
    md += '\n';
  }

  const checks = diagnose(story);
  md += `## Story Doctor — ${score(checks)}/100\n\n`;
  for (const c of checks.filter((x) => x.status !== 'pass')) md += `- [${c.status}] **${c.title}** — ${c.detail}\n`;
  md += '\n---\nGenerated by Story Builder (principles after Robert McKee, *Story*).\n';
  return md;
}
