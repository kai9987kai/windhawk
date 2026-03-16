import { ConfigProvider } from 'antd';
import 'prism-themes/themes/prism-vsc-dark-plus.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import 'react-diff-view/style/index.css';
import { useTranslation } from 'react-i18next';
import './App.css';
import {
  AppUISettingsContext,
  AppUISettingsContextType,
  defaultLocalUISettings,
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

function WhenTranslationIsReady(
  props: React.PropsWithChildren<Record<never, never>>
) {
  const { ready } = useTranslation();
  // https://stackoverflow.com/a/63898849
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return ready ? <>{props.children}</> : null;
}

function App() {
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
    document.documentElement.setAttribute(
      'data-windhawk-density',
      localUISettings.interfaceDensity
    );
    document.documentElement.setAttribute(
      'data-windhawk-reduce-motion',
      String(localUISettings.reduceMotion)
    );
    document.documentElement.setAttribute(
      'data-windhawk-layout',
      localUISettings.useWideLayout ? 'wide' : 'default'
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
    } : null),
    [
      extensionAppUISettings,
      localUISettings,
      setLocalUISettings,
      resetLocalUISettings,
    ]
  );

  if (!content || !appUISettings) {
    return null;
  }

  return (
    <WhenTranslationIsReady>
      <AppUISettingsContext.Provider value={appUISettings}>
        <ConfigProvider direction={direction}>
          {content === 'panel' ? (
            <Panel />
          ) : content === 'sidebar' ? (
            <Sidebar />
          ) : (
            ''
          )}
        </ConfigProvider>
      </AppUISettingsContext.Provider>
    </WhenTranslationIsReady>
  );
}

export default App;
