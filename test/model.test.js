// Unit tests for the story model, Story Doctor, proposals and export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newStory, newScene, normalizeStory, acts, timeline, turnOf, controllingIdeaSentence, endingType,
  dimensionCount, setIn, storyStats, storyDigest,
} from '../public/js/model.js';
import { diagnose, score } from '../public/js/doctor.js';
import { sampleStory } from '../public/js/sample.js';
import { storyToMarkdown } from '../public/js/export.js';
import { validateCharacterProposal, applyCharacterProposal, validateSceneProposal, applySceneProposal } from '../public/js/ai/apply.js';
import { triangleWeights, classifyDesign } from '../public/js/kb/triangle.js';
import { PRINCIPLES } from '../public/js/kb/principles.js';
import { GENRES } from '../public/js/kb/genres.js';
import { markdownToHtml } from '../public/js/markdown.js';

const scene = (marker, open, close, pages = 2) => newScene({ marker, open, close, pages, title: marker || 'scene' });

test('normalizeStory fills missing fields without overwriting', () => {
  const s = normalizeStory({ id: 'x', title: 'T', meaning: { value: 'Love wins' }, characters: [{ id: 'c1', name: 'A' }] });
  assert.equal(s.meaning.value, 'Love wins');
  assert.equal(s.meaning.charge, 'positive');
  assert.ok(Array.isArray(s.scenes));
  assert.equal(s.plotlines[0].id, 'main');
  assert.equal(s.characters[0].name, 'A');
  assert.equal(s.characters[0].qualities.loving.core, 0);
});

test('acts are delimited by act climax, crisis and climax; resolution joins the last act', () => {
  const s = newStory({ scenes: [scene('inciting', 1, -1), scene('', -1, 1), scene('act-climax', 1, -2), scene('', -2, 1), scene('crisis', 1, -3), scene('climax', -3, 3), scene('resolution', 1, 3)] });
  const a = acts(s);
  assert.equal(a.length, 3);
  assert.deepEqual(a.map((x) => x.items.length), [3, 2, 2]);
  assert.equal(a[2].climax.marker, 'climax');
  const t = timeline(s);
  assert.equal(t.total, 14);
  assert.equal(t.items[0].startPct, 0);
});

test('turnOf and endingType', () => {
  assert.equal(turnOf(scene('', 2, -1)), -3);
  assert.equal(turnOf(scene('', null, -1)), null);
  const s = newStory({ scenes: [scene('climax', -3, 3)] });
  assert.equal(endingType(s), 'idealistic');
  s.scenes[0].close = -3;
  assert.equal(endingType(s), 'pessimistic');
});

test('controlling idea sentence joins value and cause', () => {
  const s = newStory({ meaning: { value: 'justice is restored', cause: 'the protagonist is more clever than the criminal', charge: 'positive' } });
  assert.equal(controllingIdeaSentence(s), 'Justice is restored because the protagonist is more clever than the criminal.');
  s.meaning.cause = 'when we learn to love unconditionally';
  assert.equal(controllingIdeaSentence(s), 'Justice is restored when we learn to love unconditionally.');
  s.meaning = { ...s.meaning, value: 'la giustizia trionfa', cause: 'il protagonista è più astuto del criminale' };
  assert.equal(controllingIdeaSentence(s, 'it'), 'La giustizia trionfa perché il protagonista è più astuto del criminale.');
  // A story written in Italian, viewed in English, keeps its own conjunction.
  s.meaning.cause = 'quando impariamo ad amare';
  assert.equal(controllingIdeaSentence(s, 'en'), 'La giustizia trionfa quando impariamo ad amare.');
});

test('setIn is immutable and structural', () => {
  const o = { a: { b: [1, 2] }, c: { d: 1 } };
  const n = setIn(o, ['a', 'b', 1], 5);
  assert.deepEqual(n.a.b, [1, 5]);
  assert.deepEqual(o.a.b, [1, 2]);
  assert.equal(n.c, o.c);
});

