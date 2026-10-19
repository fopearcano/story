// AI providers the partner can use. Claude goes through the Anthropic SDK; every
// other provider speaks the OpenAI-compatible Chat Completions API, which
// covers the big cloud services and local servers such as Ollama, LM Studio
// and llama.cpp.
//
// Server configuration (environment):
//   STORY_AI_PROVIDER   default provider id (otherwise the first one with a key)
//   STORY_AI_MODEL      model for the default provider
//   <PROVIDER>_API_KEY  keys, e.g. OPENAI_API_KEY, OPENROUTER_API_KEY
//   OLLAMA_BASE_URL…    where a local server listens, if not the default
//   STORY_AI_BASE_URL / STORY_AI_API_KEY  any other OpenAI-compatible endpoint
//   STORY_AI_ALLOW_CLIENT_CONFIG=false  ignore provider, key, URL and model
//     sent from browsers and always use the server's configuration

export const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic · Claude', short: 'Claude', kind: 'cloud', api: 'anthropic', baseURL: 'https://api.anthropic.com', model: 'claude-opus-5-5', keyEnv: ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN'], keyHint: 'sk-ant-…', keyUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', label: 'OpenAI', short: 'OpenAI', kind: 'cloud', api: 'openai', baseURL: 'https://api.openai.com/v1', model: 'gpt-5', keyEnv: ['OPENAI_API_KEY'], keyHint: 'sk-…', keyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'openrouter', label: 'OpenRouter', short: 'OpenRouter', kind: 'cloud', api: 'openai', baseURL: 'https://openrouter.ai/api/v1', model: 'openrouter/auto', keyEnv: ['OPENROUTER_API_KEY'], keyHint: 'sk-or-…', keyUrl: 'https://openrouter.ai/keys',
    headers: { 'HTTP-Referer': 'https://github.com/fopearcano/story', 'X-Title': 'Story Builder' } },
  { id: 'gemini', label: 'Google Gemini', short: 'Gemini', kind: 'cloud', api: 'openai', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-flash-latest', keyEnv: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'], keyHint: 'AIza…', keyUrl: 'https://aistudio.google.com/apikey' },
  { id: 'mistral', label: 'Mistral AI', short: 'Mistral', kind: 'cloud', api: 'openai', baseURL: 'https://api.mistral.ai/v1', model: 'mistral-large-latest', keyEnv: ['MISTRAL_API_KEY'], keyUrl: 'https://console.mistral.ai/api-keys' },
  { id: 'groq', label: 'Groq', short: 'Groq', kind: 'cloud', api: 'openai', baseURL: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-120b', keyEnv: ['GROQ_API_KEY'], keyHint: 'gsk_…', keyUrl: 'https://console.groq.com/keys' },
  { id: 'deepseek', label: 'DeepSeek', short: 'DeepSeek', kind: 'cloud', api: 'openai', baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat', keyEnv: ['DEEPSEEK_API_KEY'], keyHint: 'sk-…', keyUrl: 'https://platform.deepseek.com/api_keys' },
  { id: 'xai', label: 'xAI · Grok', short: 'Grok', kind: 'cloud', api: 'openai', baseURL: 'https://api.x.ai/v1', model: 'grok-4', keyEnv: ['XAI_API_KEY'], keyHint: 'xai-…', keyUrl: 'https://console.x.ai' },
  { id: 'ollama', label: 'Ollama', short: 'Ollama', kind: 'local', api: 'openai', baseURL: 'http://localhost:11434/v1', model: '', keyEnv: [], baseEnv: 'OLLAMA_BASE_URL' },
  { id: 'lmstudio', label: 'LM Studio', short: 'LM Studio', kind: 'local', api: 'openai', baseURL: 'http://localhost:1234/v1', model: '', keyEnv: [], baseEnv: 'LMSTUDIO_BASE_URL' },
  { id: 'llamacpp', label: 'llama.cpp server', short: 'llama.cpp', kind: 'local', api: 'openai', baseURL: 'http://localhost:8080/v1', model: '', keyEnv: [], baseEnv: 'LLAMACPP_BASE_URL' },
  { id: 'custom', label: 'Other OpenAI-compatible', short: 'OpenAI-compatible', kind: 'custom', api: 'openai', baseURL: '', model: '', keyEnv: ['STORY_AI_API_KEY'], baseEnv: 'STORY_AI_BASE_URL', optionalKey: true },
];

const byId = Object.fromEntries(PROVIDERS.map((p) => [p.id, p]));
export const providerById = (id) => byId[id] || null;

const env = (name) => (process.env[name] || '').trim();
const envKey = (p) => p.keyEnv.map(env).find(Boolean) || '';
const envBase = (p) => (p.baseEnv && env(p.baseEnv)) || '';
const needsKey = (p) => p.keyEnv.length > 0 && !p.optionalKey;

export function allowClientConfig() {
  if (process.env.STORY_AI_ALLOW_CLIENT_CONFIG) return process.env.STORY_AI_ALLOW_CLIENT_CONFIG !== 'false';
  return process.env.STORY_AI_ALLOW_CLIENT_KEY !== 'false';
}

// Ready to use with the server's own settings alone.
const serverReady = (p) => (!needsKey(p) || Boolean(envKey(p))) && Boolean(envBase(p) || p.baseURL);

export function defaultProvider() {
  const chosen = providerById(env('STORY_AI_PROVIDER'));
  if (chosen) return chosen;
  return PROVIDERS.find((p) => envKey(p) && (p.baseURL || envBase(p)))
    || PROVIDERS.find((p) => p.kind !== 'cloud' && envBase(p))
    || byId.anthropic;
}

export function defaultModel(p) {
  return (p.id === defaultProvider().id && env('STORY_AI_MODEL')) || p.model;
}

// Local servers expose the OpenAI API under /v1; accept the bare host too.
export function normalizeBaseURL(p, url) {
  let u = String(url || '').trim().replace(/\/+$/, '');
  if (!u) return '';
  if (p.kind === 'local' && !/\/v1$/.test(u)) u += '/v1';
  return u;
}

function validURL(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// The provider, key, base URL and model for one request: the browser's
// choices when allowed, else the server's configuration.
export function resolveConfig(req) {
  const allow = allowClientConfig();
  const header = (name) => (allow ? String(req.get(name) || '').trim() : '');
  const p = providerById(header('x-ai-provider')) || defaultProvider();
  const legacyKey = p.id === 'anthropic' ? header('x-anthropic-api-key') : '';
  const clientBase = header('x-ai-base-url');
  if (clientBase && !validURL(clientBase)) return { provider: p, error: 'invalid-url' };
  const key = header('x-ai-key') || legacyKey || envKey(p);
  const baseURL = normalizeBaseURL(p, clientBase || envBase(p) || p.baseURL);
  const model = header('x-ai-model') || defaultModel(p);
  if (needsKey(p) && !key) return { provider: p, error: 'no-key' };
  if (!baseURL) return { provider: p, error: 'no-url' };
  return { provider: p, key, baseURL, model, keyFromEnv: !header('x-ai-key') && !legacyKey && Boolean(key) };
}

// What the settings panel needs to know (never the keys themselves).
export function providerStatus() {
  const def = defaultProvider();
  return {
    provider: def.id,
    model: defaultModel(def),
    configured: serverReady(def),
    allowClientConfig: allowClientConfig(),
    providers: PROVIDERS.map((p) => ({
      id: p.id, label: p.label, short: p.short, kind: p.kind,
      defaultModel: defaultModel(p), defaultBaseURL: normalizeBaseURL(p, envBase(p) || p.baseURL),
      needsKey: needsKey(p), optionalKey: Boolean(p.optionalKey), envKey: Boolean(envKey(p)),
      keyHint: p.keyHint || '', keyUrl: p.keyUrl || '', configured: serverReady(p),
    })),
  };
}
