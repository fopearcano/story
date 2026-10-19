// Italian version of en/genres.js: the working screenwriter's genre system from
// STORY cap. 4 (25 genres), summarised. Same ids, numbers, groups and order of
// conventions as the English file: a story's checklist is keyed by genre id and
// convention index ('redemption:0'), so never reorder or drop a convention.

export const GENRES = [
  {
    id: 'love', n: 1, name: 'Storia d’amore', group: 'basic',
    sub: ['Romance', 'Salvezza tra amici (l’amicizia al posto dell’amore romantico)', 'Storia di struggimento (rimanda l’incontro dei due innamorati al climax)'],
    summary: 'Due persone sono attratte l’una dall’altra; la domanda essenziale è “Che cosa glielo impedisce?”',
    conventions: [
      'Gli innamorati si incontrano (lui incontra lei) — presto, a meno che non sia una storia di struggimento',
      'Una forza che si oppone all’amore (personaggi d’ostacolo, cultura, società, identità, morte…)',
      'Prove e tribolazioni che mettono alla prova l’amore',
      'Valore in gioco: amore / odio (e la sua declinazione)',
    ],
    cliches: ['Due individualisti che si detestano a prima vista', 'Due timidi che fanno tappezzeria ai margini di una festa'],
  },
  {
    id: 'horror', n: 2, name: 'Horror', group: 'basic',
    sub: ['Perturbante (fonte spiegabile razionalmente)', 'Soprannaturale (irrazionale, mondo degli spiriti)', 'Super-perturbante (il pubblico resta nel dubbio)'],
    summary: 'Una mostruosa fonte di orrore incombe; la credibilità è la chiave del terrore.',
    conventions: ['Una fonte di orrore con regole studiate e coerenti', 'Attacchi in crescendo', 'Qui la sorpresa a buon mercato è ammessa come convenzione', 'Valore: vita / morte, coscienza / dannazione'],
    cliches: ['La mano sulla spalla che si rivela quella di un amico'],
  },
  {
    id: 'epic', n: 3, name: 'Epica moderna', group: 'basic', sub: [],
    summary: 'L’individuo contro lo Stato.',
    conventions: ['Un’istituzione tirannica o corrotta', 'Un protagonista che si ribella', 'Valore: libertà / schiavitù, giustizia / tirannia'],
    cliches: [],
  },
  {
    id: 'western', n: 4, name: 'Western', group: 'basic', sub: ['Parabola morale classica', 'Revisionista / quasi dramma sociale'],
    summary: 'Allegorie mitiche della frontiera sul bene e sul male, reinventate a ogni cambiamento della società.',
    conventions: ['Ambientazione di frontiera', 'Sceriffo / pistolero / coloni / fuorilegge', 'Resa dei conti', 'Valore: civiltà / natura selvaggia, giustizia / ingiustizia'],
    cliches: ['Il pistolero in pensione che ha giurato di non uccidere mai più'],
  },
  {
    id: 'war', n: 5, name: 'Film di guerra', group: 'basic', sub: ['A favore della guerra', 'Contro la guerra'],
    summary: 'Parla specificamente del combattimento (la guerra come semplice ambientazione appartiene ad altri generi).',
    conventions: ['Combattimento', 'Unità / comandante / nemico', 'Valore: vita / morte, coraggio / codardia, lealtà / tradimento'],
    cliches: [],
  },
  {
    id: 'maturation', n: 6, name: 'Trama di maturazione', group: 'basic', sub: ['Racconto di formazione'],
    summary: 'Il protagonista cresce dall’immaturità alla maturità.',
    conventions: ['Protagonista sulla soglia dell’età adulta (in qualche senso)', 'Prove che costringono a crescere', 'Valore: maturità / puerilità — la sua negazione è l’immaturità scambiata per maturità'],
    cliches: [],
  },
  {
    id: 'redemption', n: 7, name: 'Trama di redenzione', group: 'basic', sub: [],
    summary: 'Un cambiamento morale dentro il protagonista, da cattivo a buono.',
    conventions: ['Il protagonista parte moralmente compromesso', 'Un evento gli offre un’ultima possibilità di salvezza', 'Climax: il sacrificio dell’ossessione che lo corrompe'],
    cliches: [],
  },
  {
    id: 'punitive', n: 8, name: 'Trama punitiva', group: 'basic', sub: [],
    summary: 'Il buono diventa cattivo e viene punito.',
    conventions: ['Il protagonista parte come una persona per bene', 'Corruzione crescente', 'Climax: ottiene ciò che desidera, e proprio questo lo distrugge'],
    cliches: [],
  },
  {
    id: 'testing', n: 9, name: 'Trama della prova', group: 'basic', sub: [],
    summary: 'La forza di volontà contro la tentazione di arrendersi.',
    conventions: ['Una prova di resistenza o di integrità', 'La tentazione, ripetuta, di mollare', 'Valore: forza di volontà / resa'],
    cliches: [],
  },
  {
    id: 'education', n: 10, name: 'Trama di educazione', group: 'basic', sub: [],
    summary: 'Un cambiamento profondo nel modo in cui il protagonista vede la vita, gli altri o sé stesso: dal negativo (ingenuo, diffidente, fatalista, pieno di odio per sé) al positivo (saggio, fiducioso, ottimista, padrone di sé).',
    conventions: ['Il protagonista parte con una visione del mondo negativa', 'La sua vita tocca il fondo', 'Una figura di maestro o un’esperienza trasforma la sua comprensione', 'Richiede personaggi complessi e conflitto interiore'],
    cliches: [],
  },
  {
    id: 'disillusionment', n: 11, name: 'Trama della disillusione', group: 'basic', sub: [],
    summary: 'Un cambiamento profondo della visione del mondo, dal positivo al negativo.',
    conventions: ['Il protagonista parte ottimista, con grandi ideali', 'Ripetute svolte negative che prima alimentano la speranza e poi la avvelenano', 'Finale negativo: cinismo, disillusione'],
    cliches: [],
  },
  {
    id: 'comedy', n: 12, name: 'Commedia', group: 'mega',
    sub: ['Parodia', 'Satira', 'Sitcom', 'Commedia romantica', 'Commedia screwball', 'Farsa', 'Commedia nera'],
    summary: 'I sottogeneri si distinguono per il bersaglio dell’attacco comico e per il grado di derisione (bonario, caustico, letale).',
    conventions: ['Nessuno si fa male davvero (tranne che nella commedia nera)', 'Un’istituzione sociale sotto attacco', 'Personaggi comici con ossessioni cieche', 'Punti di svolta che esplodono in una risata'],
    cliches: [],
  },
  {
    id: 'crime', n: 13, name: 'Poliziesco', group: 'mega',
    sub: ['Giallo a enigma (punto di vista del grande investigatore)', 'Film di rapina (punto di vista del genio del crimine)', 'Indagine di polizia (punto di vista del poliziotto)', 'Gangster (punto di vista del delinquente)', 'Thriller / vendetta (punto di vista della vittima)', 'Dramma giudiziario (punto di vista dell’avvocato)', 'Film giornalistico (punto di vista del reporter)', 'Spionaggio (punto di vista della spia)', 'Film carcerario (punto di vista del detenuto)', 'Film noir'],
    summary: 'I sottogeneri si definiscono in base al punto di vista da cui si osserva il crimine.',
    conventions: ['Un crimine, all’inizio del racconto', 'Un investigatore (professionista o dilettante) che trova indizi e sospettati', 'Thriller: il criminale “ne fa una questione personale”', 'Il criminale viene identificato, catturato e punito — oppure, come nei finali negativi moderni, la fa franca'],
    cliches: ['Il cattivo uccide il collega dell’investigatore', 'Il cattivo minaccia la famiglia del poliziotto'],
  },
  {
    id: 'social', n: 14, name: 'Dramma sociale', group: 'mega',
    sub: ['Dramma familiare', 'Film al femminile', 'Dramma politico', 'Dramma ecologico', 'Dramma medico', 'Psicodramma'],
    summary: 'Individua un problema della società e costruisce una storia che ne dimostra la cura.',
    conventions: ['Un male sociale', 'Il suo rimedio messo in scena', 'Rischio: il didascalismo — costruisci entrambe le parti con onestà'],
    cliches: [],
  },
  {
    id: 'action', n: 15, name: 'Film d’azione / avventura', group: 'mega',
    sub: ['Grande avventura (destino, hybris, dimensione spirituale)', 'Catastrofico / sopravvivenza (la natura come antagonista)'],
    summary: 'Azione esplosiva e imprese temerarie, spesso con motivazioni prese in prestito da altri generi.',
    conventions: ['L’eroe in balia del cattivo — e deve ribaltare la situazione (scena obbligatoria)', 'Conflitto extrapersonale, cast numeroso, molti luoghi', 'Personaggi semplici, perché la complessità non distragga'],
    cliches: ['“Attento! C’è qualcuno dietro di te!”'],
  },
  {
    id: 'historical', n: 16, name: 'Dramma storico', group: 'supra', sub: [],
    summary: 'Un sovragenere: il passato usato come un vetro trasparente per mostrare il presente.',
    conventions: ['Ciò che è passato deve essere presente: una rilevanza anacronistica', 'Contiene un altro genere (storia d’amore, film di guerra, dramma politico…)'],
    cliches: [],
  },
  {
    id: 'biography', n: 17, name: 'Biografia', group: 'supra', sub: ['Autobiografia'],
    summary: 'Interpreta i fatti come se fossero finzione; fai del soggetto il protagonista del genere della sua vita.',
    conventions: ['Non una cronaca: trova il significato di quella vita', 'Scegli il genere che la governa (dramma giudiziario, epica moderna, disillusione…)'],
    cliches: [],
  },
  {
    id: 'docudrama', n: 18, name: 'Docu-drama', group: 'supra', sub: [], summary: 'Fatti recenti messi in scena.', conventions: ['Basato su fatti recenti', 'Drammatizzato, non solo documentato'], cliches: [],
  },
  {
    id: 'mockumentary', n: 19, name: 'Mockumentary', group: 'supra', sub: [],
    summary: 'Finge di essere un documentario ma è pura finzione, e fa la satira di istituzioni ipocrite.',
    conventions: ['Forma documentaria', 'Un’istituzione bersaglio della satira'], cliches: [],
  },
  {
    id: 'musical', n: 20, name: 'Musical', group: 'supra', sub: ['Commedia musicale'],
    summary: 'I personaggi cantano e ballano le loro storie; qualsiasi genere può prendere la forma del musical.',
    conventions: ['Una “realtà” in cui il canto è espressione', 'Contiene un altro genere'], cliches: [],
  },
  {
    id: 'scifi', n: 21, name: 'Fantascienza', group: 'supra', sub: [],
    summary: 'Futuri ipotetici (spesso distopie tecnologiche); qualsiasi genere può svolgersi nel futuro.',
    conventions: ['Un mondo futuro documentato e coerente', 'Spesso individuo contro Stato + azione'], cliches: [],
  },
  {
    id: 'sports', n: 22, name: 'Sport', group: 'supra', sub: [],
    summary: 'Lo sport come crogiolo del cambiamento del personaggio: la casa delle trame di maturazione, redenzione, educazione, punitive e della prova.',
    conventions: ['La grande partita / il grande evento', 'Un arco interiore incorniciato dalla competizione'], cliches: [],
  },
  {
    id: 'fantasy', n: 23, name: 'Fantasy', group: 'supra', sub: [],
    summary: 'Gioca con il tempo, lo spazio e il mondo fisico. Un grande salto lontano dalla realtà, poi probabilità rigorosa e nessuna coincidenza.',
    conventions: ['Regole della magia o della realtà che non vengono mai infrante', 'Un’archetrama causale e serrata'], cliches: [],
  },
  {
    id: 'animation', n: 24, name: 'Animazione', group: 'supra', sub: [],
    summary: 'La legge della metamorfosi universale: qualsiasi cosa può diventare qualcos’altro.',
    conventions: ['Metamorfosi', 'Spesso farsa, grande avventura o maturazione'], cliches: [],
  },
  {
    id: 'artfilm', n: 25, name: 'Film d’arte', group: 'supra', sub: ['Minimalismo', 'Antistruttura'],
    summary: 'Un genere tradizionale a pieno titolo, la cui grande convenzione è l’anticonvenzionalità.',
    conventions: ['Celebrazione del cerebrale; l’atmosfera prima dell’emozione forte', 'Enigmi e tensioni irrisolte che invitano all’interpretazione'], cliches: [],
  },
];

// Plot types that describe a protagonist's inner arc (used on the character arc picker).
export const ARC_PLOTS = [
  { id: '', label: '—' },
  { id: 'maturation', label: 'Maturazione (immaturo → maturo)', dir: 1 },
  { id: 'redemption', label: 'Redenzione (cattivo → buono)', dir: 1 },
  { id: 'education', label: 'Educazione (visione del mondo negativa → positiva)', dir: 1 },
  { id: 'testing', label: 'Prova (volontà contro resa)', dir: 0 },
  { id: 'punitive', label: 'Punitiva (buono → cattivo, punito)', dir: -1 },
  { id: 'disillusionment', label: 'Disillusione (visione del mondo positiva → negativa)', dir: -1 },
];
