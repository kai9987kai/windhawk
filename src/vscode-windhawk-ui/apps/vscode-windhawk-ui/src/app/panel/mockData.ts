import vsCodeApi from '../vsCodeApi';

export const useMockData = !vsCodeApi;

export const mockAppUISettings = !useMockData
  ? null
  : {
    language: 'en',
    devModeOptOut: false,
    devModeUsedAtLeastOnce: false,
    loggingEnabled: false,
    updateIsAvailable: false,
    safeMode: false,
  };

export const mockSettings = !useMockData
  ? null
  : {
    language: 'en',
    disableUpdateCheck: false,
    disableRunUIScheduledTask: false,
    devModeOptOut: false,
    devModeUsedAtLeastOnce: false,
    hideTrayIcon: false,
    alwaysCompileModsLocally: false,
    parallelCompileTargets: true,
    preferPrecompiledHeaders: true,
    pythonAuthoringCommand: 'py',
    pythonAuthoringArgs: '-3',
    copilotCliCommand: 'python',
    copilotCliArgs: 'scripts\\windhawk_tool.py',
    dontAutoShowToolkit: false,
    modTasksDialogDelay: 2000,
    safeMode: false,
    loggingVerbosity: 0,
    engine: {
      loggingVerbosity: 0,
      include: ['a.exe', 'b.exe'],
      exclude: ['c.exe', 'd.exe'],
      injectIntoCriticalProcesses: false,
      injectIntoIncompatiblePrograms: false,
      injectIntoGames: false,
      usePhantomInjection: false,
      useModuleStomping: false,
      useIndirectSyscalls: true,
    },
  };

export const mockRuntimeDiagnostics = !useMockData
  ? null
  : {
    platformArch: 'arm64',
    arm64Enabled: true,
    portable: true,
    totalMemoryGb: 32,
    npuDetected: true,
    npuName: 'Qualcomm Hexagon NPU',
    windowsProductName: 'Windows 11 Pro',
    windowsDisplayVersion: '24H2',
    windowsBuild: '26100.2605',
    windowsInstallationType: 'Client',
    hostName: 'WORKSTATION-KAI',
    userName: 'kai99',
    isElevated: true,
    windowsDirectory: 'C:\\Windows',
    tempDirectory: 'C:\\Users\\kai99\\AppData\\Local\\Temp',
    engineConfigExists: true,
    enginePortable: false,
    engineConfigMatchesAppConfig: false,
    compilerAvailable: true,
    issueCode: 'engine-storage-mismatch' as const,
    appRootPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable',
    appDataPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\Data',
    enginePath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\Engine\\1.7.3',
    compilerPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\Compiler',
    uiPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\UI',
    expectedEngineAppDataPath: 'C:\\Users\\kai99\\AppData\\Local\\Programs\\Windhawk-Custom-Portable\\Data\\Engine',
    engineAppDataPath: 'C:\\ProgramData\\Windhawk\\Engine',
    expectedEngineRegistryKey: null,
    engineRegistryKey: 'HKLM\\SOFTWARE\\Windhawk\\Engine',
    repairAvailable: true,
  };

const mockModMetadata = {
  id: 'custom-message-box',
  name: 'Custom Message Box',
  description: 'Customizes the message box',
  version: '0.1',
  author: 'Michael Jackson',
  github: 'https://github.com/jackson',
  twitter: 'https://twitter.com/jackson',
  homepage: 'http://custom-message-box.com/',
  include: ['*'],
  exclude: ['explorer.exe'],
  license: 'MIT',
  donateUrl: 'https://example.com/donate',
};

const mockModMetadataOnline = {
  ...mockModMetadata,
  id: undefined,
  version: '0.2',
};

const mockModConfig = {
  libraryFileName: 'custom-message-box-123456.dll',
  disabled: false,
  loggingEnabled: false,
  debugLoggingEnabled: false,
  include: ['*'],
  exclude: ['explorer.exe'],
  includeCustom: [],
  excludeCustom: [],
  includeExcludeCustomOnly: false,
  patternsMatchCriticalSystemProcesses: true,
  architecture: ['x86-64'],
  version: '1.0',
};

const mockModDetails = {
  metadata: {},
  config: mockModConfig,
  updateAvailable: false,
  userRating: 0,
};

export const mockModsBrowserLocalInitialMods = !useMockData
  ? null
  : {
    'custom-message-box': {
      metadata: mockModMetadata,
      config: mockModConfig,
      updateAvailable: true,
      userRating: 4,
    },
    'local@asdf2': mockModDetails,
    asdf3: mockModDetails,
    asdf4: mockModDetails,
    asdf5: mockModDetails,
    asdf6: mockModDetails,
    asdf7: mockModDetails,
  };

export const mockModsBrowserLocalFeaturedMods = !useMockData
  ? null
  : {
    online1: {
      metadata: mockModMetadataOnline,
      details: {
        users: 111222333,
        rating: 5,
        ratingBreakdown: [1, 2, 16, 3, 5],
        defaultSorting: 2,
        published: 1618321977408,
        updated: 1718321977408,
      },
    },
  };

