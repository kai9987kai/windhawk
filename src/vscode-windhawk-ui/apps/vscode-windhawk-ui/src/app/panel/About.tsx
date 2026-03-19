import { Alert, Button, Card, message } from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AppUISettingsContext } from '../appUISettings';
import {
  useGetAppSettings,
  useOpenExternal,
  useOpenPath,
  useRepairRuntimeConfig
} from '../webviewIPC';
import { AppRuntimeDiagnostics, AppSettings } from '../webviewIPCMessages';
import { ChangelogModal } from './ChangelogModal';
import { mockRuntimeDiagnostics, mockSettings } from './mockData';
import { UpdateModal } from './UpdateModal';

type StatusTone = 'default' | 'success' | 'warning' | 'error';

type StatusItem = {
  key: string;
  text: string;
  tone: StatusTone;
};

type SummaryItem = {
  label: string;
  value: string;
};

type PathItem = {
  key: string;
  label: string;
  value: string;
  openPath?: string | null;
};

type LinkItem = {
  key: string;
  label: string;
  href: string;
};

type BuiltWithItem = {
  key: string;
  label?: string;
  href?: string;
  description: string;
};

type QuickActionItem = {
  key: string;
  title: string;
  description: string;
  kind: 'path' | 'uri';
  target: string;
};

const AboutContainer = styled.div`
  padding: 8px 0 32px;
`;

const HeroCard = styled.section`
  margin-bottom: var(--app-section-gap);
  padding: calc(var(--app-card-padding) + 4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgba(23, 125, 220, 0.25), transparent 45%),
    radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.12), transparent 40%),
    rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.5);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }
`;

const HeroEyebrow = styled.div`
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  margin: 10px 0 8px;
  font-size: 34px;
  line-height: 1.05;
`;

const HeroSubtitle = styled.p`
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 18px;
`;

const HeroDescription = styled.p`
  max-width: 760px;
  margin-bottom: 18px;
  color: rgba(255, 255, 255, 0.64);
`;

const HeroActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
`;

const HeroAlert = styled(Alert)`
  margin-top: 18px;
`;

const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--app-section-gap);
`;

const SectionCard = styled(Card)`
  /* Premium Glassmorphism */
  background: rgba(26, 26, 26, 0.4) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 24px -6px rgba(0, 0, 0, 0.3) !important;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease-out, border-color 0.3s ease-out !important;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
  }

  .ant-card-body {
    padding: var(--app-card-padding);
  }
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

const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const StatusPill = styled.span<{ $tone: StatusTone }>`
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
      case 'success':
        return '#73d13d';
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

const SummaryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
`;

const SummaryLabel = styled.div`
  color: rgba(255, 255, 255, 0.62);
`;

const SummaryValue = styled.div`
  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;
  text-align: right;
`;

const ResourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResourceItem = styled.a`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: inherit;
    border-color: rgba(23, 125, 220, 0.35);
    background: rgba(23, 125, 220, 0.08);
  }
`;

const ResourceLabel = styled.span`
  font-weight: 600;
`;

const ResourceUrl = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
`;

const BuiltWithList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BuiltWithItemRow = styled.div`
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
`;

const BuiltWithLabel = styled.div`
  margin-bottom: 4px;
  font-weight: 600;
`;

const DiagnosticsNotice = styled(Alert)`
  margin-bottom: 16px;
`;

const DiagnosticsPathList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
`;

const DiagnosticsPathItem = styled.div`
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
`;

const DiagnosticsPathLabel = styled.div`
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const DiagnosticsPathValue = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Cascadia Mono', Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
`;

const DiagnosticsPathActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

const QuickActionCard = styled.button`
  padding: 14px 16px;
  text-align: left;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(23, 125, 220, 0.35);
    background: rgba(23, 125, 220, 0.08);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.7;
    transform: none;
  }
`;

const QuickActionTitle = styled.div`
  margin-bottom: 6px;
  font-weight: 600;
`;

const QuickActionDescription = styled.div`
  color: rgba(255, 255, 255, 0.66);
  line-height: 1.45;
