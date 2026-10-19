// Genre system (STORY ch. 4) in the interface language; data in en/ and it/.
import { lang } from '../i18n.js';
import * as en from './en/genres.js';
import * as it from './it/genres.js';

export const { GENRES, ARC_PLOTS } = lang === 'it' ? it : en;

export function genreById(id) {
  return GENRES.find((g) => g.id === id);
}