export const mockModsBrowserOnlineRepositoryMods = !useMockData
  ? null
  : {
    titanium_evasion_suite: {
      repository: {
        metadata: {
          name: 'Titanium Evasion Suite (Phase 7)',
          description: 'The ultimate 2026 EDR bypass. Utilizes an AI-Driven Polymorphism Engine, Ring -1 Hypervisor (VMM) stealth via EPT, and Data-Only ROP execution. Completely mathematically invisible.',
          version: '7.0',
          author: 'Nexus Engineering',
          github: 'https://github.com/windhawk/titanium-evasion',
          homepage: 'https://windhawk.net/evasion',
        },
        details: {
          users: 84320,
          rating: 5,
          ratingBreakdown: [0, 0, 5, 20, 800],
          defaultSorting: 9999, // Highlight at the top
          published: 1718321977408,
          updated: 1758321977408,
        },
      },
    },
    kernel_phantom_rootkit: {
      repository: {
        metadata: {
          name: 'Phantom Kernel Rootkit (Phase 5/6)',
          description: 'Deep kernel evasion and concealment. Deploys BYOVD EDR Blinder to silence kernel callbacks automatically and uses Minifilter Driver interfaces to vanish from disk and memory visibility.',
          version: '6.5',
          author: 'Nexus Engineering',
          github: 'https://github.com/windhawk/kernel-phantom',
          homepage: 'https://windhawk.net/rootkit',
        },
        details: {
          users: 56900,
          rating: 4.8,
          ratingBreakdown: [1, 2, 4, 150, 400],
          defaultSorting: 9998,
          published: 1718321900000,
          updated: 1758321900000,
        },
      },
    },
    uefi_system_escalator: {
      repository: {
        metadata: {
          name: 'UEFI SYSTEM Escalator (Phase 6)',
          description: 'Absolute persistence and dominance. Injects payload into Motherboard NVRAM variables for OS-reinstall survival, and immediately steals an NT AUTHORITY\\SYSTEM token upon boot execution.',
          version: '6.0',
          author: 'Nexus Engineering',
          github: 'https://github.com/windhawk/uefi-escalator',
          homepage: 'https://windhawk.net/escalate',
        },
        details: {
          users: 32050,
          rating: 4.9,
          ratingBreakdown: [0, 0, 10, 50, 600],
          defaultSorting: 9997,
          published: 1718321111111,
          updated: 1758321111111,
        },
      },
    },
    online1: {
      repository: {
        metadata: mockModMetadataOnline,
        details: {
          users: 111222333,
          rating: 5,
          ratingBreakdown: [1, 2, 16, 3, 5],
          defaultSorting: 2,
          published: 1618321977408,
          updated: 1718321977408,
        },
      },
      installed: {
        metadata: mockModMetadata,
        config: mockModConfig,
        userRating: 0,
      },
    },
    ...Object.fromEntries(
      Array(100)
        .fill(undefined)
        .map((e, i) => [
          `online${(i + 1).toString().padStart(3, '0')}`,
          {
            repository: {
              metadata: {
                name: `My Mod ${(i + 1).toString().padStart(3, '0')}`,
                description: 'A good mod',
                version: '1.2',
                author: 'John Smith',
                github: 'https://github.com/john',
                twitter: 'https://twitter.com/john',
                homepage: 'https://example.com/',
              },
              details: {
                users: 20,
                rating: 7,
                ratingBreakdown: [1, 2, 4, 8, 16],
                defaultSorting: 1,
                published: 1618321977408,
                updated: 1718321977408,
              },
            },
          },
        ])
    ),
  };

export const mockInstalledModSourceData = !useMockData
  ? null
  : {
    source: '// Mock local source...\n',
    metadata: mockModMetadata,
    readme: `# Mock readme...

| Month    | Savings |
| -------- | ------- |
| January  | $250    |
| February | $80     |
| March    | $420    |

More text...`,
    initialSettings: [
      {
        key: 'mock-setting',
        value: 'mock-setting-value',
        name: 'Mock Setting Name',
        description: 'Mock setting description',
      },
      {
        key: 'mock-setting-dropdown',
        value: 'a',
        name: 'Mock Setting Dropdown Name',
        description: 'Mock setting dropdown description',
        options: [
          { a: 'a option' } as Record<string, string>,
          { b: 'b option' } as Record<string, string>,
          { c: 'c option' } as Record<string, string>,
          { d: 'd option' } as Record<string, string>,
          { e: 'e option' } as Record<string, string>,
          { f: 'f option' } as Record<string, string>,
          { g: 'g option' } as Record<string, string>,
          { h: 'h option' } as Record<string, string>,
          { i: 'i option' } as Record<string, string>,
        ],
      },
      {
        key: 'mock-setting-array',
        value: ['a', 'b', 'c'],
        name: 'Mock Setting Array Name',
        description: 'Mock setting array description',
      },
      {
        key: 'mock-setting-nested-array',
        value: [
          [

            {
              key: 'mock-setting-nested',
              value: ['a', 'b', 'c'],
              name: 'Mock Setting Nested Name',
              description: 'Mock setting nested description',
            }
          ]
        ],
        name: 'Mock Setting Nested Array Name',
        description: 'Mock setting nested array description',
      },
    ],
  };

export const mockModSettings = !useMockData
  ? null
  : {
    'mock-setting': 'mock-setting-value',
    'mock-setting-dropdown': 'mock-setting-value',
    'mock-setting-array[0]': 'a',
    'mock-setting-array[1]': 'b',
    'mock-setting-array[2]': 'c',
  };

export const mockModVersions = !useMockData
  ? null
  : [
    {
      version: '0.3-alpha',
      timestamp: 1758321977, // Sep 20, 2025
      isPreRelease: true,
    },
    {
      version: '0.2',
      timestamp: 1718321977, // Jun 14, 2024
      isPreRelease: false,
    },
    {
      version: '0.1',
      timestamp: 1690444800, // Jul 27, 2023
      isPreRelease: false,
    },
    {
      version: '0.1-beta',
      timestamp: 1684454400, // May 19, 2023
      isPreRelease: true,
    },
  ];

export const mockModVersionSource = !useMockData
  ? null
  : (version: string) => ({
    source: `// Mock source for version ${version}...\n`,
    metadata: {
      ...mockModMetadata,
      version,
    },
    readme: `# Mock readme for version ${version}...\n`,
    initialSettings: [],
  });
