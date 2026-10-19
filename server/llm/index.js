// Picks the adapter for a request from the provider configuration.
import { resolveConfig } from './providers.js';
import { anthropicLLM } from './anthropic.js';
import { openaiLLM } from './openai.js';

export { LLMError, describeLLMError } from './errors.js';
export { PROVIDERS, providerStatus, defaultProvider, defaultModel } from './providers.js';

// { llm, cfg } when the request can be served, or { error, cfg } explaining
// what is missing ('no-key', 'no-url', 'invalid-url').
export function llmFor(req) {
  const cfg = resolveConfig(req);
  if (cfg.error) return { error: cfg.error, cfg };
  const llm = cfg.provider.api === 'anthropic' ? anthropicLLM(cfg) : openaiLLM(cfg);
  return { llm, cfg };
}
