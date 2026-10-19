// Optional AI features:
//  - a character-building agent (streaming tool-use loop, proposals the writer
//    accepts or rejects), and
//  - one-shot "assist" tasks (brainstorms, scene analysis, consultations).
// Claude or any OpenAI-compatible provider, cloud or local (see llm/). Everything
// degrades gracefully when no provider is configured.
import express from 'express';
import { CHARACTER_AGENT_SYSTEM, ASSIST_SYSTEM, ASSIST_TASKS, withLanguage } from './prompts.js';
import { validateCharacterProposal, validateSceneProposal } from '../public/js/ai/apply.js';
import { storyDigest, uid, sceneIndex } from '../public/js/model.js';
import { diagnose } from '../public/js/doctor.js';
import { tl } from '../public/js/i18n.js';
import { llmFor, LLMError, describeLLMError, providerStatus, defaultProvider, defaultModel } from './llm/index.js';

const MAX_AGENT_TURNS = 10;

// Provider and model the server uses by default (for the startup banner and /health).
export function aiSummary() {
  const s = providerStatus();
  const p = defaultProvider();
  return { provider: p.id, label: p.label, model: defaultModel(p) || '(first available)', configured: s.configured };
}

function openSse(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();
  return (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Why the request can't reach a provider, for a 503 response.
function configError({ error, cfg }, lang) {
  const p = cfg.provider;
  if (error === 'invalid-url') return tl(lang, 'The server address must start with http:// or https://.');
  if (error === 'no-url') return tl(lang, 'Set the server address for {provider} in AI settings.', { provider: p.short });
  return tl(lang, 'Add an API key for {provider} in AI settings, or set {env} on the server.', { provider: p.short, env: p.keyEnv[0] });
}

// ---- Agent tools -------------------------------------------------------------

const TOOLS = [
  {
    name: 'get_story_overview',
    description: 'Read the current story: title, premise, Controlling Idea, genre, setting, value declension, Inciting Incident, protagonist desires, the cast (with character ids and roles) and the scene list. Call at the start of a conversation and whenever you need fresh context; the writer edits the story between turns.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_character',
    description: 'Read every field of one character (characterization, true character, desires, dimensions, mask-vs-heart qualities, arc, choices under pressure, backstory, cast role) plus the scenes they appear in. Call before proposing changes to that character.',
    input_schema: {
      type: 'object',
      properties: { character_id: { type: 'string', description: 'Character id from get_story_overview.' } },
      required: ['character_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'propose_character_update',
    description: 'Put proposed changes to a character (or a new character) in front of the writer as a review card with Accept / Reject. Nothing is saved unless the writer accepts. Include only the fields you are changing, written concretely for this story. Text fields replace the current value; add_* lists append.',
    input_schema: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'Existing character id, or "new" to create a character.' },
        summary: { type: 'string', description: 'One sentence the writer will see: what this proposal does and why.' },
        fields: {
          type: 'object',
          description: 'Fields to set.',
          properties: {
            name: { type: 'string' },
            role: { type: 'string', enum: ['protagonist', 'antagonist', 'supporting', 'minor'] },
            mask: { type: 'string', description: 'Characterization: the outer mask, how they appear.' },
            core: { type: 'string', description: 'True character revealed under pressure.' },
            conscious: { type: 'string', description: 'Conscious desire / object of desire.' },
            unconscious: { type: 'string', description: 'Unconscious desire that contradicts the conscious one.' },
            motivation: { type: 'string' },
            capacities: { type: 'string', description: 'Qualities that make pursuing the desire credible.' },
            willpower: { type: 'integer', minimum: 1, maximum: 10 },
            chance: { type: 'string', description: 'Why they have at least a chance to succeed.' },
            risk: { type: 'string', description: 'The worst thing that happens if they fail.' },
            empathy: { type: 'string', description: 'The shared humanity that makes the audience think "like me".' },
            attitude: { type: 'string', description: 'Their distinct attitude toward the story’s central issue (cast polarization).' },
            bringsOut: { type: 'string', description: 'For non-protagonists: which side of the protagonist they bring out.' },
            obsession: { type: 'string', description: 'Comic characters: the blind obsession.' },
            notes: { type: 'string' },
            arc_plot: { type: 'string', enum: ['', 'maturation', 'redemption', 'education', 'testing', 'punitive', 'disillusionment'] },
            arc_from: { type: 'string', description: 'Inner state at the start.' },
            arc_to: { type: 'string', description: 'Inner state at the climax.' },
            characterization: {
              type: 'object',
              properties: {
                age: { type: 'string' }, occupation: { type: 'string' }, look: { type: 'string' },
                speech: { type: 'string' }, home: { type: 'string' }, attitudes: { type: 'string' },
              },
              additionalProperties: false,
            },
            qualities: {
              type: 'object',
              description: 'Mask (how they appear) vs. core (true character), each from -2 (negative pole) to 2 (positive pole). Axes: loving/cruel, generous/selfish, strong/weak, honest (truthful/liar), brave/cowardly, loyal/disloyal, willful/will-less.',
              properties: Object.fromEntries(['loving', 'generous', 'strong', 'honest', 'brave', 'loyal', 'willful'].map((k) => [k, {
                type: 'object',
                properties: { mask: { type: 'integer', minimum: -2, maximum: 2 }, core: { type: 'integer', minimum: -2, maximum: 2 } },
                additionalProperties: false,
              }])),
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
        add_dimensions: {
          type: 'array', description: 'Contradictions to add (dimension = contradiction).',
          items: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } }, required: ['a', 'b'], additionalProperties: false },
        },
        add_choices: {
          type: 'array', description: 'Choices under pressure that reveal true character.',
          items: { type: 'object', properties: { dilemma: { type: 'string' }, choice: { type: 'string' }, reveals: { type: 'string' } }, required: ['choice'], additionalProperties: false },
        },
        add_backstory: {
          type: 'array', description: 'Significant past events usable as revelations.',
          items: { type: 'object', properties: { event: { type: 'string' } }, required: ['event'], additionalProperties: false },
        },
      },
      required: ['character_id', 'summary'],
      additionalProperties: false,
    },
  },
  {
    name: 'propose_scene',
    description: 'Offer the writer a new scene (typically a pressure-test dilemma that reveals true character) as a review card. It is added to the scene list only if the writer accepts.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        summary: { type: 'string', description: 'Step-outline sentence: what happens and how it turns.' },
        value: { type: 'string', description: 'Value at stake, e.g. "loyalty / betrayal".' },
        open: { type: 'integer', minimum: -3, maximum: 3, description: 'Opening charge.' },
        close: { type: 'integer', minimum: -3, maximum: 3, description: 'Closing charge (must differ from open).' },
        choice: { type: 'string', description: 'The dilemma and the choice made under pressure.' },
        gap_expect: { type: 'string' },
        gap_result: { type: 'string' },
        character_ids: { type: 'array', items: { type: 'string' } },
        after_scene_id: { type: 'string', description: 'Insert after this scene id (omit to append).' },
        rationale: { type: 'string', description: 'What this scene reveals and why it belongs.' },
      },
      required: ['title', 'summary'],
      additionalProperties: false,
    },
  },
].map((t) => ({ ...t, eager_input_streaming: true }));

