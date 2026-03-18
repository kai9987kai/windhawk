import React from 'react';
import {
  AppRuntimeDiagnostics,
  AppUISettings,
  EditorLaunchContext,
  EditorLaunchContextResource,
} from './webviewIPCMessages';

export type InterfaceDensity = 'comfortable' | 'compact';
export type PerformanceProfile = 'balanced' | 'responsive' | 'efficient';
export type AIAccelerationPreference = 'auto' | 'prefer-npu' | 'off';
export type CompileRecommendationMode =
  | 'balanced'
  | 'safe-first'
  | 'fast-feedback';
export type StartupPage = 'home' | 'explore' | 'settings' | 'about';
export type ExploreDefaultSort =
  | 'smart-relevance'
  | 'last-updated'
  | 'popular-top-rated';
export type EditorAssistanceLevel = 'streamlined' | 'guided' | 'full';
export type WindowsQuickActionDensity = 'focused' | 'expanded';
export type PreferredAuthoringLanguage = 'cpp' | 'python';
export type PreferredStudioMode = 'code' | 'visual';

export type LocalUISettings = {
  interfaceDensity: InterfaceDensity;
  reduceMotion: boolean;
  useWideLayout: boolean;
  performanceProfile: PerformanceProfile;
  aiAccelerationPreference: AIAccelerationPreference;
  compileRecommendationMode: CompileRecommendationMode;
  startupPage: StartupPage;
  exploreDefaultSort: ExploreDefaultSort;
  editorAssistanceLevel: EditorAssistanceLevel;
  windowsQuickActionDensity: WindowsQuickActionDensity;
  preferredAuthoringLanguage: PreferredAuthoringLanguage;
  preferredSourceExtension: '.wh.cpp' | '.wh.py';
  preferredStudioMode: PreferredStudioMode;
  recentStudioLaunches: EditorLaunchContext[];
};

export const defaultLocalUISettings: LocalUISettings = {
  interfaceDensity: 'comfortable',
  reduceMotion: false,
  useWideLayout: false,
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
};

export const localUISettingsStorageKey = 'windhawk.local-ui-settings.v1';

const createNewModTemplateKeys = [
  'default',
  'ai-ready',
  'structured-core',
  'explorer-shell',
  'chromium-browser',
  'window-behavior',
  'settings-lab',
  'python-automation',
] as const;

const recentStudioLaunchLimit = 6;

function getStorage(storage?: Storage | null) {
  if (storage !== undefined) {
    return storage ?? null;
  }

  return typeof window !== 'undefined' ? window.localStorage : null;
}

function isInterfaceDensity(value: unknown): value is InterfaceDensity {
  return value === 'comfortable' || value === 'compact';
}

function isPerformanceProfile(value: unknown): value is PerformanceProfile {
  return value === 'balanced' || value === 'responsive' || value === 'efficient';
}

function isAIAccelerationPreference(
  value: unknown
): value is AIAccelerationPreference {
  return value === 'auto' || value === 'prefer-npu' || value === 'off';
}

function isCompileRecommendationMode(
  value: unknown
): value is CompileRecommendationMode {
  return (
    value === 'balanced' ||
    value === 'safe-first' ||
    value === 'fast-feedback'
  );
}

function isStartupPage(value: unknown): value is StartupPage {
  return (
    value === 'home' ||
    value === 'explore' ||
    value === 'settings' ||
    value === 'about'
  );
}

function isExploreDefaultSort(value: unknown): value is ExploreDefaultSort {
  return (
    value === 'smart-relevance' ||
    value === 'last-updated' ||
    value === 'popular-top-rated'
  );
}

function isEditorAssistanceLevel(
  value: unknown
): value is EditorAssistanceLevel {
  return value === 'streamlined' || value === 'guided' || value === 'full';
}

function isWindowsQuickActionDensity(
  value: unknown
): value is WindowsQuickActionDensity {
  return value === 'focused' || value === 'expanded';
}

function isPreferredAuthoringLanguage(
  value: unknown
): value is PreferredAuthoringLanguage {
  return value === 'cpp' || value === 'python';
}

function isPreferredStudioMode(value: unknown): value is PreferredStudioMode {
  return value === 'code' || value === 'visual';
}

function isCreateNewModTemplateKey(
  value: unknown
): value is (typeof createNewModTemplateKeys)[number] {
  return createNewModTemplateKeys.includes(
    value as (typeof createNewModTemplateKeys)[number]
  );
}

function isEditorLaunchContextKind(
  value: unknown
): value is EditorLaunchContext['kind'] {
  return (
    value === 'starter' ||
    value === 'workflow' ||
    value === 'visual-preset'
  );
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  );
}

function normalizeLaunchResource(
  value: unknown
): EditorLaunchContextResource | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<Record<keyof EditorLaunchContextResource, unknown>>;

  if (
    typeof candidate.key !== 'string' ||
    !candidate.key.trim() ||
    typeof candidate.title !== 'string' ||
    !candidate.title.trim()
  ) {
    return null;
  }

  return {
    key: candidate.key,
    title: candidate.title,
    command:
      typeof candidate.command === 'string' && candidate.command.trim()
        ? candidate.command
        : undefined,
  };
}

