// The Story Triangle (STORY ch. 2) in the interface language; data in en/ and it/.
// Each formal contrast is a spectrum from the Archplot pole (0) to the Miniplot
// or Antiplot pole (1).
import { lang } from '../i18n.js';
import * as en from './en/triangle.js';
import * as it from './it/triangle.js';

export const { CONTRASTS, CORNERS, REFERENCE_FILMS } = lang === 'it' ? it : en;

// Barycentric weights for (arch, mini, anti) from the two pulls.
export function triangleWeights(m, a) {
  const wA = (1 - m) * (1 - a);
  const wM = m * (1 - a / 2);
  const wN = a * (1 - m / 2);
  const s = wA + wM + wN || 1;
  return { arch: wA / s, mini: wM / s, anti: wN / s };
}

export function trianglePulls(triangle) {
  const t = triangle || {};
  const avg = (corner) => {
    const xs = CONTRASTS.filter((c) => c.corner === corner).map((c) => Number(t[c.id] ?? 0));
    return xs.reduce((p, x) => p + x, 0) / xs.length;
  };
  return { m: avg('mini'), a: avg('anti') };
}

export function classifyDesign(triangle) {
  const t = triangle || {};
  if (t.stasis) return 'non';
  const { m, a } = trianglePulls(t);
  const w = triangleWeights(m, a);
  if (w.arch >= w.mini && w.arch >= w.anti) return 'arch';
  return w.mini >= w.anti ? 'mini' : 'anti';
}
