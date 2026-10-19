// Story Bible export: Markdown document generated from the story JSON.
import {
  acts, controllingIdeaSentence, protagonist, sceneLabel, hasCharge, endingType, QUALITY_AXES,
} from './model.js';
import { genreById } from './kb/genres.js';
import { CONTRASTS, classifyDesign, CORNERS } from './kb/triangle.js';
import { diagnose, score } from './doctor.js';
import { t } from './i18n.js';

const nz = (s) => (s && String(s).trim()) || '';
const line = (label, v) => (nz(v) ? `- **${label}:** ${nz(v)}\n` : '');
const charge = (v) => (hasCharge(v) ? (Number(v) > 0 ? `+${v}` : String(v)) : '?');

// Display names for ids written into the document (English shows the id itself).
const ENDINGS = { idealistic: t('idealistic'), pessimistic: t('pessimistic'), ironic: t('ironic') };
const LEVELS = { inner: t('inner'), personal: t('personal'), extra: t('extra') };
const WORLD = { work: t('Work'), politics: t('Politics'), rituals: t('Rituals'), values: t('Values'), biographies: t('Biographies'), laws: t('Laws') };
const ROLES = { protagonist: t('protagonist'), antagonist: t('antagonist'), supporting: t('supporting'), minor: t('minor') };
const MARKERS = {
  inciting: t('inciting'), 'seq-climax': t('seq-climax'), 'mid-act': t('mid-act'), 'act-climax': t('act-climax'),
  crisis: t('crisis'), climax: t('climax'), resolution: t('resolution'),
};
const IMAGE_KINDS = { internal: t('internal'), external: t('external') };
const STATUSES = { pass: t('pass'), warn: t('warn'), fail: t('fail'), todo: t('todo') };
const nameOf = (map, id) => map[id] || id;

