// JSON-file storage for stories and AI chat transcripts.
import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizeStory, newStory } from '../public/js/model.js';

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function isValidId(id) {
  return typeof id === 'string' && ID_RE.test(id);
}

export class Storage {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.storiesDir = path.join(dataDir, 'stories');
    this.chatsDir = path.join(dataDir, 'chats');
  }

  async init() {
    await fs.mkdir(this.storiesDir, { recursive: true });
    await fs.mkdir(this.chatsDir, { recursive: true });
  }

  #file(dir, id) {
    if (!isValidId(id)) throw Object.assign(new Error('Invalid id'), { status: 400 });
    return path.join(dir, `${id}.json`);
  }

  async #readJson(file) {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  async #writeJson(file, data) {
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2));
    await fs.rename(tmp, file);
  }

  async listStories() {
    const files = (await fs.readdir(this.storiesDir)).filter((f) => f.endsWith('.json'));
    const out = [];
    for (const f of files) {
      const s = await this.#readJson(path.join(this.storiesDir, f));
      if (!s) continue;
      out.push({
        id: s.id, title: s.title, logline: s.logline || '', updatedAt: s.updatedAt, createdAt: s.createdAt,
        scenes: (s.scenes || []).length, characters: (s.characters || []).length,
      });
    }
    return out.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async getStory(id) {
    const s = await this.#readJson(this.#file(this.storiesDir, id));
    return s ? normalizeStory(s) : null;
  }

  async saveStory(story) {
    const s = normalizeStory(story);
    s.updatedAt = new Date().toISOString();
    await this.#writeJson(this.#file(this.storiesDir, s.id), s);
    return s;
  }

  // `lang` picks the language of default names (title, central plot).
  async createStory(partial = {}, lang = 'en') {
    const { title, ...rest } = partial;
    let s = newStory({ ...rest, ...(title && { title }) }, lang);
    // Never overwrite an existing story with an imported id.
    while (await this.#readJson(this.#file(this.storiesDir, s.id))) s = { ...s, id: newStory().id };
    return this.saveStory(s);
  }

  async deleteStory(id) {
    await fs.rm(this.#file(this.storiesDir, id), { force: true });
    for (const c of await this.listChats(id)) await this.deleteChat(c.id);
  }

  // ---- chats --------------------------------------------------------------
  async listChats(storyId) {
    const files = (await fs.readdir(this.chatsDir)).filter((f) => f.endsWith('.json'));
    const out = [];
    for (const f of files) {
      const c = await this.#readJson(path.join(this.chatsDir, f));
      if (c && c.storyId === storyId) out.push({ id: c.id, title: c.title, characterId: c.characterId, updatedAt: c.updatedAt });
    }
    return out.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async getChat(id) {
    return this.#readJson(this.#file(this.chatsDir, id));
  }

  async saveChat(chat) {
    chat.updatedAt = new Date().toISOString();
    await this.#writeJson(this.#file(this.chatsDir, chat.id), chat);
    return chat;
  }

  async deleteChat(id) {
    await fs.rm(this.#file(this.chatsDir, id), { force: true });
  }
}