function characterReport(story, c) {
  const { color, ...rest } = c;
  const scenes = story.scenes
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (s.characters || []).includes(c.id))
    .map(({ s, i }) => `${i + 1}. ${s.title}`);
  return `${JSON.stringify(rest, null, 1)}\n\nAppears in scenes: ${scenes.join('; ') || '(none linked yet)'}`;
}

async function runTool(name, input, ctx) {
  if (input && '__invalid_json' in input) return { content: JSON.stringify({ INVALID_INPUT: 'The arguments were not valid JSON. Send the call again with a JSON object.' }), isError: true };
  const story = await ctx.storage.getStory(ctx.chat.storyId);
  if (!story) return { content: 'The story no longer exists.', isError: true };
  switch (name) {
    case 'get_story_overview': {
      const charFindings = diagnose(story).filter((c) => c.group === 'character' && c.status !== 'pass').map((c) => `- ${c.title}: ${c.detail}`);
      return { content: `${storyDigest(story, { lang: ctx.lang })}\n\nCharacter diagnostics:\n${charFindings.join('\n') || '- none'}` };
    }
    case 'get_character': {
      const c = story.characters.find((x) => x.id === input.character_id);
      if (!c) return { content: `No character with id "${input.character_id}". Ids: ${story.characters.map((x) => `${x.id} (${x.name})`).join(', ')}`, isError: true };
      return { content: characterReport(story, c) };
    }
    case 'propose_character_update': {
      const v = validateCharacterProposal(input);
      if (!v.ok) return { content: JSON.stringify({ INVALID_INPUT: v.error }), isError: true };
      const existing = v.value.character_id === 'new' ? null : story.characters.find((x) => x.id === v.value.character_id);
      if (v.value.character_id !== 'new' && !existing) return { content: `No character with id "${v.value.character_id}".`, isError: true };
      const proposal = {
        id: `p${ctx.chat.proposals.length + 1}`, type: 'character', status: 'pending', reported: false,
        characterId: v.value.character_id, characterName: existing ? existing.name : v.value.fields.name, payload: v.value,
      };
      ctx.chat.proposals.push(proposal);
      ctx.emit('proposal', proposal);
      return { content: `Proposal ${proposal.id} is in front of the writer for review. It is not applied unless they accept; their decision will appear in a later message.` };
    }
    case 'propose_scene': {
      const v = validateSceneProposal(input);
      if (!v.ok) return { content: JSON.stringify({ INVALID_INPUT: v.error }), isError: true };
      if (v.value.after_scene_id && sceneIndex(story, v.value.after_scene_id) < 0) delete v.value.after_scene_id;
      const proposal = { id: `p${ctx.chat.proposals.length + 1}`, type: 'scene', status: 'pending', reported: false, payload: v.value };
      ctx.chat.proposals.push(proposal);
      ctx.emit('proposal', proposal);
      return { content: `Scene proposal ${proposal.id} is in front of the writer for review. Nothing is added unless they accept.` };
    }
    default:
      return { content: `Unknown tool ${name}`, isError: true };
  }
}

