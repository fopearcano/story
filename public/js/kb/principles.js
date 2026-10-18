// Paraphrased principles from Robert McKee, "Story: Substance, Structure, Style,
// and the Principles of Screenwriting" (1997), organised by chapter.
// Text is a summary written for this app, not a reproduction of the book;
// short quotations are marked with quote marks and kept to single sentences.
// `route` links each principle to the tool in the app where it is applied.

export const PARTS = [
  { n: 1, title: 'The Writer and the Art of Story' },
  { n: 2, title: 'The Elements of Story' },
  { n: 3, title: 'The Principles of Story Design' },
  { n: 4, title: 'The Writer at Work' },
];

export const CHAPTERS = [
  {
    id: 'intro', part: 1, n: 0, title: 'Introduction',
    summary: 'Story is about principles, not rules; universal forms, not formulas; archetypes, not stereotypes; thoroughness, not shortcuts; mastering the art, not second-guessing the market; respect for the audience; originality, not duplication.',
    principles: [
      { id: 'principles-not-rules', term: 'Principles, not rules', text: 'A rule says you must do it this way. A principle says this works, and has through all remembered time. Use the craft as a set of principles to master, then bend them only to put something more important in their place.', route: 'library' },
      { id: 'archetype', term: 'Archetype vs. stereotype', text: 'An archetypal story finds a universal human experience and wraps it in a unique, culture-specific expression. A stereotype impoverishes both content and form with generic, predictable choices.', route: 'genre' },
    ],
  },
  {
    id: 'ch1', part: 1, n: 1, title: 'The Story Problem',
    summary: 'A good story well told: a story worth telling that the world wants to hear, executed with craft. Craft maximizes talent; talent alone is not enough.',
    principles: [
      { id: 'good-story', term: 'Good story well told', text: '"Good story" means something worth saying that the world wants to hear. Finding it is a lonely task begun with a talent to perceive the world freshly, and finished by the craft to shape it.', route: 'dashboard' },
      { id: 'craft', term: 'Craft maximizes talent', text: 'Story talent (the gift to invent events) and literary talent (vivid language) are distinct. Craft is the total of all means used to involve the audience deeply, hold that involvement, and reward it with a moving, meaningful experience.', route: 'library' },
    ],
  },
  {
    id: 'ch2', part: 2, n: 2, title: 'The Structure Spectrum',
    summary: 'The terminology of story design (event, scene, beat, sequence, act, story) and the Story Triangle that maps every possible design between Archplot, Miniplot and Antiplot.',
    principles: [
      { id: 'structure', term: 'Structure', text: 'A selection of events from the characters’ life stories, composed into a strategic sequence to arouse specific emotions and to express a specific view of life.', route: 'structure' },
      { id: 'story-event', term: 'Story Event', text: 'A meaningful change in a character’s life situation, expressed and experienced in terms of a value, and achieved through conflict. Change by coincidence alone is not a story event.', route: 'scenes' },
      { id: 'story-values', term: 'Story values', text: 'Universal binary qualities of experience whose charge can reverse from one moment to the next: alive/dead, love/hate, freedom/slavery, truth/lie, courage/cowardice, loyalty/betrayal, hope/despair, and so on.', route: 'values' },
      { id: 'scene', term: 'Scene', text: 'An action through conflict, in more or less continuous time and space, that turns the value-charged condition of a character’s life on at least one value with perceptible significance. If the value at the end equals the value at the start, nothing happened: cut it or make it turn.', route: 'scenes' },
      { id: 'beat', term: 'Beat', text: 'The smallest structural unit: an exchange of behaviour in action/reaction. Beat by beat, changing behaviours shape the turning of a scene.', route: 'scenes' },
      { id: 'sequence', term: 'Sequence', text: 'A series of scenes (generally two to five) that culminates with greater impact than any previous scene. Title each sequence (e.g. NO JOB → JOB) to know why it is in the story.', route: 'structure' },
      { id: 'act', term: 'Act', text: 'A series of sequences that peaks in a climactic scene causing a major reversal of values, more powerful than any previous sequence or scene.', route: 'structure' },
      { id: 'story-climax', term: 'Story Climax', text: 'A story is a series of acts building to a last-act climax that brings absolute and irreversible change. Scene, sequence and act changes can be reversed; the story climax cannot.', route: 'crisis' },
      { id: 'archplot', term: 'Archplot (Classical Design)', text: 'An active protagonist struggles against primarily external forces of antagonism to pursue desire, through continuous time, within a consistent and causally connected reality, to a closed ending of absolute, irreversible change.', route: 'triangle' },
      { id: 'miniplot', term: 'Miniplot (Minimalism)', text: 'Begins with the classical elements and reduces them: open ending, inner conflict, multiple or passive protagonists — simplicity and economy that still satisfy as story.', route: 'triangle' },
      { id: 'antiplot', term: 'Antiplot (Anti-structure)', text: 'Reverses classical design: coincidence instead of causality, nonlinear time, inconsistent realities. It expresses life as absurd or as thought about rather than lived.', route: 'triangle' },
      { id: 'nonplot', term: 'Nonplot', text: 'Below the line between Miniplot and Antiplot, life does not change: the work becomes portraiture rather than story.', route: 'triangle' },
      { id: 'formal-contrasts', term: 'Seven formal contrasts', text: 'Closed vs. open ending; external vs. internal conflict; single vs. multiple protagonists; active vs. passive protagonist; linear vs. nonlinear time; causality vs. coincidence; consistent vs. inconsistent reality. Writers slide along these spectra, blending the corners.', route: 'triangle' },
      { id: 'audience-shrinks', term: 'The audience shrinks toward the bottom', text: 'As design moves from Archplot toward Miniplot, Antiplot and Nonplot, the audience shrinks — not for lack of quality, but because classical design mirrors how people remember and anticipate their own lives. Master classical form first; write only what you believe.', route: 'triangle' },
    ],
  },
  {
    id: 'ch3', part: 2, n: 3, title: 'Structure and Setting',
    summary: 'Cliché comes from not knowing the world of the story. Setting is four-dimensional and it defines and confines what can happen. A small, knowable world plus research wins the war on cliché.',
    principles: [
      { id: 'setting-4d', term: 'Setting is four-dimensional', text: 'Period (place in time), Duration (length through time), Location (place in space) and Level of Conflict (position on the hierarchy of human struggles, from inner to extra-personal).', route: 'setting' },
      { id: 'laws-of-probability', term: 'Internal laws of probability', text: 'Each fictional world sets its own rules for how and why things happen. Once established they cannot change; the audience feels cheated when they are broken. There is no such thing as a portable story.', route: 'setting' },
      { id: 'creative-limitation', term: 'Principle of Creative Limitation', text: 'Create a small, knowable world. The smaller the world, the deeper the writer’s knowledge and the greater the creative choices; constraint inspires rather than inhibits.', route: 'setting' },
      { id: 'research', term: 'Research: memory, imagination, fact', text: 'Ask what you know from experience; imagine living your character’s life hour by hour; study the subject. Research feeds talent — but it must lead to events, and must not become procrastination.', route: 'setting' },
      { id: 'creative-choices', term: 'Creativity is choice', text: 'Invent far more than you can use (five, ten, twenty to one), then choose the option truest to character and world that has not been seen before. Never trust the first idea — it is usually a cliché.', route: 'scenes' },
    ],
  },
  {
    id: 'ch4', part: 2, n: 4, title: 'Structure and Genre',
    summary: 'The audience is a genre expert. Each genre carries conventions of setting, role, event and value. Keep the convention, avoid the cliché; mix and reinvent genres as society changes.',
    principles: [
      { id: 'genre-conventions', term: 'Genre conventions', text: 'Specific settings, roles, events and values that define a genre and its subgenres. The audience expects them fulfilled — and expects to be led to fresh, unexpected moments within them.', route: 'genre' },
      { id: 'convention-vs-cliche', term: 'Convention vs. cliché', text: 'Boy meets girl in a Love Story is a convention; the way they meet is where cliché lurks. Conventions are the rhyme scheme of the story’s poem: they stir the imagination.', route: 'genre' },
      { id: 'genre-study', term: 'Master your genre', text: 'List works like yours, break each down into setting, role, event and value, stack the analyses and ask: what does this genre always do? Until you know, the audience is ahead of you.', route: 'genre' },
      { id: 'mixing-genres', term: 'Mixing and reinventing genres', text: 'Genres combine to resonate meaning and vary mood. They evolve with society; a visionary writer senses where society is leaning and takes a genre into its next generation.', route: 'genre' },
      { id: 'love-the-genre', term: 'The gift of endurance', text: 'A screenplay takes months. Love of an idea or of yourself will wither; love of your favourite genre sustains you. Write the kind of story you’d stand in the rain to see.', route: 'genre' },
    ],
  },
  {
    id: 'ch5', part: 2, n: 5, title: 'Structure and Character',
    summary: 'Structure is character; character is structure. True character is revealed in choices under pressure, in contrast to characterization.',
    principles: [
      { id: 'characterization', term: 'Characterization', text: 'The sum of all observable qualities: age, IQ, sex, style of speech and gesture, home, car, dress, education, occupation, personality, values and attitudes.', route: 'characters' },
      { id: 'true-character', term: 'True character', text: '"True character is revealed in the choices a human being makes under pressure" — the greater the pressure, the deeper the revelation. Choices made when nothing is at risk mean little.', route: 'characters' },
      { id: 'revelation', term: 'Character revelation', text: 'Reveal true character in contrast or contradiction to characterization. Principals cannot be at heart what they seem on the surface.', route: 'characters' },
      { id: 'character-arc', term: 'Character arc', text: 'The finest writing not only reveals true character but arcs or changes that inner nature, for better or worse, over the course of the telling.', route: 'characters' },
      { id: 'structure-function', term: 'Function of structure', text: 'Provide progressively building pressures that force characters into more and more difficult dilemmas and risk-taking choices, gradually revealing their true natures down to the unconscious self.', route: 'structure' },
      { id: 'character-function', term: 'Function of character', text: 'Bring the qualities of characterization needed to act out the choices credibly. If the climax demands it, rework characterization — not deep character.', route: 'characters' },
      { id: 'last-act', term: 'Save the best for last', text: 'Film is a temporal art: the last act climax must be the most satisfying experience of all. Most of a writer’s design effort goes into creating it.', route: 'crisis' },
    ],
  },
  {
    id: 'ch6', part: 2, n: 6, title: 'Structure and Meaning',
    summary: 'Story unites idea and emotion (aesthetic emotion). It moves from an open Premise to a Controlling Idea expressed in the climax: Value plus Cause, argued through Idea vs. Counter-Idea.',
    principles: [
      { id: 'aesthetic-emotion', term: 'Aesthetic emotion', text: 'In life, meaning and emotion arrive separately; story fuses them so an experience is meaningful the moment it happens.', route: 'meaning' },
      { id: 'premise', term: 'Premise', text: 'The open-ended idea that inspires the work — often a "What would happen if…?" It is not precious: abandon it if the story turns another way.', route: 'meaning' },
      { id: 'storytelling-proof', term: 'Story as proof', text: 'Storytelling is the creative demonstration of truth: the event structure first expresses, then proves the idea — without explanation.', route: 'meaning' },
      { id: 'controlling-idea', term: 'Controlling Idea', text: 'The story’s ultimate meaning in one sentence describing how and why life changes from one condition to another. Two components: Value (the charge at climax) plus Cause (the chief reason it changed).', route: 'meaning' },
      { id: 'idea-counter-idea', term: 'Idea vs. Counter-Idea', text: 'Progressions build by moving between the positive and negative charge of the values at stake. Sequence by sequence the two sides argue until one wins at climax.', route: 'meaning' },
      { id: 'didacticism', term: 'Beware didacticism', text: 'Build both sides with equal truth and energy. A slanted argument becomes a sermon; the proof of your vision is its victory over powerful opposing forces.', route: 'meaning' },
      { id: 'idealist-pessimist-ironist', term: 'Idealist, pessimist, ironist', text: 'Up-endings express life as we wish it; down-endings, life as we dread it; ironic endings say both at once — the hardest to write and the longest-lasting. Irony is a clear double declaration, never a blur, never coincidence.', route: 'meaning' },
      { id: 'tell-the-truth', term: 'One responsibility: tell the truth', text: 'Extract the Controlling Idea from your climax and ask: is this the truth? Do I believe it? If not, start again.', route: 'meaning' },
    ],
  },
  {
    id: 'ch7', part: 3, n: 7, title: 'The Substance of Story',
    summary: 'The protagonist, the audience bond, and the gap between expectation and result — the substance and the energy of story.',
    principles: [
      { id: 'protagonist-willful', term: 'The protagonist is willful', text: 'Single, plural (shared desire, shared fortune) or multi-protagonist — every protagonist has the willpower to sustain desire through conflict to irreversible change.', route: 'characters' },
      { id: 'conscious-desire', term: 'Conscious desire', text: 'The protagonist knows what he wants: an object of desire, external or internal.', route: 'characters' },
      { id: 'unconscious-desire', term: 'Unconscious desire', text: 'The most memorable protagonists also have a self-contradictory unconscious desire: what they believe they want is the antithesis of what they actually want.', route: 'characters' },
      { id: 'capacity-chance', term: 'Capacity and chance', text: 'The protagonist must have believable capacities to pursue the desire and at least a chance to attain it — and the will to pursue it to the end of the line set by setting and genre.', route: 'characters' },
      { id: 'end-of-line', term: 'The end of the line', text: 'A story must build to a final action beyond which the audience cannot imagine another.', route: 'crisis' },
      { id: 'empathy', term: 'Empathetic, not necessarily sympathetic', text: 'Sympathetic means likable; empathetic means "like me." The audience must recognize a shared humanity in the protagonist; likability is optional.', route: 'characters' },
      { id: 'minimum-action', term: 'The first step', text: 'Every character, at every moment, takes the minimum, conservative action they believe will get a positive reaction from their world.', route: 'gaps' },
      { id: 'levels-of-conflict', term: 'Three levels of conflict', text: 'Concentric circles around the self: inner conflict (mind, body, emotion), personal conflict (family, friends, lovers), extra-personal conflict (institutions, society, environment).', route: 'gaps' },
      { id: 'the-gap', term: 'The gap', text: 'Story is born where the subjective and objective realms touch: the character acts expecting one result, the world reacts differently or more powerfully, and a gap splits open between expectation and result.', route: 'gaps' },
      { id: 'risk', term: 'Risk', text: 'Ask: what is the worst thing that will happen if the protagonist fails? "Life goes back to normal" means the story is misconceived. The value of a desire is proportional to the risk taken to achieve it.', route: 'characters' },
      { id: 'inside-out', term: 'Writing from the inside out', text: 'Ask "If I were this character in these circumstances, what would I do?" then step out and ask "What is the opposite of that?" to pry open the next gap. Fine writing emphasizes reactions.', route: 'gaps' },
    ],
  },
  {
    id: 'ch8', part: 3, n: 8, title: 'The Inciting Incident',
    summary: 'The five-part design: Inciting Incident, Progressive Complications, Crisis, Climax, Resolution. The Inciting Incident radically upsets the balance of the protagonist’s life and launches the Spine.',
    principles: [
      { id: 'five-parts', term: 'Five-part design', text: 'Inciting Incident → Progressive Complications → Crisis → Climax → Resolution. The Inciting Incident is the primary cause of all that follows.', route: 'structure' },
      { id: 'world-questions', term: 'Know the world', text: 'How do characters make a living, play, pray, make love? What are the politics (distribution of power), rituals, values, genre conventions, biographies and backstory of the world?', route: 'setting' },
      { id: 'backstory-def', term: 'Backstory', text: 'Not a life history: the set of significant past events the writer can use to build progressions.', route: 'exposition' },
      { id: 'cast-polarization', term: 'Cast design: polarization', text: 'If two characters share the same attitude and react the same way, merge or cut one. A polarized cast maximizes opportunities for conflict — it gives you scenes.', route: 'cast' },
      { id: 'authenticity', term: 'Author, authority, authenticity', text: 'Empathy and authenticity hold the audience. Authenticity is internal consistency, not actuality, and depends on the telling detail.', route: 'setting' },
      { id: 'inciting-incident', term: 'The Inciting Incident', text: 'A dynamic, fully developed event that radically upsets the balance of forces in the protagonist’s life, positively or negatively. It happens by decision or by coincidence, and the protagonist must react.', route: 'inciting' },
      { id: 'restore-balance', term: 'Restore the balance', text: 'The Inciting Incident throws life out of balance, arouses the desire to restore it, makes the protagonist conceive an Object of Desire, and propels him into pursuit.', route: 'inciting' },
      { id: 'spine', term: 'Spine (through-line, super-objective)', text: 'The protagonist’s deep desire and effort to restore balance. If there is an unconscious desire, it becomes the Spine — the conscious desire may then change repeatedly.', route: 'inciting' },
      { id: 'quest', term: 'The Quest', text: 'All stories take the form of a quest: an event unbalances a life, arousing conscious and/or unconscious desire for what will restore balance, launching a pursuit against inner, personal and extra-personal antagonism.', route: 'inciting' },
      { id: 'onscreen', term: 'Onscreen, raising the Major Dramatic Question', text: 'The central plot’s Inciting Incident must happen onscreen. It raises the Major Dramatic Question ("How will this turn out?") and projects the Obligatory Scene (Crisis) into the audience’s imagination.', route: 'inciting' },
      { id: 'placement', term: 'Placement', text: 'Usually within the first 25% of the telling. "As soon as possible, but not until the moment is ripe" — when the audience knows enough to react fully. A late central plot needs a setup subplot.', route: 'structure' },
      { id: 'worst-best', term: 'Creating the Inciting Incident', text: 'Ask: what is the worst thing that could happen to my protagonist, and how could it become the best? Or the best — and how could it become the worst?', route: 'inciting' },
    ],
  },
  {
    id: 'ch9', part: 3, n: 9, title: 'Act Design',
    summary: 'Progressive complications pass points of no return. Nothing moves forward except through conflict. Three acts are a minimum for a full-length work; acts, subplots and rhythm solve the long middle.',
    principles: [
      { id: 'progressive-complications', term: 'Progressive Complications', text: 'Generate more and more conflict as characters face greater forces of antagonism, passing points of no return. Never retreat to actions of lesser quality or magnitude.', route: 'gaps' },
      { id: 'law-of-conflict', term: 'The Law of Conflict', text: 'Nothing moves forward in a story except through conflict. Conflict is to story what sound is to music.', route: 'gaps' },
      { id: 'complexity', term: 'Complication vs. complexity', text: 'Conflict on one level only is mere complication (action: extra-personal; soap: personal; stream of consciousness: inner). Complexity puts characters in conflict on all three levels, often at once. Don’t proliferate characters or locations.', route: 'gaps' },
      { id: 'three-acts', term: 'Three acts minimum', text: 'A feature-length story needs at least three major reversals. Act One is roughly a quarter of the telling; the last act is the shortest and accelerates.', route: 'structure' },
      { id: 'long-second-act', term: 'The long second act', text: 'Solve it with subplots or more acts — e.g. a Mid-Act Climax splits Act Two into a four-act rhythm. Too many act climaxes invite cliché and repetition.', route: 'structure' },
      { id: 'act-rhythm', term: 'Act rhythm', text: 'The last two act climaxes must not share a charge: an up-ending needs a down penultimate climax, and vice versa. For irony, find which way it leans and contradict that.', route: 'structure' },
      { id: 'false-ending', term: 'False ending', text: 'A scene so complete we think the story is over. Mostly an Action-genre device; usually the penultimate climax should instead intensify the Major Dramatic Question.', route: 'structure' },
      { id: 'subplots', term: 'Subplots', text: 'A subplot may contradict the Controlling Idea (irony), resonate it (variations), set up a late central plot, or complicate the central plot. If it does none of these, it splits the story.', route: 'subplots' },
      { id: 'mental-physical', term: 'Make the mental physical', text: 'The screenwriter creates visual correlatives for inner conflict — images of choice and action, not explanation.', route: 'scenes' },
    ],
  },
  {
    id: 'ch10', part: 3, n: 10, title: 'Scene Design',
    summary: 'Every scene turns. Turning points bring surprise, curiosity, insight and new direction. Setups and payoffs, emotional transitions, and true choice (dilemma).',
    principles: [
      { id: 'turning-point', term: 'Turning Point', text: 'Each scene’s scene-objective serves the Spine. Strive for a design in which every scene is a minor, moderate or major turning point.', route: 'scenes' },
      { id: 'tp-effects', term: 'Effects of a turning point', text: 'Surprise, increased curiosity, insight, and new direction. The audience rushes back through the story to find the layered-in answers.', route: 'scenes' },
      { id: 'self-expression', term: 'Self-expression', text: 'The writer’s most powerful means of self-expression is the unique way the story turns — not the words.', route: 'scenes' },
      { id: 'setups-payoffs', term: 'Setups and payoffs', text: 'To set up is to layer in knowledge; to pay off is to close the gap by delivering it. Plant setups so they carry one meaning at first and a second, deeper one in retrospect. Every payoff can become a new setup.', route: 'setups' },
      { id: 'retroactive-logic', term: 'Logic is retroactive', text: 'Think the unthinkable — then go back and set it up so it makes sense. Imagination first, reasoning second.', route: 'setups' },
      { id: 'emotional-transitions', term: 'Emotional transitions', text: 'There are two emotions, pleasure and pain. Emotion comes from a transition of values the audience understands, for a character it empathizes with.', route: 'composition' },
      { id: 'diminishing-returns', term: 'Law of Diminishing Returns', text: 'The more often we experience something, the less effect it has. Alternate charges; three tragic scenes in a row turn the third into a laugh.', route: 'composition' },
      { id: 'mood', term: 'Feeling and mood', text: 'Transitions create emotion; mood (light, tempo, casting, design, music) makes it specific. Mood never substitutes for emotion.', route: 'composition' },
      { id: 'dilemma', term: 'True choice is dilemma', text: 'Good vs. evil is no choice at all. True choice is between irreconcilable goods or the lesser of two evils. Meaningful decisions are triangular: A caught between B and C.', route: 'crisis' },
    ],
  },
  {
    id: 'ch11', part: 3, n: 11, title: 'Scene Analysis',
    summary: 'Text vs. subtext, and the five-step technique for making a scene give up its secrets.',
    principles: [
      { id: 'subtext', term: 'Text and subtext', text: 'Text is the sensory surface — what we see and hear. Subtext is the life underneath. "If the scene is about what the scene is about," it is written on the nose and unactable.', route: 'scenes' },
      { id: 'step1', term: 'Step 1 — Define conflict', text: 'Who drives the scene and what do they want (as an infinitive: "to…")? What forces block them and what do those forces want? The desires must be in direct conflict.', route: 'scenes' },
      { id: 'step2', term: 'Step 2 — Note opening value', text: 'Identify the value at stake and its charge at the opening.', route: 'scenes' },
      { id: 'step3', term: 'Step 3 — Break into beats', text: 'Name each action and reaction in the subtext with an active gerund phrase ("Groveling at her feet" / "Ignoring the plea"). A new beat begins only when behaviour clearly changes.', route: 'scenes' },
      { id: 'step4', term: 'Step 4 — Closing value', text: 'Note the closing charge and compare with the opening. Same charge = non-event.', route: 'scenes' },
      { id: 'step5', term: 'Step 5 — Locate the turning point', text: 'Survey the beats for the shape of the scene and find the moment the major gap opens between expectation and result.', route: 'scenes' },
    ],
  },
  {
    id: 'ch12', part: 3, n: 12, title: 'Composition',
    summary: 'Ordering and linking scenes: unity and variety, pacing, rhythm and tempo, four ways to express progression, and the principle of transition.',
    principles: [
      { id: 'unity', term: 'Unity and variety', text: '"Because of the Inciting Incident, the Climax had to happen." Within that causal lock, seek variety: the comic in the tragic, the political in the personal.', route: 'composition' },
      { id: 'pacing', term: 'Pacing', text: 'Alternate tension and relaxation like the rhythm of life, each cycle rising higher, until the climax empties the audience out.', route: 'composition' },
      { id: 'rhythm-tempo', term: 'Rhythm and tempo', text: 'Rhythm is scene length (average two to three minutes of screen time); tempo is the activity within a scene. Toward act climaxes, shorten scenes and raise tempo — then slow down and let the climax breathe ("earn the pause").', route: 'composition' },
      { id: 'social-progression', term: 'Social progression', text: 'Widen the impact of character actions out into society, gradually touching more and more lives.', route: 'composition' },
      { id: 'personal-progression', term: 'Personal progression', text: 'Drive actions deep into intimate relationships and inner lives, toward secrets behind the public mask.', route: 'composition' },
      { id: 'symbolic-ascension', term: 'Symbolic ascension', text: 'Build imagery from the particular to the universal, the specific to the archetypal — subliminally.', route: 'images' },
      { id: 'ironic-ascension', term: 'Ironic ascension', text: 'Turn progression on irony between actions and results, appearance and reality — typically for protagonists certain of their plan.', route: 'composition' },
      { id: 'transition', term: 'Principle of transition', text: 'Link the tail of one scene to the head of the next through something they share or oppose: a trait, an action, an object, a word, a quality of light, a sound, an idea.', route: 'composition' },
    ],
  },
  {
    id: 'ch13', part: 3, n: 13, title: 'Crisis, Climax, Resolution',
    summary: 'The Crisis is the ultimate decision (danger/opportunity) and the Obligatory Scene; the Climax is a meaningful, irreversible reversal; the Resolution is a slow curtain.',
    principles: [
      { id: 'crisis', term: 'Crisis', text: 'The protagonist has exhausted all actions save one and faces the most focused forces of antagonism. The Crisis must be a true dilemma; how he chooses gives the deepest view of his character and reveals the story’s most important value.', route: 'crisis' },
      { id: 'crisis-static', term: 'A deliberately static moment', text: 'Never skim or put the Crisis decision offscreen. Freeze it: let tension build until the choice explodes into the Climax. If Crisis and Climax are in different places, splice them on a cut.', route: 'crisis' },
      { id: 'crisis-within-climax', term: 'Turning point within the climax', text: 'As the protagonist takes the climactic action, split expectation from result one last time: he may or may not get what he wants, but not the way he expects.', route: 'crisis' },
      { id: 'climax', term: 'Climax: meaning produces emotion', text: 'A revolution in values at maximum charge, absolute and irreversible, executed through a pure, self-evident action needing no explanation. Climax subplots inside or before the central climax.', route: 'crisis' },
      { id: 'inevitable-unexpected', term: 'Inevitable and unexpected', text: 'Give the audience the emotion you promised, but not the way it expects. In retrospect the path should seem the only one possible.', route: 'crisis' },
      { id: 'key-image', term: 'Spectacle and truth (key image)', text: 'Seek a single climactic image that concentrates all meaning and emotion — written for the eye, expressing the Controlling Idea.', route: 'crisis' },
      { id: 'resolution', term: 'Resolution', text: 'Climax a leftover subplot, show the spread of climactic effects across the cast, or simply give a slow curtain so the audience can leave with dignity.', route: 'crisis' },
    ],
  },
  {
    id: 'ch14', part: 4, n: 14, title: 'The Principle of Antagonism',
    summary: 'A protagonist and story can only be as compelling as the forces of antagonism make them. Take the value to the end of the line: Contrary, Contradictory, Negation of the Negation.',
    principles: [
      { id: 'principle-antagonism', term: 'The Principle of Antagonism', text: 'A protagonist and his story can only be as intellectually fascinating and emotionally compelling as the forces of antagonism make them. Weigh the protagonist against all forces combined: he should be an underdog with only a chance.', route: 'values' },
      { id: 'contrary', term: 'The Contrary', text: 'A situation somewhat negative but not the full opposite of the positive value (e.g. unfairness, for justice).', route: 'values' },
      { id: 'contradictory', term: 'The Contradictory', text: 'The direct opposite of the positive value (e.g. injustice).', route: 'values' },
      { id: 'negation-of-negation', term: 'The Negation of the Negation', text: 'A compound negative where life turns qualitatively, not just quantitatively, worse (e.g. tyranny, "might makes right"). Stories that stop at the Contradictory may satisfy but are never sublime.', route: 'values' },
      { id: 'declension-acts', term: 'Progression through the declension', text: 'Typically: Positive to Contrary in Act One, Contradictory in later acts, Negation of the Negation in the last act — ending tragically or returning to the positive with a profound difference. Anything is possible, but the end of the line must be reached.', route: 'values' },
      { id: 'build-negative', term: 'Build the negative side', text: 'When a story is weak, its forces of antagonism are weak. Spend creativity on the negative; it pays off naturally on the positive.', route: 'values' },
    ],
  },
  {
    id: 'ch15', part: 4, n: 15, title: 'Exposition',
    summary: 'Show, don’t tell: dramatize exposition, convert it to ammunition, parse it out progressively, save secrets for last. Backstory supplies revelations that turn scenes.',
    principles: [
      { id: 'show-dont-tell', term: 'Show, don’t tell', text: 'Dramatized exposition serves two ends: first to further the immediate conflict, second to convey information. Never put the information first.', route: 'exposition' },
      { id: 'ammunition', term: 'Convert exposition to ammunition', text: 'Characters know their world and each other; let them use what they know as ammunition in the struggle for what they want.', route: 'exposition' },
      { id: 'parse-exposition', term: 'Parse exposition progressively', text: 'Never include what the audience can easily assume; never pass on facts unless their absence would confuse. Least important facts early, critical ones (secrets) last. Create the desire to know before telling.', route: 'exposition' },
      { id: 'action-revelation', term: 'Turn on action or revelation', text: 'Scenes turn only through action or revelation. Powerful revelations come from Backstory, often reserved for act climaxes.', route: 'exposition' },
      { id: 'in-medias-res', term: 'In medias res', text: 'Start close to the climactic event so the protagonist has a long, value-rich life before the Inciting Incident — something to lose.', route: 'inciting' },
      { id: 'flashbacks', term: 'Flashbacks, dreams, montage, voice-over', text: 'Dramatize flashbacks as mini-dramas and bring them in only after the audience wants to know. Dream sequences and montages are usually exposition in disguise. Test voice-over: if the story still works without it, keep it only as counterpoint.', route: 'exposition' },
    ],
  },
  {
    id: 'ch16', part: 4, n: 16, title: 'Problems and Solutions',
    summary: 'Interest (curiosity and concern), surprise, coincidence, comedy, point of view, adaptation, melodrama and holes.',
    principles: [
      { id: 'curiosity-concern', term: 'Curiosity and concern', text: 'Curiosity is the intellectual need to answer questions; concern is the emotional need for positive values. The audience seeks the Center of Good — which must at least be in the protagonist, defined against a background of negativity.', route: 'characters' },
      { id: 'mystery-suspense-irony', term: 'Mystery, Suspense, Dramatic Irony', text: 'Mystery: the audience knows less than the characters. Suspense: the same. Dramatic irony: more — replacing curiosity with dread and compassion. Most stories mix them within an overall suspense design.', route: 'composition' },
      { id: 'false-mystery', term: 'No false mystery, no cheap surprise', text: 'True surprise springs from the gap and is followed by a rush of insight. Cheap surprise exploits the audience; false mystery withholds facts artificially.', route: 'composition' },
      { id: 'coincidence', term: 'Coincidence', text: 'Bring coincidence in early and let it gain meaning; avoid it after the midpoint; never use it to turn an ending (deus ex machina).', route: 'crisis' },
      { id: 'comedy', term: 'Comedy', text: 'Comedy attacks a social institution; the comic character has a blind obsession. Comedy tolerates more coincidence if the protagonist has suffered enormously and never despaired.', route: 'characters' },
      { id: 'pov', term: 'Point of view', text: 'Shaping the whole story from the protagonist’s point of view is a creative discipline that yields a tight, memorable telling and deeper empathy.', route: 'scenes' },
      { id: 'melodrama', term: 'Melodrama', text: 'Melodrama comes not from overexpression but from undermotivation. Lift the forces that drive characters to equal the extremity of their actions.', route: 'characters' },
      { id: 'holes', term: 'Holes', text: 'Close a hole if you can; if the audience may not notice, let it pass; or expose it and deny it is a hole.', route: 'setups' },
      { id: 'adaptation', term: 'Adaptation', text: 'The purer the novel or play, the worse the film. Reduce events to one-line steps, test whether the story is well told, and be willing to reinvent.', route: 'outline' },
    ],
  },
  {
    id: 'ch17', part: 4, n: 17, title: 'Character',
    summary: 'Characters are works of art. Dimension means contradiction. The protagonist creates the cast, which orbits the protagonist and delineates his dimensions.',
    principles: [
      { id: 'mind-worm', term: 'The writer as Mind Worm', text: 'Burrow into a character, learn their dreams, fears, strengths and weaknesses, then design the precise event (the Inciting Incident) that will send them on a quest to the limits of their being.', route: 'characters' },
      { id: 'desire-motivation', term: 'Desire and motivation', text: 'The key to true character is desire: what does the character want now, soon, overall, knowingly, unknowingly? Understand motive, but leave some mystery — mono-explanations diminish characters.', route: 'characters' },
      { id: 'dimension', term: 'Dimension = contradiction', text: 'Either within deep character (guilt-ridden ambition) or between characterization and deep character (a charming thief). Contradictions must be consistent; random quirks are not dimension.', route: 'characters' },
      { id: 'most-dimensional', term: 'The protagonist is the most dimensional', text: 'If a supporting role is more dimensional, the Center of Good decenters and empathy drifts away from the star role.', route: 'cast' },
      { id: 'cast-design', term: 'Cast design: a solar system', text: 'The protagonist is the sun; supporting roles orbit as planets, each bringing out a different side of the protagonist’s contradictions; bit players are satellites, flat but not dull.', route: 'cast' },
      { id: 'comic-character', term: 'The comic character', text: 'Marked by a blind obsession (a "humour") the character does not see. When he sees it, the comedy is over.', route: 'characters' },
      { id: 'three-tips', term: 'Three tips', text: 'Leave room for the actor; fall in love with all your characters (no one thinks they’re bad); character is self-knowledge — ask "If I were this character…"', route: 'characters' },
    ],
  },
  {
    id: 'ch18', part: 4, n: 18, title: 'The Text',
    summary: 'Dialogue is not conversation; description puts a film in the reader’s head; Image Systems carry poetics subliminally; titles position the audience.',
    principles: [
      { id: 'dialogue', term: 'Dialogue', text: 'Compression and economy, direction, purpose — yet it must sound like talk. Short speeches, action/reaction, suspense sentences that hold meaning to the last word. Never write a line you can express visually.', route: 'scenes' },
      { id: 'description', term: 'Description', text: 'Vivid action in the present tense, specific nouns and active verbs; each paragraph a shot, guiding the reader’s eye through action/reaction.', route: 'outline' },
      { id: 'image-system', term: 'Image System', text: 'A strategy of motifs: a category of imagery that repeats from beginning to end with persistence, variation and subtlety, as subliminal communication that deepens aesthetic emotion.', route: 'images' },
      { id: 'internal-external', term: 'Internal vs. external imagery', text: 'External imagery borrows a symbol’s outside meaning (a flag = patriotism) — the hallmark of the student film. Internal imagery gives a category a meaning unique to this story. Never label symbols.', route: 'images' },
      { id: 'titles', term: 'Titles', text: 'A title names something solid in the story — character, setting, theme or genre; the best name several at once.', route: 'genre' },
    ],
  },
  {
    id: 'ch19', part: 4, n: 19, title: 'A Writer’s Method',
    summary: 'Write from the inside out: step-outline, pitch, treatment, then screenplay. Dialogue comes last.',
    principles: [
      { id: 'outside-in', term: 'Writing from the outside in', text: 'Rushing to dialogue and then twisting drafts around favourite scenes rarely produces a story that works.', route: 'outline' },
      { id: 'step-outline', term: 'Step-outline', text: 'Each scene in one or two sentences describing how it builds and turns; on the back of the card, its function in the design. Create far more than you need and destroy what is less than your best.', route: 'outline' },
      { id: 'pitch', term: 'Pitch test', text: 'Pitch the step-outline in ten minutes. If it can’t hook, hold and move a listener, it will not work at 110 minutes.', route: 'outline' },
      { id: 'treatment', term: 'Treatment', text: 'Expand each step into present-tense, moment-by-moment description with full subtext — what characters talk about, never the dialogue itself.', route: 'outline' },
      { id: 'screenplay', term: 'Screenplay', text: 'Only after the treatment do you write dialogue — and it will be character-specific because the characters have waited so long to speak.', route: 'outline' },
    ],
  },
];