function normalizeLaunchResources(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeLaunchResource(item))
    .filter((item): item is EditorLaunchContextResource => !!item);
}

export function normalizeEditorLaunchContext(
  value: unknown
): EditorLaunchContext | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<Record<keyof EditorLaunchContext, unknown>>;

  if (
    !isEditorLaunchContextKind(candidate.kind) ||
    typeof candidate.title !== 'string' ||
    !candidate.title.trim() ||
    typeof candidate.summary !== 'string' ||
    !candidate.summary.trim()
  ) {
    return null;
  }

  const checklist = normalizeStringArray(candidate.checklist);
  const tools = normalizeLaunchResources(candidate.tools);
  const prompts = normalizeLaunchResources(candidate.prompts);

  return {
    kind: candidate.kind,
    title: candidate.title,
    summary: candidate.summary,
    templateKey: isCreateNewModTemplateKey(candidate.templateKey)
      ? candidate.templateKey
      : undefined,
    studioMode: isPreferredStudioMode(candidate.studioMode)
      ? candidate.studioMode
      : undefined,
    authoringLanguage: isPreferredAuthoringLanguage(candidate.authoringLanguage)
      ? candidate.authoringLanguage
      : undefined,
    checklist: checklist.length > 0 ? checklist : undefined,
    tools: tools.length > 0 ? tools : undefined,
    prompts: prompts.length > 0 ? prompts : undefined,
    packet:
      typeof candidate.packet === 'string' && candidate.packet.trim()
        ? candidate.packet
        : undefined,
  };
}

export function normalizeRecentStudioLaunches(
  value: unknown
): EditorLaunchContext[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeEditorLaunchContext(item))
    .filter(
      (item): item is EditorLaunchContext =>
        !!item && item.templateKey !== undefined
    )
    .slice(0, recentStudioLaunchLimit);
}

function getRecentStudioLaunchKey(launchContext: EditorLaunchContext) {
  return [
    launchContext.kind,
    launchContext.templateKey,
    launchContext.title,
    launchContext.authoringLanguage ?? '',
    launchContext.studioMode ?? '',
  ].join('::');
}

export function recordRecentStudioLaunch(
  recentStudioLaunches: unknown,
  launchContext: unknown
) {
  const normalizedLaunchContext = normalizeEditorLaunchContext(launchContext);
  const currentRecentStudioLaunches =
    normalizeRecentStudioLaunches(recentStudioLaunches);

  if (!normalizedLaunchContext || !normalizedLaunchContext.templateKey) {
    return currentRecentStudioLaunches;
  }

  const launchKey = getRecentStudioLaunchKey(normalizedLaunchContext);

  return [
    normalizedLaunchContext,
    ...currentRecentStudioLaunches.filter(
      (item) => getRecentStudioLaunchKey(item) !== launchKey
    ),
  ].slice(0, recentStudioLaunchLimit);
}

function normalizeAuthoringPreferences(
  candidate: Partial<Record<keyof LocalUISettings, unknown>>
) {
  const preferredAuthoringLanguage = isPreferredAuthoringLanguage(
    candidate.preferredAuthoringLanguage
  )
    ? candidate.preferredAuthoringLanguage
    : candidate.preferredSourceExtension === '.wh.py'
      ? 'python'
      : defaultLocalUISettings.preferredAuthoringLanguage;

  return {
    preferredAuthoringLanguage,
    preferredSourceExtension:
      preferredAuthoringLanguage === 'python' ? '.wh.py' : '.wh.cpp',
  } as Pick<
    LocalUISettings,
    'preferredAuthoringLanguage' | 'preferredSourceExtension'
  >;
}