// Without tools the model can't read the story itself, so it gets the overview
// (and the character in focus) in the system prompt instead.
async function storyContext(ctx) {
  const story = await ctx.storage.getStory(ctx.chat.storyId);
  if (!story) return '';
  const focus = story.characters.find((c) => c.id === ctx.chat.characterId);
  return [
    'Tools are not available with this model: you cannot call functions or create proposal cards, and nothing you write changes the story. When you suggest changes, present them clearly so the writer can copy them into the app themselves.',
    `Current story:\n${storyDigest(story, { lang: ctx.lang })}`,
    focus && `Character in focus:\n${characterReport(story, focus)}`,
  ].filter(Boolean).join('\n\n');
}

// Streaming manual tool-use loop over any provider. Appends to chat.messages
// (append-only, canonical content blocks; Claude's thinking blocks are kept
// as returned) and streams UI events.
async function runAgent({ llm, chat, storage, emit, signal, lang }) {
  const ctx = { chat, storage, emit, lang };
  await llm.prepare(signal);
  let tools = llm.supportsTools() ? TOOLS : null;
  let retries = 0;
  for (let turn = 0; turn < MAX_AGENT_TURNS; turn++) {
    const base = withLanguage(CHARACTER_AGENT_SYSTEM, lang);
    const system = tools ? base : `${base}\n\n${await storyContext(ctx)}`;
    let res;
    try {
      res = await llm.agentTurn({
        system, tools, messages: chat.messages, signal,
        onText: (text) => emit('text', { text }),
        onThinking: (text) => emit('thinking', { text }),
        onTool: (name) => emit('tool', { name }),
      });
      retries = 0;
    } catch (err) {
      if (signal.aborted) throw err;
      // A model without tool support: carry on as a plain conversation.
      if (err instanceof LLMError && err.kind === 'tools_unsupported' && tools) {
        llm.markNoTools();
        tools = null;
        emit('notice', { text: tl(lang, '{model} can’t use tools, so it reads the story from a summary and can’t make proposal cards. For proposals, pick a model with tool support.', { model: llm.model }) });
        continue;
      }
      // A tool input that wasn't valid JSON: re-issue the same turn (nothing was appended).
      if (err instanceof LLMError && err.kind === 'malformed' && retries++ < 2) {
        emit('status', { text: tl(lang, 'Retrying a malformed tool call…') });
        continue;
      }
      throw err;
    }

    if (res.stop === 'refusal') {
      emit('error', { message: tl(lang, '{name} declined to continue this request.', { name: llm.label }) });
      return;
    }
    const toolUses = res.content.filter((b) => b.type === 'tool_use');
    if (res.stop === 'max_tokens' && toolUses.length) throw new LLMError('truncated', 'The reply was cut off mid tool call (max_tokens).');
    if (!res.content.length) {
      emit('error', { message: tl(lang, 'The model returned an empty reply.') });
      return;
    }

    chat.messages.push({ role: 'assistant', content: res.content });
    if (res.stop === 'pause') continue;
    if (!toolUses.length || !tools) return;

    const results = [];
    for (const tu of toolUses) {
      let out;
      try {
        out = await runTool(tu.name, tu.input || {}, ctx);
      } catch (err) {
        out = { content: `Tool failed: ${err.message}`, isError: true };
      }
      results.push({ type: 'tool_result', tool_use_id: tu.id, content: out.content, ...(out.isError && { is_error: true }) });
    }
    chat.messages.push({ role: 'user', content: results });
    emit('status', { text: '' });
  }
  emit('status', { text: tl(lang, 'Stopped after many tool calls; ask me to continue.') });
}

