// Italian version of en/values.js: value declensions from the Principle of
// Antagonism (STORY cap. 14), positivo -> contrario -> contraddittorio ->
// negazione della negazione. Same ids, order and charge values as the English file.

export const DECLENSIONS = [
  { id: 'justice', positive: 'Giustizia', contrary: 'Iniquità', contradictory: 'Ingiustizia', negation: 'Tirannia' },
  { id: 'love', positive: 'Amore', contrary: 'Indifferenza', contradictory: 'Odio', negation: 'Odio di sé' },
  { id: 'love2', positive: 'Amore', contrary: 'Indifferenza', contradictory: 'Odio', negation: 'Odio travestito da amore' },
  { id: 'truth', positive: 'Verità', contrary: 'Bugie pietose / mezze verità', contradictory: 'Menzogna', negation: 'Autoinganno' },
  { id: 'consciousness', positive: 'Coscienza', contrary: 'Incoscienza', contradictory: 'Morte', negation: 'Dannazione' },
  { id: 'wealth', positive: 'Ricco', contrary: 'Classe media', contradictory: 'Povero, con le pene della povertà', negation: 'Ricco, ma con le pene della povertà' },
  { id: 'communication', positive: 'Comunicazione', contrary: 'Alienazione', contradictory: 'Isolamento', negation: 'Follia' },
  { id: 'success', positive: 'Successo', contrary: 'Compromesso', contradictory: 'Fallimento', negation: 'Svendersi' },
  { id: 'wisdom', positive: 'Saggezza', contrary: 'Ignoranza', contradictory: 'Stupidità', negation: 'Stupidità scambiata per intelligenza' },
  { id: 'freedom', positive: 'Libertà', contrary: 'Restrizione', contradictory: 'Schiavitù', negation: 'Schiavitù scambiata per libertà' },
  { id: 'bravery', positive: 'Coraggio', contrary: 'Paura', contradictory: 'Codardia', negation: 'Codardia scambiata per coraggio' },
  { id: 'loyalty', positive: 'Lealtà', contrary: 'Lealtà divisa', contradictory: 'Tradimento', negation: 'Tradimento di sé' },
  { id: 'maturity', positive: 'Maturità', contrary: 'Puerilità', contradictory: 'Immaturità', negation: 'Immaturità scambiata per maturità' },
  { id: 'sex', positive: 'Sesso naturale e lecito', contrary: 'Naturale ma illecito, o innaturale ma lecito', contradictory: 'Innaturale / illecito', negation: 'Grottesco / aberrante' },
];

// Scene-level value pairs mentioned in cap. 2 (plus a few common ones).
export const VALUE_PAIRS = [
  'vivo / morto', 'amore / odio', 'libertà / schiavitù', 'verità / menzogna', 'coraggio / codardia',
  'lealtà / tradimento', 'saggezza / stupidità', 'forza / debolezza', 'entusiasmo / noia',
  'speranza / disperazione', 'giustizia / ingiustizia', 'fiducia in sé / insicurezza', 'successo / fallimento',
  'ricchezza / povertà', 'fiducia / sospetto', 'maturità / immaturità', 'legame / isolamento',
];

// Charge scale used throughout the app. Negative steps follow the declension.
export const CHARGES = [
  { v: 3, short: '+++', label: 'Positiva (piena)' },
  { v: 2, short: '++', label: 'Positiva' },
  { v: 1, short: '+', label: 'Tendente al positivo' },
  { v: 0, short: '±', label: 'Mista / ironica' },
  { v: -1, short: '−', label: 'Contrario' },
  { v: -2, short: '−−', label: 'Contraddittorio' },
  { v: -3, short: '−−−', label: 'Negazione della negazione' },
];
