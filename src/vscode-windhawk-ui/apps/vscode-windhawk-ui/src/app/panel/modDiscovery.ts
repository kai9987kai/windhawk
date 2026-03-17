import {
  ModConfig,
  ModMetadata,
  RepositoryDetails,
} from '../webviewIPCMessages';

export type RepositoryModEntry = {
  repository: {
    metadata: ModMetadata;
    details: RepositoryDetails;
  };
  installed?: {
    metadata: ModMetadata | null;
    config: ModConfig | null;
    userRating?: number;
  };
};

export type SortingOrder =
  | 'smart-relevance'
  | 'popular-top-rated'
  | 'popular'
  | 'top-rated'
  | 'newest'
  | 'last-updated'
  | 'alphabetical';

export type RankedMod = {
  modId: string;
  mod: RepositoryModEntry;
  discoveryScore: number;
  insights: string[];
  inferredConcepts: string[];
};

export type RefinementSuggestion = {
  key: string;
  label: string;
  queryText: string;
};

export type SearchCorrection = {
  correctedQuery: string;
  correctedTokens: number;
};

export type SearchRecovery = {
  suggestedQuery: string;
  reason: 'correction' | 'broadened';
  results: RankedMod[];
};

export type DiscoveryMission = {
  key: string;
  title: string;
  description: string;
  researchCue: string;
  query: string;
  sortingOrder: SortingOrder;
  followUpQueries: string[];
  verificationChecks: string[];
};

export type DiscoveryMissionCandidate = {
  modId: string;
  displayName: string;
  author: string;
  insightSummary: string;
  communitySummary: string;
};

type SearchConcept = {
  key: string;
  label: string;
  queryText: string;
  terms: string[];
  processes: string[];
};

type SearchField = {
  key: 'title' | 'id' | 'description' | 'author' | 'process';
  weight: number;
  value: string;
  tokens: string[];
};

type VocabularyCandidate = {
  token: string;
  weight: number;
};

type QueryProfile = {
  raw: string;
  normalized: string;
  tokens: string[];
  concepts: SearchConcept[];
  expandedTokens: string[];
};

type ModProfile = {
  title: string;
  titleTokens: string[];
  id: string;
  idTokens: string[];
  description: string;
  descriptionTokens: string[];
  author: string;
  authorTokens: string[];
  processes: string[];
  processTokens: string[];
  concepts: SearchConcept[];
  searchableText: string;
  fields: SearchField[];
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'into',
  'is',
  'it',
  'its',
  'mod',
  'mods',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'this',
  'to',
  'with',
  'windows',
]);

const SEARCH_CONCEPTS: SearchConcept[] = [
  {
    key: 'taskbar',
    label: 'Taskbar',
    queryText: 'taskbar',
    terms: [
      'taskbar',
      'tray',
      'system tray',
      'notification area',
      'clock',
      'quick settings',
    ],
    processes: ['explorer.exe'],
  },
  {
    key: 'explorer',
    label: 'Explorer',
    queryText: 'explorer',
    terms: [
      'explorer',
      'file explorer',
      'folder',
      'folders',
      'files',
      'shell',
    ],
    processes: ['explorer.exe'],
  },
  {
    key: 'context-menu',
    label: 'Context menu',
    queryText: 'context menu',
    terms: [
      'context menu',
      'context menus',
      'right click',
      'right-click',
      'shell menu',
    ],
    processes: ['explorer.exe'],
  },
  {
    key: 'start-menu',
    label: 'Start menu',
    queryText: 'start menu',
    terms: [
      'start menu',
      'launcher',
      'windows search',
      'start button',
      'search panel',
    ],
    processes: ['explorer.exe', 'startmenuexperiencehost.exe', 'searchhost.exe'],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    queryText: 'notifications',
    terms: [
      'notifications',
      'notification center',
      'action center',
      'toast',
      'toasts',
      'quick settings',
      'focus assist',
    ],
    processes: ['explorer.exe', 'shellexperiencehost.exe'],
  },
  {
    key: 'desktop',
    label: 'Desktop',
    queryText: 'desktop',
    terms: ['desktop', 'icons', 'wallpaper', 'background'],
    processes: ['explorer.exe'],
  },
  {
    key: 'window-management',
    label: 'Window management',
    queryText: 'window management',
    terms: [
      'window',
      'windows',
      'title bar',
      'titlebar',
      'caption',
      'resize',
      'snap',
      'maximize',
      'minimize',
    ],
    processes: ['dwm.exe', 'explorer.exe'],
  },
  {
    key: 'alt-tab',
    label: 'Alt+Tab',
    queryText: 'alt tab',
    terms: [
      'alt tab',
      'task switcher',
      'window switcher',
      'switcher',
      'switch between windows',
    ],
    processes: ['dwm.exe', 'explorer.exe'],
  },
  {
    key: 'appearance',
    label: 'Appearance',
    queryText: 'appearance',
    terms: [
      'theme',
      'style',
      'visual',
      'appearance',
      'dark mode',
      'light mode',
      'accent',
      'transparent',
      'transparency',
    ],
    processes: [],
  },
  {
    key: 'input',
    label: 'Input',
    queryText: 'input',
    terms: ['keyboard', 'mouse', 'hotkey', 'shortcut', 'scroll', 'touchpad'],
    processes: [],
  },
  {
    key: 'audio',
    label: 'Audio',
    queryText: 'audio',
    terms: ['audio', 'sound', 'volume', 'speaker', 'microphone'],
    processes: ['sndvol.exe'],
  },
  {
    key: 'performance',
    label: 'Performance',
    queryText: 'performance',
    terms: ['performance', 'latency', 'fast', 'faster', 'memory', 'cpu'],
    processes: [],
  },
];