test('Story Doctor on the worked example', () => {
  const s = sampleStory();
  const checks = diagnose(s);
  const byId = Object.fromEntries(checks.map((c) => [c.id, c]));
  assert.equal(byId.turns.status, 'pass');
  assert.equal(byId['act-rhythm'].status, 'pass');
  assert.equal(byId.declension.status, 'pass');
  assert.equal(byId.setups.status, 'pass');
  assert.ok(score(checks) >= 85);
  for (const c of checks) assert.ok(PRINCIPLES.some((p) => p.id === c.principle), `principle ${c.principle} exists`);
});

test('Story Doctor flags the classic problems', () => {
  const s = newStory({
    meaning: { value: 'Love triumphs', cause: '', charge: 'positive' },
    climax: { causedBy: 'coincidence' },
    scenes: [scene('inciting', 1, 1), scene('', 1, 2), scene('', 2, 3), scene('act-climax', 3, 3), scene('crisis', 2, 3), scene('climax', 2, 3)],
    setups: [{ id: 'p', text: 'gun', setupScene: '', payoffScene: '' }],
  });
  s.setups[0].setupScene = s.scenes[3].id;
  s.setups[0].payoffScene = s.scenes[1].id;
  const byId = Object.fromEntries(diagnose(s).map((c) => [c.id, c]));
  assert.equal(byId.prot.status, 'fail');
  assert.equal(byId.ci.status, 'fail', 'value without cause is half a meaning');
  assert.equal(byId.turns.status, 'fail', 'non-events found');
  assert.equal(byId['act-rhythm'].status, 'fail', 'penultimate and final climaxes share a charge');
  assert.equal(byId.deus.status, 'fail');
  assert.equal(byId.setups.status, 'fail', 'payoff before setup');
  assert.equal(byId.declension.status, 'todo');
});

test('dimension count', () => {
  const s = sampleStory();
  const scrooge = s.characters.find((c) => c.id === 'c-scrooge');
  assert.ok(dimensionCount(scrooge) >= 4);
  assert.equal(dimensionCount(s.characters.find((c) => c.id === 'c-fred')), 0);
});

test('character proposals validate, clamp and apply', () => {
  const s = sampleStory();
  const bad = validateCharacterProposal({ character_id: 'c-fred', summary: 'x' });
  assert.equal(bad.ok, false);
  const v = validateCharacterProposal({
    character_id: 'c-fred', summary: 'Deepen Fred',
    fields: { core: 'Lonely beneath the cheer', willpower: 0, role: 'villain', arc_plot: 'education' },
    add_dimensions: [{ a: 'Cheerful', b: 'Lonely' }, { a: 'incomplete' }],
    add_choices: [{ choice: 'Keeps inviting' }],
  });
  assert.equal(v.ok, true);
  assert.equal(v.value.fields.willpower, 1);
  assert.equal(v.value.fields.role, undefined, 'invalid role dropped');
  assert.equal(v.value.add_dimensions.length, 1);
  const { story, characterId } = applyCharacterProposal(s, v.value);
  const fred = story.characters.find((c) => c.id === characterId);
  assert.equal(fred.core, 'Lonely beneath the cheer');
  assert.equal(fred.arc.plot, 'education');
  assert.equal(fred.dimensions.length, 1);
  assert.equal(s.characters.find((c) => c.id === 'c-fred').core, 'Unshakeable goodwill; pities rather than resents.', 'original untouched');
  const created = validateCharacterProposal({ character_id: 'new', summary: 'A rival', fields: { name: 'Mr. Gradgrind', role: 'antagonist' } });
  const res = applyCharacterProposal(s, created.value);
  assert.equal(res.story.characters.length, s.characters.length + 1);
});

