// Story data model shared by the browser app, the server and the AI agent.
// A story is plain JSON; normalizeStory() fills in any missing fields so older
// files keep loading as the schema grows.
import { lang, t, tl } from './i18n.js';

export const SCHEMA_VERSION = 1;

export function uid(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-5);
  return `${prefix}${time}${rand}`;
}

export const ROLES = [
  { id: 'protagonist', label: t('Protagonist') },
  { id: 'antagonist', label: t('Antagonist / force') },
  { id: 'supporting', label: t('Supporting') },
  { id: 'minor', label: t('Minor / bit') },
];

export const QUALITY_AXES = [
  { id: 'loving', pos: t('Loving'), neg: t('Cruel') },
  { id: 'generous', pos: t('Generous'), neg: t('Selfish') },
  { id: 'strong', pos: t('Strong'), neg: t('Weak') },
  { id: 'honest', pos: t('Truthful'), neg: t('Liar') },
  { id: 'brave', pos: t('Courageous'), neg: t('Cowardly') },
  { id: 'loyal', pos: t('Loyal'), neg: t('Disloyal') },
  { id: 'willful', pos: t('Willful'), neg: t('Will-less') },
];

export const MARKERS = [
  { id: '', label: '—' },
  { id: 'inciting', label: t('Inciting Incident'), short: t('II') },
  { id: 'seq-climax', label: t('Sequence climax'), short: t('SQ') },
  { id: 'mid-act', label: t('Mid-act climax'), short: t('MA') },
  { id: 'act-climax', label: t('Act climax'), short: t('AC') },
  { id: 'crisis', label: t('Crisis (+ penultimate climax)'), short: t('CR') },
  { id: 'climax', label: t('Story Climax'), short: t('CL') },
  { id: 'resolution', label: t('Resolution'), short: t('RS') },
];

export const MODES = [
  { id: 'suspense', label: t('Suspense'), hint: t('Audience knows what the characters know.') },
  { id: 'mystery', label: t('Mystery'), hint: t('Audience knows less than the characters.') },
  { id: 'irony', label: t('Dramatic irony'), hint: t('Audience knows more than the characters.') },
];

export const EXPOSITION_METHODS = [
  { id: 'ammunition', label: t('Dialogue as ammunition') },
  { id: 'action', label: t('Shown in action') },
  { id: 'revelation', label: t('Revelation (turns a scene)') },
  { id: 'flashback', label: t('Dramatized flashback') },
  { id: 'voiceover', label: t('Voice-over') },
  { id: 'told', label: t('Told (on the nose)') },
];

export const PLOT_RELATIONS = [
  { id: 'central', label: t('Central plot') },
  { id: 'contradict', label: t('Contradicts the Controlling Idea (irony)') },
  { id: 'resonate', label: t('Resonates the Controlling Idea (variation)') },
  { id: 'setup', label: t('Sets up a late central plot') },
  { id: 'complicate', label: t('Complicates the central plot') },
  { id: '', label: t('Runs alongside (no relation)') },
];

export const PALETTE = ['#e4572e', '#2e86ab', '#7a4fbf', '#2a9d8f', '#e9a03b', '#c2417f', '#4a7c59', '#8d6e63', '#3d5a80', '#b5651d'];

export function newCharacter(partial = {}) {
  return {
    id: uid('c'),
    name: '',
    role: 'supporting',
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    characterization: { age: '', occupation: '', look: '', speech: '', home: '', attitudes: '' },
    mask: '',
    core: '',
    qualities: Object.fromEntries(QUALITY_AXES.map((q) => [q.id, { mask: 0, core: 0 }])),
    conscious: '',
    unconscious: '',
    motivation: '',
    capacities: '',
    willpower: 5,
    chance: '',
    risk: '',
    empathy: '',
    sympathetic: false,
    dimensions: [],
    arc: { plot: '', from: '', to: '' },
    choices: [],
    backstory: [],
    bringsOut: '',
    attitude: '',
    obsession: '',
    interview: {},
    notes: '',
    ...partial,
  };
}

