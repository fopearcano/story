// AI settings: which provider the partner uses (Claude, another cloud service
// or a model running locally), with its key, server address and model. Saved
// in this browser; the server can also be configured for everyone.
import { html, useState, useEffect } from '../lib.js';
import { api, aiConfig } from '../api.js';
import { Btn, rich } from '../ui.js';
import { t } from '../i18n.js';
import { useApp } from '../appctx.js';

const KIND_GROUPS = [
  { kind: 'cloud', label: t('Cloud services') },
  { kind: 'local', label: t('On your computer or network') },
  { kind: 'custom', label: t('Other') },
];

const TIPS = {
  openrouter: () => rich('One key for models from many companies. Model ids look like <code>company/model</code>; <code>openrouter/auto</code> picks one for you.'),
  ollama: () => rich('Install Ollama and download a model, e.g. <code>ollama pull qwen3</code>. Models with tool support (Qwen 3, Llama 3.1+, Mistral…) can make proposal cards.'),
  lmstudio: () => rich('In LM Studio, load a model and start the local server (Developer tab).'),
  llamacpp: () => rich('Start <code>llama-server</code> with <code>--jinja</code> so the model can use tools.'),
  custom: () => rich('Any server with an OpenAI-compatible Chat Completions API: vLLM, LocalAI, Jan, KoboldCpp, Together, Fireworks…'),
};

const providerOf = (ai, id) => (ai.providers || []).find((p) => p.id === id) || null;

// The provider and model in use, for labels.
export function aiInUse(ai) {
  const cfg = aiConfig.get();
  const id = (ai.allowClientConfig && cfg.provider) || ai.provider;
  const p = providerOf(ai, id);
  const model = (ai.allowClientConfig && cfg.provider && cfg.models[id]) || (p && p.defaultModel) || '';
  return { provider: p, model };
}

export function aiAvailable(ai) {
  if (!ai) return false;
  if (!ai.providers) return Boolean(ai.envKey);
  const cfg = aiConfig.get();
  if (!ai.allowClientConfig || !cfg.provider) {
    return Boolean(ai.configured || (ai.allowClientConfig && ai.provider === 'anthropic' && cfg.keys.anthropic));
  }
  const p = providerOf(ai, cfg.provider);
  if (!p) return false;
  const hasKey = !p.needsKey || p.envKey || Boolean(cfg.keys[p.id]);
  return hasKey && Boolean(p.defaultBaseURL || cfg.baseUrls[p.id]);
}

