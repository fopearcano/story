// Value declensions and the charge scale in the interface language; data in en/ and it/.
import { lang, t } from '../i18n.js';
import * as en from './en/values.js';
import * as it from './it/values.js';

export const { DECLENSIONS, VALUE_PAIRS, CHARGES } = lang === 'it' ? it : en;

export function chargeLabel(v, decl) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (decl) {
    if (n >= 2) return decl.positive || t('Positive');
    if (n === -1) return decl.contrary || t('Contrary');
    if (n === -2) return decl.contradictory || t('Contradictory');
    if (n <= -3) return decl.negation || t('Negation of the Negation');
  }
  return (CHARGES.find((c) => c.v === n) || {}).label || String(n);
}

export function chargeClass(v) {
  const n = Number(v);
  if (n > 0) return 'pos';
  if (n < 0) return 'neg';
  return 'mix';
}