export function newScene(partial = {}) {
  return {
    id: uid('s'),
    title: '',
    summary: '',
    func: '',
    plotline: 'main',
    sequence: '',
    marker: '',
    location: '',
    time: '',
    pages: 2.5,
    tempo: 3,
    value: '',
    open: null,
    close: null,
    turn: 'action',
    gapExpect: '',
    gapResult: '',
    driver: '',
    desire: '',
    antagonist: '',
    antagonistDesire: '',
    beats: [],
    turningBeat: -1,
    subtext: '',
    mode: 'suspense',
    levels: { inner: false, personal: false, extra: false },
    transition: { hinge: '', link: '' },
    choice: '',
    coincidence: false,
    characters: [],
    treatment: '',
    ...partial,
  };
}

// `l` is the language for default names (the server passes the client's).
export function newStory(partial = {}, l = lang) {
  const now = new Date().toISOString();
  return normalizeStory({
    id: uid(''),
    title: tl(l, 'Untitled Story'),
    createdAt: now,
    updatedAt: now,
    ...partial,
  }, l);
}

const mainPlotline = (l) => ({ id: 'main', name: tl(l, 'Central plot'), relation: 'central', color: '#e4572e' });

const DEFAULTS = (l) => ({
  schema: SCHEMA_VERSION,
  title: tl(l, 'Untitled Story'),
  logline: '',
  author: '',
  premise: '',
  meaning: { value: '', charge: 'positive', cause: '', counterIdea: '', notes: '' },
  triangle: { ending: 0, conflict: 0, protagonists: 0, activity: 0, time: 0, causality: 0, reality: 0, stasis: false, notes: '' },
  setting: {
    period: '', duration: '', location: '',
    levels: { inner: false, personal: false, extra: false },
    world: { work: '', politics: '', rituals: '', values: '', biographies: '', laws: '' },
    rules: [],
    research: { memory: '', imagination: '', fact: '' },
  },
  genres: { primary: '', secondary: [], sub: '', checks: {}, fresh: {}, notes: '', title: '', titleTest: {}, comparables: [] },
  values: {
    presetId: '',
    declension: { positive: '', contrary: '', contradictory: '', negation: '' },
    actStages: {},
    secondary: [],
  },
  antagonism: { forces: [] },
  characters: [],
  inciting: { sceneId: '', event: '', cause: 'decision-protagonist', onscreen: true, shift: -1, reaction: '', mdq: '', obligatory: '', worst: '', best: '', notes: '' },
  plotlines: [mainPlotline(l)],
  scenes: [],
  sequences: [],
  gaps: [],
  crisis: { dilemma: 'irreconcilable', optionB: '', optionC: '', choice: '', sceneId: '', sameScene: true },
  climax: { sceneId: '', action: '', turning: '', keyImage: '', causedBy: 'choice', inevitable: '', unexpected: '' },
  resolution: { subplot: false, spread: false, curtain: false, text: '' },
  composition: { techniques: { social: '', personal: '', symbolic: '', ironic: '' }, ironicPattern: -1, notes: '' },
  setups: [],
  images: [],
  exposition: [],
  notes: '',
});

function isPlainObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

// Fill missing keys from `defaults` recursively without overwriting existing values.
function fill(target, defaults) {
  const out = isPlainObject(target) ? { ...target } : {};
  for (const [k, dv] of Object.entries(defaults)) {
    if (!(k in out) || out[k] === undefined) out[k] = structuredClone(dv);
    else if (isPlainObject(dv) && isPlainObject(out[k]) && Object.keys(dv).length) out[k] = fill(out[k], dv);
  }
  return out;
}

export function normalizeStory(raw, l = lang) {
  const s = fill(raw || {}, DEFAULTS(l));
  if (!s.plotlines.length || !s.plotlines.some((p) => p.id === 'main')) {
    s.plotlines = [mainPlotline(l), ...s.plotlines];
  }
  const blankChar = newCharacter();
  s.characters = s.characters.map((c) => {
    const filled = fill(c, { ...blankChar, id: c.id || uid('c') });
    filled.qualities = fill(filled.qualities, blankChar.qualities);
    return filled;
  });
  const blankScene = newScene();
  s.scenes = s.scenes.map((sc) => fill(sc, { ...blankScene, id: sc.id || uid('s') }));
  return s;
}

