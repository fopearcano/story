// The working screenwriter's genre system described in STORY ch. 4 (25 genres),
// summarised. Convention checklists combine what the book names explicitly with
// prompts for the writer's own genre study (setting, role, event, value).

export const GENRES = [
  {
    id: 'love', n: 1, name: 'Love Story', group: 'basic',
    sub: ['Romance', 'Buddy Salvation (friendship instead of romance)', 'Longing Story (delays boy-meets-girl to the climax)'],
    summary: 'Two people are drawn together; the essential question is "What’s to stop them?"',
    conventions: [
      'Lovers meet (boy meets girl) — early, unless it is a Longing Story',
      'A force opposed to love (blocking characters, culture, society, identity, death…)',
      'Trials and tribulations that test the love',
      'Value at stake: love / hate (and its declension)',
    ],
    cliches: ['Two individualists who hate each other on sight', 'Two wallflowers stranded at the edge of a party'],
  },
  {
    id: 'horror', n: 2, name: 'Horror Film', group: 'basic',
    sub: ['Uncanny (rationally explainable source)', 'Supernatural (irrational, spirit realm)', 'Super-Uncanny (audience kept guessing)'],
    summary: 'A monstrous source of horror threatens; believability is the key to terror.',
    conventions: ['A source of horror whose rules are researched and consistent', 'Escalating attacks', 'Cheap surprise is acceptable here as a convention', 'Value: life / death, consciousness / damnation'],
    cliches: ['The hand on the shoulder that turns out to be a friend'],
  },
  {
    id: 'epic', n: 3, name: 'Modern Epic', group: 'basic', sub: [],
    summary: 'The individual versus the state.',
    conventions: ['A tyrannical or corrupt institution', 'A protagonist who rebels', 'Value: freedom / slavery, justice / tyranny'],
    cliches: [],
  },
  {
    id: 'western', n: 4, name: 'Western', group: 'basic', sub: ['Classic morality play', 'Revisionist / quasi-Social Drama'],
    summary: 'Mythic frontier allegories of good and evil, reinvented as society changes.',
    conventions: ['Frontier setting', 'Lawman / gunfighter / settlers / outlaws', 'Showdown', 'Value: civilization / wilderness, justice / injustice'],
    cliches: ['The retired gunslinger who swore never to kill again'],
  },
  {
    id: 'war', n: 5, name: 'War Genre', group: 'basic', sub: ['Pro-war', 'Antiwar'],
    summary: 'Specifically about combat (war as mere setting belongs to other genres).',
    conventions: ['Combat', 'Unit / commander / enemy', 'Value: life / death, courage / cowardice, loyalty / betrayal'],
    cliches: [],
  },
  {
    id: 'maturation', n: 6, name: 'Maturation Plot', group: 'basic', sub: ['Coming of age'],
    summary: 'The protagonist grows from immaturity to maturity.',
    conventions: ['Protagonist on the threshold of adulthood (in some sense)', 'Tests that force growing up', 'Value: maturity / childishness — its negation is immaturity perceived as maturity'],
    cliches: [],
  },
  {
    id: 'redemption', n: 7, name: 'Redemption Plot', group: 'basic', sub: [],
    summary: 'A moral change within the protagonist from bad to good.',
    conventions: ['Protagonist begins morally compromised', 'An event offers a last chance at salvation', 'Climax: sacrifice of the corrupting obsession'],
    cliches: [],
  },
  {
    id: 'punitive', n: 8, name: 'Punitive Plot', group: 'basic', sub: [],
    summary: 'The good guy turns bad and is punished.',
    conventions: ['Protagonist begins decent', 'Escalating corruption', 'Climax: desire achieved, then destroys him'],
    cliches: [],
  },
  {
    id: 'testing', n: 9, name: 'Testing Plot', group: 'basic', sub: [],
    summary: 'Willpower versus the temptation to surrender.',
    conventions: ['A test of endurance or integrity', 'Repeated temptation to give up', 'Value: strength of will / surrender'],
    cliches: [],
  },
  {
    id: 'education', n: 10, name: 'Education Plot', group: 'basic', sub: [],
    summary: 'A deep change in the protagonist’s view of life, people or self, from negative (naive, distrustful, fatalistic, self-hating) to positive (wise, trusting, optimistic, self-possessed).',
    conventions: ['Protagonist begins with a negative worldview', 'His life bottoms out', 'A teacher figure or experience reshapes understanding', 'Requires complex characters and inner conflict'],
    cliches: [],
  },
  {
    id: 'disillusionment', n: 11, name: 'Disillusionment Plot', group: 'basic', sub: [],
    summary: 'A deep change of worldview from positive to negative.',
    conventions: ['Protagonist opens optimistic, with high ideals', 'Repeated negative turns that raise and then poison hope', 'Down-ending: cynicism, disillusion'],
    cliches: [],
  },
  {
    id: 'comedy', n: 12, name: 'Comedy', group: 'mega',
    sub: ['Parody', 'Satire', 'Sitcom', 'Romantic Comedy', 'Screwball', 'Farce', 'Black Comedy'],
    summary: 'Subgenres differ by the target of comic attack and the degree of ridicule (gentle, caustic, lethal).',
    conventions: ['Nobody really gets hurt (except in Black Comedy)', 'A social institution under attack', 'Comic characters with blind obsessions', 'Turning points that explode into laughter'],
    cliches: [],
  },
  {
    id: 'crime', n: 13, name: 'Crime', group: 'mega',
    sub: ['Murder Mystery (master detective POV)', 'Caper (master criminal POV)', 'Detective (cop POV)', 'Gangster (crook POV)', 'Thriller / Revenge (victim POV)', 'Courtroom (lawyer POV)', 'Newspaper (reporter POV)', 'Espionage (spy POV)', 'Prison Drama (inmate POV)', 'Film Noir'],
    summary: 'Subgenres are defined by from whose point of view the crime is seen.',
    conventions: ['A crime, early in the telling', 'A detective (pro or amateur) who finds clues and suspects', 'Thriller: the criminal "makes it personal"', 'The criminal is identified, apprehended and punished — or, as in modern down-endings, escapes'],
    cliches: ['The villain kills the detective’s partner', 'The villain menaces the cop’s family'],
  },
  {
    id: 'social', n: 14, name: 'Social Drama', group: 'mega',
    sub: ['Domestic Drama', 'Woman’s Film', 'Political Drama', 'Eco-Drama', 'Medical Drama', 'Psycho-Drama'],
    summary: 'Identifies a problem in society and constructs a story demonstrating a cure.',
    conventions: ['A social ill', 'Its remedy dramatized', 'Danger: didacticism — build both sides honestly'],
    cliches: [],
  },
  {
    id: 'action', n: 15, name: 'Action / Adventure', group: 'mega',
    sub: ['High Adventure (destiny, hubris, the spiritual)', 'Disaster / Survival (nature as antagonist)'],
    summary: 'Explosive action and derring-do, often borrowing motivation from other genres.',
    conventions: ['Hero at the mercy of the villain — who must turn the tables (imperative scene)', 'Extra-personal conflict, large cast, many locations', 'Simple characters so complexity doesn’t distract'],
    cliches: ['"Look out! There’s somebody behind you!"'],
  },
  {
    id: 'historical', n: 16, name: 'Historical Drama', group: 'supra', sub: [],
    summary: 'A supra-genre: the past used as a clear glass to show the present.',
    conventions: ['What is past must be present: anachronistic relevance', 'Contains another genre (Love Story, War, Political…)'],
    cliches: [],
  },
  {
    id: 'biography', n: 17, name: 'Biography', group: 'supra', sub: ['Autobiography'],
    summary: 'Interpret facts as if they were fiction; cast the subject as protagonist of his life’s genre.',
    conventions: ['Not a chronicle: find the meaning of the life', 'Choose the governing genre (Courtroom, Epic, Disillusionment…)'],
    cliches: [],
  },
  {
    id: 'docudrama', n: 18, name: 'Docu-Drama', group: 'supra', sub: [], summary: 'Recent events dramatized.', conventions: ['Basis in recent fact', 'Dramatized, not merely documented'], cliches: [],
  },
  {
    id: 'mockumentary', n: 19, name: 'Mockumentary', group: 'supra', sub: [],
    summary: 'Pretends to be documentary but is utter fiction, satirizing hypocritical institutions.',
    conventions: ['Documentary form', 'Satirical target institution'], cliches: [],
  },
  {
    id: 'musical', n: 20, name: 'Musical', group: 'supra', sub: ['Musical Comedy'],
    summary: 'Characters sing and dance their stories; any genre can play in musical form.',
    conventions: ['A "reality" in which song is expression', 'Contains another genre'], cliches: [],
  },
  {
    id: 'scifi', n: 21, name: 'Science Fiction', group: 'supra', sub: [],
    summary: 'Hypothetical futures (often technological dystopias); any genre may play in the future.',
    conventions: ['A researched, consistent future world', 'Often individual vs. state + action'], cliches: [],
  },
  {
    id: 'sports', n: 22, name: 'Sports Genre', group: 'supra', sub: [],
    summary: 'Sport as a crucible for character change — home for Maturation, Redemption, Education, Punitive, Testing plots.',
    conventions: ['The big game / event', 'An inner arc framed by competition'], cliches: [],
  },
  {
    id: 'fantasy', n: 23, name: 'Fantasy', group: 'supra', sub: [],
    summary: 'Plays with time, space and the physical. One great leap away from reality, then strict probability and no coincidence.',
    conventions: ['Rules of magic or reality that are never broken', 'Tight causal Archplot'], cliches: [],
  },
  {
    id: 'animation', n: 24, name: 'Animation', group: 'supra', sub: [],
    summary: 'The law of universal metamorphosis: anything can become something else.',
    conventions: ['Metamorphosis', 'Often Farce, High Adventure or Maturation'], cliches: [],
  },
  {
    id: 'artfilm', n: 25, name: 'Art Film', group: 'supra', sub: ['Minimalism', 'Antistructure'],
    summary: 'A traditional genre in its own right, whose grand convention is unconventionality.',
    conventions: ['Celebration of the cerebral; mood over strong emotion', 'Enigma and unresolved tension that invite interpretation'], cliches: [],
  },
];

export function genreById(id) {
  return GENRES.find((g) => g.id === id);
}

// Plot types that describe a protagonist's inner arc (used on the character arc picker).
export const ARC_PLOTS = [
  { id: '', label: '—' },
  { id: 'maturation', label: 'Maturation (immature → mature)', dir: 1 },
  { id: 'redemption', label: 'Redemption (bad → good)', dir: 1 },
  { id: 'education', label: 'Education (negative → positive worldview)', dir: 1 },
  { id: 'testing', label: 'Testing (will vs. surrender)', dir: 0 },
  { id: 'punitive', label: 'Punitive (good → bad, punished)', dir: -1 },
  { id: 'disillusionment', label: 'Disillusionment (positive → negative worldview)', dir: -1 },
];