const DISCOVERY_MISSIONS: DiscoveryMission[] = [
  {
    key: 'taskbar-flow',
    title: 'Sharpen taskbar flow',
    description: 'Start from taskbar-focused mods, then branch into tray and clock refinements.',
    researchCue: 'Compare a small set first, then refine instead of stacking unrelated tweaks.',
    query: 'taskbar',
    sortingOrder: 'smart-relevance',
    followUpQueries: ['tray', 'clock', 'start menu'],
    verificationChecks: [
      'Check primary and secondary monitor behavior before keeping the change.',
      'Verify pinned apps, overflow area, and taskbar labels after Explorer reloads.',
      'Keep one rollback path in case explorer.exe behavior changes in your build.',
    ],
  },
  {
    key: 'notification-calm',
    title: 'Calm notifications',
    description: 'Use notification-centered mods to reduce interruption cost and noisy shell surfaces.',
    researchCue: 'Prefer focused interventions with explicit review steps over one broad shell change.',
    query: 'notifications',
    sortingOrder: 'smart-relevance',
    followUpQueries: ['quick settings', 'toast', 'focus assist'],
    verificationChecks: [
      'Trigger a real toast and confirm the experience is quieter without losing critical alerts.',
      'Check quick settings and shell surfaces that share notification infrastructure.',
      'Review changelog notes for Windows build-specific shell regressions before enabling long term.',
    ],
  },
  {
    key: 'explorer-focus',
    title: 'Tighten Explorer workflow',
    description: 'Begin with Explorer mods, then narrow toward context menu, desktop, or file-flow changes.',
    researchCue: 'Keep the search wide enough to discover options, but validate one workflow at a time.',
    query: 'explorer',
    sortingOrder: 'smart-relevance',
    followUpQueries: ['context menu', 'desktop', 'folders'],
    verificationChecks: [
      'Test the exact file and folder flow you want to improve, not just a screenshot path.',
      'Verify right-click menus and drag-drop behavior after any shell tweak.',
      'Check whether the mod targets only explorer.exe or reaches other shell processes too.',
    ],
  },
  {
    key: 'window-flow',
    title: 'Refine window movement',
    description: 'Compare window-management mods, then drill into Alt+Tab, snapping, or title-bar behavior.',
    researchCue: 'Use the first pass to shortlist candidates, then validate the risky interactions manually.',
    query: 'window management',
    sortingOrder: 'smart-relevance',
    followUpQueries: ['alt tab', 'snap', 'title bar'],
    verificationChecks: [
      'Exercise snap, maximize, minimize, and virtual desktop flows before keeping the mod.',
      'Check for DWM or shell process scope when window chrome behavior changes.',
      'Keep logging available for the first live run if the mod adjusts window lifecycle events.',
    ],
  },
];

