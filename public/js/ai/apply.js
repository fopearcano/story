// Validation and application of AI proposals. Shared by the server (to validate
// tool input before showing it) and the browser (to apply an accepted proposal).
import { newCharacter, newScene, uid, QUALITY_AXES, ROLES } from '../model.js';
import { ARC_PLOTS } from '../kb/genres.js';

const TEXT_FIELDS = ['name', 'mask', 'core', 'conscious', 'unconscious', 'motivation', 'capacities', 'chance', 'risk', 'empathy', 'attitude', 'bringsOut', 'obsession', 'notes'];
const CHARZ_FIELDS = ['age', 'occupation', 'look', 'speech', 'home', 'attitudes'];
const MAX = 2000;

const str = (v) => (typeof v === 'string' ? v.slice(0, MAX).trim() : null);
const clampInt = (v, lo, hi) => (Number.isFinite(Number(v)) ? Math.max(lo, Math.min(hi, Math.round(Number(v)))) : null);

export const FIELD_LABELS = {
  name: 'Name', role: 'Role', mask: 'Characterization (mask)', core: 'True character (heart)', conscious: 'Conscious desire',
  unconscious: 'Unconscious desire', motivation: 'Motivation', capacities: 'Capacities', willpower: 'Willpower', chance: 'Chance to succeed',
  risk: 'Risk (worst outcome)', empathy: 'Empathy hook', attitude: 'Attitude', bringsOut: 'Brings out in the protagonist',
  obsession: 'Comic obsession', notes: 'Notes', arc_plot: 'Arc type', arc_from: 'Arc from', arc_to: 'Arc to',
};

// Returns { ok: true, value } or { ok: false, error }.
export function validateCharacterProposal(input) {
  if (!input || typeof input !== 'object') return { ok: false, error: 'input must be an object' };
  const characterId = str(input.character_id);
  if (!characterId) return { ok: false, error: 'character_id is required ("new" to create a character)' };
  const f = input.fields && typeof input.fields === 'object' ? input.fields : {};
  const fields = {};
  for (const k of TEXT_FIELDS) if (str(f[k])) fields[k] = str(f[k]);
  if (f.role && ROLES.some((r) => r.id === f.role)) fields.role = f.role;
  if (f.willpower != null && clampInt(f.willpower, 1, 10) != null) fields.willpower = clampInt(f.willpower, 1, 10);
  if (f.arc_plot != null && ARC_PLOTS.some((p) => p.id === f.arc_plot)) fields.arc_plot = f.arc_plot;
  if (str(f.arc_from)) fields.arc_from = str(f.arc_from);
  if (str(f.arc_to)) fields.arc_to = str(f.arc_to);
  const characterization = {};
  const cz = f.characterization && typeof f.characterization === 'object' ? f.characterization : {};
  for (const k of CHARZ_FIELDS) if (str(cz[k])) characterization[k] = str(cz[k]);
  const qualities = {};
  const q = f.qualities && typeof f.qualities === 'object' ? f.qualities : {};
  for (const axis of QUALITY_AXES) {
    const v = q[axis.id];
    if (v && typeof v === 'object') {
      const mask = clampInt(v.mask, -2, 2);
      const core = clampInt(v.core, -2, 2);
      if (mask != null || core != null) qualities[axis.id] = { ...(mask != null && { mask }), ...(core != null && { core }) };
    }
  }
  const list = (arr, keys, max = 6) => (Array.isArray(arr) ? arr.slice(0, max).map((x) => {
    const o = {};
    for (const k of keys) if (str(x && x[k])) o[k] = str(x[k]);
    return o;
  }).filter((o) => Object.keys(o).length) : []);
  const add_dimensions = list(input.add_dimensions, ['a', 'b']).filter((d) => d.a && d.b);
  const add_choices = list(input.add_choices, ['dilemma', 'choice', 'reveals']).filter((c) => c.choice);
  const add_backstory = list(input.add_backstory, ['event']).filter((b) => b.event);
  const summary = str(input.summary) || '';
  const count = Object.keys(fields).length + Object.keys(characterization).length + Object.keys(qualities).length
    + add_dimensions.length + add_choices.length + add_backstory.length;
  if (!count) return { ok: false, error: 'proposal contains no valid changes' };
  if (characterId === 'new' && !fields.name) return { ok: false, error: 'a new character needs fields.name' };
  return { ok: true, value: { character_id: characterId, summary, fields, characterization, qualities, add_dimensions, add_choices, add_backstory } };
}

