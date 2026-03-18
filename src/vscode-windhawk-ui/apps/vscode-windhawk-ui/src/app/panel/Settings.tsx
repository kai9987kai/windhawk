import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Collapse,
  List,
  Modal,
  Select,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  AppUISettingsContext,
  getRecommendedLocalUISettings,
} from '../appUISettings';
import {
  InputWithContextMenu,
  InputNumberWithContextMenu,
  SelectModal,
  TextAreaWithContextMenu,
} from '../components/InputWithContextMenu';
import { sanitizeUrl } from '../utils';
import { useGetAppSettings, useUpdateAppSettings } from '../webviewIPC';
import { AppRuntimeDiagnostics, AppSettings } from '../webviewIPCMessages';
import { mockRuntimeDiagnostics, mockSettings } from './mockData';

const SettingsWrapper = styled.div`
  padding: 8px 0 28px;
`;

const SettingsHero = styled.section`
  margin-bottom: var(--app-section-gap);
  padding: calc(var(--app-card-padding) + 2px);
  border: 1px solid var(--app-surface-border);
  border-radius: var(--app-surface-radius);
  background:
    radial-gradient(circle at top right, rgba(23, 125, 220, 0.16), transparent 35%),
    var(--app-surface-background);
  box-shadow: var(--app-surface-shadow);
`;

const SettingsEyebrow = styled.div`
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const SettingsPageTitle = styled.h1`
  margin: 10px 0 8px;
  font-size: 34px;
  line-height: 1.05;
`;

const SettingsPageDescription = styled.p`
  max-width: 720px;
  margin-bottom: 18px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
`;

const StatusPillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const StatusPill = styled.span<{ $tone: 'default' | 'warning' | 'error' }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: var(--app-status-pill-height);
  padding: 0 14px 0 30px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
  font-weight: 600;

  &::before {
    content: '';
    position: absolute;
    left: 12px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ $tone }) => {
    switch ($tone) {
      case 'error':
        return '#ff7875';
      case 'warning':
        return '#ffc53d';
      default:
        return '#69c0ff';
    }
  }};
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--app-section-gap);
  align-items: start;
`;

const SettingsSectionCard = styled(Card)`
  border: 1px solid var(--app-surface-border);
  border-radius: var(--app-surface-radius);
  background: var(--app-surface-background);
  box-shadow: var(--app-surface-shadow);

  .ant-card-body {
    padding: var(--app-card-padding) var(--app-card-padding) 14px;
  }
`;

const AdvancedSettingsCard = styled(SettingsSectionCard)`
  grid-column: 1 / -1;
`;

const SectionHeading = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 18px;
`;

const SectionDescription = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
`;

const SettingsList = styled(List)`
  margin-bottom: 0;
`;

const SettingsListItemMeta = styled(List.Item.Meta)`
  .ant-list-item-meta {
    margin-bottom: 8px;
  }

  .ant-list-item-meta-title {
    margin-bottom: 0;
  }
`;

const SettingsSelect = styled(SelectModal)`
  width: 220px;
`;

const SettingsNotice = styled.div`
  margin-top: 14px;
  color: rgba(255, 255, 255, 0.45);
`;

const SettingsActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
`;

const SettingInputNumber = styled(InputNumberWithContextMenu)`
  width: 100%;
  max-width: 130px;

  input:focus {
    outline: none !important;
  }
`;

const SettingInput = styled(InputWithContextMenu)`
  width: 100%;
  max-width: 280px;