// ---- Derived data -------------------------------------------------------

export function protagonist(story) {
  return story.characters.find((c) => c.role === 'protagonist') || null;
}

export function charactersByRole(story, role) {
  return story.characters.filter((c) => c.role === role);
}

export function sceneIndex(story, id) {
  return story.scenes.findIndex((s) => s.id === id);
}

export function sceneById(story, id) {
  return story.scenes.find((s) => s.id === id) || null;
}

export function sceneLabel(story, id) {
  const i = sceneIndex(story, id);
  if (i < 0) return '';
  const s = story.scenes[i];
  return `${i + 1}. ${s.title || t('Untitled scene')}`;
}

export function hasCharge(v) {
  return v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));
}

export function turnOf(scene) {
  if (!hasCharge(scene.open) || !hasCharge(scene.close)) return null;
  return Number(scene.close) - Number(scene.open);
}

// Positions along the telling, using scene page counts (1 page ~ 1 minute).
export function timeline(story) {
  let at = 0;
  const items = story.scenes.map((s, i) => {
    const len = Math.max(0.25, Number(s.pages) || 2.5);
    const item = { scene: s, index: i, start: at, end: at + len, len };
    at += len;
    return item;
  });
  const total = at || 1;
  for (const it of items) {
    it.startPct = it.start / total;
    it.endPct = it.end / total;
    it.midPct = (it.start + it.len / 2) / total;
  }
  return { items, total };
}

const ACT_ENDERS = new Set(['act-climax', 'crisis', 'climax']);

// Acts are delimited by act-climax / crisis / climax scenes on the central plot.
export function acts(story) {
  const { items, total } = timeline(story);
  const result = [];
  let current = [];
  for (const it of items) {
    current.push(it);
    if (it.scene.plotline === 'main' && ACT_ENDERS.has(it.scene.marker)) {
      result.push(current);
      current = [];
    }
  }
  if (current.length) {
    // Trailing resolution scenes belong to the last act; otherwise an unfinished act.
    if (result.length && current.every((it) => it.scene.marker === 'resolution' || it.scene.plotline !== 'main')) {
      result[result.length - 1].push(...current);
    } else {
      result.push(current);
    }
  }
  return result.map((its, i) => {
    const climaxItem = [...its].reverse().find((it) => it.scene.plotline === 'main' && ACT_ENDERS.has(it.scene.marker));
    return {
      n: i + 1,
      items: its,
      start: its[0].start,
      end: its[its.length - 1].end,
      startPct: its[0].start / total,
      endPct: its[its.length - 1].end / total,
      climax: climaxItem ? climaxItem.scene : null,
    };
  });
}

export function actOfScene(story, sceneId) {
  const a = acts(story).find((act) => act.items.some((it) => it.scene.id === sceneId));
  return a ? a.n : null;
}

export function markerScene(story, marker) {
  return story.scenes.find((s) => s.plotline === 'main' && s.marker === marker) || null;
}

export function declension(story) {
  return story.values.declension;
}

// Value + Cause, joined with "because" unless the cause already starts with a conjunction.
const CAUSE_JOIN = {
  en: { starts: /^(because|when|if|since|as)\b/i, word: 'because ' },
  it: { starts: /^(perché|poiché|quando|se|siccome|finché|dato che|grazie a)(?=[\s,]|$)/i, word: 'perché ' },
};

