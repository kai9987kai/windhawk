import { Button, ConfigProvider, Modal } from 'antd';
import 'prism-themes/themes/prism-vsc-dark-plus.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import 'react-diff-view/style/index.css';
import { useTranslation } from 'react-i18next';
import './App.css';
import {
  AppUISettingsContext,
  AppUISettingsContextType,
  defaultLocalUISettings,
  hasStoredLocalUISettings,
  LocalUISettings,
  mergeLocalUISettings,
  readLocalUISettings,
  writeLocalUISettings,
} from './appUISettings';
import { setLanguage } from './i18n';
import { mockAppUISettings, useMockData } from './panel/mockData';
import { AppUISettings } from './webviewIPCMessages';
import Panel from './panel/Panel';
import Sidebar from './sidebar/Sidebar';
import { useGetInitialAppSettings, useSetNewAppSettings } from './webviewIPC';

type AppBootSplashProps = {
  content: string | null;
  extensionReady: boolean;
  translationsReady: boolean;
  localUISettings: LocalUISettings;
  t: ReturnType<typeof useTranslation>['t'];
};

function AppBootSplash({
  content,
  extensionReady,
  translationsReady,
  localUISettings,
  t,
}: AppBootSplashProps) {
  const panelMode = content === 'sidebar' ? 'sidebar' : 'panel';
  const startupPageLabel =
    localUISettings.startupPage === 'explore'
      ? t('settings.workflow.startupPage.options.explore', {
          defaultValue: 'Explore',
        })
      : localUISettings.startupPage === 'settings'
        ? t('settings.workflow.startupPage.options.settings', {
            defaultValue: 'Settings',
          })
        : localUISettings.startupPage === 'about'
          ? t('settings.workflow.startupPage.options.about', {
              defaultValue: 'About',
            })
          : t('settings.workflow.startupPage.options.home', {
              defaultValue: 'Home',
            });
  const performanceLabel =
    localUISettings.performanceProfile === 'responsive'
      ? t('settings.performance.profile.options.responsive', {
          defaultValue: 'Responsive',
        })
      : localUISettings.performanceProfile === 'efficient'
        ? t('settings.performance.profile.options.efficient', {
            defaultValue: 'Efficient',
          })
        : t('settings.performance.profile.options.balanced', {
            defaultValue: 'Balanced',
          });
  const aiAccelerationLabel =
    localUISettings.aiAccelerationPreference === 'prefer-npu'
      ? t('settings.performance.aiAcceleration.options.preferNpu', {
          defaultValue: 'Prefer NPU',
        })
      : localUISettings.aiAccelerationPreference === 'off'
        ? t('settings.performance.aiAcceleration.options.off', {
            defaultValue: 'Off',
          })
        : t('settings.performance.aiAcceleration.options.auto', {
            defaultValue: 'Auto',
          });

  const phases = [
    {
      key: 'profile',
      label: t('splash.phases.profile', {
        defaultValue: 'Workspace profile',
      }),
      state: 'complete' as const,
    },
    {
      key: 'bridge',
      label: t('splash.phases.bridge', { defaultValue: 'Extension bridge' }),
      state: extensionReady ? ('complete' as const) : ('active' as const),
    },
    {
      key: 'shell',
      label: t('splash.phases.shell', { defaultValue: 'UI shell' }),
      state: translationsReady
        ? ('complete' as const)
        : extensionReady
          ? ('active' as const)
          : ('pending' as const),
    },
  ];

  return (
    <div className={`app-boot app-boot--${panelMode}`}>
      <div className="app-boot__halo app-boot__halo--one" />
      <div className="app-boot__halo app-boot__halo--two" />
      <div className="app-boot__grid">
        <section className="app-boot__hero">
          <div className="app-boot__brand-row">
            <div className="app-boot__mark">WH</div>
            <div>
              <div className="app-boot__eyebrow">
                {t('splash.eyebrow', { defaultValue: 'Windhawk startup' })}
              </div>
              <div className="app-boot__brand">
                {panelMode === 'sidebar'
                  ? t('splash.sidebarBrand', {
                      defaultValue: 'Editor cockpit',
                    })
                  : t('splash.panelBrand', { defaultValue: 'Windhawk' })}
              </div>
            </div>
          </div>
          <h1 className="app-boot__title">
            {panelMode === 'sidebar'
              ? t('splash.sidebarTitle', {
                  defaultValue: 'Loading the editor cockpit',
                })
              : t('splash.panelTitle', {
                  defaultValue: 'Preparing your workspace',
                })}
          </h1>
          <p className="app-boot__description">
            {panelMode === 'sidebar'
              ? t('splash.sidebarDescription', {
                  defaultValue:
                    'Syncing the editor surface, compile controls, and cockpit helpers before the current mod session opens.',
                })
              : t('splash.panelDescription', {
                  defaultValue:
                    'Applying your startup route, local workspace profile, and webview shell before the control center appears.',
                })}
          </p>
          <div className="app-boot__chips">
            <span className="app-boot__chip">
              {t('splash.startingIn', {
                defaultValue: 'Starting in {{page}}',
                page: startupPageLabel,
              })}
            </span>
            <span className="app-boot__chip">
              {t('splash.profile', {
                defaultValue: 'Profile: {{profile}}',
                profile: performanceLabel,
              })}
            </span>
            <span className="app-boot__chip">
              {t('splash.aiAcceleration', {
                defaultValue: 'AI: {{mode}}',
                mode: aiAccelerationLabel,
              })}
            </span>
            <span className="app-boot__chip">
              {localUISettings.useWideLayout
                ? t('splash.layoutWide', {
                    defaultValue: 'Wide workspace',
                  })
                : t('splash.layoutStandard', {
                    defaultValue: 'Standard width',
                  })}
            </span>
          </div>
        </section>
        <section className="app-boot__status">
          <div className="app-boot__status-title">
            {t('splash.statusTitle', {
              defaultValue: 'Startup progress',
            })}
          </div>
          <div className="app-boot__phase-list">
            {phases.map((phase, index) => (
              <div
                key={phase.key}
                className={`app-boot__phase app-boot__phase--${phase.state}`}
              >
                <div className="app-boot__phase-index">{index + 1}</div>
                <div className="app-boot__phase-copy">
                  <div className="app-boot__phase-label">{phase.label}</div>
                  <div className="app-boot__phase-state">
                    {phase.state === 'complete'
                      ? t('splash.phaseComplete', { defaultValue: 'Ready' })
                      : phase.state === 'active'
                        ? t('splash.phaseActive', {
                            defaultValue: 'In progress',
                          })
                        : t('splash.phasePending', {
                            defaultValue: 'Queued',
                          })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="app-boot__hint">
            {t('splash.hint', {
              defaultValue:
                'The first frame now stays visible while the extension bridge and language shell finish warming up.',
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function App() {
  const { t, ready } = useTranslation();
  const content = useMemo(
    () =>
      document.querySelector('body')?.getAttribute('data-content') ??
      (document.location.hash === '#/debug_sidebar' ? 'sidebar' : 'panel'),
    []
  );

  const [extensionAppUISettings, setExtensionAppUISettings] =
    useState<Partial<AppUISettings> | null>(null);
  const [localUISettings, setLocalUISettingsState] = useState<LocalUISettings>(
    () => readLocalUISettings()
  );
  const [setupAssistantOpen, setSetupAssistantOpen] = useState(false);

  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  const applyNewLanguage = useCallback((language?: string) => {
    setLanguage(language);
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    if (language && rtlLanguages.includes(language.split('-')[0])) {
      setDirection('rtl');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      setDirection('ltr');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, []);

  useEffect(() => {
    applyNewLanguage(extensionAppUISettings?.language);
  }, [applyNewLanguage, extensionAppUISettings?.language]);

  useEffect(() => {
    const effectiveReduceMotion =
      localUISettings.reduceMotion ||
      localUISettings.performanceProfile === 'efficient';

    document.documentElement.setAttribute(
      'data-windhawk-density',
      localUISettings.interfaceDensity
    );
    document.documentElement.setAttribute(
      'data-windhawk-reduce-motion',
      String(effectiveReduceMotion)
    );
    document.documentElement.setAttribute(
      'data-windhawk-layout',
      localUISettings.useWideLayout ? 'wide' : 'default'
    );
    document.documentElement.setAttribute(
      'data-windhawk-performance',
      localUISettings.performanceProfile
    );
    document.documentElement.setAttribute(
      'data-windhawk-ai-acceleration',
      localUISettings.aiAccelerationPreference
    );
  }, [localUISettings]);

  const setLocalUISettings = useCallback(
    (updates: Partial<LocalUISettings>) => {
      setLocalUISettingsState((current) => {
        const next = mergeLocalUISettings(current, updates);
        writeLocalUISettings(next);
        return next;
      });
    },
    []
  );

  const resetLocalUISettings = useCallback(() => {
    setLocalUISettingsState(defaultLocalUISettings);
    writeLocalUISettings(defaultLocalUISettings);
  }, []);

  const applySetupProfile = useCallback((settings: LocalUISettings) => {
    setLocalUISettingsState(settings);
    writeLocalUISettings(settings);
    setSetupAssistantOpen(false);
  }, []);

  const openSetupAssistant = useCallback(() => {
    setSetupAssistantOpen(true);
  }, []);

  const { getInitialAppSettings } = useGetInitialAppSettings(
    useCallback((data) => {
      setExtensionAppUISettings(data.appUISettings || {});
    }, [])
  );

  useEffect(() => {
    if (!useMockData) {
      getInitialAppSettings({});
    } else {
      setExtensionAppUISettings(mockAppUISettings || {});
    }
  }, [getInitialAppSettings]);

  useSetNewAppSettings(
    useCallback((data) => {
      setExtensionAppUISettings((current) => ({
        ...(current ?? {}),
        ...(data.appUISettings || {}),
      }));
    }, [])
  );

  const appUISettings = useMemo<AppUISettingsContextType | null>(
    () => (extensionAppUISettings ? {
      ...extensionAppUISettings,
      localUISettings,
      setLocalUISettings,
      resetLocalUISettings,
      openSetupAssistant,
    } : null),
    [
      extensionAppUISettings,
      localUISettings,
      openSetupAssistant,
      setLocalUISettings,
      resetLocalUISettings,
    ]
  );

  useEffect(() => {
    if (extensionAppUISettings && !hasStoredLocalUISettings()) {
      setSetupAssistantOpen(true);
    }
  }, [extensionAppUISettings]);

  const isBooting = !content || !appUISettings || !ready;

  return (
    <ConfigProvider direction={direction}>
      {isBooting ? (
        <AppBootSplash
          content={content}
          extensionReady={!!appUISettings}
          translationsReady={ready}
          localUISettings={localUISettings}
          t={t}
        />
      ) : (
        <AppUISettingsContext.Provider value={appUISettings}>
          {content === 'panel' ? (
            <Panel />
          ) : content === 'sidebar' ? (
            <Sidebar />
          ) : (
            ''
          )}
          <Modal
            open={setupAssistantOpen}
            title={t('setupAssistant.title', {
              defaultValue: 'Choose your first-launch workspace',
            })}
            onCancel={() => applySetupProfile(localUISettings)}
            footer={null}
            centered
          >
            <p>
              {t('setupAssistant.description', {
                defaultValue:
                  'Pick a starting profile now. You can change any of these options later in Settings.',
              })}
            </p>
            <div className="setup-assistant__actions">
              <Button
                type="primary"
                block
                onClick={() => applySetupProfile(defaultLocalUISettings)}
              >
                {t('setupAssistant.balanced', {
                  defaultValue: 'Use balanced defaults',
                })}
              </Button>
              <Button
                block
                onClick={() =>
                  applySetupProfile(
                    mergeLocalUISettings(defaultLocalUISettings, {
                      preferredAuthoringLanguage: 'python',
                      preferredSourceExtension: '.wh.py',
                      preferredStudioMode: 'visual',
                      startupPage: 'home',
                    })
                  )
                }
              >
                {t('setupAssistant.pythonCreator', {
                  defaultValue: 'Start in Python + visual mode',
                })}
              </Button>
              <Button
                block
                onClick={() =>
                  applySetupProfile(
                    mergeLocalUISettings(defaultLocalUISettings, {
                      preferredAuthoringLanguage: 'cpp',
                      preferredSourceExtension: '.wh.cpp',
                      preferredStudioMode: 'code',
                      editorAssistanceLevel: 'guided',
                    })
                  )
                }
              >
                {t('setupAssistant.classicCpp', {
                  defaultValue: 'Stay with classic C++ authoring',
                })}
              </Button>
            </div>
          </Modal>
        </AppUISettingsContext.Provider>
      )}
    </ConfigProvider>
  );
}

export default App;