export function normalizeProcessName(process: string): string {
  return process.includes('\\')
    ? process.substring(process.lastIndexOf('\\') + 1)
    : process;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeToken(token: string): string {
  if (token.endsWith('.exe')) {
    return token;
  }

  if (token.length > 4) {
    if (token.endsWith('ies')) {
      return token.slice(0, -3) + 'y';
    }

    if (token.endsWith('s') && !token.endsWith('ss')) {
      return token.slice(0, -1);
    }
  }

  return token;
}

function tokenize(value: string): string[] {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(' ')
    .map((token) => normalizeToken(token))
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const previous = new Array(b.length + 1).fill(0);
  const current = new Array(b.length + 1).fill(0);

  for (let j = 0; j <= b.length; j++) {
    previous[j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + substitutionCost
      );
    }

    for (let j = 0; j <= b.length; j++) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function fuzzySimilarity(queryToken: string, candidateToken: string): number {
  if (
    queryToken.length < 4 ||
    candidateToken.length < 4 ||
    Math.abs(queryToken.length - candidateToken.length) > 2
  ) {
    return 0;
  }

  const distance = levenshteinDistance(queryToken, candidateToken);
  const maxLength = Math.max(queryToken.length, candidateToken.length);
  return 1 - distance / maxLength;
}

function bestTokenMatchScore(queryToken: string, tokens: string[], value: string): number {
  if (tokens.length === 0 && !value) {
    return 0;
  }

  if (tokens.includes(queryToken)) {
    return 1;
  }

  for (const token of tokens) {
    if (
      token.startsWith(queryToken) ||
      (queryToken.startsWith(token) && token.length >= 4)
    ) {
      return 0.82;
    }
  }

  if (value.includes(queryToken) && queryToken.length >= 3) {
    return 0.68;
  }

  let bestFuzzyScore = 0;
  for (const token of tokens) {
    const similarity = fuzzySimilarity(queryToken, token);
    if (similarity >= 0.85) {
      bestFuzzyScore = Math.max(bestFuzzyScore, 0.62);
    } else if (similarity >= 0.75) {
      bestFuzzyScore = Math.max(bestFuzzyScore, 0.48);
    }
  }

  return bestFuzzyScore;
}

function matchesConcept(queryValue: string, concept: SearchConcept): boolean {
  if (!queryValue) {
    return false;
  }

  if (queryValue === concept.key || queryValue === normalizeText(concept.label)) {
    return true;
  }

  return concept.terms.some((term) => {
    const normalizedTerm = normalizeText(term);
    return queryValue.includes(normalizedTerm) || normalizedTerm.includes(queryValue);
  });
}

function inferConcepts(
  metadata: ModMetadata,
  modId: string
): SearchConcept[] {
  const title = metadata.name || '';
  const description = metadata.description || '';
  const author = metadata.author || '';
  const processes = unique(
    (metadata.include || [])
      .filter((process) => process && !process.includes('*') && !process.includes('?'))
      .map((process) => normalizeProcessName(process).toLowerCase())
  );

  const searchableText = normalizeText(
    [title, description, author, modId, ...processes].join(' ')
  );

  return SEARCH_CONCEPTS.filter((concept) => {
    const termMatch = concept.terms.some((term) =>
      searchableText.includes(normalizeText(term))
    );

    const processMatch = concept.processes.some((process) => {
      if (!processes.includes(process)) {
        return false;
      }

      // explorer.exe is too broad to imply every shell sub-domain on its own.
      if (
        process === 'explorer.exe' &&
        [
          'taskbar',
          'context-menu',
          'start-menu',
          'notifications',
          'desktop',
          'window-management',
        ].includes(concept.key)
      ) {
        return termMatch;
      }

      if (
        process === 'dwm.exe' &&
        ['window-management', 'alt-tab'].includes(concept.key)
      ) {
        return termMatch;
      }

      return true;
    });

    return processMatch || termMatch;
  });
}

function buildQueryProfile(query: string): QueryProfile {
  const normalized = normalizeText(query);
  const tokens = unique(tokenize(query));
  const concepts = SEARCH_CONCEPTS.filter((concept) =>
    matchesConcept(normalized, concept) ||
    tokens.some((token) => matchesConcept(token, concept))
  );

  const expandedTokens = unique(
    concepts.flatMap((concept) => [
      ...concept.terms.flatMap((term) => tokenize(term)),
      ...concept.processes.flatMap((process) => tokenize(process)),
    ])
  ).filter((token) => !tokens.includes(token));

  return {
    raw: query.trim(),
    normalized,
    tokens,
    concepts,
    expandedTokens,
  };
}

function buildModProfile(modId: string, mod: RepositoryModEntry): ModProfile {
  const metadata = mod.repository.metadata;
  const title = normalizeText(metadata.name || modId);
  const description = normalizeText(metadata.description || '');
  const author = normalizeText(metadata.author || '');
  const processes = unique(
    (metadata.include || [])
      .filter((process) => process && !process.includes('*') && !process.includes('?'))
      .map((process) => normalizeProcessName(process).toLowerCase())
  );
  const concepts = inferConcepts(metadata, modId);

  return {
    title,
    titleTokens: unique(tokenize(title)),
    id: normalizeText(modId),
    idTokens: unique(tokenize(modId)),
    description,
    descriptionTokens: unique(tokenize(description)),
    author,
    authorTokens: unique(tokenize(author)),
    processes,
    processTokens: unique(processes.flatMap((process) => tokenize(process))),
    concepts,
    searchableText: normalizeText(
      [
        metadata.name || modId,
        metadata.description || '',
        metadata.author || '',
        modId,
        ...processes,
        ...concepts.map((concept) => concept.label),
        ...concepts.flatMap((concept) => concept.terms),
      ].join(' ')
    ),
    fields: [
      {
        key: 'title',
        weight: 7,
        value: title,
        tokens: unique(tokenize(title)),
      },
      {
        key: 'id',
        weight: 6,
        value: normalizeText(modId),
        tokens: unique(tokenize(modId)),
      },
      {
        key: 'description',
        weight: 4,
        value: description,
        tokens: unique(tokenize(description)),
      },
      {
        key: 'author',
        weight: 2,
        value: author,
        tokens: unique(tokenize(author)),
      },
      {
        key: 'process',
        weight: 4,
        value: normalizeText(processes.join(' ')),
        tokens: unique(processes.flatMap((process) => tokenize(process))),
      },
    ],
  };
}

function buildSearchVocabulary(
  mods: [string, RepositoryModEntry][]
): VocabularyCandidate[] {
  const vocabulary = new Map<string, number>();

  const addTokens = (tokens: string[], weight: number) => {
    for (const token of tokens) {
      vocabulary.set(token, (vocabulary.get(token) || 0) + weight);
    }
  };

  addTokens(
    SEARCH_CONCEPTS.flatMap((concept) => tokenize(concept.label)),
    2.2
  );
  addTokens(
    SEARCH_CONCEPTS.flatMap((concept) => concept.terms.flatMap((term) => tokenize(term))),
    1.8
  );
  addTokens(
    SEARCH_CONCEPTS.flatMap((concept) => concept.processes.flatMap((process) => tokenize(process))),
    2
  );

  for (const [modId, mod] of mods) {
    const profile = buildModProfile(modId, mod);
    addTokens(profile.titleTokens, 3.2);
    addTokens(profile.idTokens, 2.9);
    addTokens(profile.descriptionTokens, 1.2);
    addTokens(profile.authorTokens, 0.8);
    addTokens(profile.processTokens, 2.4);
    addTokens(
      profile.concepts.flatMap((concept) => tokenize(concept.label)),
      1.7
    );
  }

  return Array.from(vocabulary.entries())
    .map(([token, weight]) => ({ token, weight }))
    .sort((a, b) => b.weight - a.weight || a.token.localeCompare(b.token));
}

function getTokenCorrection(
  token: string,
  vocabulary: VocabularyCandidate[]
): { token: string; score: number } | null {
  if (token.length < 4) {
    return null;
  }

  const exactMatch = vocabulary.find((candidate) => candidate.token === token);
  if (exactMatch) {
    return null;
  }

  let bestCandidate: { token: string; score: number } | null = null;

  for (const candidate of vocabulary) {
    if (Math.abs(candidate.token.length - token.length) > 2) {
      continue;
    }

    const similarity = fuzzySimilarity(token, candidate.token);
    if (similarity < 0.75) {
      continue;
    }

    let score = similarity + Math.min(candidate.weight / 20, 0.18);
    if (
      candidate.token.startsWith(token.slice(0, Math.min(3, token.length))) ||
      token.startsWith(candidate.token.slice(0, Math.min(3, candidate.token.length)))
    ) {
      score += 0.04;
    }

    if (!bestCandidate || score > bestCandidate.score) {
      bestCandidate = {
        token: candidate.token,
        score,
      };
    }
  }

  if (!bestCandidate || bestCandidate.score < 0.84) {
    return null;
  }

  return bestCandidate;
}

function buildRelaxedQueries(query: string): string[] {
  const tokens = tokenize(query);
  if (tokens.length <= 1) {
    return [];
  }

  return tokens
    .map((_, index) => tokens.filter((__, tokenIndex) => tokenIndex !== index).join(' '))
    .filter((candidate) => candidate.length > 0);
}

function compareAlphabetical(
  [modIdA, modA]: [string, RepositoryModEntry],
  [modIdB, modB]: [string, RepositoryModEntry]
): number {
  const modATitle = (modA.repository.metadata.name || modIdA).toLowerCase();
  const modBTitle = (modB.repository.metadata.name || modIdB).toLowerCase();

  if (modATitle < modBTitle) {
    return -1;
  }

  if (modATitle > modBTitle) {
    return 1;
  }

  if (modIdA < modIdB) {
    return -1;
  }

  if (modIdA > modIdB) {
    return 1;
  }

  return 0;
}

function compareBySortOrder(
  a: [string, RepositoryModEntry],
  b: [string, RepositoryModEntry],
  sortingOrder: Exclude<SortingOrder, 'smart-relevance'>
): number {
  const [, modA] = a;
  const [, modB] = b;

  switch (sortingOrder) {
    case 'popular-top-rated':
      if (modB.repository.details.defaultSorting !== modA.repository.details.defaultSorting) {
        return modB.repository.details.defaultSorting - modA.repository.details.defaultSorting;
      }
      break;

    case 'popular':
      if (modB.repository.details.users !== modA.repository.details.users) {
        return modB.repository.details.users - modA.repository.details.users;
      }
      break;

    case 'top-rated':
      if (modB.repository.details.rating !== modA.repository.details.rating) {
        return modB.repository.details.rating - modA.repository.details.rating;
      }
      break;

    case 'newest':
      if (modB.repository.details.published !== modA.repository.details.published) {
        return modB.repository.details.published - modA.repository.details.published;
      }
      break;

    case 'last-updated':
      if (modB.repository.details.updated !== modA.repository.details.updated) {
        return modB.repository.details.updated - modA.repository.details.updated;
      }
      break;

    case 'alphabetical':
      break;
  }

  return compareAlphabetical(a, b);
}

function qualityScore(details: RepositoryDetails): number {
  const popularity = Math.min(1, Math.log10(details.users + 10) / 5);
  const rating = Math.min(1, details.rating / 10);
  const recencyDays = Math.max(
    0,
    (Date.now() - details.updated) / (1000 * 60 * 60 * 24)
  );
  const recency = 1 / (1 + recencyDays / 180);
  const defaultRanking = Math.min(1, details.defaultSorting / 100);

  return (
    popularity * 0.35 +
    rating * 0.3 +
    recency * 0.2 +
    defaultRanking * 0.15
  );
}

function buildInsightLabel(fieldKey: SearchField['key'], mod: ModProfile): string {
  switch (fieldKey) {
    case 'title':
      return 'Name match';
    case 'id':
      return 'ID match';
    case 'description':
      return 'Description match';
    case 'author':
      return mod.author ? `Author: ${mod.author}` : 'Author match';
    case 'process':
      return mod.processes[0] ? `Process: ${mod.processes[0]}` : 'Process match';
  }
}

function buildBrowseInsights(
  mod: RepositoryModEntry,
  modProfile: ModProfile
): string[] {
  const insightScores = new Map<string, number>();
  const quality = qualityScore(mod.repository.details);
  const updatedDays =
    (Date.now() - mod.repository.details.updated) / (1000 * 60 * 60 * 24);
  const includesWildcards = (mod.repository.metadata.include || []).some(
    (entry) => entry.includes('*') || entry.includes('?')
  );

  if (quality >= 0.82) {
    insightScores.set('Community favorite', 0.69);
  } else if (quality >= 0.68) {
    insightScores.set('Popular', 0.63);
  }

  if (mod.repository.details.rating >= 8.5) {
    insightScores.set('Highly rated', 1.1);
  }

  if (updatedDays <= 45) {
    insightScores.set('Fresh update', 1.05);
  } else if (updatedDays <= 120) {
    insightScores.set('Recently updated', 0.8);
  }

  if (modProfile.concepts.length > 0) {
    insightScores.set(modProfile.concepts[0].label, 0.76);
  }

  if (includesWildcards) {
    insightScores.set('Broad reach', 0.62);
  } else if (modProfile.processes.length === 1) {
    insightScores.set(`Targets ${modProfile.processes[0]}`, 0.58);
  }

  if (mod.installed) {
    insightScores.set('Installed already', 0.54);
  }

  return Array.from(insightScores.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([label]) => label);
}

function scoreModAgainstQuery(
  modId: string,
  mod: RepositoryModEntry,
  query: QueryProfile
): RankedMod | null {
  const modProfile = buildModProfile(modId, mod);

  if (!query.tokens.length && !query.normalized) {
    return {
      modId,
      mod,
      discoveryScore: qualityScore(mod.repository.details),
      insights: buildBrowseInsights(mod, modProfile),
      inferredConcepts: modProfile.concepts.map((concept) => concept.label),
    };
  }

  let rawTokenScore = 0;
  let matchedTokenWeight = 0;
  const insightScores = new Map<string, number>();
  let typoMatched = false;

  for (const token of query.tokens) {
    let bestScore = 0;
    let bestField: SearchField | null = null;

    for (const field of modProfile.fields) {
      const matchScore = bestTokenMatchScore(token, field.tokens, field.value);
      const weightedScore = matchScore * field.weight;

      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestField = field;
      }

      if (matchScore >= 0.48 && matchScore < 0.68) {
        typoMatched = true;
      }
    }

    if (bestScore > 0) {
      rawTokenScore += bestScore;
      matchedTokenWeight += Math.min(1, bestScore / 5);
      if (bestField) {
        const label = buildInsightLabel(bestField.key, modProfile);
        insightScores.set(label, (insightScores.get(label) || 0) + bestScore);
      }
    }
  }

  let expansionScore = 0;
  for (const token of query.expandedTokens) {
    let bestExpandedScore = 0;
    for (const field of modProfile.fields) {
      bestExpandedScore = Math.max(
        bestExpandedScore,
        bestTokenMatchScore(token, field.tokens, field.value) * field.weight * 0.3
      );
    }
    expansionScore += bestExpandedScore;
  }

  const phraseMatch = query.normalized.length >= 3 &&
    modProfile.searchableText.includes(query.normalized);
  if (phraseMatch) {
    rawTokenScore += 3.2;
    matchedTokenWeight += 1;
    insightScores.set('Phrase match', (insightScores.get('Phrase match') || 0) + 3.2);
  }

  const sharedConcepts = modProfile.concepts.filter((concept) =>
    query.concepts.some((queryConcept) => queryConcept.key === concept.key)
  );

  let conceptScore = 0;
  for (const concept of sharedConcepts) {
    conceptScore += 2.2;
    insightScores.set(concept.label, (insightScores.get(concept.label) || 0) + 2.2);
  }

  const coverageTarget = Math.max(1, query.tokens.length);
  const coverage = matchedTokenWeight / coverageTarget;
  const hasMeaningfulMatch =
    phraseMatch ||
    coverage >= (query.tokens.length <= 1 ? 0.3 : 0.55) ||
    (sharedConcepts.length > 0 && coverage >= 0.25);

  if (!hasMeaningfulMatch) {
    return null;
  }

  const quality = qualityScore(mod.repository.details);
  const finalScore =
    rawTokenScore * 0.72 +
    expansionScore * 0.1 +
    conceptScore * 0.1 +
    quality * 1.4 +
    (mod.installed ? 0.2 : 0);

  if (quality > 0.72) {
    insightScores.set('Popular', (insightScores.get('Popular') || 0) + quality * 0.8);
  }

  if (mod.repository.details.rating >= 8) {
    insightScores.set(
      'Highly rated',
      (insightScores.get('Highly rated') || 0) + mod.repository.details.rating / 10
    );
  }

  const recentlyUpdatedDays = (Date.now() - mod.repository.details.updated) / (1000 * 60 * 60 * 24);
  if (recentlyUpdatedDays <= 120) {
    insightScores.set('Recently updated', (insightScores.get('Recently updated') || 0) + 0.8);
  }

  if (typoMatched) {
    insightScores.set('Fuzzy match', (insightScores.get('Fuzzy match') || 0) + 0.4);
  }

  const insights = Array.from(insightScores.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([label]) => label);

  if (typoMatched && !insights.includes('Fuzzy match')) {
    if (insights.length < 3) {
      insights.push('Fuzzy match');
    } else {
      insights[insights.length - 1] = 'Fuzzy match';
    }
  }

  return {
    modId,
    mod,
    discoveryScore: finalScore,
    insights,
    inferredConcepts: modProfile.concepts.map((concept) => concept.label),
  };
}

function diversifyTopResults(results: RankedMod[]): RankedMod[] {
  if (results.length <= 2) {
    return results;
  }

  const reranked: RankedMod[] = [];
  const remaining = [...results];
  const seenAuthors = new Map<string, number>();
  const seenProcesses = new Map<string, number>();
  const seenConcepts = new Map<string, number>();

  // Apply a lightweight MMR-style penalty so the first screen is less dominated
  // by one author or one process cluster.
  while (remaining.length > 0 && reranked.length < Math.min(40, results.length)) {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const author = candidate.mod.repository.metadata.author?.toLowerCase() || '';
      const processes = (candidate.mod.repository.metadata.include || [])
        .filter((process) => process && !process.includes('*') && !process.includes('?'))
        .map((process) => normalizeProcessName(process).toLowerCase());

      let penalty = 0;
      if (author) {
        penalty += (seenAuthors.get(author) || 0) * 0.55;
      }
      for (const process of processes) {
        penalty += (seenProcesses.get(process) || 0) * 0.22;
      }
      for (const concept of candidate.inferredConcepts) {
        penalty += (seenConcepts.get(concept) || 0) * 0.12;
      }

      const adjustedScore = candidate.discoveryScore - penalty;
      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestIndex = i;
      }
    }

    const [selected] = remaining.splice(bestIndex, 1);
    reranked.push(selected);

    const author = selected.mod.repository.metadata.author?.toLowerCase() || '';
    if (author) {
      seenAuthors.set(author, (seenAuthors.get(author) || 0) + 1);
    }

    for (const process of selected.mod.repository.metadata.include || []) {
      if (!process || process.includes('*') || process.includes('?')) {
        continue;
      }
      const normalizedProcess = normalizeProcessName(process).toLowerCase();
      seenProcesses.set(
        normalizedProcess,
        (seenProcesses.get(normalizedProcess) || 0) + 1
      );
    }

    for (const concept of selected.inferredConcepts) {
      seenConcepts.set(concept, (seenConcepts.get(concept) || 0) + 1);
    }
  }

  if (remaining.length === 0) {
    return reranked;
  }

  return [
    ...reranked,
    ...remaining.sort((a, b) => {
      if (b.discoveryScore !== a.discoveryScore) {
        return b.discoveryScore - a.discoveryScore;
      }
      return compareAlphabetical(
        [a.modId, a.mod],
        [b.modId, b.mod]
      );
    }),
  ];
}

