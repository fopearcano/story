// Claude through the official Anthropic SDK: streaming, adaptive thinking,
// prompt caching and server-side refusal fallbacks. History is kept in the
// Messages API's own format (full content blocks), which is also the
// canonical format the other adapters convert from.
import Anthropic from '@anthropic-ai/sdk';
import { LLMError } from './errors.js';

const EFFORT = () => process.env.STORY_AI_EFFORT || 'medium';
// Models that accept `fallbacks: "default"` and `thinking.display: "updates"`.
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-sonnet-5-5']);
const UPDATES_MODELS = new Set(['claude-opus-5-5', 'claude-fable-5-1', 'claude-fable-5', 'claude-sonnet-5-5']);
// Adaptive thinking and effort; older models get plain requests.
const MODERN = /^claude-(opus|sonnet|haiku|fable)-5/;

function params(model, display) {
  if (!MODERN.test(model)) return { model };
  const betas = [];
  const p = { model, output_config: { effort: EFFORT() } };
  if (FALLBACK_MODELS.has(model)) {
    betas.push('server-side-fallback-2026-07-01');
    p.fallbacks = 'default';
  }
  if (display === 'updates' && UPDATES_MODELS.has(model)) {
    betas.push('thinking-display-updates-2026-08-18');
    p.thinking = { type: 'adaptive', display: 'updates' };
  } else {
    p.thinking = { type: 'adaptive', display: display === 'updates' ? 'summarized' : 'omitted' };
  }
  if (betas.length) p.betas = betas;
  return p;
}

function wrap(err) {
  if (err instanceof LLMError) return err;
  if (err instanceof Anthropic.AuthenticationError) return new LLMError('auth', err.message, { status: 401 });
  if (err instanceof Anthropic.PermissionDeniedError) return new LLMError('forbidden', err.message, { status: 403 });
  if (err instanceof Anthropic.NotFoundError) return new LLMError('not_found', err.message, { status: 404 });
  if (err instanceof Anthropic.RateLimitError) return new LLMError('rate_limit', err.message, { status: 429 });
  if (err instanceof Anthropic.BadRequestError) return new LLMError('bad_request', err.message, { status: 400 });
  if (err instanceof Anthropic.APIConnectionError) return new LLMError('connection', err.message);
  if (err instanceof Anthropic.APIError) return new LLMError('api', err.message, { status: err.status });
  // Anything else while streaming is a tool input that wasn't valid JSON.
  return new LLMError('malformed', err?.message || String(err));
}

const STOPS = { refusal: 'refusal', max_tokens: 'max_tokens', pause_turn: 'pause', tool_use: 'tool_use' };

export function anthropicLLM({ provider, key, baseURL, model, keyFromEnv }) {
  // With the server's key, let the SDK read the environment (it also honours
  // ANTHROPIC_AUTH_TOKEN and ANTHROPIC_BASE_URL).
  const client = new Anthropic({
    maxRetries: 2,
    ...(!keyFromEnv && { apiKey: key }),
    ...(baseURL !== provider.baseURL && { baseURL }),
  });

  return {
    provider,
    model,
    label: 'Claude',
    prepare: async () => model,
    supportsTools: () => true,
    markNoTools: () => {},

    async agentTurn({ system, tools, messages, signal, onText, onThinking, onTool }) {
      try {
        const stream = client.beta.messages.stream({
          ...params(model, 'updates'),
          max_tokens: 64000,
          cache_control: { type: 'ephemeral' },
          system,
          ...(tools && { tools }),
          messages,
        }, { signal });
        stream.on('text', (delta) => onText(delta));
        stream.on('thinking', (delta) => { if (delta) onThinking(delta); });
        stream.on('contentBlock', (block) => { if (block.type === 'tool_use') onTool(block.name); });
        const message = await stream.finalMessage();
        return { content: message.content, stop: STOPS[message.stop_reason] || 'end' };
      } catch (err) {
        if (signal?.aborted) throw err;
        throw wrap(err);
      }
    },

    async complete({ system, prompt, signal, onText }) {
      try {
        const stream = client.beta.messages.stream({
          ...params(model, 'omitted'),
          max_tokens: 32000,
          system,
          messages: [{ role: 'user', content: prompt }],
        }, { signal });
        stream.on('text', (delta) => onText(delta));
        const message = await stream.finalMessage();
        return { stop: STOPS[message.stop_reason] || 'end' };
      } catch (err) {
        if (signal?.aborted) throw err;
        throw wrap(err);
      }
    },

    async listModels() {
      try {
        const ids = [];
        for await (const m of client.models.list({ limit: 100 })) ids.push(m.id);
        return ids;
      } catch (err) {
        throw wrap(err);
      }
    },
  };
}