export function storyToMarkdown(story) {
  let md = `# ${story.title}\n\n`;
  if (nz(story.author)) md += `*${story.author}*\n\n`;
  if (nz(story.logline)) md += `> ${story.logline}\n\n`;

  md += `## ${t('Meaning')}\n\n`;
  md += line(t('Premise'), story.premise);
  const ci = controllingIdeaSentence(story);
  md += line(t('Controlling Idea'), ci);
  md += line(t('Counter-Idea'), story.meaning.counterIdea);
  md += line(t('Ending'), nameOf(ENDINGS, endingType(story)));
  md += '\n';

  md += `## ${t('Design')}\n\n`;
  const corner = CORNERS[classifyDesign(story.triangle)];
  md += line(t('Story triangle'), `${corner.name} (${corner.sub})`);
  for (const c of CONTRASTS) {
    const v = Number(story.triangle[c.id] || 0);
    md += `  - ${v < 0.34 ? c.arch : v > 0.66 ? c.other : `${c.arch} ↔ ${c.other}`}\n`;
  }
  const g = genreById(story.genres.primary);
  md += line(t('Genre'), [g && g.name, ...story.genres.secondary.map((id) => (genreById(id) || {}).name)].filter(Boolean).join(' + '));
  md += line(t('Subgenre'), story.genres.sub);
  md += '\n';

  const st = story.setting;
  md += `## ${t('Setting')}\n\n`;
  md += line(t('Period'), st.period) + line(t('Duration'), st.duration) + line(t('Location'), st.location);
  md += line(t('Levels of conflict'), Object.entries(st.levels).filter(([, v]) => v).map(([k]) => nameOf(LEVELS, k)).join(', '));
  for (const [k, v] of Object.entries(st.world)) md += line(WORLD[k] || k[0].toUpperCase() + k.slice(1), v);
  if (st.rules.length) md += `- **${t('Rules of this world')}:**\n${st.rules.map((r) => `  - ${r}`).join('\n')}\n`;
  md += '\n';

  const d = story.values.declension;
  if (nz(d.positive)) {
    md += `## ${t('Value & Antagonism')}\n\n`;
    md += `| ${t('Positive')} | ${t('Contrary')} | ${t('Contradictory')} | ${t('Negation of the Negation')} |\n|---|---|---|---|\n| ${d.positive} | ${d.contrary} | ${d.contradictory} | ${d.negation} |\n\n`;
    for (const f of story.antagonism.forces) md += `- *${nameOf(LEVELS, f.level)}* — **${f.name}** (${f.strength}/10) ${nz(f.description)}\n`;
    md += '\n';
  }

  md += `## ${t('Characters')}\n\n`;
  const prot = protagonist(story);
  const ordered = [...story.characters].sort((a, b) => (a === prot ? -1 : b === prot ? 1 : 0));
  for (const c of ordered) {
    md += `### ${c.name || t('Unnamed')} — ${nameOf(ROLES, c.role)}\n\n`;
    md += line(t('Characterization (mask)'), c.mask) + line(t('True character'), c.core);
    md += line(t('Conscious desire'), c.conscious) + line(t('Unconscious desire'), c.unconscious);
    md += line(t('Motivation'), c.motivation) + line(t('Risk'), c.risk) + line(t('Empathy'), c.empathy);
    if (c.dimensions.length) md += `- **${t('Dimensions')}:** ${c.dimensions.map((x) => `${x.a} / ${x.b}`).join('; ')}\n`;
    const gaps = QUALITY_AXES.filter((q) => Math.abs((c.qualities[q.id]?.mask || 0) - (c.qualities[q.id]?.core || 0)) >= 2);
    if (gaps.length) md += `- **${t('Mask vs. heart')}:** ${gaps.map((q) => q.pos + '/' + q.neg).join(', ')}\n`;
    if (nz(c.arc.from) || nz(c.arc.to)) md += line(t('Arc'), `${c.arc.from} → ${c.arc.to}`);
    md += line(t('Brings out in the protagonist'), c.bringsOut) + line(t('Attitude'), c.attitude);
    md += '\n';
  }

  md += `## ${t('Five-part design')}\n\n`;
  const inc = story.inciting;
  md += line(t('Inciting Incident'), inc.event) + line(t('Major Dramatic Question'), inc.mdq) + line(t('Obligatory scene'), inc.obligatory);
  const cr = story.crisis;
  md += line(t('Crisis'), cr.optionB && cr.optionC ? t('{b} — vs. — {c}', { b: cr.optionB, c: cr.optionC }) : '') + line(t('Crisis decision'), cr.choice);
  const cl = story.climax;
  md += line(t('Climax'), cl.action) + line(t('Turning point within the climax'), cl.turning) + line(t('Key image'), cl.keyImage);
  md += line(t('Resolution'), story.resolution.text);
  md += '\n';

  md += `## ${t('Step-outline')}\n\n`;
  for (const act of acts(story)) {
    md += `### ${t('Act {n}', { n: act.n })}\n\n`;
    for (const it of act.items) {
      const s = it.scene;
      md += `${it.index + 1}. **${s.title || t('Untitled')}**${s.marker ? ` _[${nameOf(MARKERS, s.marker)}]_` : ''} — ${nz(s.summary)}`;
      if (hasCharge(s.open) || hasCharge(s.close)) md += ` _(${nz(s.value) || t('value')}: ${charge(s.open)} → ${charge(s.close)})_`;
      md += '\n';
      if (nz(s.treatment)) md += `\n   ${s.treatment.replace(/\n/g, '\n   ')}\n\n`;
    }
    md += '\n';
  }

  if (story.setups.length) {
    md += `## ${t('Setups & payoffs')}\n\n`;
    for (const p of story.setups) md += `- ${p.text}: ${sceneLabel(story, p.setupScene) || '?'} → ${sceneLabel(story, p.payoffScene) || t('(no payoff yet)')}\n`;
    md += '\n';
  }
  if (story.images.length) {
    md += `## ${t('Image systems')}\n\n`;
    for (const i of story.images) md += `- **${i.name}** (${nameOf(IMAGE_KINDS, i.kind)}, ${i.category}): ${t('{meaning} — {n} occurrences', { meaning: nz(i.meaning), n: i.scenes.length })}\n`;
    md += '\n';
  }

  const checks = diagnose(story);
  md += `## Story Doctor — ${score(checks)}/100\n\n`;
  for (const c of checks.filter((x) => x.status !== 'pass')) md += `- [${nameOf(STATUSES, c.status)}] **${c.title}** — ${c.detail}\n`;
  md += `\n---\n${t('Generated by Story Builder (principles after Robert McKee, *Story*).')}\n`;
  return md;
}