export function getDiscoveryMissions(): DiscoveryMission[] {
  return DISCOVERY_MISSIONS;
}

export function getDiscoveryMissionByQuery(
  query: string,
  sortingOrder: SortingOrder
): DiscoveryMission | null {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return null;
  }

  return DISCOVERY_MISSIONS.find(
    (mission) =>
      normalizeText(mission.query) === normalizedQuery &&
      mission.sortingOrder === sortingOrder
  ) || null;
}

export function buildDiscoveryMissionCandidates(
  rankedMods: RankedMod[]
): DiscoveryMissionCandidate[] {
  return rankedMods.slice(0, 3).map((candidate) => {
    const metadata = candidate.mod.repository.metadata;
    const details = candidate.mod.repository.details;

    return {
      modId: candidate.modId,
      displayName: metadata.name || candidate.modId,
      author: metadata.author || 'Unknown author',
      insightSummary: candidate.insights.length > 0
        ? candidate.insights.join(' | ')
        : 'No extra signals yet',
      communitySummary: `${details.users.toLocaleString()} users | ${(details.rating / 2).toFixed(1)}/5`,
    };
  });
}

export function buildDiscoveryMissionBrief(
  mission: DiscoveryMission,
  rankedMods: RankedMod[]
): string {
  const topCandidates = rankedMods.slice(0, 4);
  const topCandidateLines = topCandidates.length > 0
    ? topCandidates.map((candidate, index) => {
      const displayName = candidate.mod.repository.metadata.name || candidate.modId;
      const insightSummary = candidate.insights.length > 0
        ? candidate.insights.join(', ')
        : 'No extra signals';

      return `${index + 1}. ${displayName} (${candidate.modId}) - ${insightSummary}`;
    })
    : ['1. No ranked mods were available for this mission yet.'];

  return `Help me compare Windhawk mods for a Windows customization mission.
Mission: ${mission.title}
Goal: ${mission.description}
Starting query: ${mission.query}
Suggested follow-up queries: ${mission.followUpQueries.join(', ')}
Manual verification priorities:
- ${mission.verificationChecks.join('\n- ')}
Top candidate mods:
${topCandidateLines.join('\n')}
Output:
1. The best 1-2 mods to try first and why
2. Tradeoffs, process scope, and compatibility risks
3. A short manual validation plan before keeping the change`;
}

