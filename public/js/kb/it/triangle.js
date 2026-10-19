// Italian version of en/triangle.js: the Story Triangle (STORY cap. 2). Each
// formal contrast is a spectrum from the Archplot pole (0) to the Miniplot or
// Antiplot pole (1). Same ids, corners and placements as the English file.
// Film titles are chart labels: the Italian release title only when it is well
// known and short, otherwise the original.

export const CONTRASTS = [
  { id: 'ending', corner: 'mini', arch: 'Finale chiuso', other: 'Finale aperto',
    hint: 'Chiuso: ogni domanda trova risposta, ogni emozione è appagata. Aperto: una o due domande e un po’ di emozione restano al pubblico — ma hanno una risposta possibile.' },
  { id: 'conflict', corner: 'mini', arch: 'Conflitto esterno', other: 'Conflitto interno',
    hint: 'Dove cade l’accento: sulle lotte con persone, istituzioni e mondo, o sulle battaglie dentro il protagonista?' },
  { id: 'protagonists', corner: 'mini', arch: 'Protagonista unico', other: 'Protagonisti multipli',
    hint: 'Un solo ruolo da protagonista che domina il tempo sullo schermo, o più storie grandi quanto una sottotrama (multitrama)?' },
  { id: 'activity', corner: 'mini', arch: 'Protagonista attivo', other: 'Protagonista passivo',
    hint: 'Il protagonista agisce in conflitto diretto con il mondo, o insegue il suo desiderio dentro di sé restando inattivo all’esterno?' },
  { id: 'time', corner: 'anti', arch: 'Tempo lineare', other: 'Tempo non lineare',
    hint: 'Il pubblico riesce a mettere gli eventi in ordine temporale (anche con i flashback), o il tempo è rimescolato?' },
  { id: 'causality', corner: 'anti', arch: 'Causalità', other: 'Coincidenza',
    hint: 'Azioni motivate provocano effetti che provocano a loro volta altri effetti, o collisioni casuali frammentano la storia?' },
  { id: 'reality', corner: 'anti', arch: 'Realtà coerente', other: 'Realtà incoerenti',
    hint: 'Le regole di interazione del mondo restano valide fino alla fine, anche se bizzarre, o vengono infrante per un effetto assurdo?' },
];

export const CORNERS = {
  arch: { name: 'Archetrama', sub: 'Struttura classica', desc: 'Protagonista attivo, antagonismo esterno, tempo continuo, realtà causale coerente, finale chiuso con un cambiamento irreversibile. Il pubblico più ampio.' },
  mini: { name: 'Minitrama', sub: 'Minimalismo', desc: 'Riduce il classico: finale aperto, conflitto interiore, protagonisti multipli o passivi. Semplicità ed economia che danno comunque l’impressione di una bella storia.' },
  anti: { name: 'Antitrama', sub: 'Antistruttura', desc: 'Rovescia il classico: coincidenza, tempo non lineare, realtà incoerenti — la vita come assurdo. Un pubblico ristretto, di cinefili.' },
  non: { name: 'Non-trama', sub: 'Stasi', desc: 'La vita non cambia: un ritratto più che una storia. Resta fuori dal triangolo.' },
};

// Approximate placements of films the book positions on its triangle diagram.
// m = pull toward Miniplot, a = pull toward Antiplot (0..1).
export const REFERENCE_FILMS = [
  { title: 'Chinatown', m: 0, a: 0 },
  { title: 'I sette samurai', m: 0.05, a: 0.02 },
  { title: 'Thelma & Louise', m: 0.12, a: 0 },
  { title: 'Nashville', m: 0.42, a: 0.12 },
  { title: 'La moglie del soldato', m: 0.52, a: 0.05 },
  { title: 'Tender Mercies', m: 0.92, a: 0.02 },
  { title: 'Paris, Texas', m: 0.86, a: 0.08 },
  { title: 'Harry, ti presento Sally…', m: 0.15, a: 0.48 },
  { title: 'Barton Fink', m: 0.55, a: 0.55 },
  { title: '8½', m: 0.3, a: 0.85 },
  { title: 'Weekend', m: 0.2, a: 0.96 },
];
