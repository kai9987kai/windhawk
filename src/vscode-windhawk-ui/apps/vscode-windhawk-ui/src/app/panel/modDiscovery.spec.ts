import {
  buildDiscoveryMissionCandidates,
  buildDiscoveryMissionBrief,
  getRefinementSuggestions,
  getDiscoveryMissions,
  getDiscoveryMissionByQuery,
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

  it('adds browse-mode insights even without a search query', () => {
    const mods = [
      createMod({
        modId: 'fresh-explorer',
        name: 'Fresh Explorer',
        description: 'Explorer quality-of-life tweaks.',
        users: 12000,
        rating: 9.4,
        updatedDaysAgo: 7,
      }),
    ];

    const ranked = rankMods(mods, '', 'smart-relevance');

    expect(ranked[0].insights).toEqual(
      expect.arrayContaining(['Fresh update', 'Explorer'])
    );
  });

  it('connects notification and context-menu queries to Windows shell concepts', () => {
    const mods = [
      createMod({
        modId: 'notification-center-plus',
        name: 'Notification Center Plus',
        description: 'Improve toast handling and quick settings flow.',
        include: ['ShellExperienceHost.exe'],
      }),
      createMod({
        modId: 'context-menu-cleanup',
        name: 'Context Menu Cleanup',
        description: 'Tidy right-click and shell menu entries in Explorer.',
        include: ['explorer.exe'],
      }),
    ];

    const notificationResults = rankMods(mods, 'notifications', 'smart-relevance');
    const contextMenuResults = rankMods(mods, 'context menu', 'smart-relevance');

    expect(notificationResults[0].modId).toBe('notification-center-plus');
    expect(notificationResults[0].insights).toContain('Notifications');
    expect(contextMenuResults[0].modId).toBe('context-menu-cleanup');
    expect(contextMenuResults[0].insights).toContain('Context menu');
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

    const labels = suggestions.map((suggestion) => suggestion.label);

    expect(
      labels.some((label) => ['Taskbar', 'Start menu', 'Desktop'].includes(label))
    ).toBe(true);
    expect(labels).not.toContain('Explorer');
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

  it('provides research missions with copy-ready AI briefs', () => {
    const mods = [
      createMod({
        modId: 'notification-center-plus',
        name: 'Notification Center Plus',
        description: 'Improve toast handling and quick settings flow.',
        include: ['ShellExperienceHost.exe'],
      }),
      createMod({
        modId: 'quiet-notifications',
        name: 'Quiet Notifications',
        description: 'Reduce shell interruption cost and noisy alerts.',
        include: ['explorer.exe'],
      }),
    ];

    const mission = getDiscoveryMissions().find(
      (candidate) => candidate.key === 'notification-calm'
    );

    expect(mission).toBeDefined();

    const ranked = rankMods(mods, mission?.query || '', mission?.sortingOrder || 'smart-relevance');
    const brief = buildDiscoveryMissionBrief(mission!, ranked);

    expect(brief).toContain('Calm notifications');
    expect(brief).toContain('Notification Center Plus');
    expect(brief).toContain('Top candidate mods');
    expect(brief).toContain('Manual verification priorities');
  });

  it('matches an active mission and summarizes its top candidates', () => {
    const mods = [
      createMod({
        modId: 'taskbar-focus',
        name: 'Taskbar Focus',
        description: 'Taskbar and tray cleanup for daily use.',
        author: 'Alice',
        users: 6000,
        rating: 9.2,
      }),
      createMod({
        modId: 'taskbar-alerts',
        name: 'Taskbar Alerts',
        description: 'Taskbar notification and tray tweaks.',
        author: 'Bob',
        users: 5500,
        rating: 9.0,
      }),
    ];

    const mission = getDiscoveryMissionByQuery('taskbar', 'smart-relevance');
    const ranked = rankMods(mods, 'taskbar', 'smart-relevance');
    const candidates = buildDiscoveryMissionCandidates(ranked);

    expect(mission?.key).toBe('taskbar-flow');
    expect(candidates).toHaveLength(2);
    expect(
      candidates.some(
        (candidate) =>
          candidate.displayName === 'Taskbar Focus' && candidate.author === 'Alice'
      )
    ).toBe(true);
    expect(candidates[0].communitySummary).toContain('users');
    expect(candidates[0].insightSummary.length).toBeGreaterThan(0);
  });
});