export function rankMods(
  mods: [string, RepositoryModEntry][],
  query: string,
  sortingOrder: SortingOrder
): RankedMod[] {
  if (!query.trim()) {
    const fallbackSortingOrder =
      sortingOrder === 'smart-relevance' ? 'popular-top-rated' : sortingOrder;

    return [...mods]
      .sort((a, b) =>
        compareBySortOrder(
          a,
          b,
          fallbackSortingOrder as Exclude<SortingOrder, 'smart-relevance'>
        )
      )
      .map(([modId, mod]) => {
        const profile = buildModProfile(modId, mod);

        return {
          modId,
          mod,
          discoveryScore: qualityScore(mod.repository.details),
          insights: buildBrowseInsights(mod, profile),
          inferredConcepts: profile.concepts.map((concept) => concept.label),
        };
      });
  }

  const queryProfile = buildQueryProfile(query);
  const matched = mods
    .map(([modId, mod]) => scoreModAgainstQuery(modId, mod, queryProfile))
    .filter((item): item is RankedMod => item !== null);

  if (sortingOrder !== 'smart-relevance') {
    return matched.sort((a, b) =>
      compareBySortOrder(
        [a.modId, a.mod],
        [b.modId, b.mod],
        sortingOrder as Exclude<SortingOrder, 'smart-relevance'>
      )
    );
  }

  const ranked = matched.sort((a, b) => {
    if (b.discoveryScore !== a.discoveryScore) {
      return b.discoveryScore - a.discoveryScore;
    }

    return compareAlphabetical(
      [a.modId, a.mod],
      [b.modId, b.mod]
    );
  });

  return diversifyTopResults(ranked);
}

