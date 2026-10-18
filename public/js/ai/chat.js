// AI partner drawer: a character-building conversation with an agent that can
// read the story and propose changes the writer accepts or rejects.
import { html, useState, useEffect, useRef, cx } from '../lib.js';
import { api, streamSse } from '../api.js';
import { useStory } from '../store.js';
import { useApp } from '../appctx.js';
import { Btn, Icon, Select } from '../ui.js';
import { markdownToHtml } from '../markdown.js';
import { AiSetup, aiAvailable } from './setup.js';
import { applyCharacterProposal, applySceneProposal, describeCharacterProposal } from './apply.js';

const TOOL_STATUS = {
  get_story_overview: 'Reading the story…',
  get_character: 'Studying the character…',
  propose_character_update: 'Drafting a proposal…',
  propose_scene: 'Designing a pressure-test scene…',
};

function quickPrompts(c, prot) {
  const name = c ? c.name || 'this character' : null;
  if (c) {
    return [
      `Interview ${name} with me, one question at a time.`,
      `What is ${name}'s unconscious desire, and how does it contradict what they consciously want?`,
      `Find a consistent contradiction that gives ${name} real dimension.`,
      `Design a dilemma (irreconcilable goods or lesser of two evils) whose choice would reveal ${name}'s true character.`,
      c.role === 'protagonist' ? `Who in the cast should bring out ${name}'s hidden side? Propose a supporting character.` : `How should ${name} bring out a side of ${prot ? prot.name : 'the protagonist'}?`,
      'Fill in the empty fields with your best proposal.',
    ];
  }
  return [
    'Read my story and tell me which character needs the most work.',
    'Help me create a protagonist from scratch.',
    'Design a polarized cast around my protagonist.',
    'Make my forces of antagonism stronger — who or what opposes the protagonist?',
  ];
}