export function controllingIdeaSentence(story, l = lang) {
  const m = story.meaning;
  if (!m.value && !m.cause) return '';
  const value = (m.value || '…').trim();
  const cause = (m.cause || '…').trim();
  // A story can be written in another language than the interface, so any
  // known conjunction counts as already joined.
  const joined = Object.values(CAUSE_JOIN).some((j) => j.starts.test(cause));
  const word = (CAUSE_JOIN[l] || CAUSE_JOIN.en).word;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)} ${joined ? '' : word}${cause}`.replace(/\s+/g, ' ').trim().replace(/([^.!?])$/, '$1.');
}

export function endingType(story) {
  const climax = markerScene(story, 'climax');
  const v = climax && hasCharge(climax.close) ? Number(climax.close) : null;
  if (story.meaning.charge === 'ironic' || v === 0) return 'ironic';
  if (v != null) return v > 0 ? 'idealistic' : 'pessimistic';
  return story.meaning.charge === 'negative' ? 'pessimistic' : story.meaning.charge === 'positive' ? 'idealistic' : 'ironic';
}

export function dimensionCount(c) {
  const contradictions = (c.dimensions || []).filter((d) => d.a && d.b).length;
  const maskGaps = Object.values(c.qualities || {}).filter((q) => Math.abs((q.mask || 0) - (q.core || 0)) >= 2).length;
  const desireSplit = c.conscious && c.unconscious ? 1 : 0;
  return contradictions + maskGaps + desireSplit;
}

export function storyStats(story) {
  const locations = new Set(story.scenes.map((s) => (s.location || '').trim().toLowerCase()).filter(Boolean));
  const tm = timeline(story);
  return {
    scenes: story.scenes.length,
    sequences: new Set(story.scenes.map((s) => s.sequence).filter(Boolean)).size,
    acts: acts(story).length,
    characters: story.characters.length,
    locations: locations.size,
    pages: Math.round(tm.total * 10) / 10,
    turning: story.scenes.filter((s) => { const d = turnOf(s); return d !== null && d !== 0; }).length,
  };
}

// Immutable path update helper: setIn(obj, ['a', 0, 'b'], value)
export function setIn(obj, path, value) {
  if (!path.length) return value;
  const [k, ...rest] = path;
  const base = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  base[k] = setIn(base[k], rest, value);
  return base;
}

export function getIn(obj, path) {
  return path.reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// Compact digest of a story for prompts (keeps tokens down, stable key order).
export function storyDigest(story, { includeScenes = true, lang: l = lang } = {}) {
  const prot = protagonist(story);
  const lines = [];
  lines.push(`Title: ${story.title}`);
  if (story.logline) lines.push(`Logline: ${story.logline}`);
  if (story.premise) lines.push(`Premise: ${story.premise}`);
  const ci = controllingIdeaSentence(story, l);
  if (ci) lines.push(`Controlling Idea: ${ci} (charge: ${story.meaning.charge})`);
  if (story.meaning.counterIdea) lines.push(`Counter-Idea: ${story.meaning.counterIdea}`);
  if (story.genres.primary) lines.push(`Genre: ${story.genres.primary}${story.genres.secondary.length ? ' + ' + story.genres.secondary.join(', ') : ''}`);
  const st = story.setting;
  if (st.period || st.location) lines.push(`Setting: ${[st.period, st.duration, st.location].filter(Boolean).join(' | ')}`);
  const d = story.values.declension;
  if (d.positive) lines.push(`Primary value declension: ${d.positive} > ${d.contrary} > ${d.contradictory} > ${d.negation}`);
  if (story.inciting.event) lines.push(`Inciting Incident: ${story.inciting.event}`);
  if (story.inciting.mdq) lines.push(`Major Dramatic Question: ${story.inciting.mdq}`);
  if (prot) lines.push(`Protagonist: ${prot.name}${prot.conscious ? ` | wants: ${prot.conscious}` : ''}${prot.unconscious ? ` | unconsciously: ${prot.unconscious}` : ''}`);
  lines.push(`Cast: ${story.characters.map((c) => `${c.name || '(unnamed)'} [${c.role}] id=${c.id}`).join('; ') || '(none yet)'}`);
  if (includeScenes && story.scenes.length) {
    lines.push('Scenes:');
    story.scenes.forEach((s, i) => {
      const turn = hasCharge(s.open) && hasCharge(s.close) ? ` (${s.value || 'value'}: ${s.open}→${s.close})` : '';
      lines.push(`  ${i + 1}. ${s.title || 'Untitled'}${s.marker ? ` [${s.marker}]` : ''}${turn}${s.summary ? ` — ${s.summary}` : ''}`);
    });
  }
  return lines.join('\n');
}
