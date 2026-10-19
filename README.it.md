# Story Builder · versione italiana

Uno strumento interattivo e visivo per progettare storie di finzione, fondato
su *Story* di Robert McKee (*Substance, Structure, Style, and the Principles
of Screenwriting*). Ogni strumento applica un principio del libro, ogni
principio rimanda allo strumento in cui lo metti in pratica, e uno **Story
Doctor** controlla la tua bozza. Un **partner IA facoltativo** ti aiuta a
costruire i personaggi, con Claude o con il modello che preferisci: OpenAI,
OpenRouter, Gemini, Mistral, Groq, DeepSeek, xAI, oppure un modello che gira
sul tuo computer con Ollama, LM Studio o llama.cpp.

*[Read in English](README.md)*

![Bacheca](docs/screenshots/it-dashboard.png)

## Avvio rapido

```bash
npm install
npm start            # http://localhost:4135
```

Serve Node 20 o successivo; non c’è nessuna fase di build. Il server è
raggiungibile anche dagli altri dispositivi della rete locale: all’avvio
stampa l’indirizzo da aprire (per esempio `http://192.168.1.20:4135`). Se un
altro dispositivo non si collega, consenti le connessioni TCP in entrata sulla
porta 4135 nel firewall. Per limitarlo a questo computer: `HOST=127.0.0.1 npm start`.

Non c’è login: chiunque raggiunga il server può leggere, modificare ed
eliminare le storie e usare il partner IA con le chiavi del server, se sono
impostate. Dal browser si può anche scegliere il fornitore di IA e il suo
indirizzo, e il server invierà le richieste a quell’indirizzo. Usalo solo su
una rete di cui ti fidi, oppure imposta `STORY_AI_ALLOW_CLIENT_CONFIG=false`
per fissare il fornitore sul server.

## Lingua

Scegli **EN / IT** nella barra in alto. La scelta resta salvata nel browser;
alla prima visita vale la lingua del browser. In italiano è tradotto tutto:
le viste, lo Story Doctor, la Biblioteca dei principi (ogni principio mostra
anche il termine originale di McKee), l’esportazione in Markdown e l’esempio
svolto, *Canto di Natale* di Dickens, analizzato con tutti gli strumenti.
Le tue storie le scrivi nella lingua che preferisci; **Copia l’esempio** nella
schermata iniziale crea sempre l’esempio nella lingua attiva.

La terminologia segue un glossario unico ([`docs/glossario-it.md`](docs/glossario-it.md)):
idea guida, incidente scatenante, complicazioni progressive, crisi, climax,
scarto tra aspettativa e risultato, negazione della negazione, archetrama,
minitrama, antitrama, semina e raccolta…

![Analisi delle scene](docs/screenshots/it-scenes.png)

## Temi

Due stili, ciascuno chiaro e scuro: quello classico e uno **terminale**
minimale (monospazio, angoli vivi, verde su nero), da attivare con il
pulsante `>_` nella barra in alto. Il pulsante sole/luna passa ancora da
chiaro a scuro; lo stile terminale parte scuro, a meno che tu non scelga il
chiaro.

## Partner IA (facoltativo)

Tutto funziona anche senza IA. Per attivarla, dai al server la chiave di un
fornitore oppure collegalo a un modello locale:

```bash
ANTHROPIC_API_KEY=sk-ant-... npm start                  # Claude
OPENAI_API_KEY=sk-... npm start                         # OpenAI
OPENROUTER_API_KEY=sk-or-... npm start                  # OpenRouter
STORY_AI_PROVIDER=ollama STORY_AI_MODEL=qwen3 npm start # Ollama su questo computer
```

Oppure dall’app: **Partner IA → impostazioni** (il pulsante con i cursori)
permette a ogni browser di scegliere il fornitore, incollare una chiave,
indicare l’indirizzo di un server locale e caricare l’elenco dei modelli. Le
chiavi restano nel browser e vengono inoltrate solo da questo server. Con
l’interfaccia in italiano, il modello risponde in italiano e usa gli stessi
termini dell’app.

Fornitori: Anthropic (Claude), OpenAI, OpenRouter, Google Gemini, Mistral AI,
Groq, DeepSeek, xAI (Grok); in locale Ollama (`http://localhost:11434/v1`),
LM Studio (`http://localhost:1234/v1`), il server di llama.cpp
(`http://localhost:8080/v1`, avvialo con `--jinja`) e qualsiasi altro server
compatibile con OpenAI (vLLM, LocalAI, Jan…). “Locale” vuol dire sul computer
su cui gira Story Builder: `localhost` è quel computer, anche se usi l’app da
un telefono in rete. I nomi dei modelli cloud cambiano spesso: **Carica i
modelli** mostra quelli davvero disponibili.

Le schede di proposta richiedono un modello che supporti gli strumenti
(*tool calling*): quasi tutti i modelli cloud e molti modelli locali (Qwen 3,
Llama 3.1+, Mistral…). Se un modello non li supporta, il partner te lo dice e
prosegue come semplice conversazione.

- **Costruttore di personaggi (agente).** Legge la tua storia, ti intervista,
  trova contraddizioni e desideri inconsci, progetta dilemmi che rivelano il
  vero carattere. Quando siete d’accordo propone una modifica al personaggio
  o una nuova scena: la vedi in una scheda con **Accetta / Rifiuta** e non
  cambia nulla finché non accetti.
- **Assistenze mirate**: dieci alternative a una scena (contro il cliché),
  analisi della scena in cinque passi, “Qual è il contrario?”, portare un
  valore fino alla negazione della negazione, trovare l’idea guida, incidenti
  scatenanti peggiori/migliori, dilemmi della crisi, polarizzazione del cast,
  consulto sulla diagnosi dello Story Doctor.

## Configurazione

Le variabili d’ambiente sono le stesse della versione inglese: `PORT` (4135),
`HOST` (0.0.0.0), `DATA_DIR` (`./data`), le chiavi dei fornitori
(`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`…),
`STORY_AI_PROVIDER`, `STORY_AI_MODEL`, gli indirizzi dei server locali
(`OLLAMA_BASE_URL`, `LMSTUDIO_BASE_URL`, `LLAMACPP_BASE_URL`),
`STORY_AI_BASE_URL` / `STORY_AI_API_KEY`, `STORY_AI_EFFORT`,
`STORY_AI_ALLOW_CLIENT_CONFIG`. Vedi il [README inglese](README.md#configuration)
per i dettagli.

## Sul testo di McKee

I principi sono sintesi parafrasate scritte per questo strumento, organizzate
secondo i capitoli del libro e citate ovunque; l’app non riproduce il testo
del libro. *Story* è © Robert McKee (ReganBooks/HarperCollins, 1997).
*Canto di Natale* di Charles Dickens (1843) è di pubblico dominio.