export function ChatDrawer({ focusId, seedPrompt, onClose, onFocusChange }) {
  const store = useStory();
  const { story } = store;
  const { ai } = useApp();
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState('');
  const [display, setDisplay] = useState([]);
  const [proposals, setProposals] = useState({});
  const [input, setInput] = useState(seedPrompt || '');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [thinking, setThinking] = useState('');
  const [err, setErr] = useState('');
  const ctrl = useRef(null);
  const bodyRef = useRef(null);
  const ready = aiAvailable(ai);
  const focus = story.characters.find((c) => c.id === focusId) || null;
  const prot = story.characters.find((c) => c.role === 'protagonist');

  const loadChats = () => api.listChats(story.id).then(setChats).catch(() => {});
  useEffect(() => { loadChats(); }, [story.id]);
  useEffect(() => { if (seedPrompt) setInput(seedPrompt); }, [seedPrompt]);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [display, thinking, status]);

  const openChat = async (id) => {
    setErr('');
    if (!id) { setChatId(''); setDisplay([]); setProposals({}); return; }
    const c = await api.getChat(id);
    setChatId(c.id);
    setDisplay(c.display || []);
    setProposals(Object.fromEntries((c.proposals || []).map((p) => [p.id, p])));
    if (c.characterId && onFocusChange) onFocusChange(c.characterId);
  };

  const patchLast = (fn) => setDisplay((d) => {
    const next = d.slice();
    const last = { ...next[next.length - 1], parts: next[next.length - 1].parts.slice() };
    fn(last);
    next[next.length - 1] = last;
    return next;
  });

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput(''); setErr(''); setBusy(true); setStatus('Thinking…'); setThinking('');
    setDisplay((d) => [...d, { role: 'user', parts: [{ type: 'text', text: message }] }, { role: 'assistant', parts: [] }]);
    ctrl.current = new AbortController();
    try {
      await store.flush();
      await streamSse('/api/ai/chat', { storyId: story.id, chatId: chatId || undefined, characterId: focusId || undefined, message }, (ev, data) => {
        if (ev === 'chat') setChatId(data.chatId);
        else if (ev === 'text') {
          setStatus(''); setThinking('');
          patchLast((m) => {
            const lp = m.parts[m.parts.length - 1];
            if (lp && lp.type === 'text') m.parts[m.parts.length - 1] = { ...lp, text: lp.text + data.text };
            else m.parts.push({ type: 'text', text: data.text });
          });
        } else if (ev === 'thinking') setThinking((t) => (t + data.text).slice(-220));
        else if (ev === 'tool') { setStatus(TOOL_STATUS[data.name] || 'Working…'); setThinking(''); }
        else if (ev === 'status') setStatus(data.text);
        else if (ev === 'proposal') {
          setProposals((p) => ({ ...p, [data.id]: data }));
          patchLast((m) => m.parts.push({ type: 'proposal', id: data.id }));
        } else if (ev === 'error') patchLast((m) => m.parts.push({ type: 'error', text: data.message }));
      }, { signal: ctrl.current.signal });
    } catch (e) {
      if (e.name !== 'AbortError') setErr(e.message);
    }
    setBusy(false); setStatus(''); setThinking('');
    loadChats();
  };

  const decide = async (p, status) => {
    if (status === 'accepted') {
      const cur = store.get();
      if (p.type === 'character') {
        const { story: next, characterId } = applyCharacterProposal(cur, p.payload);
        store.replace(next);
        if (onFocusChange && p.payload.character_id === 'new') onFocusChange(characterId);
      } else if (p.type === 'scene') {
        store.replace(applySceneProposal(cur, p.payload).story);
      }
    }
    setProposals((all) => ({ ...all, [p.id]: { ...p, status } }));
    try { await api.decideProposal(chatId, p.id, status); } catch (e) { setErr(e.message); }
  };

  return html`<aside class="drawer" aria-label="AI partner">
    <div class="drawer-head">
      <div class="row">
        <span class="drawer-title grow"><${Icon} name="spark" /> AI partner <span class="muted small" style="font-weight:400">· character builder</span></span>
        <button class="icon-btn" onClick=${onClose} title="Close"><${Icon} name="close" /></button>
      </div>
      ${ready && html`<div class="row">
        <${Select} class="grow" value=${focusId || ''} onChange=${(v) => onFocusChange && onFocusChange(v)}
          options=${[{ id: '', label: 'Whole cast' }, ...story.characters.map((c) => ({ id: c.id, label: `${c.name || 'Unnamed'} (${c.role})` }))]} />
        <${Select} class="grow" value=${chatId} onChange=${openChat}
          options=${[{ id: '', label: 'New conversation' }, ...chats.map((c) => ({ id: c.id, label: c.title || 'Conversation' }))]} />
      </div>`}
    </div>
    <div class="drawer-body" ref=${bodyRef}>
      ${!ready ? html`<${AiSetup} />` : html`
        ${!display.length && html`<div class="callout">
          <b>${focus ? `Developing ${focus.name || 'this character'}` : 'Your dramaturg'}</b>
          <p>Ask for an interview, a contradiction, an unconscious desire, a dilemma that reveals true character, or a cast designed around your protagonist. Proposed changes appear as cards — nothing changes until you accept.</p>
        </div>`}
        ${display.map((m) => html`<div class=${cx('msg', m.role)}>
          ${m.role === 'user' ? m.parts.map((p) => p.text) : m.parts.map((p) => {
            if (p.type === 'text') return html`<div class="prose" dangerouslySetInnerHTML=${{ __html: markdownToHtml(p.text) }} />`;
            if (p.type === 'proposal') return proposals[p.id] ? html`<${ProposalCard} p=${proposals[p.id]} story=${story} onDecide=${decide} />` : null;
            if (p.type === 'error') return html`<p class="err">${p.text}</p>`;
            return null;
          })}
        </div>`)}
        ${busy && (status || thinking) && html`<div class="thinking-line"><span class="pulse" /><span>${status}${thinking && html`<br /><i class="muted">${thinking}</i>`}</span></div>`}
        ${err && html`<p class="err">${err}</p>`}
      `}
    </div>
    ${ready && html`<div class="drawer-foot">
      ${!busy && html`<div class="quick">${quickPrompts(focus, prot).slice(0, 4).map((q) => html`<button onClick=${() => send(q)}>${q.length > 52 ? `${q.slice(0, 50)}…` : q}</button>`)}</div>`}
      <div class="composer">
        <textarea rows="2" placeholder=${focus ? `Ask about ${focus.name || 'this character'}…` : 'Ask about your characters…'} value=${input}
          onInput=${(e) => setInput(e.target.value)}
          onKeyDown=${(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
        ${busy ? html`<${Btn} icon="close" onClick=${() => ctrl.current && ctrl.current.abort()} title="Stop" />` : html`<${Btn} kind="primary" icon="send" onClick=${() => send()} title="Send" />`}
      </div>
    </div>`}
  </aside>`;
}

function ProposalCard({ p, story, onDecide }) {
  const isChar = p.type === 'character';
  const target = isChar ? (p.payload.character_id === 'new' ? `New character: ${p.payload.fields.name}` : `Update ${(story.characters.find((c) => c.id === p.payload.character_id) || {}).name || p.characterName || 'character'}`) : `New scene: ${p.payload.title}`;
  const rows = isChar ? describeCharacterProposal(p.payload) : [
    ['Summary', p.payload.summary], p.payload.value && ['Value', `${p.payload.value} (${p.payload.open ?? '?'} → ${p.payload.close ?? '?'})`],
    p.payload.choice && ['Choice under pressure', p.payload.choice], p.payload.rationale && ['Why', p.payload.rationale],
  ].filter(Boolean);
  return html`<div class=${cx('proposal', p.status)}>
    <div class="proposal-head"><${Icon} name="spark" size=${14} />${target}</div>
    <div class="proposal-body">
      ${isChar && p.payload.summary && html`<p class="muted" style="margin-top:0">${p.payload.summary}</p>`}
      ${rows.map(([k, v]) => html`<div class="proposal-row"><span>${k}</span><span>${v}</span></div>`)}
    </div>
    <div class="proposal-foot">
      ${p.status === 'pending' ? html`
        <${Btn} small kind="primary" icon="check" onClick=${() => onDecide(p, 'accepted')}>Accept</${Btn}>
        <${Btn} small icon="x" onClick=${() => onDecide(p, 'rejected')}>Reject</${Btn}>`
        : html`<span class=${cx('status', p.status === 'accepted' ? 'pass' : 'todo')}><${Icon} name=${p.status === 'accepted' ? 'check' : 'x'} size=${14} />${p.status === 'accepted' ? 'Accepted — applied to your story' : 'Rejected'}</span>`}
    </div>
  </div>`;
}
