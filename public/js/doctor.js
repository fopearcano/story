// "Story Doctor": diagnostics that test a story against McKee's principles.
// Each check returns { id, group, title, status, detail, route, principle }.
// status: 'pass' | 'warn' | 'fail' | 'todo'
import {
  acts, timeline, protagonist, turnOf, hasCharge, markerScene, dimensionCount, sceneLabel, sceneIndex,
} from './model.js';
import { genreById } from './kb/genres.js';

export const GROUPS = [
  { id: 'foundations', label: 'Foundations', hint: 'Meaning, genre, setting' },
  { id: 'character', label: 'Character', hint: 'Protagonist, desire, dimension, cast' },
  { id: 'structure', label: 'Structure', hint: 'Five-part design and acts' },
  { id: 'scenes', label: 'Scenes', hint: 'Turning points and rhythm' },
  { id: 'craft', label: 'Craft', hint: 'Antagonism, setups, exposition, images' },
];

const has = (s) => typeof s === 'string' ? s.trim().length > 0 : !!s;

export function diagnose(story) {
  const out = [];
  const add = (group, id, title, status, detail, route, principle) => out.push({ group, id, title, status, detail, route, principle });
  const prot = protagonist(story);
  const tl = timeline(story);
  const actList = acts(story);
  const scenes = story.scenes;
  const nScenes = scenes.length;

  // ---- Foundations ------------------------------------------------------
  add('foundations', 'premise', 'Premise', has(story.premise) ? 'pass' : 'todo',
    has(story.premise) ? 'Premise recorded.' : 'Write the "What would happen if…?" that inspired the story.', 'meaning', 'premise');

  const m = story.meaning;
  if (!has(m.value) && !has(m.cause)) add('foundations', 'ci', 'Controlling Idea (Value + Cause)', 'todo', 'State the story’s meaning in one sentence: the value at climax plus the chief cause.', 'meaning', 'controlling-idea');
  else if (!has(m.value) || !has(m.cause)) add('foundations', 'ci', 'Controlling Idea (Value + Cause)', 'fail', has(m.value) ? 'You have the value but not the cause — only half a meaning.' : 'You have a cause but not the resulting value.', 'meaning', 'controlling-idea');
  else add('foundations', 'ci', 'Controlling Idea (Value + Cause)', 'pass', 'Value and cause both stated.', 'meaning', 'controlling-idea');

  add('foundations', 'counter', 'Counter-Idea argued', has(m.counterIdea) ? 'pass' : 'warn',
    has(m.counterIdea) ? 'The opposing voice is defined — give it as much energy as the Idea.' : 'Without a strong Counter-Idea the story risks didacticism.', 'meaning', 'didacticism');

  const climax = markerScene(story, 'climax');
  if (climax && hasCharge(climax.close) && has(m.value)) {
    const v = Number(climax.close);
    const ok = (m.charge === 'positive' && v > 0) || (m.charge === 'negative' && v < 0) || (m.charge === 'ironic');
    add('foundations', 'ci-climax', 'Climax expresses the Controlling Idea', ok ? 'pass' : 'warn',
      ok ? 'Climax charge matches the Controlling Idea.' : `The Controlling Idea is ${m.charge}, but the climax closes at ${v > 0 ? '+' : ''}${v}. The story tells you its meaning — revise one of them.`, 'meaning', 'controlling-idea');
  }

  const g = story.genres;
  if (!g.primary) add('foundations', 'genre', 'Genre identified', 'todo', 'Identify your genre (or combination) and study its conventions.', 'genre', 'genre-conventions');
  else {
    const genre = genreById(g.primary);
    const total = genre ? genre.conventions.length : 0;
    const done = genre ? genre.conventions.filter((_, i) => g.checks[`${g.primary}:${i}`]).length : 0;
    add('foundations', 'genre', 'Genre conventions honoured', total && done >= Math.ceil(total / 2) ? 'pass' : 'warn',
      `${genre ? genre.name : g.primary}: ${done}/${total} conventions planned. Keep the convention, avoid the cliché.`, 'genre', 'convention-vs-cliche');
  }

  const st = story.setting;
  const missing = ['period', 'duration', 'location'].filter((k) => !has(st[k]));
  const anyLevel = Object.values(st.levels).some(Boolean);
  if (!anyLevel) missing.push('level of conflict');
  add('foundations', 'setting', 'Setting in four dimensions', missing.length ? (missing.length > 2 ? 'todo' : 'warn') : 'pass',
    missing.length ? `Missing: ${missing.join(', ')}.` : 'Period, duration, location and level of conflict are defined.', 'setting', 'setting-4d');

  const locs = new Set(scenes.map((s) => (s.location || '').trim().toLowerCase()).filter(Boolean)).size;
  const castN = story.characters.length;
  if (nScenes) {
    const big = locs > 20 || castN > 20;
    add('foundations', 'small-world', 'Small, knowable world', big ? 'warn' : 'pass',
      `${castN} characters, ${locs} locations. ${big ? 'A vast world dilutes knowledge — don’t proliferate characters or locations.' : 'Contained enough to know in depth.'}`, 'setting', 'creative-limitation');
  }

  // ---- Character --------------------------------------------------------
  const prots = story.characters.filter((c) => c.role === 'protagonist');
  if (!prot) add('character', 'prot', 'Protagonist', 'fail', 'Every story needs a willful protagonist (single, plural or multi).', 'characters', 'protagonist-willful');
  else {
    add('character', 'prot', 'Protagonist', prots.length > 1 ? 'warn' : 'pass',
      prots.length > 1 ? `${prots.length} protagonists: as a Plural-Protagonist they must share one desire and one fate; otherwise you are writing a Multiplot.` : `${prot.name || 'Unnamed'} drives the story.`, 'characters', 'protagonist-willful');
    add('character', 'conscious', 'Conscious desire (Object of Desire)', has(prot.conscious) ? 'pass' : 'fail',
      has(prot.conscious) ? `Wants: ${prot.conscious}` : 'If you asked your protagonist "What do you want?", what would he answer?', 'characters', 'conscious-desire');
    add('character', 'unconscious', 'Unconscious, contradictory desire', has(prot.unconscious) ? 'pass' : 'warn',
      has(prot.unconscious) ? 'An unconscious desire gives the story its Spine and the protagonist depth.' : 'Optional, but the most memorable protagonists also want, unknowingly, the opposite of what they pursue.', 'characters', 'unconscious-desire');
    add('character', 'risk', 'Risk: the worst that can happen', has(prot.risk) ? 'pass' : 'fail',
      has(prot.risk) ? prot.risk : 'What does the protagonist stand to lose? "Life goes back to normal" means the story is misconceived.', 'characters', 'risk');
    add('character', 'empathy', 'Empathy ("like me")', has(prot.empathy) ? 'pass' : 'warn',
      has(prot.empathy) ? 'The audience bond is defined.' : 'Name the shared humanity that makes the audience root for him. Likability is optional; empathy is not.', 'characters', 'empathy');
    const maskCore = has(prot.mask) && has(prot.core);
    add('character', 'true-char', 'True character vs. characterization', maskCore ? 'pass' : 'warn',
      maskCore ? 'Mask and heart are both defined.' : 'Define the outer mask and the true character that choices under pressure will reveal.', 'characters', 'true-character');
    const pd = dimensionCount(prot);
    const rival = story.characters.filter((c) => c.id !== prot.id).map((c) => ({ c, d: dimensionCount(c) })).sort((a, b) => b.d - a.d)[0];
    if (pd === 0) add('character', 'dimension', 'Dimension = contradiction', 'warn', 'Add at least one consistent contradiction (within deep character, or between mask and heart).', 'characters', 'dimension');
    else if (rival && rival.d > pd) add('character', 'dimension', 'Protagonist is the most dimensional', 'warn', `${rival.c.name || 'A supporting role'} has more dimensions (${rival.d}) than the protagonist (${pd}) — the Center of Good may decenter.`, 'cast', 'most-dimensional');
    else add('character', 'dimension', 'Protagonist is the most dimensional', 'pass', `${pd} dimension${pd === 1 ? '' : 's'}.`, 'cast', 'most-dimensional');
    add('character', 'will', 'Will, capacity and a chance', (prot.willpower >= 5 && has(prot.chance)) ? 'pass' : 'warn',
      `Willpower ${prot.willpower}/10. ${has(prot.chance) ? 'Has a chance.' : 'State the chance he has to succeed — a hopeless protagonist cannot interest us.'}`, 'characters', 'capacity-chance');
    add('character', 'arc', 'Character arc', (has(prot.arc.from) && has(prot.arc.to)) ? 'pass' : 'warn',
      (has(prot.arc.from) && has(prot.arc.to)) ? `${prot.arc.from} → ${prot.arc.to}` : 'How does the protagonist’s inner nature change by the climax?', 'characters', 'character-arc');
  }
  const support = story.characters.filter((c) => c.role !== 'protagonist' && c.role !== 'minor');
  if (support.length) {
    const atts = support.map((c) => (c.attitude || '').trim().toLowerCase());
    const blank = atts.filter((a) => !a).length;
    const dupes = atts.filter((a, i) => a && atts.indexOf(a) !== i).length;
    add('character', 'polarized', 'Polarized cast (the dinner-table test)', blank || dupes ? 'warn' : 'pass',
      blank || dupes ? `${blank} role(s) without a distinct attitude${dupes ? `, ${dupes} duplicate attitude(s)` : ''}. Characters who react alike should be merged or cut.` : 'Every principal has a distinct attitude.', 'cast', 'cast-polarization');
    const noOrbit = support.filter((c) => !has(c.bringsOut)).length;
    add('character', 'orbit', 'Cast orbits the protagonist', noOrbit ? 'warn' : 'pass',
      noOrbit ? `${noOrbit} supporting role(s) don’t yet bring out a side of the protagonist.` : 'Each supporting role delineates a dimension of the protagonist.', 'cast', 'cast-design');
  }

  // ---- Structure --------------------------------------------------------
  const inc = story.inciting;
  const incScene = inc.sceneId ? scenes.find((s) => s.id === inc.sceneId) : markerScene(story, 'inciting');
  if (!has(inc.event) && !incScene) add('structure', 'inciting', 'Inciting Incident', 'todo', 'Design the event that radically upsets the balance of the protagonist’s life.', 'inciting', 'inciting-incident');
  else {
    add('structure', 'inciting', 'Inciting Incident', inc.onscreen === false ? 'fail' : 'pass',
      inc.onscreen === false ? 'The central plot’s Inciting Incident must happen onscreen, not in backstory.' : 'Defined and onscreen.', 'inciting', 'onscreen');
    if (incScene) {
      const it = tl.items.find((x) => x.scene.id === incScene.id);
      const pct = Math.round(it.startPct * 100);
      add('structure', 'inciting-placement', 'Inciting Incident placement', pct <= 25 ? 'pass' : 'warn',
        pct <= 25 ? `At ${pct}% of the telling.` : `At ${pct}% — later than the first quarter. If the moment needs ripening, hold the audience with a setup subplot.`, 'structure', 'placement');
    } else add('structure', 'inciting-placement', 'Inciting Incident placement', 'todo', 'Link the Inciting Incident to a scene (or mark a scene as Inciting Incident).', 'inciting', 'placement');
  }
  add('structure', 'mdq', 'Major Dramatic Question & Obligatory Scene', has(inc.mdq) && has(inc.obligatory) ? 'pass' : 'warn',
    has(inc.mdq) && has(inc.obligatory) ? inc.mdq : 'What question does the Inciting Incident raise, and what scene does it promise?', 'inciting', 'onscreen');

  if (nScenes >= 6) {
    add('structure', 'three-acts', 'At least three acts', actList.length >= 3 ? 'pass' : 'warn',
      `${actList.length} act${actList.length === 1 ? '' : 's'} detected (from act climax / crisis / climax markers). A full-length story needs at least three major reversals.`, 'structure', 'three-acts');
    if (actList.length >= 2) {
      const first = actList[0];
      const last = actList[actList.length - 1];
      const firstPct = Math.round((first.endPct - first.startPct) * 100);
      add('structure', 'act-one', 'Act One proportion', firstPct <= 40 ? 'pass' : 'warn', `Act One is ${firstPct}% of the telling (typically about a quarter).`, 'structure', 'three-acts');
      const lastLen = last.end - last.start;
      const longest = Math.max(...actList.slice(0, -1).map((a) => a.end - a.start));
      add('structure', 'last-act', 'Last act is the shortest', lastLen <= longest ? 'pass' : 'warn',
        lastLen <= longest ? 'The last act accelerates to the climax.' : 'The last act is longer than an earlier act; its pace will sag in mid-movement.', 'structure', 'three-acts');
    }
  }
  const climaxes = actList.map((a) => a.climax).filter(Boolean);
  if (climaxes.length >= 2) {
    const ult = climaxes[climaxes.length - 1];
    const pen = climaxes[climaxes.length - 2];
    if (hasCharge(ult.close) && hasCharge(pen.close)) {
      const a = Math.sign(Number(ult.close));
      const b = Math.sign(Number(pen.close));
      add('structure', 'act-rhythm', 'Penultimate and final climaxes contrast', a !== 0 && a === b ? 'fail' : 'pass',
        a !== 0 && a === b ? 'The last two act climaxes share a charge: "things were good, then they got even better" halves the power of the ending.' : 'The penultimate climax contradicts the story climax.', 'structure', 'act-rhythm');
    }
  }
  const cr = story.crisis;
  add('structure', 'crisis', 'Crisis is a true dilemma', has(cr.optionB) && has(cr.optionC) ? 'pass' : 'warn',
    has(cr.optionB) && has(cr.optionC) ? `${cr.dilemma === 'lesser-evil' ? 'Lesser of two evils' : cr.dilemma === 'both' ? 'Irreconcilable goods + lesser of two evils' : 'Irreconcilable goods'}: B vs. C.` : 'Frame the Crisis as A caught between B and C — not good vs. evil.', 'crisis', 'dilemma');
  const cl = story.climax;
  add('structure', 'deus', 'Climax caused by choice, not coincidence', cl.causedBy === 'coincidence' ? 'fail' : 'pass',
    cl.causedBy === 'coincidence' ? 'Deus ex machina: a coincidental ending erases meaning and emotion.' : 'The ending comes from the protagonist’s choice and action.', 'crisis', 'coincidence');
  if (climax && hasCharge(climax.close)) {
    const v = Number(climax.close);
    const swing = hasCharge(climax.open) ? Math.abs(v - Number(climax.open)) : 0;
    const absolute = Math.abs(v) === 3 || (v === 0 && story.meaning.charge === 'ironic');
    add('structure', 'climax-absolute', 'Climax: absolute, irreversible change', absolute && swing >= 3 ? 'pass' : 'warn',
      absolute && swing >= 3 ? `Value swing of ${swing} to maximum charge.` : 'The story climax should swing the value to its maximum charge — a final action beyond which the audience can imagine no other.', 'crisis', 'climax');
  } else add('structure', 'climax-absolute', 'Story Climax', 'todo', 'Mark the climax scene and its closing charge. 75% of design effort goes into it.', 'crisis', 'last-act');
  add('structure', 'key-image', 'Key image (spectacle and truth)', has(cl.keyImage) ? 'pass' : 'warn',
    has(cl.keyImage) ? cl.keyImage : 'Find the single climactic image that concentrates the story’s meaning.', 'crisis', 'key-image');

  const gaps = story.gaps || [];
  if (gaps.length >= 2) {
    const retreats = gaps.filter((gp, i) => i > 0 && Number(gp.risk) <= Number(gaps[i - 1].risk)).length;
    add('structure', 'progression', 'Progressive complications (points of no return)', retreats ? 'warn' : 'pass',
      retreats ? `${retreats} step(s) don’t raise the risk. Never retreat to actions of lesser quality or magnitude.` : 'Each action demands more will and risk than the last.', 'gaps', 'progressive-complications');
  } else add('structure', 'progression', 'Progressive complications', 'todo', 'Chart the protagonist’s escalating actions and the gaps they open.', 'gaps', 'progressive-complications');

  // ---- Scenes -----------------------------------------------------------
  if (!nScenes) add('scenes', 'scenes', 'Scenes', 'todo', 'Add scenes (a feature typically has 40–60; any count works).', 'scenes', 'scene');
  else {
    const charged = scenes.filter((s) => hasCharge(s.open) && hasCharge(s.close));
    const flat = charged.filter((s) => turnOf(s) === 0);
    add('scenes', 'charged', 'Values tracked in scenes', charged.length === nScenes ? 'pass' : charged.length ? 'warn' : 'todo',
      `${charged.length}/${nScenes} scenes have opening and closing charges.`, 'scenes', 'step2');
    add('scenes', 'turns', 'Every scene turns', flat.length ? 'fail' : charged.length ? 'pass' : 'todo',
      flat.length ? `Non-events: ${flat.map((s) => sceneLabel(story, s.id)).join('; ')}. Make them turn or cut them.` : 'No scene that doesn’t turn.', 'scenes', 'scene');

    // Law of diminishing returns: three or more consecutive turns in the same direction.
    let run = 1; let worst = 1; let at = -1;
    for (let i = 1; i < scenes.length; i++) {
      const d0 = Math.sign(turnOf(scenes[i - 1]) || 0);
      const d1 = Math.sign(turnOf(scenes[i]) || 0);
      if (d1 !== 0 && d1 === d0) { run++; if (run > worst) { worst = run; at = i; } } else run = 1;
    }
    add('scenes', 'diminishing', 'Alternating emotional charges', worst >= 3 ? 'warn' : 'pass',
      worst >= 3 ? `${worst} consecutive scenes turn the same way (ending at scene ${at + 1}). The Law of Diminishing Returns will drain them.` : 'Charges alternate between positive and negative transitions.', 'composition', 'diminishing-returns');

    const lateCoinc = tl.items.filter((it) => it.scene.coincidence && it.startPct > 0.5);
    add('scenes', 'coincidence', 'No coincidence after the midpoint', lateCoinc.length ? 'warn' : 'pass',
      lateCoinc.length ? `Coincidence in: ${lateCoinc.map((it) => sceneLabel(story, it.scene.id)).join('; ')}. Put the story in the characters’ hands.` : 'Coincidence (if any) arrives early enough to gain meaning.', 'scenes', 'coincidence');

    const avg = tl.total / nScenes;
    add('scenes', 'rhythm', 'Scene rhythm', avg <= 4.5 ? 'pass' : 'warn',
      `Average scene length ${avg.toFixed(1)} pages (≈ minutes). ${avg <= 4.5 ? '' : 'Long scenes make the camera repeat itself — aim for 2–3.'}`, 'composition', 'rhythm-tempo');

    const withConflict = scenes.filter((s) => has(s.desire) && (has(s.antagonist) || has(s.antagonistDesire))).length;
    add('scenes', 'conflict', 'Scene conflicts defined (Step 1)', withConflict >= nScenes / 2 ? 'pass' : 'warn',
      `${withConflict}/${nScenes} scenes define who drives them, what they want, and what blocks it.`, 'scenes', 'step1');
  }

  // ---- Craft ------------------------------------------------------------
  const neg = scenes.some((s) => Number(s.close) <= -3 || Number(s.open) <= -3);
  const d = story.values.declension;
  if (!has(d.positive)) add('craft', 'declension', 'Value declension', 'todo', 'Name the primary value and its Contrary, Contradictory and Negation of the Negation.', 'values', 'principle-antagonism');
  else add('craft', 'declension', 'Antagonism reaches the end of the line', neg ? 'pass' : 'warn',
    neg ? `The story reaches the Negation of the Negation (${d.negation || 'max negative'}).` : 'No scene reaches the Negation of the Negation — the story may satisfy, but never be sublime.', 'values', 'negation-of-negation');

  const forces = story.antagonism.forces || [];
  const levelsUsed = new Set([
    ...forces.map((f) => f.level),
    ...scenes.flatMap((s) => Object.entries(s.levels || {}).filter(([, v]) => v).map(([k]) => k)),
  ]);
  add('craft', 'complexity', 'Complexity: conflict on all three levels', levelsUsed.size >= 3 ? 'pass' : levelsUsed.size ? 'warn' : 'todo',
    `Levels in play: ${[...levelsUsed].join(', ') || 'none'}. Conflict on one level is mere complication.`, 'gaps', 'complexity');

  const setups = story.setups || [];
  if (setups.length) {
    const dangling = setups.filter((p) => !p.payoffScene);
    const inverted = setups.filter((p) => p.setupScene && p.payoffScene && sceneIndex(story, p.payoffScene) < sceneIndex(story, p.setupScene));
    add('craft', 'setups', 'Setups pay off', inverted.length ? 'fail' : dangling.length ? 'warn' : 'pass',
      inverted.length ? `${inverted.length} payoff(s) come before their setup.` : dangling.length ? `${dangling.length} setup(s) without a payoff yet.` : `${setups.length} setups, all paid off.`, 'setups', 'setups-payoffs');
  } else add('craft', 'setups', 'Setups and payoffs', 'todo', 'Plant knowledge that a later turning point will pay off.', 'setups', 'setups-payoffs');

  const imgs = story.images || [];
  if (imgs.length) {
    const weak = imgs.filter((i) => (i.scenes || []).length < 3).length;
    const ext = imgs.filter((i) => i.kind === 'external').length;
    add('craft', 'images', 'Image systems', weak ? 'warn' : 'pass',
      `${imgs.length} system(s)${ext ? `, ${ext} external` : ''}. ${weak ? `${weak} with fewer than 3 occurrences — an image system repeats with persistence and variation.` : 'Motifs recur through the story.'}`, 'images', 'image-system');
  } else add('craft', 'images', 'Image systems', 'todo', 'Choose a category of imagery to repeat subliminally from beginning to end.', 'images', 'image-system');

  const expo = story.exposition || [];
  if (expo.length) {
    const earlySecrets = expo.filter((e) => e.secret && e.sceneId).filter((e) => {
      const it = tl.items.find((x) => x.scene.id === e.sceneId);
      return it && it.startPct < 0.25;
    }).length;
    const told = expo.filter((e) => e.method === 'told').length;
    add('craft', 'exposition', 'Exposition: save the best for last', earlySecrets || told ? 'warn' : 'pass',
      earlySecrets || told ? `${earlySecrets ? `${earlySecrets} secret(s) revealed in the first quarter. ` : ''}${told ? `${told} fact(s) told on the nose — convert them to ammunition.` : ''}` : 'Secrets are held back and exposition is dramatized.', 'exposition', 'parse-exposition');
  }

  const subs = story.plotlines.filter((p) => p.id !== 'main');
  if (subs.length) {
    const loose = subs.filter((p) => !p.relation);
    add('craft', 'subplots', 'Subplots relate to the central plot', loose.length ? 'warn' : 'pass',
      loose.length ? `${loose.map((p) => p.name).join(', ')} run alongside without contradicting, resonating, setting up or complicating the central plot.` : 'Each subplot has a structural or thematic relationship.', 'subplots', 'subplots');
  }

  return out;
}

export function score(checks) {
  if (!checks.length) return 0;
  const pts = { pass: 1, warn: 0.5, fail: 0, todo: 0 };
  return Math.round((checks.reduce((s, c) => s + pts[c.status], 0) / checks.length) * 100);
}

export function groupScores(checks) {
  return GROUPS.map((g) => {
    const cs = checks.filter((c) => c.group === g.id);
    return { ...g, score: score(cs), count: cs.length, fails: cs.filter((c) => c.status === 'fail').length };
  });
}
