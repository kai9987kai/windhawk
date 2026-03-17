import { getLocalModsOverview, matchesLocalModFilters } from './localModsInsights';

describe('localModsInsights', () => {
  const installedMods = {
    'local@taskbar-draft': {
      metadata: { name: 'Taskbar Draft' },
      config: null,
      updateAvailable: false,
    },
    'explorer-fix': {
      metadata: { name: 'Explorer Fix' },
      config: {
        disabled: false,
        loggingEnabled: true,
        debugLoggingEnabled: false,
        include: [],
        exclude: [],
        includeCustom: [],
        excludeCustom: [],
        includeExcludeCustomOnly: false,
        patternsMatchCriticalSystemProcesses: false,
        architecture: [],
        version: '1.0.0',
      },
      updateAvailable: true,
    },
  };

  it('summarizes local drafts and logging-enabled mods', () => {
    expect(getLocalModsOverview(installedMods)).toMatchObject({
      totalInstalled: 2,
      updates: 1,
      needsCompile: 1,
      needsAttention: 2,
      localDrafts: 1,
      loggingEnabled: 1,
    });
  });

  it('matches extended local mod filters', () => {
    expect(
      matchesLocalModFilters(
        'local@taskbar-draft',
        installedMods['local@taskbar-draft'],
        new Set(['local-drafts', 'needs-compile'])
      )
    ).toBe(true);

    expect(
      matchesLocalModFilters(
        'explorer-fix',
        installedMods['explorer-fix'],
        new Set(['logging-enabled'])
      )
    ).toBe(true);
  });
});
