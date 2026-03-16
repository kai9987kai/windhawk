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
import { AppUISettingsContext } from '../appUISettings';
import {
  InputNumberWithContextMenu,
  SelectModal,
  TextAreaWithContextMenu,
} from '../components/InputWithContextMenu';
import { sanitizeUrl } from '../utils';
import { useGetAppSettings, useUpdateAppSettings } from '../webviewIPC';
import { AppSettings } from '../webviewIPCMessages';
import { mockSettings } from './mockData';

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
    resetLocalUISettings,
    setLocalUISettings,
  } = useContext(AppUISettingsContext);

  const [appSettings, setAppSettings] = useState<Partial<AppSettings> | null>(
    mockSettings
  );

  const [appLoggingVerbosity, setAppLoggingVerbosity] = useState(0);
  const [engineLoggingVerbosity, setEngineLoggingVerbosity] = useState(0);
  const [engineInclude, setEngineInclude] = useState('');
  const [engineExclude, setEngineExclude] = useState('');
  const [engineInjectIntoCriticalProcesses, setEngineInjectIntoCriticalProcesses] =
    useState(false);
  const [engineInjectIntoIncompatiblePrograms, setEngineInjectIntoIncompatiblePrograms] =
    useState(false);
  const [engineInjectIntoGames, setEngineInjectIntoGames] = useState(false);

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
  }, [appSettings]);

  const { getAppSettings } = useGetAppSettings(
    useCallback((data) => {
      setAppSettings(data.appSettings);
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

    return items;
  }, [appSettings?.devModeOptOut, appSettings?.disableUpdateCheck, localUISettings, loggingEnabled, safeMode, t]);

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