export function validateSceneProposal(input) {
  if (!input || typeof input !== 'object') return { ok: false, error: 'input must be an object' };
  const title = str(input.title);
  const summary = str(input.summary);
  if (!title || !summary) return { ok: false, error: 'title and summary are required' };
  const out = { title, summary };
  for (const k of ['value', 'choice', 'gap_expect', 'gap_result', 'rationale']) if (str(input[k])) out[k] = str(input[k]);
  const open = clampInt(input.open, -3, 3);
  const close = clampInt(input.close, -3, 3);
  if (open != null) out.open = open;
  if (close != null) out.close = close;
  if (Array.isArray(input.character_ids)) out.character_ids = input.character_ids.filter((x) => typeof x === 'string').slice(0, 12);
  if (str(input.after_scene_id)) out.after_scene_id = str(input.after_scene_id);
  return { ok: true, value: out };
}

export function applyCharacterProposal(story, p) {
  const s = structuredClone(story);
  let c = p.character_id === 'new' ? null : s.characters.find((x) => x.id === p.character_id);
  if (!c) {
    c = newCharacter({ name: p.fields.name || 'New character' });
    s.characters.push(c);
  }
  const { arc_plot, arc_from, arc_to, ...plain } = p.fields;
  Object.assign(c, plain);
  if (arc_plot != null) c.arc.plot = arc_plot;
  if (arc_from) c.arc.from = arc_from;
  if (arc_to) c.arc.to = arc_to;
  Object.assign(c.characterization, p.characterization || {});
  for (const [k, v] of Object.entries(p.qualities || {})) c.qualities[k] = { ...c.qualities[k], ...v };
  for (const d of p.add_dimensions || []) c.dimensions.push({ id: uid('d'), a: d.a, b: d.b });
  for (const ch of p.add_choices || []) c.choices.push({ id: uid('ch'), sceneId: '', dilemma: ch.dilemma || '', choice: ch.choice, reveals: ch.reveals || '' });
  for (const b of p.add_backstory || []) c.backstory.push({ id: uid('k'), event: b.event, sceneId: '' });
  return { story: s, characterId: c.id };
}

export function applySceneProposal(story, p) {
  const s = structuredClone(story);
  const scene = newScene({
    title: p.title, summary: p.summary, value: p.value || '', open: p.open ?? null, close: p.close ?? null,
    choice: p.choice || '', gapExpect: p.gap_expect || '', gapResult: p.gap_result || '',
    characters: (p.character_ids || []).filter((id) => s.characters.some((c) => c.id === id)),
    func: p.rationale || 'Pressure test proposed by the AI partner.',
  });
  const i = p.after_scene_id ? s.scenes.findIndex((x) => x.id === p.after_scene_id) : -1;
  if (i >= 0) s.scenes.splice(i + 1, 0, scene); else s.scenes.push(scene);
  return { story: s, sceneId: scene.id };
}

// Human-readable list of the changes in a character proposal (for the review card).
export function describeCharacterProposal(p) {
  const rows = [];
  for (const [k, v] of Object.entries(p.fields || {})) rows.push([FIELD_LABELS[k] || k, String(v)]);
  for (const [k, v] of Object.entries(p.characterization || {})) rows.push([k[0].toUpperCase() + k.slice(1), v]);
  for (const [k, v] of Object.entries(p.qualities || {})) {
    const axis = QUALITY_AXES.find((a) => a.id === k);
    rows.push([`${axis ? axis.pos + '/' + axis.neg : k}`, `mask ${v.mask ?? '–'}, heart ${v.core ?? '–'}`]);
  }
  for (const d of p.add_dimensions || []) rows.push(['+ Dimension', `${d.a} ↔ ${d.b}`]);
  for (const c of p.add_choices || []) rows.push(['+ Choice under pressure', `${c.dilemma ? c.dilemma + ': ' : ''}${c.choice}${c.reveals ? ` (reveals: ${c.reveals})` : ''}`]);
  for (const b of p.add_backstory || []) rows.push(['+ Backstory', b.event]);
  return rows;
}
