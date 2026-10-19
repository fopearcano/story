// One-shot AI assists: a button that opens a modal and streams the answer.
import { html, useState, useRef, useEffect } from '../lib.js';
import { streamSse } from '../api.js';
import { Btn, Modal } from '../ui.js';
import { useStory } from '../store.js';
import { useApp } from '../appctx.js';
import { markdownToHtml } from '../markdown.js';
import { AiSettings, aiAvailable } from './setup.js';
import { t } from '../i18n.js';

export function AssistButton({ task, label, sceneId, input, small = true, title }) {
  const [open, setOpen] = useState(false);
  return html`<span>
    <${Btn} kind="ai" icon="spark" small=${small} onClick=${() => setOpen(true)} title=${title || t('Ask the AI partner')}>${label}</${Btn}>
    ${open && html`<${AssistModal} task=${task} label=${label} sceneId=${sceneId} input=${input} onClose=${() => setOpen(false)} />`}
  </span>`;
}

function AssistModal({ task, label, sceneId, input, onClose }) {
  const { story, flush } = useStory();
  const { ai } = useApp();
  const [text, setText] = useState('');
  const [state, setState] = useState('idle');
  const [err, setErr] = useState('');
  const ctrl = useRef(null);
  const ready = aiAvailable(ai);

  const run = async () => {
    setText(''); setErr(''); setState('running');
    ctrl.current = new AbortController();
    try {
      await flush();
      await streamSse('/api/ai/assist', { task, storyId: story.id, sceneId, input }, (ev, data) => {
        if (ev === 'text') setText((prev) => prev + data.text);
        else if (ev === 'error') setErr(data.message);
      }, { signal: ctrl.current.signal });
      setState('done');
    } catch (e) {
      if (e.name !== 'AbortError') setErr(e.message);
      setState('done');
    }
  };
  useEffect(() => { if (ready) run(); return () => ctrl.current && ctrl.current.abort(); }, [ready]);

  return html`<${Modal} title=${label} onClose=${onClose} wide>
    ${!ready ? html`<${AiSettings} />` : html`<div class="stack">
      ${state === 'running' && !text && html`<div class="thinking-line"><span class="pulse" />${t('Thinking about your story…')}</div>`}
      <div class="prose assist-out" dangerouslySetInnerHTML=${{ __html: markdownToHtml(text) }} />
      ${err && html`<p class="err">${err}</p>`}
      <div class="row">
        ${state === 'running' ? html`<${Btn} icon="close" onClick=${() => ctrl.current && ctrl.current.abort()}>${t('Stop')}</${Btn}>` : html`<${Btn} icon="spark" kind="ai" onClick=${run}>${t('Try again')}</${Btn}>`}
        ${text && html`<${Btn} icon="copy" onClick=${() => navigator.clipboard && navigator.clipboard.writeText(text)}>${t('Copy')}</${Btn}>`}
        <span class="tiny muted grow" style="text-align:right">${t('Suggestions only — nothing is changed in your story.')}</span>
      </div>
    </div>`}
  </${Modal}>`;
}
