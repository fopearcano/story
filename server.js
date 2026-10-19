// Story Builder server: static app, JSON story storage, optional AI routes.
import express from 'express';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Storage, isValidId } from './server/storage.js';
import { aiRouter, aiSummary } from './server/ai.js';
import { sampleStory } from './public/js/sample.js';
import { normalizeStory } from './public/js/model.js';
import { normLang, tl } from './public/js/i18n.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4135);
// 0.0.0.0 listens on every interface, so other devices on the LAN can connect.
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(here, 'data'));

export async function createApp({ dataDir = DATA_DIR, seed = true } = {}) {
  const storage = new Storage(dataDir);
  await storage.init();

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb' }));

  app.use('/vendor/htm-preact.js', (req, res) => res.sendFile(path.join(here, 'node_modules/htm/preact/standalone.module.js')));
  app.use(express.static(path.join(here, 'public'), { extensions: ['html'] }));

  const api = express.Router();
  const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
  const idParam = (req, res, next) => (isValidId(req.params.id) ? next() : res.status(400).json({ error: tl(req.lang, 'Invalid id') }));

  // The client sends its interface language; browsers without the app's header
  // fall back to Accept-Language. The worked example is added on the first
  // request into an empty library, in that client's language.
  let seeding = seed ? null : Promise.resolve();
  api.use(wrap(async (req, res, next) => {
    req.lang = normLang(req.get('x-story-lang') || req.acceptsLanguages('en', 'it') || 'en');
    seeding ??= (async () => {
      if (!(await storage.listStories()).length) await storage.saveStory(sampleStory(req.lang));
    })().catch((err) => { seeding = null; throw err; });
    await seeding;
    next();
  }));

  api.get('/health', (req, res) => res.json({ ok: true, ai: aiSummary() }));

  api.get('/stories', wrap(async (req, res) => res.json(await storage.listStories())));

  api.post('/stories', wrap(async (req, res) => {
    const { title, template } = req.body || {};
    if (template === 'sample') {
      const { id, ...rest } = sampleStory(req.lang);
      return res.status(201).json(await storage.createStory({ ...rest, title: tl(req.lang, 'A Christmas Carol (copy)') }, req.lang));
    }
    res.status(201).json(await storage.createStory({ title: String(title || tl(req.lang, 'Untitled Story')).slice(0, 200) }, req.lang));
  }));

  api.post('/stories/import', wrap(async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: tl(req.lang, 'Expected a story JSON object') });
    const { id, createdAt, updatedAt, ...rest } = normalizeStory(body, req.lang);
    res.status(201).json(await storage.createStory({ ...rest, title: rest.title || tl(req.lang, 'Imported story') }, req.lang));
  }));

  api.get('/stories/:id', idParam, wrap(async (req, res) => {
    const s = await storage.getStory(req.params.id);
    if (!s) return res.status(404).json({ error: tl(req.lang, 'Story not found') });
    res.json(s);
  }));

  api.put('/stories/:id', idParam, wrap(async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: tl(req.lang, 'Expected a story JSON object') });
    const saved = await storage.saveStory({ ...body, id: req.params.id });
    res.json({ ok: true, updatedAt: saved.updatedAt });
  }));

  api.post('/stories/:id/duplicate', idParam, wrap(async (req, res) => {
    const s = await storage.getStory(req.params.id);
    if (!s) return res.status(404).json({ error: tl(req.lang, 'Story not found') });
    const { id, createdAt, updatedAt, ...rest } = s;
    res.status(201).json(await storage.createStory({ ...rest, title: tl(req.lang, '{title} (copy)', { title: s.title }) }, req.lang));
  }));

  api.delete('/stories/:id', idParam, wrap(async (req, res) => {
    await storage.deleteStory(req.params.id);
    res.json({ ok: true });
  }));

  api.use('/ai', aiRouter(storage));

  api.use((req, res) => res.status(404).json({ error: tl(req.lang, 'Not found') }));
  app.use('/api', api);

  // SPA fallback for client-side routes.
  app.get('*', (req, res) => res.sendFile(path.join(here, 'public/index.html')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? tl(req.lang, 'Internal server error') : err.message });
  });

  return { app, storage };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { app } = await createApp();
  const server = app.listen(PORT, HOST, () => {
    const wildcard = HOST === '0.0.0.0' || HOST === '::';
    console.log(`Story Builder running at http://${wildcard ? 'localhost' : HOST}:${PORT}`);
    if (wildcard) {
      for (const ip of lanAddresses()) console.log(`  on your network:  http://${ip}:${PORT}`);
    }
    console.log(`Data directory: ${DATA_DIR}`);
    const ai = aiSummary();
    console.log(ai.configured ? `AI: ${ai.label}, model ${ai.model}` : 'AI: optional — set a provider key (e.g. ANTHROPIC_API_KEY or OPENAI_API_KEY), point it at a local server, or configure it in the app.');
  });
  server.on('error', (err) => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${PORT} is already in use. Set PORT to use another one.` : err.message);
    process.exit(1);
  });
}

// Non-internal IPv4 addresses of this machine, for the startup banner.
function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => a.address);
}
