// Italian mirror of en/principles.js: same exports, ids, routes, part/chapter
// numbers and order, with every human-readable string translated.
// Paraphrased principles from Robert McKee, "Story: Substance, Structure, Style,
// and the Principles of Screenwriting" (1997), organised by chapter.
// Text is a summary written for this app, not a reproduction of the book;
// short quotations are marked with quote marks and kept to single sentences.
// `route` links each principle to the tool in the app where it is applied.
// Terminology follows docs/glossario-it.md.

export const PARTS = [
  { n: 1, title: 'Lo scrittore e l’arte della storia' },
  { n: 2, title: 'Gli elementi della storia' },
  { n: 3, title: 'I principi della progettazione della storia' },
  { n: 4, title: 'Lo scrittore al lavoro' },
];

export const CHAPTERS = [
  {
    id: 'intro', part: 1, n: 0, title: 'Introduzione',
    summary: 'Story parla di principi, non di regole; di forme universali, non di formule; di archetipi, non di stereotipi; di rigore, non di scorciatoie; di padronanza dell’arte, non di congetture sul mercato; di rispetto per il pubblico; di originalità, non di imitazione.',
    principles: [
      { id: 'principles-not-rules', term: 'Principi, non regole', text: 'Una regola dice: devi fare così. Un principio dice: questo funziona, e ha sempre funzionato a memoria d’uomo. Tratta il mestiere come un insieme di principi da padroneggiare, e piegali solo per mettere al loro posto qualcosa di più importante.', route: 'library' },
      { id: 'archetype', term: 'Archetipo e stereotipo', text: 'Una storia archetipica trova un’esperienza umana universale e la riveste di un’espressione unica, radicata in una cultura precisa. Lo stereotipo impoverisce contenuto e forma con scelte generiche e prevedibili.', route: 'genre' },
    ],
  },
  {
    id: 'ch1', part: 1, n: 1, title: 'Il problema della storia',
    summary: 'Una bella storia ben raccontata: una storia che valga la pena di raccontare e che il mondo voglia ascoltare, realizzata con mestiere. Il mestiere moltiplica il talento; il talento da solo non basta.',
    principles: [
      { id: 'good-story', term: 'Una bella storia ben raccontata', text: '“Bella storia” significa qualcosa che valga la pena di dire e che il mondo voglia sentire. Trovarla è un lavoro solitario: comincia con il talento di guardare il mondo con occhi nuovi e si compie con il mestiere che le dà forma.', route: 'dashboard' },
      { id: 'craft', term: 'Il mestiere moltiplica il talento', text: 'Il talento narrativo (il dono di inventare eventi) e il talento letterario (una lingua vivida) sono cose distinte. Il mestiere è l’insieme dei mezzi con cui coinvolgere a fondo il pubblico, tenerlo coinvolto e ricompensarlo con un’esperienza emozionante e piena di senso.', route: 'library' },
    ],
  },
  {
    id: 'ch2', part: 2, n: 2, title: 'Lo spettro della struttura',
    summary: 'Il lessico della progettazione della storia (evento, scena, beat, sequenza, atto, storia) e il triangolo della storia, che mappa ogni forma possibile tra archetrama, minitrama e antitrama.',
    principles: [
      { id: 'structure', term: 'Struttura', text: 'Una selezione di eventi tratti dalle vicende dei personaggi, disposti in una sequenza strategica per suscitare emozioni precise ed esprimere una visione specifica della vita.', route: 'structure' },
      { id: 'story-event', term: 'Evento della storia', text: 'Un cambiamento significativo nella situazione di vita di un personaggio, espresso e vissuto in termini di un valore e ottenuto attraverso il conflitto. Un cambiamento dovuto solo a una coincidenza non è un evento della storia.', route: 'scenes' },
      { id: 'story-values', term: 'Valori della storia', text: 'Qualità universali e binarie dell’esperienza, la cui carica può rovesciarsi da un momento all’altro: vivo/morto, amore/odio, libertà/schiavitù, verità/menzogna, coraggio/viltà, lealtà/tradimento, speranza/disperazione, e così via.', route: 'values' },
      { id: 'scene', term: 'Scena', text: 'Un’azione attraverso il conflitto, in un tempo e uno spazio più o meno continui, che fa svoltare in modo percepibile la condizione di vita di un personaggio su almeno un valore. Se alla fine il valore è uguale a quello iniziale, non è successo niente: tagliala o falla svoltare.', route: 'scenes' },
      { id: 'beat', term: 'Beat', text: 'La più piccola unità strutturale: uno scambio di comportamenti in azione/reazione. Beat dopo beat, i comportamenti che cambiano danno forma alla svolta della scena.', route: 'scenes' },
      { id: 'sequence', term: 'Sequenza', text: 'Una serie di scene (di solito da due a cinque) che culmina con un impatto maggiore di qualsiasi scena precedente. Dai un titolo a ogni sequenza (per esempio SENZA LAVORO → LAVORO) per sapere perché è nella storia.', route: 'structure' },
      { id: 'act', term: 'Atto', text: 'Una serie di sequenze che culmina in una scena di climax e provoca un forte rovesciamento dei valori, più potente di qualsiasi sequenza o scena precedente.', route: 'structure' },
      { id: 'story-climax', term: 'Climax della storia', text: 'Una storia è una serie di atti che cresce fino al climax dell’ultimo atto, portatore di un cambiamento assoluto e irreversibile. I cambiamenti di scena, sequenza e atto si possono ribaltare; il climax della storia no.', route: 'crisis' },
      { id: 'archplot', term: 'Archetrama (struttura classica)', text: 'Un protagonista attivo lotta soprattutto contro forze antagoniste esterne per inseguire il proprio desiderio, in un tempo continuo, dentro una realtà coerente e legata da nessi causali, fino a un finale chiuso di cambiamento assoluto e irreversibile.', route: 'triangle' },
      { id: 'miniplot', term: 'Minitrama (minimalismo)', text: 'Parte dagli elementi classici e li riduce: finale aperto, conflitto interno, protagonisti multipli o passivi — una semplicità e un’economia che soddisfano comunque come storia.', route: 'triangle' },
      { id: 'antiplot', term: 'Antitrama (antistruttura)', text: 'Rovescia la struttura classica: coincidenza al posto della causalità, tempo non lineare, realtà incoerenti. Esprime la vita come assurda, o come qualcosa di pensato più che di vissuto.', route: 'triangle' },
      { id: 'nonplot', term: 'Non-trama', text: 'Sotto la linea che unisce minitrama e antitrama la vita non cambia: l’opera diventa ritratto più che storia.', route: 'triangle' },
      { id: 'formal-contrasts', term: 'Sette contrasti formali', text: 'Finale chiuso o aperto; conflitto esterno o interno; protagonista unico o protagonisti multipli; protagonista attivo o passivo; tempo lineare o non lineare; causalità o coincidenza; realtà coerente o realtà incoerenti. Chi scrive si muove lungo questi spettri, mescolando i vertici.', route: 'triangle' },
      { id: 'audience-shrinks', term: 'Verso il basso il pubblico si restringe', text: 'Man mano che la struttura scende dall’archetrama verso minitrama, antitrama e non-trama, il pubblico si riduce — non per mancanza di qualità, ma perché la struttura classica rispecchia il modo in cui le persone ricordano e immaginano la propria vita. Padroneggia prima la forma classica; scrivi solo ciò in cui credi.', route: 'triangle' },
    ],
  },
  {
    id: 'ch3', part: 2, n: 3, title: 'Struttura e ambientazione',
    summary: 'Il cliché nasce dal non conoscere il mondo della storia. L’ambientazione ha quattro dimensioni: definisce e delimita ciò che può accadere. Un mondo piccolo e conoscibile, più la documentazione, vince la guerra contro il cliché.',
    principles: [
      { id: 'setting-4d', term: 'L’ambientazione ha quattro dimensioni', text: 'Epoca (la collocazione nel tempo), durata (l’estensione nel tempo), luogo (la collocazione nello spazio) e livello del conflitto (la posizione nella gerarchia delle lotte umane, da quella interiore a quella extrapersonale).', route: 'setting' },
      { id: 'laws-of-probability', term: 'Leggi interne di probabilità', text: 'Ogni mondo narrativo stabilisce le proprie regole su come e perché accadono le cose. Una volta fissate non possono cambiare: se vengono infrante, il pubblico si sente ingannato. Non esistono storie “portatili”.', route: 'setting' },
      { id: 'creative-limitation', term: 'Principio della limitazione creativa', text: 'Crea un mondo piccolo e conoscibile. Più il mondo è piccolo, più la conoscenza di chi scrive è profonda e più ampie sono le scelte creative: il limite ispira, non inibisce.', route: 'setting' },
      { id: 'research', term: 'Documentazione: memoria, immaginazione, fatti', text: 'Chiediti che cosa sai per esperienza; immagina di vivere la vita del tuo personaggio ora per ora; studia l’argomento. La documentazione nutre il talento, ma deve portare a degli eventi e non diventare un modo per rimandare.', route: 'setting' },
      { id: 'creative-choices', term: 'La creatività è scelta', text: 'Inventa molto più di quanto puoi usare (cinque, dieci, venti a uno), poi scegli l’opzione più fedele al personaggio e al mondo, che non si sia mai vista prima. Non fidarti mai della prima idea: di solito è un cliché.', route: 'scenes' },
    ],
  },
  {
    id: 'ch4', part: 2, n: 4, title: 'Struttura e genere',
    summary: 'Il pubblico è esperto di generi. Ogni genere porta con sé convenzioni di ambientazione, ruolo, evento e valore. Rispetta la convenzione, evita il cliché; mescola e reinventa i generi man mano che la società cambia.',
    principles: [
      { id: 'genre-conventions', term: 'Convenzioni di genere', text: 'Ambientazioni, ruoli, eventi e valori specifici che definiscono un genere e i suoi sottogeneri. Il pubblico si aspetta di vederli rispettati — e di essere condotto, al loro interno, verso momenti nuovi e inattesi.', route: 'genre' },
      { id: 'convention-vs-cliche', term: 'Convenzione e cliché', text: 'In una storia d’amore, lui che incontra lei è una convenzione; il cliché si annida nel modo in cui si incontrano. Le convenzioni sono lo schema metrico del poema della storia: stimolano l’immaginazione.', route: 'genre' },
      { id: 'genre-study', term: 'Padroneggia il tuo genere', text: 'Elenca le opere simili alla tua, scomponi ciascuna in ambientazione, ruolo, evento e valore, metti le analisi una sull’altra e chiediti: che cosa fa sempre questo genere? Finché non lo sai, il pubblico è un passo avanti a te.', route: 'genre' },
      { id: 'mixing-genres', term: 'Mescolare e reinventare i generi', text: 'I generi si combinano per arricchire il significato e variare il tono. Evolvono con la società: chi scrive con uno sguardo visionario intuisce dove la società sta andando e porta un genere alla generazione successiva.', route: 'genre' },
      { id: 'love-the-genre', term: 'Il dono della costanza', text: 'Una sceneggiatura richiede mesi. L’amore per un’idea o per sé stessi appassisce; l’amore per il tuo genere preferito ti sostiene. Scrivi il tipo di storia per cui faresti la fila sotto la pioggia.', route: 'genre' },
    ],
  },
  {
    id: 'ch5', part: 2, n: 5, title: 'Struttura e personaggio',
    summary: 'La struttura è il personaggio; il personaggio è la struttura. Il vero carattere si rivela nelle scelte sotto pressione, in contrasto con la caratterizzazione.',
    principles: [
      { id: 'characterization', term: 'Caratterizzazione', text: 'La somma di tutte le qualità osservabili: età, quoziente intellettivo, sesso, modo di parlare e di gesticolare, casa, auto, abbigliamento, istruzione, professione, personalità, valori e atteggiamenti.', route: 'characters' },
      { id: 'true-character', term: 'Vero carattere', text: '“Il vero carattere si rivela nelle scelte che un essere umano compie sotto pressione”: più forte è la pressione, più profonda è la rivelazione. Le scelte fatte quando non c’è nulla in gioco significano poco.', route: 'characters' },
      { id: 'revelation', term: 'Rivelazione del personaggio', text: 'Rivela il vero carattere in contrasto o in contraddizione con la caratterizzazione. I personaggi principali non possono essere, nel profondo, ciò che sembrano in superficie.', route: 'characters' },
      { id: 'character-arc', term: 'Arco del personaggio', text: 'La scrittura migliore non si limita a rivelare il vero carattere: ne trasforma la natura interiore, in meglio o in peggio, nel corso del racconto.', route: 'characters' },
      { id: 'structure-function', term: 'Funzione della struttura', text: 'Creare pressioni via via crescenti che costringano i personaggi a dilemmi sempre più difficili e a scelte sempre più rischiose, rivelandone a poco a poco la vera natura, fino all’inconscio.', route: 'structure' },
      { id: 'character-function', term: 'Funzione del personaggio', text: 'Portare le qualità di caratterizzazione necessarie per compiere le scelte in modo credibile. Se il climax lo richiede, rivedi la caratterizzazione, non il carattere profondo.', route: 'characters' },
      { id: 'last-act', term: 'Il meglio alla fine', text: 'Il cinema è un’arte del tempo: il climax dell’ultimo atto deve essere l’esperienza più appagante di tutte. Gran parte del lavoro di progettazione di chi scrive serve a costruirlo.', route: 'crisis' },
    ],
  },
  {
    id: 'ch6', part: 2, n: 6, title: 'Struttura e significato',
    summary: 'La storia unisce idea ed emozione (l’emozione estetica). Passa da una premessa aperta a un’idea guida espressa nel climax: valore più causa, sostenuta nel confronto tra idea e contro-idea.',
    principles: [
      { id: 'aesthetic-emotion', term: 'Emozione estetica', text: 'Nella vita significato ed emozione arrivano separati; la storia li fonde, così che un’esperienza abbia senso nel momento stesso in cui accade.', route: 'meaning' },
      { id: 'premise', term: 'Premessa', text: 'L’idea aperta che ispira l’opera, spesso un “E se…?”. Non è sacra: abbandonala se la storia prende un’altra strada.', route: 'meaning' },
      { id: 'storytelling-proof', term: 'La storia come dimostrazione', text: 'Raccontare storie è la dimostrazione creativa della verità: la struttura degli eventi prima esprime l’idea, poi la dimostra — senza spiegarla.', route: 'meaning' },
      { id: 'controlling-idea', term: 'Idea guida', text: 'Il significato ultimo della storia, in una frase che descrive come e perché la vita passa da una condizione a un’altra. Due componenti: il valore (la carica nel climax) più la causa (il motivo principale del cambiamento).', route: 'meaning' },
      { id: 'idea-counter-idea', term: 'Idea e contro-idea', text: 'Le progressioni si costruiscono alternando la carica positiva e quella negativa dei valori in gioco. Sequenza dopo sequenza le due parti si affrontano, finché una vince nel climax.', route: 'meaning' },
      { id: 'didacticism', term: 'Guardati dal didascalismo', text: 'Costruisci entrambe le parti con la stessa verità e la stessa energia. Un argomento di parte diventa una predica; la prova della tua visione è la sua vittoria su forze contrarie potenti.', route: 'meaning' },
      { id: 'idealist-pessimist-ironist', term: 'Idealista, pessimista, ironista', text: 'Il finale positivo esprime la vita come la desideriamo; quello negativo, la vita come la temiamo; il finale ironico dice entrambe le cose insieme — è il più difficile da scrivere e il più duraturo. L’ironia è una doppia affermazione netta: mai una sfocatura, mai una coincidenza.', route: 'meaning' },
      { id: 'tell-the-truth', term: 'Un solo dovere: dire la verità', text: 'Ricava l’idea guida dal tuo climax e chiediti: è la verità? Ci credo? Se no, ricomincia.', route: 'meaning' },
    ],
  },
  {
    id: 'ch7', part: 3, n: 7, title: 'La sostanza della storia',
    summary: 'Il protagonista, il legame con il pubblico e lo scarto tra aspettativa e risultato: la sostanza e l’energia della storia.',
    principles: [
      { id: 'protagonist-willful', term: 'Il protagonista è volitivo', text: 'Unico, plurale (stesso desiderio, stessa sorte) o in una storia a protagonisti multipli: ogni protagonista ha la forza di volontà per sostenere il desiderio attraverso il conflitto, fino a un cambiamento irreversibile.', route: 'characters' },
      { id: 'conscious-desire', term: 'Desiderio conscio', text: 'Il protagonista sa che cosa vuole: un oggetto del desiderio, esterno o interiore.', route: 'characters' },
      { id: 'unconscious-desire', term: 'Desiderio inconscio', text: 'I protagonisti più memorabili hanno anche un desiderio inconscio che li contraddice: ciò che credono di volere è l’antitesi di ciò che vogliono davvero.', route: 'characters' },
      { id: 'capacity-chance', term: 'Capacità e possibilità', text: 'Il protagonista deve avere capacità credibili per inseguire il desiderio e almeno una possibilità di ottenerlo — e la volontà di inseguirlo fino al limite estremo fissato da ambientazione e genere.', route: 'characters' },
      { id: 'end-of-line', term: 'Il limite estremo', text: 'Una storia deve arrivare a un’azione finale oltre la quale il pubblico non riesce a immaginarne un’altra.', route: 'crisis' },
      { id: 'empathy', term: 'Empatico, non per forza simpatico', text: 'Simpatico significa gradevole; empatico significa “come me”. Il pubblico deve riconoscere nel protagonista un’umanità condivisa; che sia anche gradevole è facoltativo.', route: 'characters' },
      { id: 'minimum-action', term: 'Il primo passo', text: 'Ogni personaggio, in ogni momento, compie l’azione minima e prudente che ritiene gli procurerà una reazione positiva dal suo mondo.', route: 'gaps' },
      { id: 'levels-of-conflict', term: 'Tre livelli di conflitto', text: 'Cerchi concentrici intorno al sé: conflitto interiore (mente, corpo, emozioni), conflitto personale (famiglia, amici, amanti), conflitto extrapersonale (istituzioni, società, ambiente).', route: 'gaps' },
      { id: 'the-gap', term: 'Lo scarto', text: 'La storia nasce dove la sfera soggettiva e quella oggettiva si toccano: il personaggio agisce aspettandosi un risultato, il mondo reagisce in modo diverso o più forte, e tra aspettativa e risultato si apre uno scarto.', route: 'gaps' },
      { id: 'risk', term: 'Rischio', text: 'Chiediti: qual è la cosa peggiore che succederà se il protagonista fallisce? Se la risposta è “la vita torna alla normalità”, la storia è concepita male. Il valore di un desiderio è proporzionale al rischio corso per ottenerlo.', route: 'characters' },
      { id: 'inside-out', term: 'Scrivere dall’interno', text: 'Chiediti: “Se fossi questo personaggio, in queste circostanze, che cosa farei?”. Poi fai un passo fuori e chiediti: “Qual è il contrario?”, per aprire a forza lo scarto successivo. La buona scrittura dà risalto alle reazioni.', route: 'gaps' },
    ],
  },
  {
    id: 'ch8', part: 3, n: 8, title: 'L’incidente scatenante',
    summary: 'La struttura in cinque parti: incidente scatenante, complicazioni progressive, crisi, climax, risoluzione. L’incidente scatenante sconvolge radicalmente l’equilibrio della vita del protagonista e mette in moto la spina dorsale.',
    principles: [
      { id: 'five-parts', term: 'Struttura in cinque parti', text: 'Incidente scatenante → complicazioni progressive → crisi → climax → risoluzione. L’incidente scatenante è la causa prima di tutto ciò che segue.', route: 'structure' },
      { id: 'world-questions', term: 'Conosci il mondo', text: 'Come si guadagnano da vivere i personaggi, come si svagano, come pregano, come fanno l’amore? Quali sono la politica (la distribuzione del potere), i rituali, i valori, le convenzioni di genere, le biografie e l’antefatto di questo mondo?', route: 'setting' },
      { id: 'backstory-def', term: 'Antefatto', text: 'Non una biografia completa: l’insieme degli eventi passati significativi che chi scrive può usare per costruire le progressioni.', route: 'exposition' },
      { id: 'cast-polarization', term: 'Progettazione del cast: polarizzazione', text: 'Se due personaggi hanno lo stesso atteggiamento e reagiscono allo stesso modo, fondili in uno o tagliane uno. Un cast polarizzato moltiplica le occasioni di conflitto: ti dà le scene.', route: 'cast' },
      { id: 'authenticity', term: 'Autore, autorità, autenticità', text: 'Empatia e autenticità tengono legato il pubblico. L’autenticità è coerenza interna, non aderenza ai fatti, e dipende dal dettaglio rivelatore.', route: 'setting' },
      { id: 'inciting-incident', term: 'Incidente scatenante', text: 'Un evento dinamico e pienamente sviluppato che sconvolge radicalmente l’equilibrio delle forze nella vita del protagonista, in positivo o in negativo. Avviene per decisione o per coincidenza, e il protagonista deve reagire.', route: 'inciting' },
      { id: 'restore-balance', term: 'Ristabilire l’equilibrio', text: 'L’incidente scatenante sbilancia la vita, accende il desiderio di riequilibrarla, porta il protagonista a concepire un oggetto del desiderio e lo lancia al suo inseguimento.', route: 'inciting' },
      { id: 'spine', term: 'Spina dorsale (linea d’azione, superobiettivo)', text: 'Il desiderio profondo del protagonista e il suo sforzo di ristabilire l’equilibrio. Se c’è un desiderio inconscio, è quello a diventare la spina dorsale: il desiderio conscio può allora cambiare più volte.', route: 'inciting' },
      { id: 'quest', term: 'La ricerca', text: 'Ogni storia prende la forma di una ricerca: un evento sbilancia una vita, accende il desiderio conscio e/o inconscio di ciò che ristabilirà l’equilibrio e avvia un inseguimento contro forze antagoniste interiori, personali ed extrapersonali.', route: 'inciting' },
      { id: 'onscreen', term: 'Sullo schermo, pone la domanda drammatica principale', text: 'L’incidente scatenante della trama principale deve avvenire sullo schermo. Pone la domanda drammatica principale (“Come andrà a finire?”) e proietta nell’immaginazione del pubblico la scena obbligatoria (la crisi).', route: 'inciting' },
      { id: 'placement', term: 'Collocazione', text: 'Di solito entro il primo 25% del racconto. “Il prima possibile, ma non prima che il momento sia maturo”: quando il pubblico sa abbastanza per reagire pienamente. Una trama principale che parte tardi ha bisogno di una sottotrama che la prepari.', route: 'structure' },
      { id: 'worst-best', term: 'Creare l’incidente scatenante', text: 'Chiediti: qual è la cosa peggiore che potrebbe capitare al mio protagonista, e come potrebbe trasformarsi nella migliore? Oppure la migliore, e come potrebbe diventare la peggiore?', route: 'inciting' },
    ],
  },
  {
    id: 'ch9', part: 3, n: 9, title: 'La progettazione degli atti',
    summary: 'Le complicazioni progressive superano punti di non ritorno. Niente va avanti se non attraverso il conflitto. Tre atti sono il minimo per un lungometraggio; atti, sottotrame e ritmo risolvono la lunga parte centrale.',
    principles: [
      { id: 'progressive-complications', term: 'Complicazioni progressive', text: 'Genera sempre più conflitto man mano che i personaggi affrontano forze antagoniste più grandi, superando punti di non ritorno. Non tornare mai ad azioni di qualità o portata minore.', route: 'gaps' },
      { id: 'law-of-conflict', term: 'La legge del conflitto', text: 'In una storia niente va avanti se non attraverso il conflitto. Il conflitto sta alla storia come il suono sta alla musica.', route: 'gaps' },
      { id: 'complexity', term: 'Complicazione e complessità', text: 'Il conflitto su un solo livello è semplice complicazione (film d’azione: extrapersonale; soap opera: personale; flusso di coscienza: interiore). La complessità mette i personaggi in conflitto su tutti e tre i livelli, spesso insieme. Non moltiplicare personaggi o luoghi.', route: 'gaps' },
      { id: 'three-acts', term: 'Almeno tre atti', text: 'Una storia di lungometraggio ha bisogno di almeno tre grandi rovesciamenti. Il primo atto occupa circa un quarto del racconto; l’ultimo è il più breve e accelera.', route: 'structure' },
      { id: 'long-second-act', term: 'Il lungo secondo atto', text: 'Risolvilo con le sottotrame o con più atti: per esempio, un climax di metà atto divide il secondo atto e dà un ritmo in quattro atti. Troppi climax d’atto aprono la porta a cliché e ripetizioni.', route: 'structure' },
      { id: 'act-rhythm', term: 'Ritmo degli atti', text: 'Gli ultimi due climax d’atto non devono avere la stessa carica: un finale positivo richiede un penultimo climax negativo, e viceversa. Per un finale ironico, capisci da che parte pende e contraddicilo.', route: 'structure' },
      { id: 'false-ending', term: 'Falso finale', text: 'Una scena così compiuta da farci credere che la storia sia finita. È soprattutto un espediente del genere d’azione; di solito il penultimo climax dovrebbe invece intensificare la domanda drammatica principale.', route: 'structure' },
      { id: 'subplots', term: 'Sottotrame', text: 'Una sottotrama può contraddire l’idea guida (ironia), farle eco (variazioni), preparare una trama principale che parte tardi o complicare la trama principale. Se non fa nessuna di queste cose, spacca la storia in due.', route: 'subplots' },
      { id: 'mental-physical', term: 'Rendi fisico ciò che è mentale', text: 'Chi scrive per il cinema crea correlativi visivi del conflitto interiore: immagini di scelta e di azione, non spiegazioni.', route: 'scenes' },
    ],
  },
  {
    id: 'ch10', part: 3, n: 10, title: 'La progettazione della scena',
    summary: 'Ogni scena svolta. I punti di svolta portano sorpresa, curiosità, comprensione e una nuova direzione. Semine e raccolte, transizioni emotive e la vera scelta (il dilemma).',
    principles: [
      { id: 'turning-point', term: 'Punto di svolta', text: 'L’obiettivo di ogni scena è al servizio della spina dorsale. Punta a una struttura in cui ogni scena sia un punto di svolta minore, medio o maggiore.', route: 'scenes' },
      { id: 'tp-effects', term: 'Effetti di un punto di svolta', text: 'Sorpresa, curiosità accresciuta, comprensione e nuova direzione. Il pubblico ripercorre di corsa la storia per trovare le risposte che vi erano state disseminate.', route: 'scenes' },
      { id: 'self-expression', term: 'Espressione di sé', text: 'Il mezzo più potente con cui chi scrive esprime sé stesso è il modo unico in cui la storia svolta, non le parole.', route: 'scenes' },
      { id: 'setups-payoffs', term: 'Semine e raccolte', text: 'Seminare significa depositare informazioni strato su strato; raccogliere significa chiudere lo scarto consegnandole. Semina in modo che un’informazione abbia un significato all’inizio e un secondo, più profondo, a posteriori. Ogni raccolta può diventare una nuova semina.', route: 'setups' },
      { id: 'retroactive-logic', term: 'La logica è retroattiva', text: 'Pensa l’impensabile, poi torna indietro e semina ciò che serve perché abbia senso. Prima l’immaginazione, poi il ragionamento.', route: 'setups' },
      { id: 'emotional-transitions', term: 'Transizioni emotive', text: 'Le emozioni sono due: piacere e dolore. L’emozione nasce da una transizione di valori che il pubblico comprende, vissuta da un personaggio con cui è in empatia.', route: 'composition' },
      { id: 'diminishing-returns', term: 'Legge dei rendimenti decrescenti', text: 'Più spesso viviamo qualcosa, meno effetto ci fa. Alterna le cariche: tre scene tragiche di fila, e alla terza il pubblico ride.', route: 'composition' },
      { id: 'mood', term: 'Emozione e atmosfera', text: 'Le transizioni creano l’emozione; l’atmosfera (luce, tempo, casting, scenografia, musica) la rende specifica. L’atmosfera non sostituisce mai l’emozione.', route: 'composition' },
      { id: 'dilemma', term: 'La vera scelta è un dilemma', text: 'Bene contro male non è una scelta. La vera scelta è tra beni inconciliabili o tra il minore dei due mali. Le decisioni che contano sono triangolari: A stretto tra B e C.', route: 'crisis' },
    ],
  },
  {
    id: 'ch11', part: 3, n: 11, title: 'L’analisi della scena',
    summary: 'Testo e sottotesto, e la tecnica in cinque passi per far svelare a una scena i suoi segreti.',
    principles: [
      { id: 'subtext', term: 'Testo e sottotesto', text: 'Il testo è la superficie sensoriale: ciò che vediamo e sentiamo. Il sottotesto è la vita che scorre sotto. “Se la scena parla di ciò di cui parla la scena”, è scritta in modo troppo esplicito ed è impossibile da recitare.', route: 'scenes' },
      { id: 'step1', term: 'Passo 1 — Definisci il conflitto', text: 'Chi guida la scena e che cosa vuole (espresso con un verbo all’infinito)? Quali forze lo ostacolano e che cosa vogliono? I desideri devono essere in conflitto diretto.', route: 'scenes' },
      { id: 'step2', term: 'Passo 2 — Nota il valore iniziale', text: 'Individua il valore in gioco e la sua carica all’inizio della scena.', route: 'scenes' },
      { id: 'step3', term: 'Passo 3 — Dividi in beat', text: 'Dai un nome a ogni azione e reazione del sottotesto con un gerundio attivo (“Prostrandosi ai suoi piedi” / “Ignorando la supplica”). Un nuovo beat comincia solo quando il comportamento cambia in modo netto.', route: 'scenes' },
      { id: 'step4', term: 'Passo 4 — Valore finale', text: 'Nota la carica finale e confrontala con quella iniziale. Stessa carica = non-evento.', route: 'scenes' },
      { id: 'step5', term: 'Passo 5 — Trova il punto di svolta', text: 'Ripercorri i beat per cogliere la forma della scena e trova il momento in cui si apre lo scarto maggiore tra aspettativa e risultato.', route: 'scenes' },
    ],
  },
  {
    id: 'ch12', part: 3, n: 12, title: 'La composizione',
    summary: 'Ordinare e collegare le scene: unità e varietà, andamento, ritmo e tempo, quattro modi di esprimere la progressione e il principio di transizione.',
    principles: [
      { id: 'unity', term: 'Unità e varietà', text: '“A causa dell’incidente scatenante, il climax doveva accadere.” Dentro questo vincolo causale, cerca la varietà: il comico nel tragico, il politico nel personale.', route: 'composition' },
      { id: 'pacing', term: 'Andamento', text: 'Alterna tensione e distensione come il ritmo della vita, con ogni ciclo che sale più in alto, finché il climax lascia il pubblico svuotato.', route: 'composition' },
      { id: 'rhythm-tempo', term: 'Ritmo e tempo', text: 'Il ritmo è la durata delle scene (in media due o tre minuti sullo schermo); il tempo è l’attività dentro la scena. Verso i climax d’atto accorcia le scene e alza il tempo, poi rallenta e lascia respirare il climax (“guadagnati la pausa”).', route: 'composition' },
      { id: 'social-progression', term: 'Progressione sociale', text: 'Allarga l’impatto delle azioni dei personaggi alla società, toccando a poco a poco sempre più vite.', route: 'composition' },
      { id: 'personal-progression', term: 'Progressione personale', text: 'Spingi le azioni in profondità, nelle relazioni intime e nella vita interiore, verso i segreti nascosti dietro la maschera pubblica.', route: 'composition' },
      { id: 'symbolic-ascension', term: 'Ascesa simbolica', text: 'Costruisci le immagini dal particolare all’universale, dallo specifico all’archetipico — in modo subliminale.', route: 'images' },
      { id: 'ironic-ascension', term: 'Ascesa ironica', text: 'Fai avanzare la progressione sull’ironia tra azioni e risultati, tra apparenza e realtà — tipicamente con protagonisti sicuri del proprio piano.', route: 'composition' },
      { id: 'transition', term: 'Principio di transizione', text: 'Collega la coda di una scena alla testa della successiva con qualcosa che le accomuna o le oppone: un tratto, un’azione, un oggetto, una parola, una qualità della luce, un suono, un’idea.', route: 'composition' },
    ],
  },
  {
    id: 'ch13', part: 3, n: 13, title: 'Crisi, climax, risoluzione',
    summary: 'La crisi è la decisione suprema (pericolo/opportunità) e la scena obbligatoria; il climax è un rovesciamento significativo e irreversibile; la risoluzione è un sipario che cala lentamente.',
    principles: [
      { id: 'crisis', term: 'Crisi', text: 'Il protagonista ha esaurito tutte le azioni tranne una e affronta le forze antagoniste più concentrate. La crisi deve essere un vero dilemma: il modo in cui sceglie offre lo sguardo più profondo sul suo carattere e rivela il valore più importante della storia.', route: 'crisis' },
      { id: 'crisis-static', term: 'Un momento volutamente statico', text: 'Non sorvolare mai sulla decisione della crisi e non lasciarla fuori campo. Congelala: lascia crescere la tensione finché la scelta esplode nel climax. Se crisi e climax avvengono in luoghi diversi, uniscili con uno stacco.', route: 'crisis' },
      { id: 'crisis-within-climax', term: 'Punto di svolta dentro il climax', text: 'Mentre il protagonista compie l’azione del climax, separa un’ultima volta aspettativa e risultato: può ottenere o no ciò che vuole, ma non nel modo in cui se lo aspetta.', route: 'crisis' },
      { id: 'climax', term: 'Climax: il significato produce emozione', text: 'Una rivoluzione dei valori alla massima carica, assoluta e irreversibile, realizzata con un’azione pura ed evidente che non ha bisogno di spiegazioni. Porta al climax le sottotrame dentro o prima del climax principale.', route: 'crisis' },
      { id: 'inevitable-unexpected', term: 'Inevitabile e inatteso', text: 'Dai al pubblico l’emozione che hai promesso, ma non nel modo in cui se l’aspetta. A posteriori, la strada deve sembrare l’unica possibile.', route: 'crisis' },
      { id: 'key-image', term: 'Spettacolo e verità (immagine chiave)', text: 'Cerca un’unica immagine di climax che concentri tutto il significato e l’emozione: scritta per l’occhio, esprime l’idea guida.', route: 'crisis' },
      { id: 'resolution', term: 'Risoluzione', text: 'Porta al climax una sottotrama rimasta aperta, mostra come gli effetti del climax si diffondono nel cast, o semplicemente fai calare il sipario lentamente, così che il pubblico possa uscire con dignità.', route: 'crisis' },
    ],
  },
  {
    id: 'ch14', part: 4, n: 14, title: 'Il principio dell’antagonismo',
    summary: 'Un protagonista e la sua storia possono essere avvincenti solo quanto le forze antagoniste li rendono. Porta il valore fino al limite estremo: contrario, contraddittorio, negazione della negazione.',
    principles: [
      { id: 'principle-antagonism', term: 'Il principio dell’antagonismo', text: 'Un protagonista e la sua storia possono essere intellettualmente affascinanti ed emotivamente coinvolgenti solo quanto le forze antagoniste li rendono. Pesa il protagonista contro tutte le forze messe insieme: deve partire sfavorito, con appena una possibilità.', route: 'values' },
      { id: 'contrary', term: 'Il contrario', text: 'Una situazione in parte negativa, ma non l’opposto pieno del valore positivo (per esempio l’iniquità, rispetto alla giustizia).', route: 'values' },
      { id: 'contradictory', term: 'Il contraddittorio', text: 'L’opposto diretto del valore positivo (per esempio l’ingiustizia).', route: 'values' },
      { id: 'negation-of-negation', term: 'La negazione della negazione', text: 'Un negativo composto, in cui la vita peggiora per qualità e non solo per quantità (per esempio la tirannia, “la ragione del più forte”). Le storie che si fermano al contraddittorio possono soddisfare, ma non sono mai sublimi.', route: 'values' },
      { id: 'declension-acts', term: 'La progressione lungo la declinazione', text: 'Di solito: dal positivo al contrario nel primo atto, il contraddittorio negli atti successivi, la negazione della negazione nell’ultimo — con un finale tragico o con un ritorno al positivo profondamente cambiato. Tutto è possibile, ma bisogna arrivare al limite estremo.', route: 'values' },
      { id: 'build-negative', term: 'Costruisci il lato negativo', text: 'Quando una storia è debole, sono deboli le sue forze antagoniste. Investi la creatività sul negativo: il positivo ne trarrà beneficio in modo naturale.', route: 'values' },
    ],
  },
  {
    id: 'ch15', part: 4, n: 15, title: 'L’esposizione',
    summary: 'Mostra, non raccontare: drammatizza l’esposizione, trasformala in munizione, distribuiscila in modo progressivo, tieni i segreti per ultimi. L’antefatto fornisce le rivelazioni che fanno svoltare le scene.',
    principles: [
      { id: 'show-dont-tell', term: 'Mostra, non raccontare', text: 'L’esposizione drammatizzata ha due scopi: prima alimentare il conflitto immediato, poi trasmettere informazioni. Non mettere mai l’informazione al primo posto.', route: 'exposition' },
      { id: 'ammunition', term: 'L’esposizione come munizione', text: 'I personaggi conoscono il loro mondo e si conoscono tra loro: lascia che usino ciò che sanno come munizione nella lotta per ottenere ciò che vogliono.', route: 'exposition' },
      { id: 'parse-exposition', term: 'Distribuisci l’esposizione in modo progressivo', text: 'Non includere mai ciò che il pubblico può facilmente dedurre; non dare informazioni se la loro assenza non crea confusione. I fatti meno importanti all’inizio, quelli cruciali (i segreti) alla fine. Crea il desiderio di sapere prima di raccontare.', route: 'exposition' },
      { id: 'action-revelation', term: 'Svoltare con l’azione o la rivelazione', text: 'Le scene svoltano solo attraverso l’azione o la rivelazione. Le rivelazioni più potenti vengono dall’antefatto e spesso sono riservate ai climax d’atto.', route: 'exposition' },
      { id: 'in-medias-res', term: 'In medias res', text: 'Comincia vicino all’evento del climax, così che il protagonista abbia una vita lunga e ricca di valori prima dell’incidente scatenante — qualcosa da perdere.', route: 'inciting' },
      { id: 'flashbacks', term: 'Flashback, sogni, montaggi, voce fuori campo', text: 'Drammatizza i flashback come piccoli drammi e inseriscili solo quando il pubblico vuole sapere. Sequenze oniriche e montaggi sono di solito esposizione travestita. Metti alla prova la voce fuori campo: se la storia funziona anche senza, tienila solo come contrappunto.', route: 'exposition' },
    ],
  },
  {
    id: 'ch16', part: 4, n: 16, title: 'Problemi e soluzioni',
    summary: 'Interesse (curiosità e partecipazione), sorpresa, coincidenza, commedia, punto di vista, adattamento, melodramma e buchi nella trama.',
    principles: [
      { id: 'curiosity-concern', term: 'Curiosità e partecipazione', text: 'La curiosità è il bisogno intellettuale di trovare risposte; la partecipazione è il bisogno emotivo di valori positivi. Il pubblico cerca il centro del bene, che deve trovarsi almeno nel protagonista, definito su uno sfondo di negatività.', route: 'characters' },
      { id: 'mystery-suspense-irony', term: 'Mistero, suspense, ironia drammatica', text: 'Mistero: il pubblico sa meno dei personaggi. Suspense: quanto loro. Ironia drammatica: di più, e la curiosità lascia il posto al timore e alla compassione. Quasi tutte le storie li mescolano dentro una struttura complessiva di suspense.', route: 'composition' },
      { id: 'false-mystery', term: 'Niente falsi misteri né sorprese facili', text: 'La vera sorpresa nasce dallo scarto ed è seguita da un’improvvisa comprensione. La sorpresa facile sfrutta il pubblico; il falso mistero nasconde i fatti in modo artificioso.', route: 'composition' },
      { id: 'coincidence', term: 'Coincidenza', text: 'Introduci la coincidenza presto e lascia che acquisti significato; evitala dopo la metà; non usarla mai per far svoltare un finale (deus ex machina).', route: 'crisis' },
      { id: 'comedy', term: 'Commedia', text: 'La commedia attacca un’istituzione sociale; il personaggio comico ha un’ossessione cieca. La commedia tollera più coincidenze se il protagonista ha sofferto moltissimo senza mai disperare.', route: 'characters' },
      { id: 'pov', term: 'Punto di vista', text: 'Dare forma all’intera storia dal punto di vista del protagonista è una disciplina creativa che produce un racconto compatto e memorabile e un’empatia più profonda.', route: 'scenes' },
      { id: 'melodrama', term: 'Melodramma', text: 'Il melodramma non nasce dall’eccesso di espressione ma dalla carenza di motivazione. Porta le forze che spingono i personaggi all’altezza dell’estremità delle loro azioni.', route: 'characters' },
      { id: 'holes', term: 'Buchi nella trama', text: 'Chiudi il buco se puoi; se il pubblico potrebbe non notarlo, lascialo passare; oppure mettilo in luce e nega che sia un buco.', route: 'setups' },
      { id: 'adaptation', term: 'Adattamento', text: 'Più il romanzo o il testo teatrale è puro, peggiore sarà il film. Riduci gli eventi a passi di una riga, verifica se la storia è ben raccontata e accetta di reinventare.', route: 'outline' },
    ],
  },
  {
    id: 'ch17', part: 4, n: 17, title: 'Il personaggio',
    summary: 'I personaggi sono opere d’arte. Dimensione significa contraddizione. Il protagonista crea il cast, che gli orbita intorno e ne delinea le dimensioni.',
    principles: [
      { id: 'mind-worm', term: 'Lo scrittore come verme della mente', text: 'Scava dentro un personaggio, impara a conoscerne sogni, paure, punti di forza e debolezze, poi progetta l’evento preciso (l’incidente scatenante) che lo spingerà in una ricerca fino ai limiti del suo essere.', route: 'characters' },
      { id: 'desire-motivation', term: 'Desiderio e motivazione', text: 'La chiave del vero carattere è il desiderio: che cosa vuole il personaggio adesso, tra poco, nel complesso, consapevolmente, inconsapevolmente? Comprendi il movente, ma lascia un po’ di mistero: le spiegazioni univoche impoveriscono i personaggi.', route: 'characters' },
      { id: 'dimension', term: 'Dimensione = contraddizione', text: 'O dentro il carattere profondo (un’ambizione rosa dal senso di colpa), o tra caratterizzazione e carattere profondo (un ladro affascinante). Le contraddizioni devono essere coerenti; le stranezze casuali non sono dimensione.', route: 'characters' },
      { id: 'most-dimensional', term: 'Il protagonista ha più dimensioni di tutti', text: 'Se un ruolo secondario ha più dimensioni, il centro del bene si sposta e l’empatia si allontana dal ruolo principale.', route: 'cast' },
      { id: 'cast-design', term: 'Progettazione del cast: un sistema solare', text: 'Il protagonista è il sole; i ruoli secondari gli orbitano intorno come pianeti, e ciascuno fa emergere un lato diverso delle sue contraddizioni; le comparse sono satelliti, piatte ma non noiose.', route: 'cast' },
      { id: 'comic-character', term: 'Il personaggio comico', text: 'È segnato da un’ossessione cieca (un “umore”) che il personaggio non vede. Quando la vede, la commedia è finita.', route: 'characters' },
      { id: 'three-tips', term: 'Tre consigli', text: 'Lascia spazio all’attore; innamorati di tutti i tuoi personaggi (nessuno crede di essere cattivo); il personaggio è conoscenza di sé — chiediti: “Se fossi questo personaggio…”', route: 'characters' },
    ],
  },
  {
    id: 'ch18', part: 4, n: 18, title: 'Il testo',
    summary: 'Il dialogo non è conversazione; la descrizione proietta un film nella testa di chi legge; i sistemi di immagini trasmettono la poetica in modo subliminale; i titoli orientano il pubblico.',
    principles: [
      { id: 'dialogue', term: 'Dialogo', text: 'Compressione ed economia, direzione, scopo — eppure deve suonare come parlato. Battute brevi, azione/reazione, frasi in sospensione che tengono il senso fino all’ultima parola. Non scrivere mai una battuta che puoi esprimere con le immagini.', route: 'scenes' },
      { id: 'description', term: 'Descrizione', text: 'Azione vivida al presente, nomi specifici e verbi attivi; ogni paragrafo è un’inquadratura che guida l’occhio di chi legge attraverso azione e reazione.', route: 'outline' },
      { id: 'image-system', term: 'Sistema di immagini', text: 'Una strategia di motivi: una categoria di immagini che si ripete dall’inizio alla fine con insistenza, variazione e discrezione, come comunicazione subliminale che approfondisce l’emozione estetica.', route: 'images' },
      { id: 'internal-external', term: 'Immagini interne ed esterne', text: 'Le immagini esterne prendono in prestito il significato che un simbolo ha fuori dall’opera (una bandiera = patriottismo): il marchio dei film da scuola di cinema. Le immagini interne danno a una categoria un significato che appartiene solo a questa storia. Non etichettare mai i simboli.', route: 'images' },
      { id: 'titles', term: 'Titoli', text: 'Un titolo nomina qualcosa di concreto nella storia — personaggio, ambientazione, tema o genere; i migliori ne nominano diversi insieme.', route: 'genre' },
    ],
  },
  {
    id: 'ch19', part: 4, n: 19, title: 'Il metodo di chi scrive',
    summary: 'Scrivi dall’interno verso l’esterno: scaletta, pitch, trattamento, poi sceneggiatura. Il dialogo viene per ultimo.',
    principles: [
      { id: 'outside-in', term: 'Scrivere dall’esterno', text: 'Correre subito al dialogo e poi stravolgere le stesure intorno alle scene preferite raramente produce una storia che funziona.', route: 'outline' },
      { id: 'step-outline', term: 'Scaletta', text: 'Ogni scena in una o due frasi che descrivono come cresce e come svolta; sul retro della scheda, la sua funzione nella struttura. Crea molto più del necessario e distruggi tutto ciò che è al di sotto del tuo meglio.', route: 'outline' },
      { id: 'pitch', term: 'La prova del pitch', text: 'Racconta la scaletta in dieci minuti. Se non riesce ad agganciare, tenere e commuovere chi ascolta, non funzionerà in 110 minuti.', route: 'outline' },
      { id: 'treatment', term: 'Trattamento', text: 'Espandi ogni passo in una descrizione al presente, momento per momento, con tutto il sottotesto: di che cosa parlano i personaggi, mai il dialogo vero e proprio.', route: 'outline' },
      { id: 'screenplay', term: 'Sceneggiatura', text: 'Solo dopo il trattamento scrivi i dialoghi — e saranno propri di ciascun personaggio, perché i personaggi hanno aspettato a lungo per parlare.', route: 'outline' },
    ],
  },
];

