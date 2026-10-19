// AI configuration panel: explains how to enable the optional AI partner and
// lets the writer store a personal API key in this browser.
import { html, useState } from '../lib.js';
import { aiKey } from '../api.js';
import { setSafeStorage } from '../lib.js';
import { Btn, rich } from '../ui.js';
import { t } from '../i18n.js';
import { useApp } from '../appctx.js';

export function aiAvailable(ai) {
  return Boolean(ai && (ai.envKey || (ai.clientKeyAllowed && aiKey.get())));
}

export function AiSetup({ onSaved }) {
  const { ai, refreshAi } = useApp();
  const [key, setKey] = useState(aiKey.get());
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSafeStorage(aiKey.storageKey, key.trim() || null);
    setSaved(true);
    refreshAi && refreshAi();
    onSaved && onSaved();
  };
  return html`<div class="stack small">
    <p>${rich('<b>The AI partner is optional.</b> Every tool in Story Builder works without it. With it, a Claude-powered dramaturg interviews your characters, pressure-tests them with dilemmas and proposes changes you accept or reject.')}</p>
    ${ai.envKey
      ? html`<div class="callout">${rich('The server has an API key configured (model <code>{model}</code>). You’re all set.', { model: ai.model })}</div>`
      : html`<div class="callout">${rich('To enable it for everyone using this server, start it with <code>ANTHROPIC_API_KEY=… npm start</code>.')}</div>`}
    ${ai.clientKeyAllowed && html`<div class="stack">
      <label class="field"><span class="field-label">${t('Or use your own API key in this browser')}</span>
        <input type="password" placeholder="sk-ant-…" value=${key} onInput=${(e) => { setKey(e.target.value); setSaved(false); }} autocomplete="off" />
        <span class="field-hint">${t('Stored in this browser’s localStorage and sent only to this Story Builder server, which forwards it to the Claude API.')}</span>
      </label>
      <div class="row"><${Btn} kind="primary" icon="key" onClick=${save} disabled=${!key.trim() && !aiKey.get()}>${key.trim() || !aiKey.get() ? t('Save key') : t('Clear key')}</${Btn}>${saved && html`<span class="muted">${t('Saved.')}</span>`}</div>
    </div>`}
  </div>`;
}
