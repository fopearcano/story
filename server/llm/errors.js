// Provider-neutral errors, so the agent loop and the routes can react the same
// way whichever service answered.
import { tl } from '../../public/js/i18n.js';

export class LLMError extends Error {
  // kind: auth | forbidden | not_found | rate_limit | bad_request | connection |
  //       tools_unsupported | no_model | malformed | truncated | api
  constructor(kind, message, { status } = {}) {
    super(message);
    this.kind = kind;
    this.status = status;
  }
}

// A message for the writer, in their interface language.
export function describeLLMError(err, cfg, lang) {
  if (!(err instanceof LLMError)) return err?.message || String(err);
  const provider = cfg?.provider?.short || 'AI';
  const local = cfg?.provider?.kind !== 'cloud';
  switch (err.kind) {
    case 'auth': return tl(lang, 'The API key was rejected. Check it in AI settings.');
    case 'forbidden': return tl(lang, 'This API key is not allowed to use the configured model.');
    case 'not_found': return tl(lang, '{provider} could not find model “{model}”. Pick another one in AI settings.', { provider, model: cfg?.model || '?' });
    case 'rate_limit': return tl(lang, 'Rate limited by the API — wait a moment and try again.');
    case 'bad_request': return tl(lang, 'The API rejected the request: {message}', { message: err.message });
    case 'connection': return local
      ? tl(lang, 'Could not reach {provider} at {url}. Is it running?', { provider, url: cfg?.baseURL || '?' })
      : tl(lang, 'Could not reach {provider} (network error).', { provider });
    case 'no_model': return tl(lang, 'No models found at {url}. Download or load a model first.', { url: cfg?.baseURL || '?' });
    case 'truncated': return tl(lang, 'The reply was cut off in the middle of a tool call.');
    default: return tl(lang, '{provider} error {status}: {message}', { provider, status: err.status ?? '', message: err.message });
  }
}