`;

function copyText(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.opacity = '0';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let successful = false;

  try {
    successful = document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }

  return successful;
}

function About() {
  const { t } = useTranslation();
  const [changelogModalOpen, setChangelogModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<Partial<AppSettings> | null>(
    mockSettings
  );
  const [runtimeDiagnostics, setRuntimeDiagnostics] =
    useState<AppRuntimeDiagnostics | null>(mockRuntimeDiagnostics);

  const {
    language,
    devModeOptOut,
    loggingEnabled,
    localUISettings,
    safeMode,
    updateIsAvailable,
  } = useContext(AppUISettingsContext);

  const { getAppSettings } = useGetAppSettings(
    useCallback((data) => {
      setAppSettings(data.appSettings);
      setRuntimeDiagnostics(data.runtimeDiagnostics || null);
    }, [])
  );

  const { repairRuntimeConfig, repairRuntimeConfigPending } =
    useRepairRuntimeConfig(
      useCallback(
        (data) => {
          if (data.succeeded) {
            setRuntimeDiagnostics(data.runtimeDiagnostics || null);
            message.success(t('about.runtime.actions.repairSuccess'));
            return;
          }

          message.error(
            data.error || (t('about.runtime.actions.repairFailed') as string)
          );
        },
        [t]
      )
    );

  const { openExternal, openExternalPending } = useOpenExternal(
    useCallback(
      (data) => {
        if (!data.succeeded) {
          message.error(
            data.error || (t('about.actions.openError') as string)
          );
        }
      },
      [t]
    )
  );

  const { openPath, openPathPending } = useOpenPath(
    useCallback(
      (data) => {
        if (!data.succeeded) {
          message.error(
            data.error || (t('about.actions.openError') as string)
          );
        }
      },
      [t]
    )
  );

  useEffect(() => {
    getAppSettings({});
  }, [getAppSettings]);

  const currentVersion = (
    process.env['REACT_APP_VERSION'] || 'unknown'
  ).replace(/^(\d+(?:\.\d+)+?)(\.0+)+$/, '$1');

  const performanceProfileLabel = useCallback(
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

  const aiAccelerationLabel = useCallback(
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

  const startupPageLabel = useCallback(
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

  const exploreDefaultSortLabel = useCallback(
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

  const editorAssistanceLabel = useCallback(
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

  const windowsQuickActionDensityLabel = useCallback(
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

  const workspaceItems = useMemo<SummaryItem[]>(
    () => [
      {
        label: t('about.workspace.language'),
        value: language || appSettings?.language || 'en',
      },
      {
        label: t('about.workspace.updateChecks'),
        value: appSettings?.disableUpdateCheck
          ? t('about.values.disabled')
          : t('about.values.enabled'),
      },
      {
        label: t('about.workspace.developerMode'),
        value: devModeOptOut
          ? t('about.values.hidden')
          : t('about.values.visible'),
      },
      {
        label: t('about.workspace.compileLocally'),
        value: appSettings?.alwaysCompileModsLocally
          ? t('about.values.enabled')
          : t('about.values.disabled'),
      },
      {
        label: t('about.workspace.trayIcon'),
        value: appSettings?.hideTrayIcon
          ? t('about.values.hidden')
          : t('about.values.visible'),
      },
      {
        label: t('about.workspace.toolkitDialog'),
        value: appSettings?.dontAutoShowToolkit
          ? t('about.values.manual')
          : t('about.values.automatic'),
      },
      {
        label: t('about.workspace.interfaceDensity'),
        value:
          localUISettings.interfaceDensity === 'compact'
            ? t('settings.interface.layoutDensity.compact')
            : t('settings.interface.layoutDensity.comfortable'),
      },
      {
        label: t('about.workspace.layoutWidth'),
        value: localUISettings.useWideLayout
          ? t('about.values.wide')
          : t('about.values.standard'),
      },
      {
        label: t('about.workspace.motion'),
        value: localUISettings.reduceMotion
          ? t('about.values.reduced')
          : t('about.values.standard'),
      },
      {
        label: t('about.workspace.performanceProfile'),
        value: performanceProfileLabel(localUISettings.performanceProfile),
      },
      {
        label: t('about.workspace.aiAcceleration'),
        value: aiAccelerationLabel(localUISettings.aiAccelerationPreference),
      },
      {
        label: t('about.workspace.startupPage'),
        value: startupPageLabel(localUISettings.startupPage),
      },
      {
        label: t('about.workspace.exploreDefaultSort'),
        value: exploreDefaultSortLabel(localUISettings.exploreDefaultSort),
      },
      {
        label: t('about.workspace.editorAssistance'),
        value: editorAssistanceLabel(localUISettings.editorAssistanceLevel),
      },
      {
        label: t('about.workspace.windowsQuickActions'),
        value: windowsQuickActionDensityLabel(
          localUISettings.windowsQuickActionDensity
        ),
      },
    ],
    [
      aiAccelerationLabel,
      appSettings,
      devModeOptOut,
      editorAssistanceLabel,
      exploreDefaultSortLabel,
      language,
      localUISettings,
      performanceProfileLabel,
      startupPageLabel,
      t,
      windowsQuickActionDensityLabel,
    ]
  );

  const runtimeModeLabel = useCallback(
    (portable: boolean | null | undefined) => {
      if (portable === null || portable === undefined) {
        return t('about.runtime.values.missing');
      }

      return portable
        ? t('about.runtime.values.portable')
        : t('about.runtime.values.installed');
    },
    [t]
  );

  const runtimeIssueText = useMemo(() => {
    if (!runtimeDiagnostics) {
      return null;
    }

    switch (runtimeDiagnostics.issueCode) {
      case 'engine-config-missing':
        return t('about.runtime.issue.engineConfigMissing');
      case 'engine-storage-mismatch':
        return t('about.runtime.issue.engineStorageMismatch');
      case 'compiler-missing':
        return t('about.runtime.issue.compilerMissing');
      default:
        return t('about.runtime.issue.none');
    }
  }, [runtimeDiagnostics, t]);

  const statusItems = useMemo<StatusItem[]>(() => {
    const items: StatusItem[] = [
      {
        key: 'update',
        text: updateIsAvailable
          ? t('about.status.updateAvailable')
          : t('about.status.upToDate'),
        tone: updateIsAvailable ? 'error' : 'success',
      },
      {
        key: 'safe-mode',
        text: safeMode
          ? t('about.status.safeModeOn')
          : t('about.status.safeModeOff'),
        tone: safeMode ? 'warning' : 'success',
      },
      {
        key: 'logging',
        text: loggingEnabled
          ? t('about.status.loggingOn')
          : t('about.status.loggingOff'),
        tone: loggingEnabled ? 'warning' : 'default',
      },
      {
        key: 'dev-mode',
        text: devModeOptOut
          ? t('about.status.devModeOff')
          : t('about.status.devModeOn'),
        tone: devModeOptOut ? 'default' : 'success',
      },
    ];

    if (runtimeDiagnostics) {
      items.push({
        key: 'compiler',
        text: runtimeDiagnostics.compilerAvailable
          ? t('about.status.toolchainReady')
          : t('about.status.toolchainMissing'),
        tone: runtimeDiagnostics.compilerAvailable ? 'success' : 'error',
      });

      items.push({
        key: 'runtime-storage',
        text: runtimeDiagnostics.engineConfigMatchesAppConfig
          ? t('about.status.storageAligned')
          : t('about.status.storageMismatch'),
        tone: runtimeDiagnostics.engineConfigMatchesAppConfig
          ? 'success'
          : 'error',
      });
    }

    return items;
  }, [
    devModeOptOut,
    loggingEnabled,
    runtimeDiagnostics,
    safeMode,
    t,
    updateIsAvailable,
  ]);

  const runtimeSummaryItems = useMemo<SummaryItem[]>(
    () =>
      runtimeDiagnostics
        ? [
            {
              label: t('about.runtime.modes.platform'),
              value: runtimeDiagnostics.platformArch,
            },
            {
              label: t('about.runtime.modes.appMode'),
              value: runtimeModeLabel(runtimeDiagnostics.portable),
            },
            {
              label: t('about.runtime.modes.engineMode'),
              value: runtimeModeLabel(runtimeDiagnostics.enginePortable),
            },
            {
              label: t('about.runtime.modes.arm64'),
              value: runtimeDiagnostics.arm64Enabled
                ? t('about.values.enabled')
                : t('about.values.disabled'),
            },
          ]
        : [],
    [runtimeDiagnostics, runtimeModeLabel, t]
  );

  const windowsSummaryItems = useMemo<SummaryItem[]>(
    () =>
      runtimeDiagnostics
        ? [
            {
              label: t('about.windows.summary.version'),
              value:
                runtimeDiagnostics.windowsProductName ||
                t('about.runtime.values.missing'),
            },
            {
              label: t('about.windows.summary.release'),
              value:
                runtimeDiagnostics.windowsDisplayVersion ||
                t('about.runtime.values.missing'),
            },
            {
              label: t('about.windows.summary.build'),
              value: runtimeDiagnostics.windowsBuild,
            },
            {
              label: t('about.windows.summary.memory'),
              value: `${runtimeDiagnostics.totalMemoryGb} GB`,
            },
            {
              label: t('about.windows.summary.npu'),
              value:
                runtimeDiagnostics.npuName ||
                (runtimeDiagnostics.npuDetected
                  ? t('about.windows.values.detected')
                  : t('about.windows.values.none')),
            },
            {
              label: t('about.windows.summary.installationType'),
              value:
                runtimeDiagnostics.windowsInstallationType ||
                t('about.runtime.values.missing'),
            },
            {
              label: t('about.windows.summary.session'),
              value:
                runtimeDiagnostics.isElevated === null
                  ? t('about.runtime.values.missing')
                  : runtimeDiagnostics.isElevated
                    ? t('about.windows.values.elevated')
                    : t('about.windows.values.standard'),
            },
            {
              label: t('about.windows.summary.host'),
              value: runtimeDiagnostics.hostName,
            },
            {
              label: t('about.windows.summary.user'),
              value:
                runtimeDiagnostics.userName ||
                t('about.runtime.values.missing'),
            },
          ]
        : [],
    [runtimeDiagnostics, t]
  );

  const runtimePathItems = useMemo<PathItem[]>(
    () =>
      runtimeDiagnostics
        ? [
            {
              key: 'app-root',
              label: t('about.runtime.paths.appRoot'),
              value: runtimeDiagnostics.appRootPath,
              openPath: runtimeDiagnostics.appRootPath,
            },
            {
              key: 'app-data',
              label: t('about.runtime.paths.appData'),
              value: runtimeDiagnostics.appDataPath,
              openPath: runtimeDiagnostics.appDataPath,
            },
            {
              key: 'expected-engine-data',
              label: t('about.runtime.paths.expectedEngineData'),
              value: runtimeDiagnostics.expectedEngineAppDataPath,
              openPath: runtimeDiagnostics.expectedEngineAppDataPath,
            },
            {
              key: 'actual-engine-data',
              label: t('about.runtime.paths.actualEngineData'),
              value:
                runtimeDiagnostics.engineAppDataPath ||
                t('about.runtime.values.missing'),
              openPath: runtimeDiagnostics.engineAppDataPath,
            },
            {
              key: 'engine',
              label: t('about.runtime.paths.engine'),
              value: runtimeDiagnostics.enginePath,
              openPath: runtimeDiagnostics.enginePath,
            },
            {
              key: 'expected-engine-registry',
              label: t('about.runtime.paths.expectedEngineRegistry'),
              value:
                runtimeDiagnostics.expectedEngineRegistryKey ||
                t('about.runtime.values.missing'),
            },
            {
              key: 'actual-engine-registry',
              label: t('about.runtime.paths.actualEngineRegistry'),
              value:
                runtimeDiagnostics.engineRegistryKey ||
                t('about.runtime.values.missing'),
            },
            {
              key: 'compiler',
              label: t('about.runtime.paths.compiler'),
              value: runtimeDiagnostics.compilerPath,
              openPath: runtimeDiagnostics.compilerPath,
            },
            {
              key: 'ui',
              label: t('about.runtime.paths.ui'),
              value: runtimeDiagnostics.uiPath,
              openPath: runtimeDiagnostics.uiPath,
            },
          ]
        : [],
    [runtimeDiagnostics, t]
  );

  const windowsPathItems = useMemo<PathItem[]>(
    () =>
      runtimeDiagnostics
        ? [
            {
              key: 'windows-directory',
              label: t('about.windows.paths.windowsDirectory'),
              value:
                runtimeDiagnostics.windowsDirectory ||
                t('about.runtime.values.missing'),
              openPath: runtimeDiagnostics.windowsDirectory,
            },
            {
              key: 'temp-directory',
              label: t('about.windows.paths.tempDirectory'),
              value: runtimeDiagnostics.tempDirectory,
              openPath: runtimeDiagnostics.tempDirectory,
            },
          ]
        : [],
    [runtimeDiagnostics, t]
  );

  const supportSnapshot = useMemo(
    () =>
      [
        `Windhawk ${currentVersion}`,
        runtimeDiagnostics?.windowsProductName
          ? `Windows: ${runtimeDiagnostics.windowsProductName}`
          : null,
        runtimeDiagnostics?.windowsDisplayVersion
          ? `Windows release: ${runtimeDiagnostics.windowsDisplayVersion}`
          : null,
        runtimeDiagnostics ? `Windows build: ${runtimeDiagnostics.windowsBuild}` : null,
        runtimeDiagnostics
          ? `Session elevation: ${
              runtimeDiagnostics.isElevated === null
                ? t('about.runtime.values.missing')
                : runtimeDiagnostics.isElevated
                  ? t('about.windows.values.elevated')
                  : t('about.windows.values.standard')
            }`
          : null,
        runtimeDiagnostics ? `Host: ${runtimeDiagnostics.hostName}` : null,
        `Language: ${language || appSettings?.language || 'en'}`,
        `Update available: ${
          updateIsAvailable
            ? t('about.values.enabled')
            : t('about.values.disabled')
        }`,
        `Update checks: ${
          appSettings?.disableUpdateCheck
            ? t('about.values.disabled')
            : t('about.values.enabled')
        }`,
        `Developer mode: ${
          devModeOptOut ? t('about.values.hidden') : t('about.values.visible')
        }`,
        `Safe mode: ${
          safeMode ? t('about.values.enabled') : t('about.values.disabled')
        }`,
        `Debug logging: ${
          loggingEnabled
            ? t('about.values.enabled')
            : t('about.values.disabled')
        }`,
        `Interface density: ${
          localUISettings.interfaceDensity === 'compact'
            ? t('settings.interface.layoutDensity.compact')
            : t('settings.interface.layoutDensity.comfortable')
        }`,
        `Layout width: ${
          localUISettings.useWideLayout
            ? t('about.values.wide')
            : t('about.values.standard')
        }`,
        `Motion: ${
          localUISettings.reduceMotion
            ? t('about.values.reduced')
            : t('about.values.standard')
        }`,
        `Startup page: ${startupPageLabel(localUISettings.startupPage)}`,
        `Explore default sort: ${exploreDefaultSortLabel(
          localUISettings.exploreDefaultSort
        )}`,
        `Editor assistance: ${editorAssistanceLabel(
          localUISettings.editorAssistanceLevel
        )}`,
        `Windows quick actions: ${windowsQuickActionDensityLabel(
          localUISettings.windowsQuickActionDensity
        )}`,
        runtimeDiagnostics
          ? `Runtime storage: ${
              runtimeDiagnostics.engineConfigMatchesAppConfig
                ? t('about.runtime.values.aligned')
                : t('about.runtime.values.mismatched')
            }`
          : null,
        runtimeDiagnostics
          ? `Runtime platform: ${runtimeDiagnostics.platformArch}`
          : null,
        runtimeDiagnostics
          ? `Runtime mode: ${runtimeModeLabel(runtimeDiagnostics.portable)}`
          : null,
      ].filter(Boolean).join('\n'),
    [
      appSettings?.disableUpdateCheck,
      appSettings?.language,
      currentVersion,
      devModeOptOut,
      editorAssistanceLabel,
      exploreDefaultSortLabel,
      language,
      localUISettings.editorAssistanceLevel,
      localUISettings.exploreDefaultSort,
      localUISettings.interfaceDensity,
      localUISettings.reduceMotion,
      localUISettings.startupPage,
      localUISettings.useWideLayout,
      localUISettings.windowsQuickActionDensity,
      loggingEnabled,
      runtimeDiagnostics,
      runtimeModeLabel,
      safeMode,
      startupPageLabel,
      t,
      updateIsAvailable,
      windowsQuickActionDensityLabel,
    ]
  );

  const copySupportSnapshot = useCallback(() => {
    if (copyText(supportSnapshot)) {
      message.success(t('about.actions.copySuccess'));
    } else {
      message.error(t('about.actions.copyError'));
    }
  }, [supportSnapshot, t]);

  const copyTextWithFeedback = useCallback(
    (text: string) => {
      if (copyText(text)) {
        message.success(t('about.actions.copyPathSuccess'));
      } else {
        message.error(t('about.actions.copyPathError'));
      }
    },
    [t]
  );

  const openPathInShell = useCallback(
    (targetPath: string) => {
      openPath({
        path: targetPath,
      });
    },
    [openPath]
  );

  const openUri = useCallback(
    (uri: string) => {
      openExternal({
        uri,
      });
    },
    [openExternal]
  );

  const windowsQuickActions = useMemo<QuickActionItem[]>(
    () =>
      runtimeDiagnostics
        ? [
            {
              key: 'windows-update',
              title: t('about.windows.actions.windowsUpdate.title'),
              description: t('about.windows.actions.windowsUpdate.description'),
              kind: 'uri',
              target: 'ms-settings:windowsupdate',
            },
            {
              key: 'taskbar-settings',
              title: t('about.windows.actions.taskbar.title'),
              description: t('about.windows.actions.taskbar.description'),
              kind: 'uri',
              target: 'ms-settings:personalization-taskbar',
            },
            {
              key: 'start-settings',
              title: t('about.windows.actions.start.title'),
              description: t('about.windows.actions.start.description'),
              kind: 'uri',
              target: 'ms-settings:personalization-start',
            },
            {
              key: 'notification-settings',
              title: t('about.windows.actions.notifications.title'),
              description: t('about.windows.actions.notifications.description'),
              kind: 'uri',
              target: 'ms-settings:notifications',
            },
            {
              key: 'multitasking-settings',
              title: t('about.windows.actions.multitasking.title'),
              description: t('about.windows.actions.multitasking.description'),
              kind: 'uri',
              target: 'ms-settings:multitasking',
            },
            {
              key: 'colors-settings',
              title: t('about.windows.actions.colors.title'),
              description: t('about.windows.actions.colors.description'),
              kind: 'uri',
              target: 'ms-settings:colors',
            },
            {
              key: 'background-settings',
              title: t('about.windows.actions.background.title'),
              description: t('about.windows.actions.background.description'),
              kind: 'uri',
              target: 'ms-settings:personalization-background',
            },
            {
              key: 'themes-settings',
              title: t('about.windows.actions.themes.title'),
              description: t('about.windows.actions.themes.description'),
              kind: 'uri',
              target: 'ms-settings:themes',
            },
            {
              key: 'lockscreen-settings',
              title: t('about.windows.actions.lockScreen.title'),
              description: t('about.windows.actions.lockScreen.description'),
              kind: 'uri',
              target: 'ms-settings:lockscreen',
            },
            {
              key: 'clipboard-settings',
              title: t('about.windows.actions.clipboard.title'),
              description: t('about.windows.actions.clipboard.description'),
              kind: 'uri',
              target: 'ms-settings:clipboard',
            },
            {
              key: 'startup-apps',
              title: t('about.windows.actions.startupApps.title'),
              description: t('about.windows.actions.startupApps.description'),
              kind: 'uri',
              target: 'ms-settings:startupapps',
            },
            {
              key: 'sound-settings',
              title: t('about.windows.actions.sound.title'),
              description: t('about.windows.actions.sound.description'),
              kind: 'uri',
              target: 'ms-settings:sound',
            },
            {
              key: 'app-data-folder',
              title: t('about.windows.actions.appData.title'),
              description: t('about.windows.actions.appData.description'),
              kind: 'path',
              target: runtimeDiagnostics.appDataPath,
            },
            {
              key: 'engine-folder',
              title: t('about.windows.actions.engine.title'),
              description: t('about.windows.actions.engine.description'),
              kind: 'path',
              target: runtimeDiagnostics.enginePath,
            },
          ]
        : [],
    [runtimeDiagnostics, t]
  );

  const visibleWindowsQuickActions = useMemo(() => {
    if (localUISettings.windowsQuickActionDensity === 'expanded') {
      return windowsQuickActions;
    }

    const focusedActionKeys = new Set([
      'windows-update',
      'taskbar-settings',
      'start-settings',
      'notification-settings',
      'multitasking-settings',
      'colors-settings',
      'app-data-folder',
      'engine-folder',
    ]);

    return windowsQuickActions.filter(({ key }) => focusedActionKeys.has(key));
  }, [
    localUISettings.windowsQuickActionDensity,
    windowsQuickActions,
  ]);

  const links = useMemo<LinkItem[]>(
    () => [
      {
        key: 'homepage',
        label: t('about.links.homepage'),
        href: 'https://windhawk.net/',
      },
      {
        key: 'documentation',
        label: t('about.links.documentation'),
        href: 'https://github.com/ramensoftware/windhawk/wiki',
      },
      {
        key: 'github',
        label: t('about.links.github'),
        href: 'https://github.com/ramensoftware/windhawk',
      },
      {
        key: 'translations',
        label: t('about.links.translations'),
        href: 'https://github.com/ramensoftware/windhawk/wiki/translations',
      },
    ],
    [t]
  );

  const builtWithItems = useMemo<BuiltWithItem[]>(
    () => [
      {
        key: 'vscodium',
        label: 'VSCodium',
        href: 'https://github.com/VSCodium/vscodium',
        description: t('about.builtWith.vscodium'),
      },
      {
        key: 'llvm-mingw',
        label: 'LLVM MinGW',
        href: 'https://github.com/mstorsjo/llvm-mingw',
        description: t('about.builtWith.llvmMingw'),
      },
      {
        key: 'minhook',
        label: 'MinHook-Detours',
        href: 'https://github.com/m417z/minhook-detours',
        description: t('about.builtWith.minHook'),
      },
      {
        key: 'others',
        description: t('about.builtWith.others'),
      },
    ],
    [t]
  );

  return (
    <AboutContainer>
      <HeroCard>
        <HeroEyebrow>{t('about.eyebrow')}</HeroEyebrow>
        <HeroTitle>
          {t('about.title', {
            version: currentVersion,
          })}
        </HeroTitle>
        <HeroSubtitle>{t('about.subtitle')}</HeroSubtitle>
        <HeroDescription>{t('about.pageDescription')}</HeroDescription>
        <div>
          <Trans
            t={t}
            i18nKey="about.credit"
            values={{ author: 'Ramen Software' }}
            components={[<a href="https://ramensoftware.com/">website</a>]}
          />
        </div>
        <HeroActionRow>
          <Button onClick={() => setChangelogModalOpen(true)}>
            {t('about.actions.changelog')}
          </Button>
          <Button onClick={() => copySupportSnapshot()}>
            {t('about.actions.copySupport')}
          </Button>
          {updateIsAvailable && (
            <Button type="primary" onClick={() => setUpdateModalOpen(true)}>
              {t('about.update.updateButton')}
            </Button>
          )}
        </HeroActionRow>
        {updateIsAvailable && (
          <HeroAlert
            message={<strong>{t('about.update.title')}</strong>}
            description={t('about.update.subtitle')}
            type="info"
            showIcon
          />
        )}
      </HeroCard>

      <AboutGrid>
        <SectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('about.status.title')}</SectionTitle>
            <SectionDescription>{t('about.status.description')}</SectionDescription>
          </SectionHeading>
          <StatusRow>
            {statusItems.map(({ key, text, tone }) => (
              <StatusPill key={key} $tone={tone}>
                {text}
              </StatusPill>
            ))}
          </StatusRow>
        </SectionCard>

        <SectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('about.workspace.title')}</SectionTitle>
            <SectionDescription>{t('about.workspace.description')}</SectionDescription>
          </SectionHeading>
          <SummaryList>
            {workspaceItems.map(({ label, value }) => (
              <SummaryRow key={label}>
                <SummaryLabel>{label}</SummaryLabel>
                <SummaryValue>{value}</SummaryValue>
              </SummaryRow>
            ))}
          </SummaryList>
        </SectionCard>

        <SectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('about.runtime.title')}</SectionTitle>
            <SectionDescription>{t('about.runtime.description')}</SectionDescription>
          </SectionHeading>
          {runtimeDiagnostics && runtimeIssueText && (
            <DiagnosticsNotice
              message={<strong>{runtimeIssueText}</strong>}
              description={
                runtimeDiagnostics.engineConfigMatchesAppConfig
                  ? undefined
                  : t('about.runtime.issue.fixHint')
              }
              type={
                runtimeDiagnostics.engineConfigMatchesAppConfig
                  ? 'success'
                  : 'warning'
              }
              showIcon
            />
          )}
          <SummaryList>
            {runtimeSummaryItems.map(({ label, value }) => (
              <SummaryRow key={label}>
                <SummaryLabel>{label}</SummaryLabel>
                <SummaryValue>{value}</SummaryValue>
              </SummaryRow>
            ))}
          </SummaryList>
          {runtimeDiagnostics?.repairAvailable &&
            !runtimeDiagnostics.engineConfigMatchesAppConfig && (
              <HeroActionRow>
                <Button
                  type="primary"
                  loading={repairRuntimeConfigPending}
                  onClick={() => repairRuntimeConfig({})}
                >
                  {t('about.runtime.actions.repair')}
                </Button>
              </HeroActionRow>
            )}
          <DiagnosticsPathList>
            {runtimePathItems.map(({ key, label, value, openPath: targetPath }) => (
              <DiagnosticsPathItem key={key}>
                <DiagnosticsPathLabel>{label}</DiagnosticsPathLabel>
                <DiagnosticsPathValue>{value}</DiagnosticsPathValue>
                <DiagnosticsPathActions>
                  {targetPath && (
                    <Button
                      size="small"
                      loading={openPathPending}
                      onClick={() => openPathInShell(targetPath)}
                    >
                      {t('about.actions.openPath')}
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={() => copyTextWithFeedback(value)}
                  >
                    {t('about.actions.copyPath')}
                  </Button>
                </DiagnosticsPathActions>
              </DiagnosticsPathItem>
            ))}
          </DiagnosticsPathList>
        </SectionCard>

        <SectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('about.windows.title')}</SectionTitle>
            <SectionDescription>{t('about.windows.description')}</SectionDescription>
          </SectionHeading>
          <SummaryList>
            {windowsSummaryItems.map(({ label, value }) => (
              <SummaryRow key={label}>
                <SummaryLabel>{label}</SummaryLabel>
                <SummaryValue>{value}</SummaryValue>
              </SummaryRow>
            ))}
          </SummaryList>
          <DiagnosticsPathList>
            {windowsPathItems.map(({ key, label, value, openPath: targetPath }) => (
              <DiagnosticsPathItem key={key}>
                <DiagnosticsPathLabel>{label}</DiagnosticsPathLabel>
                <DiagnosticsPathValue>{value}</DiagnosticsPathValue>
                <DiagnosticsPathActions>
                  {targetPath && (
                    <Button
                      size="small"
                      loading={openPathPending}
                      onClick={() => openPathInShell(targetPath)}
                    >
                      {t('about.actions.openPath')}
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={() => copyTextWithFeedback(value)}
                  >
                    {t('about.actions.copyPath')}
                  </Button>
                </DiagnosticsPathActions>
              </DiagnosticsPathItem>
            ))}
          </DiagnosticsPathList>
        </SectionCard>

        <SectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('about.windows.quickActionsTitle')}</SectionTitle>
            <SectionDescription>
              {t('about.windows.quickActionsDescription')}
            </SectionDescription>
          </SectionHeading>
          <QuickActionsGrid>
            {visibleWindowsQuickActions.map(({ key, title, description, kind, target }) => (
              <QuickActionCard
                key={key}
                disabled={openExternalPending || openPathPending}
                onClick={() =>
                  kind === 'path' ? openPathInShell(target) : openUri(target)
                }
              >
                <QuickActionTitle>{title}</QuickActionTitle>
                <QuickActionDescription>{description}</QuickActionDescription>
              </QuickActionCard>
            ))}
          </QuickActionsGrid>
        </SectionCard>

        <SectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('about.links.title')}</SectionTitle>
            <SectionDescription>{t('about.links.description')}</SectionDescription>
          </SectionHeading>
          <ResourceList>
            {links.map(({ key, label, href }) => (
              <ResourceItem key={key} href={href}>
                <ResourceLabel>{label}</ResourceLabel>
                <ResourceUrl>{href.replace(/^https?:\/\//, '')}</ResourceUrl>
              </ResourceItem>
            ))}
          </ResourceList>
        </SectionCard>

        <SectionCard bordered={false}>
          <SectionHeading>
            <SectionTitle>{t('about.builtWith.title')}</SectionTitle>
            <SectionDescription>
              {t('about.builtWith.description')}
            </SectionDescription>
          </SectionHeading>
          <BuiltWithList>
            {builtWithItems.map(({ key, label, href, description }) => (
              <BuiltWithItemRow key={key}>
                {label && (
                  <BuiltWithLabel>
                    {href ? <a href={href}>{label}</a> : label}
                  </BuiltWithLabel>
                )}
                <div>{description}</div>
              </BuiltWithItemRow>
            ))}
          </BuiltWithList>
        </SectionCard>
      </AboutGrid>

      <ChangelogModal
        open={changelogModalOpen}
        onClose={() => setChangelogModalOpen(false)}
      />
      <UpdateModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
      />
    </AboutContainer>
  );
}

export default About;
