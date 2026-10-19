// Home: story library.
import { html, useEffect, useState, useRef } from '../lib.js';
import { api } from '../api.js';
import { Btn, Icon, go, href, rich } from '../ui.js';
import { t, tn, locale } from '../i18n.js';
import { TriangleChart } from '../charts/diagrams.js';

export function HomeView() {
  const [stories, setStories] = useState(null);
  const [title, setTitle] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const load = () => api.listStories().then(setStories).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e && e.preventDefault();
    const s = await api.createStory({ title: title.trim() || t('Untitled Story') });
    go(href(s.id, 'meaning'));
  };
  const copySample = async () => { const s = await api.createStory({ template: 'sample' }); go(href(s.id)); };
  const importFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const s = await api.importStory(JSON.parse(await f.text()));
      go(href(s.id));
    } catch (x) { setErr(t('Import failed: {message}', { message: x.message })); }
  };
  const remove = async (s) => {
    if (!confirm(t('Delete "{title}"? This cannot be undone.', { title: s.title }))) return;
    await api.deleteStory(s.id); load();
  };
  const dup = async (s) => { await api.duplicateStory(s.id); load(); };

  return html`<div class="home">
    <div class="home-hero">
      <div>
        <div class="kicker">${rich('Story Builder · after Robert McKee’s <i>Story</i>')}</div>
        <h1>${t('Design stories from the inside out.')}</h1>
        <p>${t('Build premise and Controlling Idea, characters with true depth, the five-part design, turning scenes and forces of antagonism — visually, with a Story Doctor that checks your draft against the principles. An optional AI partner helps you develop characters.')}</p>
        <form class="row mt" onSubmit=${create}>
          <input class="input grow" style="max-width:340px" placeholder=${t('Working title')} value=${title} onInput=${(e) => setTitle(e.target.value)} aria-label=${t('Working title')} />
          <${Btn} kind="primary" icon="plus" type="submit">${t('New story')}</${Btn}>
          <${Btn} icon="copy" onClick=${copySample}>${t('Copy the example')}</${Btn}>
          <${Btn} icon="upload" onClick=${() => fileRef.current.click()}>${t('Import JSON')}</${Btn}>
          <input ref=${fileRef} type="file" accept="application/json,.json" style="display:none" onChange=${importFile} />
        </form>
        ${err && html`<p class="err">${err}</p>`}
      </div>
      <div class="card"><${TriangleChart} triangle=${{ ending: 0.2, conflict: 0.3, protagonists: 0.1, activity: 0.2, time: 0.1, causality: 0.1, reality: 0.1 }} title=${t('Where will yours sit?')} small /></div>
    </div>
    <h2 style="font:600 20px var(--serif);margin-bottom:12px">${t('Your stories')}</h2>
    ${!stories ? html`<p class="muted">${t('Loading…')}</p>` : !stories.length ? html`<div class="empty"><div class="empty-title">${t('No stories yet')}</div><p>${t('Start a new one above, or copy the worked example.')}</p></div>` : html`
      <div class="story-cards">
        ${stories.map((s) => html`<div class="card story-card">
          <a href=${href(s.id)} style="text-decoration:none"><h3>${s.title}</h3></a>
          <div class="logline">${s.logline || html`<span class="muted">${t('No logline yet.')}</span>`}</div>
          <div class="meta"><span>${tn(s.scenes, '{n} scene', '{n} scenes')}</span><span>${tn(s.characters, '{n} character', '{n} characters')}</span><span>${s.updatedAt ? new Date(s.updatedAt).toLocaleDateString(locale) : ''}</span></div>
          <div class="row">
            <a class="btn small primary" href=${href(s.id)}>${t('Open')}</a>
            <${Btn} small icon="copy" onClick=${() => dup(s)} title=${t('Duplicate')}>${t('Duplicate')}</${Btn}>
            <${Btn} small icon="trash" kind="danger" onClick=${() => remove(s)} title=${t('Delete')} />
          </div>
        </div>`)}
      </div>`}
    <p class="tiny muted mt">${rich('Stories are saved as JSON files on the server (the <code>data/</code> folder).')} <${Icon} name="book" size=${12} /> ${rich('Principles are paraphrased from Robert McKee, <i>Story: Substance, Structure, Style, and the Principles of Screenwriting</i> (1997).')}</p>
  </div>`;
}