export function getSearchCorrection(
  mods: [string, RepositoryModEntry][],
  query: string
): SearchCorrection | null {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return null;
  }

  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return null;
  }

  const vocabulary = buildSearchVocabulary(mods);
  let correctedTokens = 0;
  const correctedQuery = tokens
    .map((token) => {
      const correction = getTokenCorrection(token, vocabulary);
      if (!correction) {
        return token;
      }

      correctedTokens++;
      return correction.token;
    })
    .join(' ');

  if (correctedTokens === 0 || correctedQuery === normalizedQuery) {
    return null;
  }

  return {
    correctedQuery,
    correctedTokens,
  };
}

export function getSearchRecovery(
  mods: [string, RepositoryModEntry][],
  query: string
): SearchRecovery | null {
  if (!query.trim()) {
    return null;
  }

  const rawResults = rankMods(mods, query, 'smart-relevance');
  if (rawResults.length > 0) {
    return null;
  }

  const correction = getSearchCorrection(mods, query);
  const candidateQueries: { query: string; reason: SearchRecovery['reason'] }[] = [];

  if (correction) {
    candidateQueries.push({
      query: correction.correctedQuery,
      reason: 'correction',
    });
  }

  for (const relaxedQuery of buildRelaxedQueries(
    correction?.correctedQuery || query
  )) {
    candidateQueries.push({
      query: relaxedQuery,
      reason: 'broadened',
    });
  }

  const dedupedCandidates = candidateQueries.filter(
    (candidate, index, candidates) =>
      normalizeText(candidate.query) !== normalizeText(query) &&
      candidates.findIndex(
        (otherCandidate) => normalizeText(otherCandidate.query) === normalizeText(candidate.query)
      ) === index
  );

  let bestRecovery: SearchRecovery | null = null;
  let bestRecoveryScore = Number.NEGATIVE_INFINITY;

  for (const candidate of dedupedCandidates) {
    const results = rankMods(mods, candidate.query, 'smart-relevance');
    if (results.length === 0) {
      continue;
    }

    const topScore = results[0]?.discoveryScore || 0;
    const averageTopScore =
      results
        .slice(0, 3)
        .reduce((sum, result) => sum + result.discoveryScore, 0) /
      Math.min(3, results.length);
    const recoveryScore =
      topScore * 0.7 +
      averageTopScore * 0.2 +
      Math.min(6, results.length) * 0.45 +
      (candidate.reason === 'correction' ? 0.35 : 0);

    if (recoveryScore > bestRecoveryScore) {
      bestRecoveryScore = recoveryScore;
      bestRecovery = {
        suggestedQuery: candidate.query,
        reason: candidate.reason,
        results: results.slice(0, 6),
      };
    }
  }

  return bestRecovery;
}