`;

const appLanguages = [
  ['en', 'English'],
  ...Object.entries({
    ar: 'العربية',
    cs: 'Čeština',
    da: 'Dansk',
    de: 'Deutsch',
    el: 'Ελληνικά',
    es: 'Español',
    fr: 'Français',
    hi: 'हिन्दी',
    hr: 'Hrvatski',
    hu: 'Magyar',
    id: 'Bahasa Indonesia',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    nl: 'Nederlands',
    pl: 'Polski',
    'pt-BR': 'Português',
    ro: 'Română',
    ru: 'Русский',
    sv: 'Svenska',
    ta: 'தமிழ்',
    th: 'ภาษาไทย',
    tr: 'Türkçe',
    uk: 'Українська',
    vi: 'Tiếng Việt',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
  }).sort((a, b) => a[1].localeCompare(b[1])),
];

function parseIntLax(value?: string | number | null) {
  const result = parseInt((value ?? 0).toString(), 10);
  return Number.isNaN(result) ? 0 : result;
}

function engineArrayToProcessList(processArray: string[]) {
  return processArray.join('\n');
}

function engineProcessListToArray(processList: string) {
  return processList
    .split('\n')
    .map((x) => x.replace(/["/<>|]/g, '').trim())
    .filter((x) => x);
}

function Settings() {
  const { t, i18n } = useTranslation();
  const appLanguage = i18n.resolvedLanguage;

  const {
    loggingEnabled,
    safeMode,
    localUISettings,
    openSetupAssistant,
    resetLocalUISettings,
    setLocalUISettings,
  } = useContext(AppUISettingsContext);

  const [appSettings, setAppSettings] = useState<Partial<AppSettings> | null>(
    mockSettings
  );
  const [runtimeDiagnostics, setRuntimeDiagnostics] =
    useState<AppRuntimeDiagnostics | null>(mockRuntimeDiagnostics);

  const [appLoggingVerbosity, setAppLoggingVerbosity] = useState(0);
  const [engineLoggingVerbosity, setEngineLoggingVerbosity] = useState(0);
  const [engineInclude, setEngineInclude] = useState('');
  const [engineExclude, setEngineExclude] = useState('');
  const [engineInjectIntoCriticalProcesses, setEngineInjectIntoCriticalProcesses] =
    useState(false);
  const [engineInjectIntoIncompatiblePrograms, setEngineInjectIntoIncompatiblePrograms] =
    useState(false);
  const [engineInjectIntoGames, setEngineInjectIntoGames] = useState(false);
  const [engineUsePhantomInjection, setEngineUsePhantomInjection] = useState(false);
  const [engineUseModuleStomping, setEngineUseModuleStomping] = useState(false);
  const [engineUseIndirectSyscalls, setEngineUseIndirectSyscalls] = useState(true);

  const resetMoreAdvancedSettings = useCallback(() => {
    setAppLoggingVerbosity(appSettings?.loggingVerbosity ?? 0);
    setEngineLoggingVerbosity(appSettings?.engine?.loggingVerbosity ?? 0);
    setEngineInclude(engineArrayToProcessList(appSettings?.engine?.include ?? []));
    setEngineExclude(engineArrayToProcessList(appSettings?.engine?.exclude ?? []));
    setEngineInjectIntoCriticalProcesses(
      appSettings?.engine?.injectIntoCriticalProcesses ?? false
    );
    setEngineInjectIntoIncompatiblePrograms(
      appSettings?.engine?.injectIntoIncompatiblePrograms ?? false
    );
    setEngineInjectIntoGames(appSettings?.engine?.injectIntoGames ?? false);
    setEngineUsePhantomInjection(appSettings?.engine?.usePhantomInjection ?? false);
    setEngineUseModuleStomping(appSettings?.engine?.useModuleStomping ?? false);
    setEngineUseIndirectSyscalls(appSettings?.engine?.useIndirectSyscalls ?? true);
  }, [appSettings]);

  const { getAppSettings } = useGetAppSettings(
    useCallback((data) => {
      setAppSettings(data.appSettings);
      setRuntimeDiagnostics(data.runtimeDiagnostics || null);
    }, [])
  );

  useEffect(() => {
    getAppSettings({});
  }, [getAppSettings]);

  const { updateAppSettings } = useUpdateAppSettings(
    useCallback(
      (data) => {
        if (data.succeeded && appSettings) {
          setAppSettings({
            ...appSettings,
            ...data.appSettings,
          });
        }
      },
      [appSettings]
    )
  );

  const [isMoreAdvancedSettingsModalOpen, setIsMoreAdvancedSettingsModalOpen] =
    useState(false);

  const recommendedLocalUISettings = useMemo(
    () => getRecommendedLocalUISettings(runtimeDiagnostics),
    [runtimeDiagnostics]
  );

  const getPerformanceProfileLabel = useCallback(
    (profile: 'balanced' | 'responsive' | 'efficient') => {
      switch (profile) {
        case 'responsive':
          return t('settings.performance.profile.options.responsive');
        case 'efficient':
          return t('settings.performance.profile.options.efficient');
        case 'balanced':
        default:
          return t('settings.performance.profile.options.balanced');
      }
    },
    [t]
  );

  const getAIAccelerationLabel = useCallback(
    (preference: 'auto' | 'prefer-npu' | 'off') => {
      switch (preference) {
        case 'prefer-npu':
          return t('settings.performance.aiAcceleration.options.preferNpu');
        case 'off':
          return t('settings.performance.aiAcceleration.options.off');
        case 'auto':
        default:
          return t('settings.performance.aiAcceleration.options.auto');
      }
    },
    [t]
  );

  const getStartupPageLabel = useCallback(
    (startupPage: 'home' | 'explore' | 'settings' | 'about') => {
      switch (startupPage) {
        case 'explore':
          return t('settings.workflow.startupPage.options.explore');
        case 'settings':
          return t('settings.workflow.startupPage.options.settings');
        case 'about':
          return t('settings.workflow.startupPage.options.about');
        case 'home':
        default:
          return t('settings.workflow.startupPage.options.home');
      }
    },
    [t]
  );

  const getExploreDefaultSortLabel = useCallback(
    (
      sortPreference:
        | 'smart-relevance'
        | 'last-updated'
        | 'popular-top-rated'
    ) => {
      switch (sortPreference) {
        case 'last-updated':
          return t('settings.workflow.exploreDefaultSort.options.lastUpdated');
        case 'popular-top-rated':
          return t(
            'settings.workflow.exploreDefaultSort.options.popularTopRated'
          );
        case 'smart-relevance':
        default:
          return t(
            'settings.workflow.exploreDefaultSort.options.smartRelevance'
          );
      }
    },
    [t]
  );

  const getEditorAssistanceLabel = useCallback(
    (assistanceLevel: 'streamlined' | 'guided' | 'full') => {
      switch (assistanceLevel) {
        case 'streamlined':
          return t('settings.workflow.editorAssistance.options.streamlined');
        case 'guided':
          return t('settings.workflow.editorAssistance.options.guided');
        case 'full':
        default:
          return t('settings.workflow.editorAssistance.options.full');
      }
    },
    [t]
  );

  const getWindowsQuickActionDensityLabel = useCallback(
    (density: 'focused' | 'expanded') => {
      switch (density) {
        case 'focused':
          return t('settings.workflow.windowsQuickActions.options.focused');
        case 'expanded':
        default:
          return t('settings.workflow.windowsQuickActions.options.expanded');
      }
    },
    [t]
  );

  const getAuthoringLanguageLabel = useCallback(
    (language: 'cpp' | 'python') =>
      language === 'python'
        ? t('settings.authoring.language.options.python')
        : t('settings.authoring.language.options.cpp'),
    [t]
  );

  const getStudioModeLabel = useCallback(
    (mode: 'code' | 'visual') =>
      mode === 'visual'
        ? t('settings.authoring.studioMode.options.visual')
        : t('settings.authoring.studioMode.options.code'),
    [t]
  );

  const performanceRecommendationDescription = useMemo(() => {
    if (!runtimeDiagnostics) {
      return t('settings.performance.recommendationFallback');
    }

    if (runtimeDiagnostics.issueCode !== 'none') {
      return t('settings.performance.recommendationIssue', {
        profile: getPerformanceProfileLabel(
          recommendedLocalUISettings.performanceProfile
        ),
      });
    }

    if (runtimeDiagnostics.npuDetected) {
      return t('settings.performance.recommendationNpu', {
        npu:
          runtimeDiagnostics.npuName ||
          t('settings.performance.values.detected'),
      });
    }

    if (runtimeDiagnostics.totalMemoryGb <= 8) {
      return t('settings.performance.recommendationEfficient', {
        memory: runtimeDiagnostics.totalMemoryGb,
      });
    }

    if (runtimeDiagnostics.totalMemoryGb >= 16) {
      return t('settings.performance.recommendationResponsive', {
        memory: runtimeDiagnostics.totalMemoryGb,
      });
    }

    return t('settings.performance.recommendationBalanced');
  }, [
    getPerformanceProfileLabel,
    recommendedLocalUISettings.performanceProfile,
    runtimeDiagnostics,
    t,
  ]);

  const recommendedSettingsAlreadyApplied =
    localUISettings.performanceProfile ===
      recommendedLocalUISettings.performanceProfile &&
    localUISettings.aiAccelerationPreference ===
      recommendedLocalUISettings.aiAccelerationPreference &&
    localUISettings.reduceMotion === recommendedLocalUISettings.reduceMotion &&
    localUISettings.useWideLayout === recommendedLocalUISettings.useWideLayout;

  const workflowSummary = useMemo(
    () =>
      t('settings.workflow.currentSummary', {
        startup: getStartupPageLabel(localUISettings.startupPage),
        explore: getExploreDefaultSortLabel(localUISettings.exploreDefaultSort),
        editor: getEditorAssistanceLabel(localUISettings.editorAssistanceLevel),
        windows: getWindowsQuickActionDensityLabel(
          localUISettings.windowsQuickActionDensity
        ),
      }),
    [
      getEditorAssistanceLabel,
      getExploreDefaultSortLabel,
      getStartupPageLabel,
      getWindowsQuickActionDensityLabel,
      localUISettings.editorAssistanceLevel,
      localUISettings.exploreDefaultSort,
      localUISettings.startupPage,
      localUISettings.windowsQuickActionDensity,
      t,
    ]
  );

  const authoringSummary = useMemo(
    () =>
      t('settings.authoring.currentSummary', {
        language: getAuthoringLanguageLabel(
          localUISettings.preferredAuthoringLanguage
        ),
        extension: localUISettings.preferredSourceExtension,
        studio: getStudioModeLabel(localUISettings.preferredStudioMode),
      }),
    [
      getAuthoringLanguageLabel,
      getStudioModeLabel,
      localUISettings.preferredAuthoringLanguage,
      localUISettings.preferredSourceExtension,
      localUISettings.preferredStudioMode,
      t,
    ]
  );

  const statusItems = useMemo(() => {
    const items = [];

    if (!appSettings?.disableUpdateCheck) {
      items.push({
        key: 'updates',
        text: t('settings.overview.updatesEnabled'),
        tone: 'default' as const,
      });
    }

    if (loggingEnabled) {
      items.push({
        key: 'logging',
        text: t('settings.overview.debugLogging'),
        tone: 'warning' as const,
      });
    }

    if (safeMode) {
      items.push({
        key: 'safe-mode',
        text: t('settings.overview.safeMode'),
        tone: 'warning' as const,
      });
    }

    if (!appSettings?.devModeOptOut) {
      items.push({
        key: 'dev-mode',
        text: t('settings.overview.devMode'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.interfaceDensity === 'compact') {
      items.push({
        key: 'compact-layout',
        text: t('settings.overview.compactLayout'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.useWideLayout) {
      items.push({
        key: 'wide-layout',
        text: t('settings.overview.wideLayout'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.reduceMotion) {
      items.push({
        key: 'reduce-motion',
        text: t('settings.overview.reduceMotion'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.performanceProfile === 'responsive') {
      items.push({
        key: 'responsive-profile',
        text: t('settings.overview.responsiveProfile'),
        tone: 'default' as const,
      });
    } else if (localUISettings.performanceProfile === 'efficient') {
      items.push({
        key: 'efficient-profile',
        text: t('settings.overview.efficientProfile'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.aiAccelerationPreference === 'prefer-npu') {
      items.push({
        key: 'prefer-npu',
        text: t('settings.overview.npuPreferred'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.startupPage === 'explore') {
      items.push({
        key: 'startup-explore',
        text: t('settings.overview.startupExplore'),
        tone: 'default' as const,
      });
    } else if (localUISettings.startupPage === 'settings') {
      items.push({
        key: 'startup-settings',
        text: t('settings.overview.startupSettings'),
        tone: 'default' as const,
      });
    } else if (localUISettings.startupPage === 'about') {
      items.push({
        key: 'startup-about',
        text: t('settings.overview.startupAbout'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.exploreDefaultSort === 'last-updated') {
      items.push({
        key: 'explore-fresh',
        text: t('settings.overview.exploreFresh'),
        tone: 'default' as const,
      });
    } else if (localUISettings.exploreDefaultSort === 'popular-top-rated') {
      items.push({
        key: 'explore-popular',
        text: t('settings.overview.explorePopular'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.editorAssistanceLevel === 'streamlined') {
      items.push({
        key: 'editor-streamlined',
        text: t('settings.overview.editorStreamlined'),
        tone: 'default' as const,
      });
    } else if (localUISettings.editorAssistanceLevel === 'guided') {
      items.push({
        key: 'editor-guided',
        text: t('settings.overview.editorGuided'),
        tone: 'default' as const,
      });
    }

    if (localUISettings.windowsQuickActionDensity === 'focused') {
      items.push({
        key: 'windows-focused',
        text: t('settings.overview.windowsFocused'),
        tone: 'default' as const,
      });
    }

    return items;
  }, [
    appSettings?.devModeOptOut,
    appSettings?.disableUpdateCheck,
    localUISettings,
    loggingEnabled,
    safeMode,
    t,
  ]);

  if (!appSettings) {
    return null;
  }

  const includeListEmpty = engineInclude.trim() === '';
  const excludeListEmpty =
    engineExclude.trim() === '' &&
    engineInjectIntoCriticalProcesses &&
    engineInjectIntoIncompatiblePrograms &&
    engineInjectIntoGames;
  const excludeListHasWildcard = !!engineExclude.match(/^[ \t]*\*[ \t]*$/m);

  return (
    <SettingsWrapper>
      <SettingsHero>
        <SettingsEyebrow>{t('appHeader.settings')}</SettingsEyebrow>
        <SettingsPageTitle>{t('settings.pageTitle')}</SettingsPageTitle>
        <SettingsPageDescription>
          {t('settings.pageDescription')}
        </SettingsPageDescription>
        <StatusPillRow>
          {statusItems.length > 0 ? (
            statusItems.map(({ key, text, tone }) => (
              <StatusPill key={key} $tone={tone}>
                {text}
              </StatusPill>
            ))
          ) : (
            <StatusPill $tone="default">
              {t('settings.overview.allClear')}
            </StatusPill>
          )}
        </StatusPillRow>
      </SettingsHero>

      <SettingsGrid>
        <SettingsSectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('settings.core.title')}</SectionTitle>
            <SectionDescription>{t('settings.core.description')}</SectionDescription>
          </SectionHeading>
          <SettingsList itemLayout="vertical" split={false}>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.language.title')}
                description={
                  <>
                    <div>{t('settings.language.description')}</div>
                    <div>
                      <Trans
                        t={t}
                        i18nKey="settings.language.contribute"
                        components={[
                          <a href="https://github.com/ramensoftware/windhawk/wiki/translations">
                            website
                          </a>,
                        ]}
                      />
                    </div>
                  </>
                }
              />
              <SettingsSelect
                showSearch
                optionFilterProp="children"
                value={appLanguage}
                onChange={(value) => {
                  updateAppSettings({
                    appSettings: {
                      language: typeof value === 'string' ? value : 'en',
                    },
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                {appLanguages.map(([languageId, languageDisplayName]) => (
                  <Select.Option key={languageId} value={languageId}>
                    {languageDisplayName}
                  </Select.Option>
                ))}
              </SettingsSelect>
              {appLanguage !== 'en' && (
                <SettingsNotice>
                  <Trans
                    t={t}
                    i18nKey="settings.language.credits"
                    components={[
                      <a
                        href={sanitizeUrl(
                          t('settings.language.creditsLink') as string
                        )}
                      >
                        website
                      </a>,
                    ]}
                  />
                </SettingsNotice>
              )}
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.updates.title')}
                description={t('settings.updates.description')}
              />
              <Switch
                checked={!appSettings.disableUpdateCheck}
                onChange={(checked) => {
                  updateAppSettings({
                    appSettings: {
                      disableUpdateCheck: !checked,
                    },
                  });
                }}
              />
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.devMode.title')}
                description={t('settings.devMode.description')}
              />
              <Switch
                checked={!appSettings.devModeOptOut}
                onChange={(checked) => {
                  updateAppSettings({
                    appSettings: {
                      devModeOptOut: !checked,
                    },
                  });
                }}
              />
            </List.Item>
          </SettingsList>
        </SettingsSectionCard>

        <SettingsSectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('settings.interface.title')}</SectionTitle>
            <SectionDescription>
              {t('settings.interface.description')}
            </SectionDescription>
          </SectionHeading>
          <SettingsList itemLayout="vertical" split={false}>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.interface.layoutDensity.title')}
                description={t('settings.interface.layoutDensity.description')}
              />
              <SettingsSelect
                value={localUISettings.interfaceDensity}
                onChange={(value) => {
                  setLocalUISettings({
                    interfaceDensity:
                      value === 'compact' ? 'compact' : 'comfortable',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="comfortable" value="comfortable">
                  {t('settings.interface.layoutDensity.comfortable')}
                </Select.Option>
                <Select.Option key="compact" value="compact">
                  {t('settings.interface.layoutDensity.compact')}
                </Select.Option>
              </SettingsSelect>
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.interface.wideLayout.title')}
                description={t('settings.interface.wideLayout.description')}
              />
              <Switch
                checked={localUISettings.useWideLayout}
                onChange={(checked) => {
                  setLocalUISettings({
                    useWideLayout: checked,
                  });
                }}
              />
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.interface.reduceMotion.title')}
                description={t('settings.interface.reduceMotion.description')}
              />
              <Switch
                checked={localUISettings.reduceMotion}
                onChange={(checked) => {
                  setLocalUISettings({
                    reduceMotion: checked,
                  });
                }}
              />
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.interface.resetButton')}
                description={t('settings.interface.resetDescription')}
              />
              <SettingsActionRow>
                <Button onClick={() => resetLocalUISettings()}>
                  {t('settings.interface.resetButton')}
                </Button>
              </SettingsActionRow>
            </List.Item>
          </SettingsList>
        </SettingsSectionCard>

        <SettingsSectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('settings.performance.title')}</SectionTitle>
            <SectionDescription>
              {t('settings.performance.description')}
            </SectionDescription>
          </SectionHeading>
          <Alert
            showIcon
            type={recommendedSettingsAlreadyApplied ? 'success' : 'info'}
            message={t('settings.performance.recommendationTitle', {
              profile: getPerformanceProfileLabel(
                recommendedLocalUISettings.performanceProfile
              ),
            })}
            description={
              <Space direction="vertical" size={10}>
                <div>{performanceRecommendationDescription}</div>
                <div>
                  {t('settings.performance.hardwareSummary', {
                    memory:
                      runtimeDiagnostics?.totalMemoryGb ??
                      t('settings.performance.values.unknown'),
                    npu:
                      runtimeDiagnostics?.npuName ||
                      (runtimeDiagnostics?.npuDetected
                        ? t('settings.performance.values.detected')
                        : t('settings.performance.values.none')),
                  })}
                </div>
                <SettingsActionRow>
                  <Button
                    type={recommendedSettingsAlreadyApplied ? 'default' : 'primary'}
                    disabled={recommendedSettingsAlreadyApplied}
                    onClick={() =>
                      setLocalUISettings({
                        performanceProfile:
                          recommendedLocalUISettings.performanceProfile,
                        aiAccelerationPreference:
                          recommendedLocalUISettings.aiAccelerationPreference,
                        reduceMotion: recommendedLocalUISettings.reduceMotion,
                        useWideLayout: recommendedLocalUISettings.useWideLayout,
                      })
                    }
                  >
                    {t('settings.performance.applyRecommendation')}
                  </Button>
                </SettingsActionRow>
              </Space>
            }
          />
          <SettingsList itemLayout="vertical" split={false}>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.performance.profile.title')}
                description={t('settings.performance.profile.description')}
              />
              <SettingsSelect
                value={localUISettings.performanceProfile}
                onChange={(value) => {
                  setLocalUISettings({
                    performanceProfile:
                      value === 'responsive'
                        ? 'responsive'
                        : value === 'efficient'
                          ? 'efficient'
                          : 'balanced',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="balanced" value="balanced">
                  {t('settings.performance.profile.options.balanced')}
                </Select.Option>
                <Select.Option key="responsive" value="responsive">
                  {t('settings.performance.profile.options.responsive')}
                </Select.Option>
                <Select.Option key="efficient" value="efficient">
                  {t('settings.performance.profile.options.efficient')}
                </Select.Option>
              </SettingsSelect>
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.performance.aiAcceleration.title')}
                description={t('settings.performance.aiAcceleration.description')}
              />
              <SettingsSelect
                value={localUISettings.aiAccelerationPreference}
                onChange={(value) => {
                  setLocalUISettings({
                    aiAccelerationPreference:
                      value === 'prefer-npu'
                        ? 'prefer-npu'
                        : value === 'off'
                          ? 'off'
                          : 'auto',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="auto" value="auto">
                  {t('settings.performance.aiAcceleration.options.auto')}
                </Select.Option>
                <Select.Option key="prefer-npu" value="prefer-npu">
                  {t('settings.performance.aiAcceleration.options.preferNpu')}
                </Select.Option>
                <Select.Option key="off" value="off">
                  {t('settings.performance.aiAcceleration.options.off')}
                </Select.Option>
              </SettingsSelect>
              <SettingsNotice>
                {t('settings.performance.currentSummary', {
                  performance: getPerformanceProfileLabel(
                    localUISettings.performanceProfile
                  ),
                  acceleration: getAIAccelerationLabel(
                    localUISettings.aiAccelerationPreference
                  ),
                })}
              </SettingsNotice>
            </List.Item>
          </SettingsList>
        </SettingsSectionCard>

        <SettingsSectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('settings.workflow.title')}</SectionTitle>
            <SectionDescription>{t('settings.workflow.description')}</SectionDescription>
          </SectionHeading>
          <SettingsList itemLayout="vertical" split={false}>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.workflow.startupPage.title')}
                description={t('settings.workflow.startupPage.description')}
              />
              <SettingsSelect
                value={localUISettings.startupPage}
                onChange={(value) => {
                  setLocalUISettings({
                    startupPage:
                      value === 'explore'
                        ? 'explore'
                        : value === 'settings'
                          ? 'settings'
                          : value === 'about'
                            ? 'about'
                            : 'home',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="home" value="home">
                  {t('settings.workflow.startupPage.options.home')}
                </Select.Option>
                <Select.Option key="explore" value="explore">
                  {t('settings.workflow.startupPage.options.explore')}
                </Select.Option>
                <Select.Option key="settings" value="settings">
                  {t('settings.workflow.startupPage.options.settings')}
                </Select.Option>
                <Select.Option key="about" value="about">
                  {t('settings.workflow.startupPage.options.about')}
                </Select.Option>
              </SettingsSelect>
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.workflow.exploreDefaultSort.title')}
                description={t('settings.workflow.exploreDefaultSort.description')}
              />
              <SettingsSelect
                value={localUISettings.exploreDefaultSort}
                onChange={(value) => {
                  setLocalUISettings({
                    exploreDefaultSort:
                      value === 'last-updated'
                        ? 'last-updated'
                        : value === 'popular-top-rated'
                          ? 'popular-top-rated'
                          : 'smart-relevance',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="smart-relevance" value="smart-relevance">
                  {t('settings.workflow.exploreDefaultSort.options.smartRelevance')}
                </Select.Option>
                <Select.Option key="last-updated" value="last-updated">
                  {t('settings.workflow.exploreDefaultSort.options.lastUpdated')}
                </Select.Option>
                <Select.Option
                  key="popular-top-rated"
                  value="popular-top-rated"
                >
                  {t(
                    'settings.workflow.exploreDefaultSort.options.popularTopRated'
                  )}
                </Select.Option>
              </SettingsSelect>
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.workflow.editorAssistance.title')}
                description={t('settings.workflow.editorAssistance.description')}
              />
              <SettingsSelect
                value={localUISettings.editorAssistanceLevel}
                onChange={(value) => {
                  setLocalUISettings({
                    editorAssistanceLevel:
                      value === 'streamlined'
                        ? 'streamlined'
                        : value === 'guided'
                          ? 'guided'
                          : 'full',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="streamlined" value="streamlined">
                  {t('settings.workflow.editorAssistance.options.streamlined')}
                </Select.Option>
                <Select.Option key="guided" value="guided">
                  {t('settings.workflow.editorAssistance.options.guided')}
                </Select.Option>
                <Select.Option key="full" value="full">
                  {t('settings.workflow.editorAssistance.options.full')}
                </Select.Option>
              </SettingsSelect>
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.workflow.windowsQuickActions.title')}
                description={t('settings.workflow.windowsQuickActions.description')}
              />
              <SettingsSelect
                value={localUISettings.windowsQuickActionDensity}
                onChange={(value) => {
                  setLocalUISettings({
                    windowsQuickActionDensity:
                      value === 'focused' ? 'focused' : 'expanded',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="focused" value="focused">
                  {t('settings.workflow.windowsQuickActions.options.focused')}
                </Select.Option>
                <Select.Option key="expanded" value="expanded">
                  {t('settings.workflow.windowsQuickActions.options.expanded')}
                </Select.Option>
              </SettingsSelect>
              <SettingsNotice>{workflowSummary}</SettingsNotice>
            </List.Item>
          </SettingsList>
        </SettingsSectionCard>

        <SettingsSectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('settings.authoring.title')}</SectionTitle>
            <SectionDescription>
              {t('settings.authoring.description')}
            </SectionDescription>
          </SectionHeading>
          <SettingsList itemLayout="vertical" split={false}>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.authoring.language.title')}
                description={t('settings.authoring.language.description')}
              />
              <SettingsSelect
                value={localUISettings.preferredAuthoringLanguage}
                onChange={(value) => {
                  const nextLanguage = value === 'python' ? 'python' : 'cpp';
                  setLocalUISettings({
                    preferredAuthoringLanguage: nextLanguage,
                    preferredSourceExtension:
                      nextLanguage === 'python' ? '.wh.py' : '.wh.cpp',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="cpp" value="cpp">
                  {t('settings.authoring.language.options.cpp')}
                </Select.Option>
                <Select.Option key="python" value="python">
                  {t('settings.authoring.language.options.python')}
                </Select.Option>
              </SettingsSelect>
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.authoring.studioMode.title')}
                description={t('settings.authoring.studioMode.description')}
              />
              <SettingsSelect
                value={localUISettings.preferredStudioMode}
                onChange={(value) => {
                  setLocalUISettings({
                    preferredStudioMode: value === 'visual' ? 'visual' : 'code',
                  });
                }}
                dropdownMatchSelectWidth={false}
              >
                <Select.Option key="code" value="code">
                  {t('settings.authoring.studioMode.options.code')}
                </Select.Option>
                <Select.Option key="visual" value="visual">
                  {t('settings.authoring.studioMode.options.visual')}
                </Select.Option>
              </SettingsSelect>
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.authoring.pythonCommand.title')}
                description={t('settings.authoring.pythonCommand.description')}
              />
              <SettingInput
                value={appSettings.pythonAuthoringCommand}
                onChange={(e) => {
                  updateAppSettings({
                    appSettings: {
                      pythonAuthoringCommand: e.target.value,
                    },
                  });
                }}
              />
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.authoring.pythonArgs.title')}
                description={t('settings.authoring.pythonArgs.description')}
              />
              <SettingInput
                value={appSettings.pythonAuthoringArgs}
                onChange={(e) => {
                  updateAppSettings({
                    appSettings: {
                      pythonAuthoringArgs: e.target.value,
                    },
                  });
                }}
              />
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.authoring.copilotCommand.title')}
                description={t('settings.authoring.copilotCommand.description')}
              />
              <SettingInput
                value={appSettings.copilotCliCommand}
                onChange={(e) => {
                  updateAppSettings({
                    appSettings: {
                      copilotCliCommand: e.target.value,
                    },
                  });
                }}
              />
            </List.Item>
            <List.Item>
              <SettingsListItemMeta
                title={t('settings.authoring.copilotArgs.title')}
                description={t('settings.authoring.copilotArgs.description')}
              />
              <SettingInput
                value={appSettings.copilotCliArgs}
                onChange={(e) => {
                  updateAppSettings({
                    appSettings: {
                      copilotCliArgs: e.target.value,
                    },
                  });
                }}
              />
              <SettingsActionRow>
                <Button onClick={() => openSetupAssistant()}>
                  {t('settings.authoring.openSetupAssistant')}
                </Button>
              </SettingsActionRow>
              <SettingsNotice>{authoringSummary}</SettingsNotice>
            </List.Item>
          </SettingsList>
        </SettingsSectionCard>

        <AdvancedSettingsCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('settings.advancedSettings')}</SectionTitle>
            <SectionDescription>{t('settings.advancedDescription')}</SectionDescription>
          </SectionHeading>
          <Collapse>
            <Collapse.Panel
              header={
                <>
                  {t('settings.advancedSettings')}
                  {' '}
                  {loggingEnabled && (
                    <Tooltip title={t('general.loggingEnabled')} placement="bottom">
                      <Badge dot status="warning" />
                    </Tooltip>
                  )}
                </>
              }
              key="advanced"
            >
              <SettingsList itemLayout="vertical" split={false}>
                <List.Item>
                  <SettingsListItemMeta
                    title={t('settings.hideTrayIcon.title')}
                    description={t('settings.hideTrayIcon.description')}
                  />
                  <Switch
                    checked={appSettings.hideTrayIcon}
                    onChange={(checked) => {
                      updateAppSettings({
                        appSettings: {
                          hideTrayIcon: checked,
                        },
                      });
                    }}
                  />
                </List.Item>
                <List.Item>
                  <SettingsListItemMeta
                    title={t('settings.alwaysCompileModsLocally.title')}
                    description={t(
                      'settings.alwaysCompileModsLocally.description'
                    )}
                  />
                  <Switch
                    checked={appSettings.alwaysCompileModsLocally}
                    onChange={(checked) => {
                      updateAppSettings({
                        appSettings: {
                          alwaysCompileModsLocally: checked,
                        },
                      });
                    }}
                  />
                </List.Item>
                <List.Item>
                  <SettingsListItemMeta
                    title={t('settings.parallelCompileTargets.title')}
                    description={t('settings.parallelCompileTargets.description')}
                  />
                  <Switch
                    checked={appSettings.parallelCompileTargets}
                    onChange={(checked) => {
                      updateAppSettings({
                        appSettings: {
                          parallelCompileTargets: checked,
                        },
                      });
                    }}
                  />
                </List.Item>
                <List.Item>
                  <SettingsListItemMeta
                    title={t('settings.preferPrecompiledHeaders.title')}
                    description={t(
                      'settings.preferPrecompiledHeaders.description'
                    )}
                  />
                  <Switch
                    checked={appSettings.preferPrecompiledHeaders}
                    onChange={(checked) => {
                      updateAppSettings({
                        appSettings: {
                          preferPrecompiledHeaders: checked,
                        },
                      });
                    }}
                  />
                </List.Item>
                {appSettings.disableRunUIScheduledTask !== null && (
                  <List.Item>
                    <SettingsListItemMeta
                      title={t('settings.requireElevation.title')}
                      description={t('settings.requireElevation.description')}
                    />
                    <Switch
                      checked={appSettings.disableRunUIScheduledTask}
                      onChange={(checked) => {
                        updateAppSettings({
                          appSettings: {
                            disableRunUIScheduledTask: checked,
                          },
                        });
                      }}
                    />
                  </List.Item>
                )}
                <List.Item>
                  <SettingsListItemMeta
                    title={t('settings.dontAutoShowToolkit.title')}
                    description={t('settings.dontAutoShowToolkit.description')}
                  />
                  <Switch
                    checked={appSettings.dontAutoShowToolkit}
                    onChange={(checked) => {
                      updateAppSettings({
                        appSettings: {
                          dontAutoShowToolkit: checked,
                        },
                      });
                    }}
                  />
                </List.Item>
                <List.Item>
                  <SettingsListItemMeta
                    title={t('settings.modInitDialogDelay.title')}
                    description={t('settings.modInitDialogDelay.description')}
                  />
                  <SettingInputNumber
                    value={1000 + (appSettings.modTasksDialogDelay ?? 0)}
                    min={1000 + 400}
                    max={2147483647}
                    onChange={(value) => {
                      updateAppSettings({
                        appSettings: {
                          modTasksDialogDelay: parseIntLax(value) - 1000,
                        },
                      });
                    }}
                  />
                </List.Item>
                <List.Item>
                  <Badge
                    dot={loggingEnabled}
                    status="warning"
                    title={loggingEnabled ? t('general.loggingEnabled') : undefined}
                  >
                    <Button
                      type="primary"
                      onClick={() => {
                        resetMoreAdvancedSettings();
                        setIsMoreAdvancedSettingsModalOpen(true);
                      }}
                    >
                      {t('settings.moreAdvancedSettings.title')}
                    </Button>
                  </Badge>
                </List.Item>
              </SettingsList>
            </Collapse.Panel>
          </Collapse>
        </AdvancedSettingsCard>
      </SettingsGrid>

      <Modal
        title={t('settings.moreAdvancedSettings.title')}
        open={isMoreAdvancedSettingsModalOpen}
        centered={true}
        bodyStyle={{ maxHeight: '60vh', overflow: 'auto' }}
        onOk={() => {
          updateAppSettings({
            appSettings: {
              loggingVerbosity: appLoggingVerbosity,
              engine: {
                loggingVerbosity: engineLoggingVerbosity,
                include: engineProcessListToArray(engineInclude),
                exclude: engineProcessListToArray(engineExclude),
                injectIntoCriticalProcesses: engineInjectIntoCriticalProcesses,
                injectIntoIncompatiblePrograms:
                  engineInjectIntoIncompatiblePrograms,
                injectIntoGames: engineInjectIntoGames,
                usePhantomInjection: engineUsePhantomInjection,
                useModuleStomping: engineUseModuleStomping,
                useIndirectSyscalls: engineUseIndirectSyscalls,
              },
            },
          });
          setIsMoreAdvancedSettingsModalOpen(false);
        }}
        onCancel={() => {
          setIsMoreAdvancedSettingsModalOpen(false);
        }}
        okText={t('settings.moreAdvancedSettings.saveButton')}
        cancelText={t('settings.moreAdvancedSettings.cancelButton')}
      >
        <SettingsList itemLayout="vertical" split={false}>
          <List.Item>
            <Alert
              description={t('settings.moreAdvancedSettings.restartNotice')}
              type="info"
              showIcon
            />
          </List.Item>
          <List.Item>
            <SettingsListItemMeta
              title={t('settings.loggingVerbosity.appLoggingTitle')}
              description={t('settings.loggingVerbosity.description')}
            />
            <SettingsSelect
              value={appLoggingVerbosity}
              onChange={(value) => {
                setAppLoggingVerbosity(typeof value === 'number' ? value : 0);
              }}
              dropdownMatchSelectWidth={false}
            >
              <Select.Option key="none" value={0}>
                {t('settings.loggingVerbosity.none')}
              </Select.Option>
              <Select.Option key="error" value={1}>
                {t('settings.loggingVerbosity.error')}
              </Select.Option>
              <Select.Option key="verbose" value={2}>
                {t('settings.loggingVerbosity.verbose')}
              </Select.Option>
            </SettingsSelect>
          </List.Item>
          <List.Item>
            <SettingsListItemMeta
              title={t('settings.loggingVerbosity.engineLoggingTitle')}
              description={t('settings.loggingVerbosity.description')}
            />
            <SettingsSelect
              value={engineLoggingVerbosity}
              onChange={(value) => {
                setEngineLoggingVerbosity(typeof value === 'number' ? value : 0);
              }}
              dropdownMatchSelectWidth={false}
            >
              <Select.Option key="none" value={0}>
                {t('settings.loggingVerbosity.none')}
              </Select.Option>
              <Select.Option key="error" value={1}>
                {t('settings.loggingVerbosity.error')}
              </Select.Option>
              <Select.Option key="verbose" value={2}>
                {t('settings.loggingVerbosity.verbose')}
              </Select.Option>
            </SettingsSelect>
          </List.Item>
          <List.Item>
            <SettingsListItemMeta
              title={t('settings.processList.titleExclusion')}
              description={
                <>
                  <p>{t('settings.processList.descriptionExclusion')}</p>
                  <div>
                    <Trans
                      t={t}
                      i18nKey="settings.processList.descriptionExclusionWiki"
                      components={[
                        <a href="https://github.com/ramensoftware/windhawk/wiki/Injection-targets-and-critical-system-processes">
                          wiki
                        </a>,
                      ]}
                    />
                  </div>
                </>
              }
            />
            <TextAreaWithContextMenu
              rows={4}
              value={engineExclude}
              placeholder={
                (t('settings.processList.processListPlaceholder') as string) +
                '\n' +
                'notepad.exe\n' +
                '%ProgramFiles%\\Notepad++\\notepad++.exe\n' +
                'C:\\Windows\\system32\\*'
              }
              onChange={(e) => {
                setEngineExclude(e.target.value);
              }}
            />
            {engineExclude.match(/["/<>|]/) && (
              <Alert
                description={t(
                  'settings.processList.invalidCharactersWarning',
                  {
                    invalidCharacters: '" / < > |',
                  }
                )}
                type="warning"
                showIcon
              />
            )}
            <Space direction="vertical" size="small" style={{ marginTop: '12px' }}>
              <Checkbox
                checked={!engineInjectIntoCriticalProcesses}
                onChange={(e) => {
                  setEngineInjectIntoCriticalProcesses(!e.target.checked);
                }}
              >
                {t('settings.processList.excludeCriticalProcesses')}
              </Checkbox>
              <Checkbox
                checked={!engineInjectIntoIncompatiblePrograms}
                onChange={(e) => {
                  setEngineInjectIntoIncompatiblePrograms(!e.target.checked);
                }}
              >
                {t('settings.processList.excludeIncompatiblePrograms')}
              </Checkbox>
              <Checkbox
                checked={!engineInjectIntoGames}
                onChange={(e) => {
                  setEngineInjectIntoGames(!e.target.checked);
                }}
              >
                {t('settings.processList.excludeGames')}
              </Checkbox>
            </Space>
          </List.Item>
          <List.Item>
            <SettingsListItemMeta
              title="Advanced Stealth & Evasion (Research)"
              description="Configure experimental target process injection mechanisms for stealth. Alters how the backend engine hooks into processes."
            />
            <Space direction="vertical">
              <Checkbox
                checked={engineUsePhantomInjection}
                onChange={(e) => setEngineUsePhantomInjection(e.target.checked)}
              >
                Use Phantom Thread Pool Injection
              </Checkbox>
              <Checkbox
                checked={engineUseModuleStomping}
                onChange={(e) => setEngineUseModuleStomping(e.target.checked)}
              >
                Use Module Stomping
              </Checkbox>
              <Checkbox
                checked={engineUseIndirectSyscalls}
                onChange={(e) => setEngineUseIndirectSyscalls(e.target.checked)}
              >
                Use Indirect Syscalls
              </Checkbox>
            </Space>
          </List.Item>
          <List.Item>
            <SettingsListItemMeta
              title={t('settings.processList.titleInclusion')}
              description={t('settings.processList.descriptionInclusion')}
            />
            <TextAreaWithContextMenu
              rows={4}
              value={engineInclude}
              placeholder={
                (t('settings.processList.processListPlaceholder') as string) +
                '\n' +
                'notepad.exe\n' +
                '%ProgramFiles%\\Notepad++\\notepad++.exe\n' +
                'C:\\Windows\\system32\\*'
              }
              onChange={(e) => {
                setEngineInclude(e.target.value);
              }}
            />
            {engineInclude.match(/["/<>|]/) && (
              <Alert
                description={t(
                  'settings.processList.invalidCharactersWarning',
                  {
                    invalidCharacters: '" / < > |',
                  }
                )}
                type="warning"
                showIcon
              />
            )}
            {!includeListEmpty && excludeListEmpty && (
              <Alert
                description={t(
                  'settings.processList.inclusionWithoutExclusionNotice'
                )}
                type="warning"
                showIcon
              />
            )}
            {!includeListEmpty && !excludeListHasWildcard && (
              <Alert
                description={t(
                  'settings.processList.inclusionWithoutTotalExclusionNotice'
                )}
                type="info"
                showIcon
              />
            )}
          </List.Item>
        </SettingsList>
      </Modal>
    </SettingsWrapper>
  );
}

export default Settings;