function sceneText(story, sceneId) {
  const i = sceneIndex(story, sceneId);
  if (i < 0) return '(scene not found)';
  const s = story.scenes[i];
  const cast = (s.characters || []).map((id) => (story.characters.find((c) => c.id === id) || {}).name).filter(Boolean);
  const beats = (s.beats || []).map((b, k) => `  ${k + 1}. ${b.action} / ${b.reaction}`).join('\n');
  return [
    `#${i + 1} "${s.title}"${s.marker ? ` [${s.marker}]` : ''}`,
    s.summary && `Summary: ${s.summary}`,
    s.location && `Location: ${s.location}${s.time ? `, ${s.time}` : ''}`,
    cast.length && `Characters: ${cast.join(', ')}`,
    s.value && `Value: ${s.value} (open ${s.open ?? '?'} → close ${s.close ?? '?'})`,
    (s.desire || s.antagonist) && `Conflict: ${s.driver || '?'} wants ${s.desire || '?'}; blocked by ${s.antagonist || '?'} who wants ${s.antagonistDesire || '?'}`,
    (s.gapExpect || s.gapResult) && `Gap: expected "${s.gapExpect}" / result "${s.gapResult}"`,
    beats && `Beats:\n${beats}`,
    s.subtext && `Subtext: ${s.subtext}`,
    s.treatment && `Treatment: ${s.treatment}`,
  ].filter(Boolean).join('\n');
}