test('scene proposals insert after a scene', () => {
  const s = sampleStory();
  const v = validateSceneProposal({ title: 'Test', summary: 'A dilemma', open: 9, close: -9, after_scene_id: 's02' });
  assert.equal(v.value.open, 3);
  assert.equal(v.value.close, -3);
  const { story, sceneId } = applySceneProposal(s, v.value);
  assert.equal(story.scenes[2].id, sceneId);
});

test('story triangle placement', () => {
  const w = triangleWeights(0, 0);
  assert.equal(w.arch, 1);
  assert.equal(classifyDesign({ ending: 1, conflict: 1, protagonists: 1, activity: 1 }), 'mini');
  assert.equal(classifyDesign({ time: 1, causality: 1, reality: 1 }), 'anti');
  assert.equal(classifyDesign({ stasis: true }), 'non');
});

test('knowledge base is complete and consistent', () => {
  assert.equal(GENRES.length, 25);
  const ids = new Set(PRINCIPLES.map((p) => p.id));
  assert.equal(ids.size, PRINCIPLES.length, 'principle ids are unique');
  assert.ok(PRINCIPLES.length > 120);
});

test('export, digest and stats', () => {
  const s = sampleStory();
  const md = storyToMarkdown(s);
  assert.match(md, /^# A Christmas Carol/);
  assert.match(md, /## Step-outline/);
  assert.match(md, /Story Doctor/);
  const digest = storyDigest(s);
  assert.match(digest, /Protagonist: Ebenezer Scrooge/);
  assert.match(digest, /id=c-scrooge/);
  const st = storyStats(s);
  assert.equal(st.scenes, 21);
  assert.equal(st.acts, 4);
});

test('markdown renderer escapes HTML', () => {
  const html = markdownToHtml('**bold** <script>alert(1)</script>\n\n- item\n- two');
  assert.match(html, /<strong>bold<\/strong>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /<ul>\n<li>item<\/li>/);
});

test('normalizeStory survives wrongly-typed and junk data', () => {
  const junk = [
    null, 'text', [1, 2],
    { title: 42, scenes: 'nope', characters: { a: 1 }, plotlines: null, values: 5, meaning: [] },
    { scenes: [null, 5, 'x', { title: 3, beats: 'b', characters: [7, null, 'c1'], pages: '4', open: 'x' }], characters: [null, { id: 9, name: 7, qualities: 'q', dimensions: [null, { a: 'x', b: 'y' }], willpower: 'high' }] },
    { genres: { secondary: [null, 3, {}], checks: [] }, setting: { rules: [1, null, { a: 1 }], levels: 'x' }, images: [{ scenes: 'all' }, 7], antagonism: 'x' },
  ];
  for (const raw of junk) {
    const s = normalizeStory(raw);
    assert.ok(Array.isArray(s.scenes) && Array.isArray(s.characters));
    assert.ok(s.plotlines.some((p) => p.id === 'main'));
    assert.doesNotThrow(() => diagnose(s));
  }
  const s = normalizeStory(junk[4]);
  assert.equal(s.scenes.length, 1);
  assert.equal(s.scenes[0].title, '3');
  assert.equal(s.scenes[0].pages, 4);
  assert.deepEqual(s.scenes[0].beats, []);
  assert.deepEqual(s.scenes[0].characters, ['7', 'c1']);
  assert.equal(s.characters[0].name, '7');
  assert.equal(s.characters[0].willpower, 5);
  assert.equal(s.characters[0].dimensions.length, 1);
  assert.equal(s.characters[0].dimensions[0].a, 'x');
  assert.equal(typeof s.characters[0].dimensions[0].id, 'string');
  assert.equal(typeof s.characters[0].id, 'string');
  const t = normalizeStory(junk[5]);
  assert.deepEqual(t.genres.secondary, ['3']);
  assert.deepEqual(t.setting.rules, ['1']);
  assert.equal(t.images.length, 1);
  assert.deepEqual(t.images[0].scenes, []);
  assert.equal(typeof t.images[0].id, 'string');
  assert.deepEqual(t.antagonism.forces, []);
});