export function getRefinementSuggestions(
  rankedMods: RankedMod[],
  query: string
): RefinementSuggestion[] {
  if (!query.trim() || rankedMods.length === 0) {
    return [];
  }

  const queryProfile = buildQueryProfile(query);
  const queryConcepts = new Set(queryProfile.concepts.map((concept) => concept.label));
  const topResults = rankedMods.slice(0, 12);

  const conceptCounts = new Map<string, { count: number; queryText: string }>();
  for (const result of topResults) {
    for (const concept of result.inferredConcepts) {
      if (queryConcepts.has(concept)) {
        continue;
      }

      const matchingConcept = SEARCH_CONCEPTS.find(
        (searchConcept) => searchConcept.label === concept
      );
      const queryTextValue = matchingConcept?.queryText || concept.toLowerCase();
      const existing = conceptCounts.get(concept);
      conceptCounts.set(concept, {
        count: (existing?.count || 0) + 1,
        queryText: queryTextValue,
      });
    }
  }

  const processCounts = new Map<string, number>();
  for (const result of topResults) {
    for (const process of result.mod.repository.metadata.include || []) {
      if (!process || process.includes('*') || process.includes('?')) {
        continue;
      }

      const normalizedProcess = normalizeProcessName(process).toLowerCase();
      if (queryProfile.normalized.includes(normalizedProcess)) {
        continue;
      }

      processCounts.set(
        normalizedProcess,
        (processCounts.get(normalizedProcess) || 0) + 1
      );
    }
  }

  const conceptSuggestions = Array.from(conceptCounts.entries())
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([label, { queryText }]) => ({
      key: `concept:${label.toLowerCase()}`,
      label,
      queryText,
    }));

  const processSuggestions = Array.from(processCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 2)
    .map(([process]) => ({
      key: `process:${process}`,
      label: process,
      queryText: process,
    }));

  return [...conceptSuggestions, ...processSuggestions]
    .filter(
      (suggestion, index, suggestions) =>
        suggestions.findIndex((candidate) => candidate.key === suggestion.key) === index
    )
    .slice(0, 4);
}