export function aiRouter(storage) {
  const router = express.Router();

  router.get('/status', (req, res) => {
    const s = providerStatus();
    res.json({
      ...s,
      // Older clients: whether the server's default provider is ready, and keys from the browser.
      envKey: s.configured,
      clientKeyAllowed: s.allowClientConfig,
      tasks: Object.fromEntries(Object.entries(ASSIST_TASKS).map(([k, v]) => [k, v.label])),
    });
  });

  // Models offered by the provider in the request's settings (the settings
  // panel sends the values being edited, before they are saved).
  router.get('/models', async (req, res) => {
    const got = llmFor(req);
    if (got.error) return res.status(400).json({ error: configError(got, req.lang) });
    try {
      const models = await got.llm.listModels();
      res.json({ provider: got.cfg.provider.id, models: [...new Set(models)].sort((a, b) => a.localeCompare(b)) });
    } catch (err) {
      res.status(502).json({ error: describeLLMError(err, got.cfg, req.lang) });
    }
  });

  router.get('/chats', async (req, res, next) => {
    try { res.json(await storage.listChats(String(req.query.storyId || ''))); } catch (e) { next(e); }
  });

  router.get('/chats/:id', async (req, res, next) => {
    try {
      const c = await storage.getChat(req.params.id);
      if (!c) return res.status(404).json({ error: tl(req.lang, 'Chat not found') });
      res.json({ id: c.id, storyId: c.storyId, characterId: c.characterId, title: c.title, display: c.display, proposals: c.proposals });
    } catch (e) { next(e); }
  });

  router.delete('/chats/:id', async (req, res, next) => {
    try { await storage.deleteChat(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
  });

  router.post('/chats/:id/proposals/:pid', async (req, res, next) => {
    try {
      const c = await storage.getChat(req.params.id);
      if (!c) return res.status(404).json({ error: tl(req.lang, 'Chat not found') });
      const p = c.proposals.find((x) => x.id === req.params.pid);
      if (!p) return res.status(404).json({ error: tl(req.lang, 'Proposal not found') });
      if (!['accepted', 'rejected'].includes(req.body.status)) return res.status(400).json({ error: 'status must be accepted or rejected' });
      p.status = req.body.status;
      p.reported = false;
      if (req.body.note) p.note = String(req.body.note).slice(0, 500);
      await storage.saveChat(c);
      res.json({ ok: true, proposal: p });
    } catch (e) { next(e); }
  });

  router.post('/chat', async (req, res, next) => {
    let emit;
    try {
      const { storyId, chatId, characterId, message } = req.body || {};
      if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message is required' });
      const story = await storage.getStory(String(storyId || ''));
      if (!story) return res.status(404).json({ error: tl(req.lang, 'Story not found') });
      const got = llmFor(req);
      if (got.error) return res.status(503).json({ error: configError(got, req.lang) });
      const { llm, cfg } = got;

      let chat = chatId ? await storage.getChat(chatId) : null;
      if (chat && chat.storyId !== story.id) chat = null;
      if (!chat) chat = { id: uid('chat'), storyId: story.id, characterId: characterId || '', title: message.slice(0, 60), messages: [], display: [], proposals: [] };

      // Report the writer's decisions on earlier proposals, then the message.
      const decided = chat.proposals.filter((p) => p.status !== 'pending' && !p.reported);
      const notes = decided.map((p) => `${p.id} ${p.status}${p.note ? ` (${p.note})` : ''}`);
      decided.forEach((p) => { p.reported = true; });
      const focus = characterId ? story.characters.find((c) => c.id === characterId) : null;
      if (characterId) chat.characterId = characterId;
      const preface = [
        notes.length && `[Writer decisions since your last turn: ${notes.join('; ')}]`,
        focus && `[The writer is looking at character "${focus.name || 'Unnamed'}" (id ${focus.id}).]`,
      ].filter(Boolean).join('\n');
      chat.messages.push({ role: 'user', content: preface ? `${preface}\n\n${message}` : message });
      chat.display.push({ role: 'user', parts: [{ type: 'text', text: message }] });
      const assistant = { role: 'assistant', parts: [] };
      chat.display.push(assistant);

      emit = openSse(res);
      emit('chat', { chatId: chat.id });
      const record = (event, data) => {
        if (event === 'text') {
          const last = assistant.parts[assistant.parts.length - 1];
          if (last && last.type === 'text') last.text += data.text; else assistant.parts.push({ type: 'text', text: data.text });
        } else if (event === 'proposal') assistant.parts.push({ type: 'proposal', id: data.id });
        else if (event === 'error') assistant.parts.push({ type: 'error', text: data.message });
        else if (event === 'notice') assistant.parts.push({ type: 'notice', text: data.text });
        emit(event, data);
      };

      const controller = new AbortController();
      res.on('close', () => { if (!res.writableFinished) controller.abort(); });
      try {
        await runAgent({ llm, chat, storage, emit: record, signal: controller.signal, lang: req.lang });
      } catch (err) {
        if (!controller.signal.aborted) record('error', { message: describeLLMError(err, { ...cfg, model: llm.model }, req.lang) });
      }
      await storage.saveChat(chat);
      emit('done', { chatId: chat.id });
      res.end();
    } catch (err) {
      if (emit) { emit('error', { message: describeLLMError(err, null, req.lang) }); res.end(); } else next(err);
    }
  });

  router.post('/assist', async (req, res, next) => {
    let emit;
    try {
      const { task, storyId, sceneId, input } = req.body || {};
      const spec = typeof task === 'string' && Object.hasOwn(ASSIST_TASKS, task) ? ASSIST_TASKS[task] : null;
      if (!spec) return res.status(400).json({ error: `Unknown task "${task}"` });
      const story = await storage.getStory(String(storyId || ''));
      if (!story) return res.status(404).json({ error: tl(req.lang, 'Story not found') });
      const got = llmFor(req);
      if (got.error) return res.status(503).json({ error: configError(got, req.lang) });
      const { llm, cfg } = got;

      let taskInput = typeof input === 'string' ? input.slice(0, 4000) : '';
      if (task === 'story-doctor') taskInput = diagnose(story).filter((c) => c.status !== 'pass').map((c) => `- [${c.status}] ${c.title}: ${c.detail}`).join('\n') || 'No findings.';
      const prompt = spec.build({ digest: storyDigest(story, { lang: req.lang }), scene: sceneId ? sceneText(story, sceneId) : '', input: taskInput });

      emit = openSse(res);
      const controller = new AbortController();
      res.on('close', () => { if (!res.writableFinished) controller.abort(); });
      try {
        const { stop } = await llm.complete({
          system: withLanguage(ASSIST_SYSTEM, req.lang), prompt, signal: controller.signal,
          onText: (text) => emit('text', { text }),
        });
        if (stop === 'refusal') emit('error', { message: tl(req.lang, '{name} declined this request.', { name: llm.label }) });
      } catch (err) {
        if (!controller.signal.aborted) emit('error', { message: describeLLMError(err, { ...cfg, model: llm.model }, req.lang) });
      }
      emit('done', {});
      res.end();
    } catch (err) {
      if (emit) { emit('error', { message: describeLLMError(err, null, req.lang) }); res.end(); } else next(err);
    }
  });

  return router;
}
