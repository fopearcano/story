// "Story Doctor": diagnostics that test a story against McKee's principles.
// Each check returns { id, group, title, status, detail, route, principle }.
// status: 'pass' | 'warn' | 'fail' | 'todo'
import {
  acts, timeline, protagonist, turnOf, hasCharge, markerScene, dimensionCount, sceneLabel, sceneIndex,
} from './model.js';
import { genreById } from './kb/genres.js';
import { lang, t, tn } from './i18n.js';

export const GROUPS = [
  { id: 'foundations', label: t('Foundations'), hint: t('Meaning, genre, setting') },
  { id: 'character', label: t('Character'), hint: t('Protagonist, desire, dimension, cast') },
  { id: 'structure', label: t('Structure'), hint: t('Five-part design and acts') },
  { id: 'scenes', label: t('Scenes'), hint: t('Turning points and rhythm') },
  { id: 'craft', label: t('Craft'), hint: t('Antagonism, setups, exposition, images') },
];

// Display names for ids that end up in a detail line.
const SETTING_FIELDS = { period: t('period'), duration: t('duration'), location: t('location') };
const LEVELS = { inner: t('inner'), personal: t('personal'), extra: t('extra') };

const has = (s) => typeof s === 'string' ? s.trim().length > 0 : !!s;
const decimal1 = (x) => (lang === 'it' ? x.toFixed(1).replace('.', ',') : x.toFixed(1));

