// Value declensions from the Principle of Antagonism (STORY ch. 14):
// Positive -> Contrary -> Contradictory -> Negation of the Negation.

export const DECLENSIONS = [
  { id: 'justice', positive: 'Justice', contrary: 'Unfairness', contradictory: 'Injustice', negation: 'Tyranny' },
  { id: 'love', positive: 'Love', contrary: 'Indifference', contradictory: 'Hate', negation: 'Self-hate' },
  { id: 'love2', positive: 'Love', contrary: 'Indifference', contradictory: 'Hate', negation: 'Hatred masquerading as love' },
  { id: 'truth', positive: 'Truth', contrary: 'White lies / half-truths', contradictory: 'Lies', negation: 'Self-deception' },
  { id: 'consciousness', positive: 'Consciousness', contrary: 'Unconsciousness', contradictory: 'Death', negation: 'Damnation' },
  { id: 'wealth', positive: 'Rich', contrary: 'Middle-class', contradictory: 'Poor and suffering the pains of poverty', negation: 'Rich but suffering the pains of poverty' },
  { id: 'communication', positive: 'Communication', contrary: 'Alienation', contradictory: 'Isolation', negation: 'Insanity' },
  { id: 'success', positive: 'Success', contrary: 'Compromise', contradictory: 'Failure', negation: 'Selling out' },
  { id: 'wisdom', positive: 'Wisdom', contrary: 'Ignorance', contradictory: 'Stupidity', negation: 'Stupidity perceived as intelligence' },
  { id: 'freedom', positive: 'Freedom', contrary: 'Restraint', contradictory: 'Slavery', negation: 'Slavery perceived as freedom' },
  { id: 'bravery', positive: 'Bravery', contrary: 'Fear', contradictory: 'Cowardice', negation: 'Cowardice perceived as courage' },
  { id: 'loyalty', positive: 'Loyalty', contrary: 'Split allegiance', contradictory: 'Betrayal', negation: 'Self-betrayal' },
  { id: 'maturity', positive: 'Maturity', contrary: 'Childishness', contradictory: 'Immaturity', negation: 'Immaturity perceived as maturity' },
  { id: 'sex', positive: 'Sanctioned natural sex', contrary: 'Unsanctioned/natural or unnatural/sanctioned', contradictory: 'Unnatural / unsanctioned', negation: 'Grotesque / abhorrent' },
];

// Scene-level value pairs mentioned in ch. 2 (plus a few common ones).
export const VALUE_PAIRS = [
  'alive / dead', 'love / hate', 'freedom / slavery', 'truth / lie', 'courage / cowardice',
  'loyalty / betrayal', 'wisdom / stupidity', 'strength / weakness', 'excitement / boredom',
  'hope / despair', 'justice / injustice', 'self-confidence / self-doubt', 'success / failure',
  'wealth / poverty', 'trust / suspicion', 'maturity / immaturity', 'connection / isolation',
];

// Charge scale used throughout the app. Negative steps follow the declension.
export const CHARGES = [
  { v: 3, short: '+++', label: 'Positive (full)' },
  { v: 2, short: '++', label: 'Positive' },
  { v: 1, short: '+', label: 'Leaning positive' },
  { v: 0, short: '±', label: 'Mixed / ironic' },
  { v: -1, short: '−', label: 'Contrary' },
  { v: -2, short: '−−', label: 'Contradictory' },
  { v: -3, short: '−−−', label: 'Negation of the Negation' },
];

export function chargeLabel(v, decl) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (decl) {
    if (n >= 2) return decl.positive || 'Positive';
    if (n === -1) return decl.contrary || 'Contrary';
    if (n === -2) return decl.contradictory || 'Contradictory';
    if (n <= -3) return decl.negation || 'Negation of the Negation';
  }
  return (CHARGES.find((c) => c.v === n) || {}).label || String(n);
}

export function chargeClass(v) {
  const n = Number(v);
  if (n > 0) return 'pos';
  if (n < 0) return 'neg';
  return 'mix';
}