// Six patterns of ironic progression (ch. 12).
export const IRONIC_PATTERNS = [
  'Ottiene finalmente ciò che ha sempre desiderato… ma troppo tardi per goderne.',
  'Viene spinto sempre più lontano dal suo obiettivo… solo per scoprire che è stato condotto proprio lì.',
  'Butta via ciò che poi scopre essere indispensabile alla sua felicità.',
  'Per raggiungere un obiettivo compie, senza saperlo, proprio i passi che lo allontanano da esso.',
  'L’azione con cui vuole distruggere qualcosa diventa esattamente ciò che serve perché quella cosa distrugga lui.',
  'Entra in possesso di qualcosa che è certo lo renderà infelice, fa di tutto per liberarsene… solo per scoprire che è il dono della felicità.',
];

// Hinges for transitions between scenes (ch. 12).
export const TRANSITION_HINGES = [
  { id: 'trait', label: 'Tratto di caratterizzazione' },
  { id: 'action', label: 'Azione' },
  { id: 'object', label: 'Oggetto' },
  { id: 'word', label: 'Parola / frase' },
  { id: 'light', label: 'Qualità della luce' },
  { id: 'sound', label: 'Suono' },
  { id: 'idea', label: 'Idea' },
];

export const PROGRESSION_TECHNIQUES = [
  { id: 'social', label: 'Progressione sociale', hint: 'Allarga l’impatto delle azioni alla società.' },
  { id: 'personal', label: 'Progressione personale', hint: 'Scava nelle relazioni intime e nella vita interiore.' },
  { id: 'symbolic', label: 'Ascesa simbolica', hint: 'Le immagini salgono dal particolare all’archetipico.' },
  { id: 'ironic', label: 'Ascesa ironica', hint: 'Avanza sull’ironia tra azione e risultato.' },
];

export const LEVELS = [
  { id: 'inner', label: 'Interiore', long: 'Conflitto interiore', hint: 'Mente, corpo, emozioni: il sé come peggior nemico di sé stesso.' },
  { id: 'personal', label: 'Personale', long: 'Conflitto personale', hint: 'Famiglia, amici, amanti: un’intimità più profonda dei ruoli sociali.' },
  { id: 'extra', label: 'Extrapersonale', long: 'Conflitto extrapersonale', hint: 'Istituzioni, individui nella società, ambiente fisico, tempo.' },
];