export function diagnose(story) {
  const out = [];
  const add = (group, id, title, status, detail, route, principle) => out.push({ group, id, title, status, detail, route, principle });
  const prot = protagonist(story);
  const tl = timeline(story);
  const actList = acts(story);
  const scenes = story.scenes;
  const nScenes = scenes.length;

  // ---- Foundations ------------------------------------------------------
  add('foundations', 'premise', t('Premise'), has(story.premise) ? 'pass' : 'todo',
    has(story.premise) ? t('Premise recorded.') : t('Write the "What would happen if…?" that inspired the story.'), 'meaning', 'premise');

  const m = story.meaning;
  if (!has(m.value) && !has(m.cause)) add('foundations', 'ci', t('Controlling Idea (Value + Cause)'), 'todo', t('State the story’s meaning in one sentence: the value at climax plus the chief cause.'), 'meaning', 'controlling-idea');
  else if (!has(m.value) || !has(m.cause)) add('foundations', 'ci', t('Controlling Idea (Value + Cause)'), 'fail', has(m.value) ? t('You have the value but not the cause — only half a meaning.') : t('You have a cause but not the resulting value.'), 'meaning', 'controlling-idea');
  else add('foundations', 'ci', t('Controlling Idea (Value + Cause)'), 'pass', t('Value and cause both stated.'), 'meaning', 'controlling-idea');

  add('foundations', 'counter', t('Counter-Idea argued'), has(m.counterIdea) ? 'pass' : 'warn',
    has(m.counterIdea) ? t('The opposing voice is defined — give it as much energy as the Idea.') : t('Without a strong Counter-Idea the story risks didacticism.'), 'meaning', 'didacticism');

  const climax = markerScene(story, 'climax');
  if (climax && hasCharge(climax.close) && has(m.value)) {
    const v = Number(climax.close);
    const ok = (m.charge === 'positive' && v > 0) || (m.charge === 'negative' && v < 0) || (m.charge === 'ironic');
    const closeAt = `${v > 0 ? '+' : ''}${v}`;
    const mismatch = m.charge === 'positive'
      ? t('The Controlling Idea is positive, but the climax closes at {v}. The story tells you its meaning — revise one of them.', { v: closeAt })
      : m.charge === 'negative'
        ? t('The Controlling Idea is negative, but the climax closes at {v}. The story tells you its meaning — revise one of them.', { v: closeAt })
        : t('The Controlling Idea is {charge}, but the climax closes at {v}. The story tells you its meaning — revise one of them.', { charge: m.charge, v: closeAt });
    add('foundations', 'ci-climax', t('Climax expresses the Controlling Idea'), ok ? 'pass' : 'warn',
      ok ? t('Climax charge matches the Controlling Idea.') : mismatch, 'meaning', 'controlling-idea');
  }

  const g = story.genres;
  if (!g.primary) add('foundations', 'genre', t('Genre identified'), 'todo', t('Identify your genre (or combination) and study its conventions.'), 'genre', 'genre-conventions');
  else {
    const genre = genreById(g.primary);
    const total = genre ? genre.conventions.length : 0;
    const done = genre ? genre.conventions.filter((_, i) => g.checks[`${g.primary}:${i}`]).length : 0;
    add('foundations', 'genre', t('Genre conventions honoured'), total && done >= Math.ceil(total / 2) ? 'pass' : 'warn',
      t('{genre}: {done}/{total} conventions planned. Keep the convention, avoid the cliché.', { genre: genre ? genre.name : g.primary, done, total }), 'genre', 'convention-vs-cliche');
  }

  const st = story.setting;
  const missing = ['period', 'duration', 'location'].filter((k) => !has(st[k])).map((k) => SETTING_FIELDS[k]);
  const anyLevel = Object.values(st.levels).some(Boolean);
  if (!anyLevel) missing.push(t('level of conflict'));
  add('foundations', 'setting', t('Setting in four dimensions'), missing.length ? (missing.length > 2 ? 'todo' : 'warn') : 'pass',
    missing.length ? t('Missing: {list}.', { list: missing.join(', ') }) : t('Period, duration, location and level of conflict are defined.'), 'setting', 'setting-4d');

  const locs = new Set(scenes.map((s) => (s.location || '').trim().toLowerCase()).filter(Boolean)).size;
  const castN = story.characters.length;
  if (nScenes) {
    const big = locs > 20 || castN > 20;
    add('foundations', 'small-world', t('Small, knowable world'), big ? 'warn' : 'pass',
      big
        ? t('{chars} characters, {locs} locations. A vast world dilutes knowledge — don’t proliferate characters or locations.', { chars: castN, locs })
        : t('{chars} characters, {locs} locations. Contained enough to know in depth.', { chars: castN, locs }), 'setting', 'creative-limitation');
  }

  // ---- Character --------------------------------------------------------
  const prots = story.characters.filter((c) => c.role === 'protagonist');
  if (!prot) add('character', 'prot', t('Protagonist'), 'fail', t('Every story needs a willful protagonist (single, plural or multi).'), 'characters', 'protagonist-willful');
  else {
    add('character', 'prot', t('Protagonist'), prots.length > 1 ? 'warn' : 'pass',
      prots.length > 1
        ? t('{n} protagonists: as a Plural-Protagonist they must share one desire and one fate; otherwise you are writing a Multiplot.', { n: prots.length })
        : t('{name} drives the story.', { name: prot.name || t('Unnamed') }), 'characters', 'protagonist-willful');
    add('character', 'conscious', t('Conscious desire (Object of Desire)'), has(prot.conscious) ? 'pass' : 'fail',
      has(prot.conscious) ? t('Wants: {desire}', { desire: prot.conscious }) : t('If you asked your protagonist "What do you want?", what would he answer?'), 'characters', 'conscious-desire');
    add('character', 'unconscious', t('Unconscious, contradictory desire'), has(prot.unconscious) ? 'pass' : 'warn',
      has(prot.unconscious) ? t('An unconscious desire gives the story its Spine and the protagonist depth.') : t('Optional, but the most memorable protagonists also want, unknowingly, the opposite of what they pursue.'), 'characters', 'unconscious-desire');
    add('character', 'risk', t('Risk: the worst that can happen'), has(prot.risk) ? 'pass' : 'fail',
      has(prot.risk) ? prot.risk : t('What does the protagonist stand to lose? "Life goes back to normal" means the story is misconceived.'), 'characters', 'risk');
    add('character', 'empathy', t('Empathy ("like me")'), has(prot.empathy) ? 'pass' : 'warn',
      has(prot.empathy) ? t('The audience bond is defined.') : t('Name the shared humanity that makes the audience root for him. Likability is optional; empathy is not.'), 'characters', 'empathy');
    const maskCore = has(prot.mask) && has(prot.core);
    add('character', 'true-char', t('True character vs. characterization'), maskCore ? 'pass' : 'warn',
      maskCore ? t('Mask and heart are both defined.') : t('Define the outer mask and the true character that choices under pressure will reveal.'), 'characters', 'true-character');
    const pd = dimensionCount(prot);
    const rival = story.characters.filter((c) => c.id !== prot.id).map((c) => ({ c, d: dimensionCount(c) })).sort((a, b) => b.d - a.d)[0];
    if (pd === 0) add('character', 'dimension', t('Dimension = contradiction'), 'warn', t('Add at least one consistent contradiction (within deep character, or between mask and heart).'), 'characters', 'dimension');
    else if (rival && rival.d > pd) add('character', 'dimension', t('Protagonist is the most dimensional'), 'warn', t('{name} has more dimensions ({d}) than the protagonist ({pd}) — the Center of Good may decenter.', { name: rival.c.name || t('A supporting role'), d: rival.d, pd }), 'cast', 'most-dimensional');
    else add('character', 'dimension', t('Protagonist is the most dimensional'), 'pass', tn(pd, '{n} dimension.', '{n} dimensions.'), 'cast', 'most-dimensional');
    add('character', 'will', t('Will, capacity and a chance'), (prot.willpower >= 5 && has(prot.chance)) ? 'pass' : 'warn',
      has(prot.chance)
        ? t('Willpower {w}/10. Has a chance.', { w: prot.willpower })
        : t('Willpower {w}/10. State the chance he has to succeed — a hopeless protagonist cannot interest us.', { w: prot.willpower }), 'characters', 'capacity-chance');
    add('character', 'arc', t('Character arc'), (has(prot.arc.from) && has(prot.arc.to)) ? 'pass' : 'warn',
      (has(prot.arc.from) && has(prot.arc.to)) ? `${prot.arc.from} → ${prot.arc.to}` : t('How does the protagonist’s inner nature change by the climax?'), 'characters', 'character-arc');
  }
  const support = story.characters.filter((c) => c.role !== 'protagonist' && c.role !== 'minor');
  if (support.length) {
    const atts = support.map((c) => (c.attitude || '').trim().toLowerCase());
    const blank = atts.filter((a) => !a).length;
    const dupes = atts.filter((a, i) => a && atts.indexOf(a) !== i).length;
    add('character', 'polarized', t('Polarized cast (the dinner-table test)'), blank || dupes ? 'warn' : 'pass',
      blank || dupes
        ? (dupes
          ? t('{blank} role(s) without a distinct attitude, {dupes} duplicate attitude(s). Characters who react alike should be merged or cut.', { blank, dupes })
          : t('{blank} role(s) without a distinct attitude. Characters who react alike should be merged or cut.', { blank }))
        : t('Every principal has a distinct attitude.'), 'cast', 'cast-polarization');
    const noOrbit = support.filter((c) => !has(c.bringsOut)).length;
    add('character', 'orbit', t('Cast orbits the protagonist'), noOrbit ? 'warn' : 'pass',
      noOrbit ? t('{n} supporting role(s) don’t yet bring out a side of the protagonist.', { n: noOrbit }) : t('Each supporting role delineates a dimension of the protagonist.'), 'cast', 'cast-design');
  }

  // ---- Structure --------------------------------------------------------
  const inc = story.inciting;
  const incScene = inc.sceneId ? scenes.find((s) => s.id === inc.sceneId) : markerScene(story, 'inciting');
  if (!has(inc.event) && !incScene) add('structure', 'inciting', t('Inciting Incident'), 'todo', t('Design the event that radically upsets the balance of the protagonist’s life.'), 'inciting', 'inciting-incident');
  else {
    add('structure', 'inciting', t('Inciting Incident'), inc.onscreen === false ? 'fail' : 'pass',
      inc.onscreen === false ? t('The central plot’s Inciting Incident must happen onscreen, not in backstory.') : t('Defined and onscreen.'), 'inciting', 'onscreen');
    if (incScene) {
      const it = tl.items.find((x) => x.scene.id === incScene.id);
      const pct = Math.round(it.startPct * 100);
      add('structure', 'inciting-placement', t('Inciting Incident placement'), pct <= 25 ? 'pass' : 'warn',
        pct <= 25 ? t('At {pct}% of the telling.', { pct }) : t('At {pct}% — later than the first quarter. If the moment needs ripening, hold the audience with a setup subplot.', { pct }), 'structure', 'placement');
    } else add('structure', 'inciting-placement', t('Inciting Incident placement'), 'todo', t('Link the Inciting Incident to a scene (or mark a scene as Inciting Incident).'), 'inciting', 'placement');
  }
  add('structure', 'mdq', t('Major Dramatic Question & Obligatory Scene'), has(inc.mdq) && has(inc.obligatory) ? 'pass' : 'warn',
    has(inc.mdq) && has(inc.obligatory) ? inc.mdq : t('What question does the Inciting Incident raise, and what scene does it promise?'), 'inciting', 'onscreen');

  if (nScenes >= 6) {
    const nActs = actList.length;
    add('structure', 'three-acts', t('At least three acts'), nActs >= 3 ? 'pass' : 'warn',
      tn(nActs, '{n} act detected (from act climax / crisis / climax markers). A full-length story needs at least three major reversals.',
        '{n} acts detected (from act climax / crisis / climax markers). A full-length story needs at least three major reversals.'), 'structure', 'three-acts');
    if (actList.length >= 2) {
      const first = actList[0];
      const last = actList[actList.length - 1];
      const firstPct = Math.round((first.endPct - first.startPct) * 100);
      add('structure', 'act-one', t('Act One proportion'), firstPct <= 40 ? 'pass' : 'warn', t('Act One is {pct}% of the telling (typically about a quarter).', { pct: firstPct }), 'structure', 'three-acts');
      const lastLen = last.end - last.start;
      const longest = Math.max(...actList.slice(0, -1).map((a) => a.end - a.start));
      add('structure', 'last-act', t('Last act is the shortest'), lastLen <= longest ? 'pass' : 'warn',
        lastLen <= longest ? t('The last act accelerates to the climax.') : t('The last act is longer than an earlier act; its pace will sag in mid-movement.'), 'structure', 'three-acts');
    }
  }
  const climaxes = actList.map((a) => a.climax).filter(Boolean);
  if (climaxes.length >= 2) {
    const ult = climaxes[climaxes.length - 1];
    const pen = climaxes[climaxes.length - 2];
    if (hasCharge(ult.close) && hasCharge(pen.close)) {
      const a = Math.sign(Number(ult.close));
      const b = Math.sign(Number(pen.close));
      add('structure', 'act-rhythm', t('Penultimate and final climaxes contrast'), a !== 0 && a === b ? 'fail' : 'pass',
        a !== 0 && a === b ? t('The last two act climaxes share a charge: "things were good, then they got even better" halves the power of the ending.') : t('The penultimate climax contradicts the story climax.'), 'structure', 'act-rhythm');
    }
  }
  const cr = story.crisis;
  const dilemma = cr.dilemma === 'lesser-evil' ? t('Lesser of two evils') : cr.dilemma === 'both' ? t('Irreconcilable goods + lesser of two evils') : t('Irreconcilable goods');
  add('structure', 'crisis', t('Crisis is a true dilemma'), has(cr.optionB) && has(cr.optionC) ? 'pass' : 'warn',
    has(cr.optionB) && has(cr.optionC) ? t('{dilemma}: B vs. C.', { dilemma }) : t('Frame the Crisis as A caught between B and C — not good vs. evil.'), 'crisis', 'dilemma');
  const cl = story.climax;
  add('structure', 'deus', t('Climax caused by choice, not coincidence'), cl.causedBy === 'coincidence' ? 'fail' : 'pass',
    cl.causedBy === 'coincidence' ? t('Deus ex machina: a coincidental ending erases meaning and emotion.') : t('The ending comes from the protagonist’s choice and action.'), 'crisis', 'coincidence');
  if (climax && hasCharge(climax.close)) {
    const v = Number(climax.close);
    const swing = hasCharge(climax.open) ? Math.abs(v - Number(climax.open)) : 0;
    const absolute = Math.abs(v) === 3 || (v === 0 && story.meaning.charge === 'ironic');
    add('structure', 'climax-absolute', t('Climax: absolute, irreversible change'), absolute && swing >= 3 ? 'pass' : 'warn',
      absolute && swing >= 3 ? t('Value swing of {swing} to maximum charge.', { swing }) : t('The story climax should swing the value to its maximum charge — a final action beyond which the audience can imagine no other.'), 'crisis', 'climax');
  } else add('structure', 'climax-absolute', t('Story Climax'), 'todo', t('Mark the climax scene and its closing charge. 75% of design effort goes into it.'), 'crisis', 'last-act');
  add('structure', 'key-image', t('Key image (spectacle and truth)'), has(cl.keyImage) ? 'pass' : 'warn',
    has(cl.keyImage) ? cl.keyImage : t('Find the single climactic image that concentrates the story’s meaning.'), 'crisis', 'key-image');

  const gaps = story.gaps || [];
  if (gaps.length >= 2) {
    const retreats = gaps.filter((gp, i) => i > 0 && Number(gp.risk) <= Number(gaps[i - 1].risk)).length;
    add('structure', 'progression', t('Progressive complications (points of no return)'), retreats ? 'warn' : 'pass',
      retreats ? t('{n} step(s) don’t raise the risk. Never retreat to actions of lesser quality or magnitude.', { n: retreats }) : t('Each action demands more will and risk than the last.'), 'gaps', 'progressive-complications');
  } else add('structure', 'progression', t('Progressive complications'), 'todo', t('Chart the protagonist’s escalating actions and the gaps they open.'), 'gaps', 'progressive-complications');

  // ---- Scenes -----------------------------------------------------------
  if (!nScenes) add('scenes', 'scenes', t('Scenes'), 'todo', t('Add scenes (a feature typically has 40–60; any count works).'), 'scenes', 'scene');
  else {
    const charged = scenes.filter((s) => hasCharge(s.open) && hasCharge(s.close));
    const flat = charged.filter((s) => turnOf(s) === 0);
    add('scenes', 'charged', t('Values tracked in scenes'), charged.length === nScenes ? 'pass' : charged.length ? 'warn' : 'todo',
      t('{n}/{total} scenes have opening and closing charges.', { n: charged.length, total: nScenes }), 'scenes', 'step2');
    add('scenes', 'turns', t('Every scene turns'), flat.length ? 'fail' : charged.length ? 'pass' : 'todo',
      flat.length ? t('Non-events: {list}. Make them turn or cut them.', { list: flat.map((s) => sceneLabel(story, s.id)).join('; ') }) : t('No scene that doesn’t turn.'), 'scenes', 'scene');

    // Law of diminishing returns: three or more consecutive turns in the same direction.
    let run = 1; let worst = 1; let at = -1;
    for (let i = 1; i < scenes.length; i++) {
      const d0 = Math.sign(turnOf(scenes[i - 1]) || 0);
      const d1 = Math.sign(turnOf(scenes[i]) || 0);
      if (d1 !== 0 && d1 === d0) { run++; if (run > worst) { worst = run; at = i; } } else run = 1;
    }
    add('scenes', 'diminishing', t('Alternating emotional charges'), worst >= 3 ? 'warn' : 'pass',
      worst >= 3 ? t('{n} consecutive scenes turn the same way (ending at scene {at}). The Law of Diminishing Returns will drain them.', { n: worst, at: at + 1 }) : t('Charges alternate between positive and negative transitions.'), 'composition', 'diminishing-returns');

    const lateCoinc = tl.items.filter((it) => it.scene.coincidence && it.startPct > 0.5);
    add('scenes', 'coincidence', t('No coincidence after the midpoint'), lateCoinc.length ? 'warn' : 'pass',
      lateCoinc.length ? t('Coincidence in: {list}. Put the story in the characters’ hands.', { list: lateCoinc.map((it) => sceneLabel(story, it.scene.id)).join('; ') }) : t('Coincidence (if any) arrives early enough to gain meaning.'), 'scenes', 'coincidence');

    const avg = tl.total / nScenes;
    add('scenes', 'rhythm', t('Scene rhythm'), avg <= 4.5 ? 'pass' : 'warn',
      `${t('Average scene length {avg} pages (≈ minutes).', { avg: decimal1(avg) })} ${avg <= 4.5 ? '' : t('Long scenes make the camera repeat itself — aim for 2–3.')}`, 'composition', 'rhythm-tempo');

    const withConflict = scenes.filter((s) => has(s.desire) && (has(s.antagonist) || has(s.antagonistDesire))).length;
    add('scenes', 'conflict', t('Scene conflicts defined (Step 1)'), withConflict >= nScenes / 2 ? 'pass' : 'warn',
      t('{n}/{total} scenes define who drives them, what they want, and what blocks it.', { n: withConflict, total: nScenes }), 'scenes', 'step1');
  }

  // ---- Craft ------------------------------------------------------------
  const neg = scenes.some((s) => Number(s.close) <= -3 || Number(s.open) <= -3);
  const d = story.values.declension;
  if (!has(d.positive)) add('craft', 'declension', t('Value declension'), 'todo', t('Name the primary value and its Contrary, Contradictory and Negation of the Negation.'), 'values', 'principle-antagonism');
  else add('craft', 'declension', t('Antagonism reaches the end of the line'), neg ? 'pass' : 'warn',
    neg ? t('The story reaches the Negation of the Negation ({negation}).', { negation: d.negation || t('max negative') }) : t('No scene reaches the Negation of the Negation — the story may satisfy, but never be sublime.'), 'values', 'negation-of-negation');

  const forces = story.antagonism.forces || [];
  const levelsUsed = new Set([
    ...forces.map((f) => f.level),
    ...scenes.flatMap((s) => Object.entries(s.levels || {}).filter(([, v]) => v).map(([k]) => k)),
  ]);
  add('craft', 'complexity', t('Complexity: conflict on all three levels'), levelsUsed.size >= 3 ? 'pass' : levelsUsed.size ? 'warn' : 'todo',
    t('Levels in play: {levels}. Conflict on one level is mere complication.', { levels: [...levelsUsed].map((k) => LEVELS[k] || k).join(', ') || t('none') }), 'gaps', 'complexity');

  const setups = story.setups || [];
  if (setups.length) {
    const dangling = setups.filter((p) => !p.payoffScene);
    const inverted = setups.filter((p) => p.setupScene && p.payoffScene && sceneIndex(story, p.payoffScene) < sceneIndex(story, p.setupScene));
    add('craft', 'setups', t('Setups pay off'), inverted.length ? 'fail' : dangling.length ? 'warn' : 'pass',
      inverted.length ? t('{n} payoff(s) come before their setup.', { n: inverted.length })
        : dangling.length ? t('{n} setup(s) without a payoff yet.', { n: dangling.length })
          : t('{n} setups, all paid off.', { n: setups.length }), 'setups', 'setups-payoffs');
  } else add('craft', 'setups', t('Setups and payoffs'), 'todo', t('Plant knowledge that a later turning point will pay off.'), 'setups', 'setups-payoffs');

  const imgs = story.images || [];
  if (imgs.length) {
    const weak = imgs.filter((i) => (i.scenes || []).length < 3).length;
    const ext = imgs.filter((i) => i.kind === 'external').length;
    const count = ext ? t('{n} system(s), {ext} external.', { n: imgs.length, ext }) : t('{n} system(s).', { n: imgs.length });
    add('craft', 'images', t('Image systems'), weak ? 'warn' : 'pass',
      `${count} ${weak ? t('{n} with fewer than 3 occurrences — an image system repeats with persistence and variation.', { n: weak }) : t('Motifs recur through the story.')}`, 'images', 'image-system');
  } else add('craft', 'images', t('Image systems'), 'todo', t('Choose a category of imagery to repeat subliminally from beginning to end.'), 'images', 'image-system');

  const expo = story.exposition || [];
  if (expo.length) {
    const earlySecrets = expo.filter((e) => e.secret && e.sceneId).filter((e) => {
      const it = tl.items.find((x) => x.scene.id === e.sceneId);
      return it && it.startPct < 0.25;
    }).length;
    const told = expo.filter((e) => e.method === 'told').length;
    add('craft', 'exposition', t('Exposition: save the best for last'), earlySecrets || told ? 'warn' : 'pass',
      earlySecrets || told
        ? `${earlySecrets ? `${t('{n} secret(s) revealed in the first quarter.', { n: earlySecrets })} ` : ''}${told ? t('{n} fact(s) told on the nose — convert them to ammunition.', { n: told }) : ''}`
        : t('Secrets are held back and exposition is dramatized.'), 'exposition', 'parse-exposition');
  }

  const subs = story.plotlines.filter((p) => p.id !== 'main');
  if (subs.length) {
    const loose = subs.filter((p) => !p.relation);
    add('craft', 'subplots', t('Subplots relate to the central plot'), loose.length ? 'warn' : 'pass',
      loose.length ? t('{names} run alongside without contradicting, resonating, setting up or complicating the central plot.', { names: loose.map((p) => p.name).join(', ') }) : t('Each subplot has a structural or thematic relationship.'), 'subplots', 'subplots');
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
