import {
  getRefinementSuggestions,
  getSearchCorrection,
  getSearchRecovery,
  rankMods,
  RepositoryModEntry,
} from './modDiscovery';

const NOW = new Date('2026-03-16T00:00:00Z').valueOf();

function createMod(overrides: Partial<RepositoryModEntry['repository']['metadata']> & {
  modId: string;
  users?: number;
  rating?: number;
  updatedDaysAgo?: number;
  defaultSorting?: number;
  author?: string;
  description?: string;
  include?: string[];
  name?: string;
}): [string, RepositoryModEntry] {
  const {
    modId,
    users = 1000,
    rating = 8,
    updatedDaysAgo = 30,
    defaultSorting = 50,
    author = 'Author',
    description = '',
    include = ['explorer.exe'],
    name = modId,
    ...metadata
  } = overrides;

  return [
    modId,
    {
      repository: {
        metadata: {
          name,
          description,
          author,
          include,
          version: '1.0.0',
          ...metadata,
        },
        details: {
          users,
          rating,
          ratingBreakdown: [0, 0, 2, 8, 20],
          defaultSorting,
          published: NOW - 120 * 24 * 60 * 60 * 1000,
          updated: NOW - updatedDaysAgo * 24 * 60 * 60 * 1000,
        },
      },
    },
  ];
}

describe('modDiscovery', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ranks typo-tolerant smart matches ahead of looser matches', () => {
    const mods = [
      createMod({
        modId: 'taskbar-tweaks',
        name: 'Taskbar Tweaks',
        description: 'Tune the tray clock and taskbar behavior.',
        author: 'Alice',
        users: 4000,
        rating: 9.2,
      }),
      createMod({
        modId: 'explorer-tabs',
        name: 'Explorer Tabs',
        description: 'Adds tabs to File Explorer.',
        author: 'Bob',
        users: 5000,
        rating: 9.4,
      }),
    ];

    const ranked = rankMods(
      mods,
      'taskbr tray',
      'smart-relevance'
    );

    expect(ranked[0].modId).toBe('taskbar-tweaks');
    expect(ranked[0].insights).toContain('Fuzzy match');
  });

  it('diversifies the first results instead of stacking one author cluster', () => {
    const mods = [
      createMod({
        modId: 'taskbar-clock',
        name: 'Taskbar Clock',
        description: 'Customize the taskbar clock.',
        author: 'Alice',
        users: 6000,
        rating: 9.5,
      }),
      createMod({
        modId: 'taskbar-labels',
        name: 'Taskbar Labels',
        description: 'Bring back taskbar labels.',
        author: 'Alice',
        users: 5900,
        rating: 9.4,
      }),
      createMod({
        modId: 'taskbar-alerts',
        name: 'Taskbar Alerts',
        description: 'Better taskbar notifications and tray alerts.',
        author: 'Bob',
        users: 5200,
        rating: 9.0,
      }),
    ];

    const ranked = rankMods(mods, 'taskbar', 'smart-relevance');

    expect(ranked[0].mod.repository.metadata.author).not.toBe(
      ranked[1].mod.repository.metadata.author
    );
  });

  it('keeps query filtering active when a non-smart sort order is selected', () => {
    const mods = [
      createMod({
        modId: 'z-taskbar',
        name: 'Z Taskbar',
        description: 'Taskbar tweaks and tray customizations.',
      }),
      createMod({
        modId: 'a-desktop',
        name: 'A Desktop',
        description: 'Desktop icons and wallpaper tweaks.',
      }),
      createMod({
        modId: 'a-taskbar',
        name: 'A Taskbar',
        description: 'Another taskbar customization.',
      }),
    ];

    const ranked = rankMods(mods, 'taskbar', 'alphabetical');

    expect(ranked.map((item) => item.modId)).toEqual(['a-taskbar', 'z-taskbar']);
  });

  it('suggests related refinements from the top matching concepts', () => {
    const mods = [
      createMod({
        modId: 'explorer-taskbar',
        name: 'Explorer Taskbar Toolkit',
        description: 'Explorer and taskbar tweaks in one mod.',
      }),
      createMod({
        modId: 'explorer-start-menu',
        name: 'Explorer Start Menu Tweaks',
        description: 'Explorer plus Start menu customization.',
        include: ['explorer.exe', 'StartMenuExperienceHost.exe'],
      }),
      createMod({
        modId: 'explorer-icons',
        name: 'Explorer Icons',
        description: 'Desktop and Explorer icon options.',
      }),
    ];

    const ranked = rankMods(mods, 'explorer', 'smart-relevance');
    const suggestions = getRefinementSuggestions(ranked, 'explorer');

    expect(
      suggestions.some((suggestion) => suggestion.label === 'Taskbar')
    ).toBe(true);
  });

  it('suggests a corrected query for likely misspellings', () => {
    const mods = [
      createMod({
        modId: 'taskbar-tweaks',
        name: 'Taskbar Tweaks',
        description: 'Taskbar and tray improvements.',
      }),
    ];

    const correction = getSearchCorrection(mods, 'taskbr');

    expect(correction).toEqual({
      correctedQuery: 'taskbar',
      correctedTokens: 1,
    });
  });

  it('recovers zero-result searches by broadening the corrected query', () => {
    const mods = [
      createMod({
        modId: 'taskbar-tweaks',
        name: 'Taskbar Tweaks',
        description: 'Taskbar and tray improvements.',
        author: 'Alice',
      }),
      createMod({
        modId: 'taskbar-clock',
        name: 'Taskbar Clock',
        description: 'Make the taskbar clock more useful.',
        author: 'Bob',
      }),
    ];

    const recovery = getSearchRecovery(mods, 'taskbr nonsense');

    expect(recovery?.suggestedQuery).toBe('taskbar');
    expect(recovery?.reason).toBe('broadened');
    expect(recovery?.results[0].modId).toBe('taskbar-clock');
  });
});
