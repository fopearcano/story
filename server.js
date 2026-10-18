// Story Builder server: static app, JSON story storage, optional AI routes.
import express from 'express';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Storage, isValidId } from './server/storage.js';
import { aiRouter, envHasKey, AI_MODEL } from './server/ai.js';
import { sampleStory } from './public/js/sample.js';
import { normalizeStory } from './public/js/model.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4135);
// 0.0.0.0 listens on every interface, so other devices on the LAN can connect.
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(here, 'data'));

export async function createApp({ dataDir = DATA_DIR, seed = true } = {}) {
  const storage = new Storage(dataDir);
  await storage.init();
  if (seed && !(await storage.listStories()).length) await storage.saveStory(sampleStory());

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb' }));

  app.use('/vendor/htm-preact.js', (req, res) => res.sendFile(path.join(here, 'node_modules/htm/preact/standalone.module.js')));
  app.use(express.static(path.join(here, 'public'), { extensions: ['html'] }));

  const api = express.Router();
  const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
  const idParam = (req, res, next) => (isValidId(req.params.id) ? next() : res.status(400).json({ error: 'Invalid id' }));

  api.get('/health', (req, res) => res.json({ ok: true, ai: { envKey: envHasKey(), model: AI_MODEL } }));

  api.get('/stories', wrap(async (req, res) => res.json(await storage.listStories())));

  api.post('/stories', wrap(async (req, res) => {
    const { title, template } = req.body || {};
    if (template === 'sample') {
      const { id, ...rest } = sampleStory();
      return res.status(201).json(await storage.createStory({ ...rest, title: 'A Christmas Carol (copy)' }));
    }
    res.status(201).json(await storage.createStory({ title: (title || 'Untitled Story').slice(0, 200) }));
  }));

  api.post('/stories/import', wrap(async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Expected a story JSON object' });
    const { id, createdAt, updatedAt, ...rest } = normalizeStory(body);
    res.status(201).json(await storage.createStory({ ...rest, title: rest.title || 'Imported story' }));
  }));

  api.get('/stories/:id', idParam, wrap(async (req, res) => {
    const s = await storage.getStory(req.params.id);
    if (!s) return res.status(404).json({ error: 'Story not found' });
    res.json(s);
  }));

  api.put('/stories/:id', idParam, wrap(async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Expected a story JSON object' });
    const saved = await storage.saveStory({ ...body, id: req.params.id });
    res.json({ ok: true, updatedAt: saved.updatedAt });
  }));

  api.post('/stories/:id/duplicate', idParam, wrap(async (req, res) => {
    const s = await storage.getStory(req.params.id);
    if (!s) return res.status(404).json({ error: 'Story not found' });
    const { id, createdAt, updatedAt, ...rest } = s;
    res.status(201).json(await storage.createStory({ ...rest, title: `${s.title} (copy)` }));
  }));

  api.delete('/stories/:id', idParam, wrap(async (req, res) => {
    await storage.deleteStory(req.params.id);
    res.json({ ok: true });
  }));

  api.use('/ai', aiRouter(storage));

  api.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use('/api', api);

  // SPA fallback for client-side routes.
  app.get('*', (req, res) => res.sendFile(path.join(here, 'public/index.html')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
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
    console.log(envHasKey() ? `AI: enabled (${AI_MODEL})` : 'AI: optional — set ANTHROPIC_API_KEY (or add a key in the app) to enable the AI partner.');
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
