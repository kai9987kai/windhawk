import {
  defaultLocalUISettings,
  getRecommendedLocalUISettings,
  hasStoredLocalUISettings,
  mergeLocalUISettings,
  normalizeLocalUISettings,
  readLocalUISettings,
  recordRecentStudioLaunch,
  writeLocalUISettings,
} from './appUISettings';

describe('appUISettings local preferences', () => {
  it('merges valid updates without dropping existing values', () => {
    expect(
      mergeLocalUISettings(defaultLocalUISettings, {
        interfaceDensity: 'compact',
        useWideLayout: true,
      })
    ).toEqual({
      interfaceDensity: 'compact',
      reduceMotion: false,
      useWideLayout: true,
      performanceProfile: 'balanced',
      aiAccelerationPreference: 'auto',
      compileRecommendationMode: 'balanced',
      startupPage: 'home',
      exploreDefaultSort: 'smart-relevance',
      editorAssistanceLevel: 'full',
      windowsQuickActionDensity: 'expanded',
      preferredAuthoringLanguage: 'cpp',
      preferredSourceExtension: '.wh.cpp',
      preferredStudioMode: 'code',
      recentStudioLaunches: [],
    });
  });

  it('falls back to defaults when persisted data is malformed', () => {
    const storage = {
      getItem: jest.fn(() => '{'),
      setItem: jest.fn(),
    } as unknown as Storage;

    expect(readLocalUISettings(storage)).toEqual(defaultLocalUISettings);
  });

  it('keeps authoring language and source extension aligned', () => {
    expect(
      normalizeLocalUISettings({
        preferredAuthoringLanguage: 'python',
        preferredSourceExtension: '.wh.cpp',
      })
    ).toMatchObject({
      preferredAuthoringLanguage: 'python',
      preferredSourceExtension: '.wh.py',
    });

    expect(
      normalizeLocalUISettings({
        preferredSourceExtension: '.wh.py',
      })
    ).toMatchObject({
      preferredAuthoringLanguage: 'python',
      preferredSourceExtension: '.wh.py',
    });
  });

  it('normalizes recent studio launches and drops broken entries', () => {
    expect(
      normalizeLocalUISettings({
        recentStudioLaunches: [
          {
            kind: 'workflow',
            title: 'Browser workflow',
            summary: 'Ship a browser-focused mod.',
            templateKey: 'chromium-browser',
            studioMode: 'visual',
            authoringLanguage: 'cpp',
            checklist: ['Inspect windows', 123, 'Verify shortcuts'],
            tools: [
              {
                key: 'status',
                title: 'Runtime status',
                command: 'python scripts/windhawk_tool.py --json detect',
              },
              {
                key: 42,
                title: 'Broken resource',
              },
            ],
            prompts: [
              {
                key: 'review',
                title: 'Review prompt',
              },
            ],
            packet: 'Launch: Browser workflow',
          },
          {
            kind: 'workflow',
            title: 'Broken launch',
            summary: 'Missing template key so it cannot relaunch.',
          },
        ],
      }).recentStudioLaunches
    ).toEqual([
      {
        kind: 'workflow',
        title: 'Browser workflow',
        summary: 'Ship a browser-focused mod.',
        templateKey: 'chromium-browser',
        studioMode: 'visual',
        authoringLanguage: 'cpp',
        checklist: ['Inspect windows', 'Verify shortcuts'],
        tools: [
          {
            key: 'status',
            title: 'Runtime status',
            command: 'python scripts/windhawk_tool.py --json detect',
          },
        ],
        prompts: [
          {
            key: 'review',
            title: 'Review prompt',
          },
        ],
        packet: 'Launch: Browser workflow',
      },
    ]);
  });

  it('keeps recent studio launches deduplicated and newest first', () => {
    expect(
      recordRecentStudioLaunch(
        [
          {
            kind: 'starter',
            title: 'Structured core starter',
            summary: 'Architecture-first scaffold',
            templateKey: 'structured-core',
            studioMode: 'code',
            authoringLanguage: 'cpp',
          },
          {
            kind: 'workflow',
            title: 'Shell workflow bundle',
            summary: 'Explorer shell work',
            templateKey: 'explorer-shell',
            studioMode: 'visual',
            authoringLanguage: 'cpp',
          },
        ],
        {
          kind: 'starter',
          title: 'Structured core starter',
          summary: 'Updated launch packet',
          templateKey: 'structured-core',
          studioMode: 'code',
          authoringLanguage: 'cpp',
          packet: 'Launch: Structured core starter',
        }
      )
    ).toEqual([
      {
        kind: 'starter',
        title: 'Structured core starter',
        summary: 'Updated launch packet',
        templateKey: 'structured-core',
        studioMode: 'code',
        authoringLanguage: 'cpp',
        packet: 'Launch: Structured core starter',
      },
      {
        kind: 'workflow',
        title: 'Shell workflow bundle',
        summary: 'Explorer shell work',
        templateKey: 'explorer-shell',
        studioMode: 'visual',
        authoringLanguage: 'cpp',
      },
    ]);
  });

  it('round-trips valid settings through storage', () => {
    let storedValue: string | null = null;
    const storage = {
      getItem: jest.fn(() => storedValue),
      setItem: jest.fn((key: string, value: string) => {
        storedValue = value;
      }),
    } as unknown as Storage;

    writeLocalUISettings(
      {
        interfaceDensity: 'compact',
        reduceMotion: true,
        useWideLayout: true,
        performanceProfile: 'responsive',
        aiAccelerationPreference: 'prefer-npu',
        compileRecommendationMode: 'fast-feedback',
        startupPage: 'explore',
        exploreDefaultSort: 'last-updated',
        editorAssistanceLevel: 'full',
        windowsQuickActionDensity: 'expanded',
        preferredAuthoringLanguage: 'python',
        preferredSourceExtension: '.wh.py',
        preferredStudioMode: 'visual',
        recentStudioLaunches: [
          {
            kind: 'visual-preset',
            title: 'Automation preset',
            summary: 'Start from automation outcomes.',
            templateKey: 'python-automation',
            studioMode: 'visual',
            authoringLanguage: 'python',
            packet: 'Launch: Automation preset',
          },
        ],
      },
      storage
    );

    expect(readLocalUISettings(storage)).toEqual({
      interfaceDensity: 'compact',
      reduceMotion: true,
      useWideLayout: true,
      performanceProfile: 'responsive',
      aiAccelerationPreference: 'prefer-npu',
      compileRecommendationMode: 'fast-feedback',
      startupPage: 'explore',
      exploreDefaultSort: 'last-updated',
      editorAssistanceLevel: 'full',
      windowsQuickActionDensity: 'expanded',
      preferredAuthoringLanguage: 'python',
      preferredSourceExtension: '.wh.py',
      preferredStudioMode: 'visual',
      recentStudioLaunches: [
        {
          kind: 'visual-preset',
          title: 'Automation preset',
          summary: 'Start from automation outcomes.',
          templateKey: 'python-automation',
          studioMode: 'visual',
          authoringLanguage: 'python',
          packet: 'Launch: Automation preset',
        },
      ],
    });
  });

  it('recommends responsive or efficient presets from runtime diagnostics', () => {
    expect(
      getRecommendedLocalUISettings({
        npuDetected: true,
        totalMemoryGb: 16,
        issueCode: 'none',
      })
    ).toMatchObject({
      performanceProfile: 'responsive',
      aiAccelerationPreference: 'prefer-npu',
      useWideLayout: true,
      compileRecommendationMode: 'fast-feedback',
      startupPage: 'explore',
    });

    expect(
      getRecommendedLocalUISettings({
        npuDetected: false,
        totalMemoryGb: 8,
        issueCode: 'none',
      })
    ).toMatchObject({
      interfaceDensity: 'compact',
      performanceProfile: 'efficient',
      aiAccelerationPreference: 'off',
      reduceMotion: true,
      compileRecommendationMode: 'safe-first',
      editorAssistanceLevel: 'guided',
    });
  });

  it('detects whether local settings were already persisted', () => {
    let storedValue: string | null = null;
    const storage = {
      getItem: jest.fn(() => storedValue),
      setItem: jest.fn((key: string, value: string) => {
        storedValue = value;
      }),
    } as unknown as Storage;

    expect(hasStoredLocalUISettings(storage)).toBe(false);

    writeLocalUISettings(defaultLocalUISettings, storage);

    expect(hasStoredLocalUISettings(storage)).toBe(true);
  });
});