// Flattened index for search and the glossary.
export const PRINCIPLES = CHAPTERS.flatMap((c) =>
  c.principles.map((p) => ({ ...p, chapter: c.id, chapterN: c.n, chapterTitle: c.title })),
);

export function principleById(id) {
  return PRINCIPLES.find((p) => p.id === id);
}

export function principlesForRoute(route) {
  return PRINCIPLES.filter((p) => p.route === route);
}

export function chapterLabel(chId) {
  const c = CHAPTERS.find((x) => x.id === chId);
  if (!c) return '';
  return c.n === 0 ? 'Intro' : `Ch. ${c.n}`;
}

// Six patterns of ironic progression (ch. 12).
export const IRONIC_PATTERNS = [
  'He gets at last what he’s always wanted… but too late to have it.',
  'He’s pushed further and further from his goal… only to discover he’s been led right to it.',
  'He throws away what he later finds is indispensable to his happiness.',
  'To reach a goal he unwittingly takes the precise steps that lead him away from it.',
  'The action he takes to destroy something becomes exactly what is needed to be destroyed by it.',
  'He comes into possession of something he’s certain will make him miserable, does everything to get rid of it… only to discover it’s the gift of happiness.',
];

// Hinges for transitions between scenes (ch. 12).
export const TRANSITION_HINGES = [
  { id: 'trait', label: 'Characterization trait' },
  { id: 'action', label: 'Action' },
  { id: 'object', label: 'Object' },
  { id: 'word', label: 'Word / phrase' },
  { id: 'light', label: 'Quality of light' },
  { id: 'sound', label: 'Sound' },
  { id: 'idea', label: 'Idea' },
];

export const PROGRESSION_TECHNIQUES = [
  { id: 'social', label: 'Social progression', hint: 'Widen the impact of actions into society.' },
  { id: 'personal', label: 'Personal progression', hint: 'Drive deep into intimate relationships and inner life.' },
  { id: 'symbolic', label: 'Symbolic ascension', hint: 'Imagery rises from the particular to the archetypal.' },
  { id: 'ironic', label: 'Ironic ascension', hint: 'Progress on the irony between action and result.' },
];

export const LEVELS = [
  { id: 'inner', label: 'Inner', long: 'Inner conflict', hint: 'Mind, body, emotions — the self as its own worst enemy.' },
  { id: 'personal', label: 'Personal', long: 'Personal conflict', hint: 'Family, friends, lovers — intimacy deeper than social roles.' },
  { id: 'extra', label: 'Extra-personal', long: 'Extra-personal conflict', hint: 'Institutions, individuals in society, the physical environment, time.' },
];
