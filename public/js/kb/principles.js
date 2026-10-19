// McKee knowledge base in the interface language. The data lives in
// en/principles.js and it/principles.js, which share ids and structure.
import { lang, t } from '../i18n.js';
import * as en from './en/principles.js';
import * as it from './it/principles.js';

const D = lang === 'it' ? it : en;
export const { PARTS, CHAPTERS, IRONIC_PATTERNS, TRANSITION_HINGES, PROGRESSION_TECHNIQUES, LEVELS } = D;

// The book's English term, shown beside a translated one so writers can match
// it to the original edition.
const EN_TERMS = Object.fromEntries(en.CHAPTERS.flatMap((c) => c.principles.map((p) => [p.id, p.term])));

// Flattened index for search and the glossary.
export const PRINCIPLES = CHAPTERS.flatMap((c) =>
  c.principles.map((p) => ({
    ...p, chapter: c.id, chapterN: c.n, chapterTitle: c.title,
    ...(D !== en && EN_TERMS[p.id] !== p.term && { original: EN_TERMS[p.id] }),
  })),
);

export function principleById(id) {
  return PRINCIPLES.find((p) => p.id === id);
}

export function principlesForRoute(route) {
  return PRINCIPLES.filter((p) => p.route === route);
}

export function chapterLabel(chId) {
  const c = CHAPTERS.find((x) => x.id === chId);
  if (!c) return '';
  return c.n === 0 ? t('Intro') : t('Ch. {n}', { n: c.n });
}
