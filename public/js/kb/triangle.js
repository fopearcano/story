// The Story Triangle (STORY ch. 2). Each formal contrast is a spectrum from the
// Archplot pole (0) to the Miniplot or Antiplot pole (1).

export const CONTRASTS = [
  { id: 'ending', corner: 'mini', arch: 'Closed ending', other: 'Open ending',
    hint: 'Closed: every question answered, every emotion satisfied. Open: a question or two and some emotion left for the audience — but answerable.' },
  { id: 'conflict', corner: 'mini', arch: 'External conflict', other: 'Internal conflict',
    hint: 'Where does the emphasis fall: on struggles with people, institutions and the world, or on battles inside the protagonist?' },
  { id: 'protagonists', corner: 'mini', arch: 'Single protagonist', other: 'Multiple protagonists',
    hint: 'One star role dominating screen time, or several subplot-sized stories (Multiplot)?' },
  { id: 'activity', corner: 'mini', arch: 'Active protagonist', other: 'Passive protagonist',
    hint: 'Does the protagonist take action in direct conflict with the world, or pursue desire inwardly while outwardly inactive?' },
  { id: 'time', corner: 'anti', arch: 'Linear time', other: 'Nonlinear time',
    hint: 'Can the audience sort events into temporal order (even with flashbacks), or is time scrambled?' },
  { id: 'causality', corner: 'anti', arch: 'Causality', other: 'Coincidence',
    hint: 'Do motivated actions cause effects that cause further effects, or do random collisions fragment the story?' },
  { id: 'reality', corner: 'anti', arch: 'Consistent reality', other: 'Inconsistent realities',
    hint: 'Are the world’s rules of interaction kept throughout, even when bizarre, or broken for absurd effect?' },
];

export const CORNERS = {
  arch: { name: 'Archplot', sub: 'Classical Design', desc: 'Active protagonist, external antagonism, continuous time, consistent causal reality, closed ending of irreversible change. The widest audience.' },
  mini: { name: 'Miniplot', sub: 'Minimalism', desc: 'Reduces the classical: open ending, inner conflict, multi or passive protagonists. Simplicity and economy that still feel like a good story.' },
  anti: { name: 'Antiplot', sub: 'Anti-structure', desc: 'Reverses the classical: coincidence, nonlinear time, inconsistent realities — life as absurd. Small, cinephile audience.' },
  non: { name: 'Nonplot', sub: 'Stasis', desc: 'Life does not change: portraiture rather than story. It falls outside the triangle.' },
};

// Approximate placements of films the book positions on its triangle diagram.
// m = pull toward Miniplot, a = pull toward Antiplot (0..1).
export const REFERENCE_FILMS = [
  { title: 'Chinatown', m: 0, a: 0 },
  { title: 'The Seven Samurai', m: 0.05, a: 0.02 },
  { title: 'Thelma & Louise', m: 0.12, a: 0 },
  { title: 'Nashville', m: 0.42, a: 0.12 },
  { title: 'The Crying Game', m: 0.52, a: 0.05 },
  { title: 'Tender Mercies', m: 0.92, a: 0.02 },
  { title: 'Paris, Texas', m: 0.86, a: 0.08 },
  { title: 'When Harry Met Sally', m: 0.15, a: 0.48 },
  { title: 'Barton Fink', m: 0.55, a: 0.55 },
  { title: '8½', m: 0.3, a: 0.85 },
  { title: 'Weekend', m: 0.2, a: 0.96 },
];

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