export function AiSettings({ onSaved, onCancel }) {
  const { ai, refreshAi } = useApp();
  const [cfg, setCfg] = useState(aiConfig.get);
  const [models, setModels] = useState({ list: [], state: '', error: '' });
  const [saved, setSaved] = useState(false);
  const id = cfg.provider;
  const p = providerOf(ai, id);
  const def = providerOf(ai, ai.provider);

  useEffect(() => { setModels({ list: [], state: '', error: '' }); }, [id]);
  const edit = (field, value) => {
    setSaved(false);
    setCfg((c) => (field === 'provider' ? { ...c, provider: value } : { ...c, [field]: { ...c[field], [id]: value } }));
  };
  const loadModels = async () => {
    setModels({ list: [], state: 'loading', error: '' });
    try {
      const r = await api.listModels(aiConfig.selection(cfg));
      setModels({ list: r.models || [], state: 'done', error: '' });
    } catch (e) {
      setModels({ list: [], state: 'done', error: e.message });
    }
  };
  const save = () => {
    aiConfig.set(cfg);
    setSaved(true);
    refreshAi && refreshAi();
    onSaved && onSaved();
  };

  const intro = html`<p>${rich('<b>The AI partner is optional.</b> Every tool in Story Builder works without it. With it, an AI dramaturg interviews your characters, pressure-tests them with dilemmas and proposes changes you accept or reject. Use Claude, another cloud service, or a model running on your own computer.')}</p>`;

  if (!ai.allowClientConfig) {
    return html`<div class="stack small">${intro}
      <div class="callout">${def && ai.configured
        ? rich('This server uses <b>{provider}</b> (model <code>{model}</code>), chosen by whoever runs it.', { provider: def.label, model: ai.model || t('first available') })
        : t('The AI partner isn’t configured on this server, and settings from browsers are turned off. Ask whoever runs it to configure a provider.')}</div>
    </div>`;
  }

  const keyField = p && (p.needsKey || p.optionalKey || p.envKey);
  return html`<div class="stack small ai-settings">
    ${intro}
    <label class="field"><span class="field-label">${t('Provider')}</span>
      <select value=${id} onChange=${(e) => edit('provider', e.target.value)}>
        <option value="">${def ? t('Server default: {provider}', { provider: def.label }) : t('Server default')}${def && !ai.configured ? ` (${t('not configured')})` : ''}</option>
        ${KIND_GROUPS.map((g) => html`<optgroup label=${g.label}>
          ${(ai.providers || []).filter((x) => x.kind === g.kind).map((x) => html`<option value=${x.id}>${x.label}</option>`)}
        </optgroup>`)}
      </select>
    </label>

    ${!p ? html`<div class="callout">${ai.configured
      ? rich('The server is set up for <b>{provider}</b> (model <code>{model}</code>). You’re all set.', { provider: def ? def.label : '?', model: ai.model || t('first available') })
      : rich('The server has no AI provider configured yet. Choose one above, or start the server with a key, e.g. <code>ANTHROPIC_API_KEY=… npm start</code> or <code>OPENAI_API_KEY=… npm start</code>.')}</div>` : html`
      ${TIPS[p.id] && html`<div class="callout">${TIPS[p.id]()}</div>`}
      ${keyField && html`<label class="field"><span class="field-label">${p.optionalKey ? t('API key (if the server needs one)') : t('API key')}
          ${p.keyUrl && html`<a class="tiny" href=${p.keyUrl} target="_blank" rel="noopener noreferrer">${t('Get a key')}</a>`}</span>
        <input type="password" placeholder=${p.envKey ? t('Using the server’s key') : p.keyHint || ''} value=${cfg.keys[id] || ''} onInput=${(e) => edit('keys', e.target.value.trim())} autocomplete="off" />
        <span class="field-hint">${t('Stored in this browser’s localStorage and sent only to this Story Builder server, which forwards it to the provider.')}</span>
      </label>`}
      ${p.kind !== 'cloud' && html`<label class="field"><span class="field-label">${t('Server address')}</span>
        <input type="url" placeholder=${p.defaultBaseURL || 'http://localhost:8000/v1'} value=${cfg.baseUrls[id] || ''} onInput=${(e) => edit('baseUrls', e.target.value.trim())} />
        <span class="field-hint">${t('Seen from the computer running Story Builder: “localhost” is that computer, not the device you’re using.')}</span>
      </label>`}
      <label class="field"><span class="field-label">${t('Model')}</span>
        <div class="row" style="flex-wrap:nowrap">
          <input class="input grow" list="ai-models" placeholder=${p.defaultModel || t('First available model')} value=${cfg.models[id] || ''} onInput=${(e) => edit('models', e.target.value.trim())} />
          <${Btn} small onClick=${loadModels} disabled=${models.state === 'loading'}>${models.state === 'loading' ? t('Loading…') : t('Load models')}</${Btn}>
        </div>
        <datalist id="ai-models">${models.list.map((m) => html`<option value=${m} />`)}</datalist>
        <span class="field-hint">${models.error ? html`<span class="err">${models.error}</span>`
          : models.state === 'done' ? t('{n} models available — pick one from the list or type its id.', { n: models.list.length })
            : t('Leave empty for the default. “Load models” also checks the connection.')}</span>
      </label>`}

    <div class="row">
      <${Btn} kind="primary" icon="check" onClick=${save}>${t('Save')}</${Btn}>
      ${onCancel && html`<${Btn} onClick=${onCancel}>${t('Cancel')}</${Btn}>`}
      ${saved && html`<span class="muted">${t('Saved.')}</span>`}
    </div>
  </div>`;
}