export function normalizeLocalUISettings(value: unknown): LocalUISettings {
  if (!value || typeof value !== 'object') {
    return defaultLocalUISettings;
  }

  const candidate = value as Partial<Record<keyof LocalUISettings, unknown>>;
  const authoringPreferences = normalizeAuthoringPreferences(candidate);

  return {
    interfaceDensity: isInterfaceDensity(candidate.interfaceDensity)
      ? candidate.interfaceDensity
      : defaultLocalUISettings.interfaceDensity,
    reduceMotion:
      typeof candidate.reduceMotion === 'boolean'
        ? candidate.reduceMotion
        : defaultLocalUISettings.reduceMotion,
    useWideLayout:
      typeof candidate.useWideLayout === 'boolean'
        ? candidate.useWideLayout
        : defaultLocalUISettings.useWideLayout,
    performanceProfile: isPerformanceProfile(candidate.performanceProfile)
      ? candidate.performanceProfile
      : defaultLocalUISettings.performanceProfile,
    aiAccelerationPreference: isAIAccelerationPreference(
      candidate.aiAccelerationPreference
    )
      ? candidate.aiAccelerationPreference
      : defaultLocalUISettings.aiAccelerationPreference,
    compileRecommendationMode: isCompileRecommendationMode(
      candidate.compileRecommendationMode
    )
      ? candidate.compileRecommendationMode
      : defaultLocalUISettings.compileRecommendationMode,
    startupPage: isStartupPage(candidate.startupPage)
      ? candidate.startupPage
      : defaultLocalUISettings.startupPage,
    exploreDefaultSort: isExploreDefaultSort(candidate.exploreDefaultSort)
      ? candidate.exploreDefaultSort
      : defaultLocalUISettings.exploreDefaultSort,
    editorAssistanceLevel: isEditorAssistanceLevel(
      candidate.editorAssistanceLevel
    )
      ? candidate.editorAssistanceLevel
      : defaultLocalUISettings.editorAssistanceLevel,
    windowsQuickActionDensity: isWindowsQuickActionDensity(
      candidate.windowsQuickActionDensity
    )
      ? candidate.windowsQuickActionDensity
      : defaultLocalUISettings.windowsQuickActionDensity,
    preferredAuthoringLanguage:
      authoringPreferences.preferredAuthoringLanguage,
    preferredSourceExtension: authoringPreferences.preferredSourceExtension,
    preferredStudioMode: isPreferredStudioMode(candidate.preferredStudioMode)
      ? candidate.preferredStudioMode
      : defaultLocalUISettings.preferredStudioMode,
    recentStudioLaunches: normalizeRecentStudioLaunches(
      candidate.recentStudioLaunches
    ),
  };
}

export function getRecommendedLocalUISettings(
  runtimeDiagnostics?: Partial<AppRuntimeDiagnostics> | null
): LocalUISettings {
  const recommendation = {
    ...defaultLocalUISettings,
  };

  if (!runtimeDiagnostics) {
    return recommendation;
  }

  const totalMemoryGb = runtimeDiagnostics.totalMemoryGb ?? 0;

  if (
    runtimeDiagnostics.issueCode !== undefined &&
    runtimeDiagnostics.issueCode !== 'none'
  ) {
    return {
      ...recommendation,
      interfaceDensity: 'compact',
      reduceMotion: true,
      performanceProfile: 'efficient',
      aiAccelerationPreference: runtimeDiagnostics.npuDetected
        ? 'prefer-npu'
        : 'auto',
      compileRecommendationMode: 'safe-first',
      startupPage: 'settings',
      editorAssistanceLevel: 'guided',
      windowsQuickActionDensity: 'focused',
    };
  }

  if (runtimeDiagnostics.npuDetected) {
    return {
      ...recommendation,
      useWideLayout: true,
      performanceProfile: 'responsive',
      aiAccelerationPreference: 'prefer-npu',
      compileRecommendationMode: 'fast-feedback',
      startupPage: 'explore',
    };
  }

  if (totalMemoryGb > 0 && totalMemoryGb <= 8) {
    return {
      ...recommendation,
      interfaceDensity: 'compact',
      reduceMotion: true,
      performanceProfile: 'efficient',
      aiAccelerationPreference: 'off',
      compileRecommendationMode: 'safe-first',
      editorAssistanceLevel: 'guided',
      windowsQuickActionDensity: 'focused',
    };
  }

  if (totalMemoryGb >= 16) {
    return {
      ...recommendation,
      useWideLayout: true,
      performanceProfile: 'responsive',
      aiAccelerationPreference: 'auto',
      compileRecommendationMode: 'fast-feedback',
      startupPage: 'explore',
    };
  }

  return recommendation;
}

export function mergeLocalUISettings(
  current: LocalUISettings,
  updates: Partial<LocalUISettings>
) {
  return normalizeLocalUISettings({
    ...current,
    ...updates,
  });
}

export function readLocalUISettings(storage?: Storage | null) {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return defaultLocalUISettings;
  }

  try {
    return normalizeLocalUISettings(
      JSON.parse(
        targetStorage.getItem(localUISettingsStorageKey) ?? 'null'
      )
    );
  } catch {
    return defaultLocalUISettings;
  }
}

export function hasStoredLocalUISettings(storage?: Storage | null) {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return false;
  }

  try {
    return targetStorage.getItem(localUISettingsStorageKey) !== null;
  } catch {
    return false;
  }
}

export function writeLocalUISettings(
  settings: LocalUISettings,
  storage?: Storage | null
) {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return;
  }

  try {
    targetStorage.setItem(
      localUISettingsStorageKey,
      JSON.stringify(settings)
    );
  } catch {
    // Ignore storage write errors so the UI remains usable in restricted hosts.
  }
}

export type AppUISettingsContextType = Partial<AppUISettings> & {
  localUISettings: LocalUISettings;
  setLocalUISettings: (updates: Partial<LocalUISettings>) => void;
  resetLocalUISettings: () => void;
  openSetupAssistant: () => void;
};

export const AppUISettingsContext =
  React.createContext<AppUISettingsContextType>({
    localUISettings: defaultLocalUISettings,
    setLocalUISettings: () => undefined,
    resetLocalUISettings: () => undefined,
    openSetupAssistant: () => undefined,
  });
