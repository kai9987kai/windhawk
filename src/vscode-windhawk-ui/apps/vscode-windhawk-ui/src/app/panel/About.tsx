import { Alert, Button, Card, message } from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AppUISettingsContext } from '../appUISettings';
import { useGetAppSettings } from '../webviewIPC';
import { AppSettings } from '../webviewIPCMessages';
import { ChangelogModal } from './ChangelogModal';
import { mockSettings } from './mockData';
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

const AboutContainer = styled.div`
  padding: 8px 0 32px;
`;

const HeroCard = styled.section`
  margin-bottom: var(--app-section-gap);
  padding: calc(var(--app-card-padding) + 4px);
  border: 1px solid var(--app-surface-border);
  border-radius: var(--app-surface-radius);
  background:
    radial-gradient(circle at top right, rgba(23, 125, 220, 0.18), transparent 36%),
    radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.08), transparent 30%),
    var(--app-surface-background);
  box-shadow: var(--app-surface-shadow);
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
  border: 1px solid var(--app-surface-border);
  border-radius: var(--app-surface-radius);
  background: var(--app-surface-background);
  box-shadow: var(--app-surface-shadow);

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
    }, [])
  );

  useEffect(() => {
    getAppSettings({});
  }, [getAppSettings]);

  const currentVersion = (
    process.env['REACT_APP_VERSION'] || 'unknown'
  ).replace(/^(\d+(?:\.\d+)+?)(\.0+)+$/, '$1');

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
    ],
    [appSettings, devModeOptOut, language, localUISettings, t]
  );

  const statusItems = useMemo<StatusItem[]>(
    () => [
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
    ],
    [devModeOptOut, loggingEnabled, safeMode, t, updateIsAvailable]
  );

  const supportSnapshot = useMemo(
    () =>
      [
        `Windhawk ${currentVersion}`,
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
      ].join('\n'),
    [
      appSettings?.disableUpdateCheck,
      appSettings?.language,
      currentVersion,
      devModeOptOut,
      language,
      localUISettings.interfaceDensity,
      localUISettings.reduceMotion,
      localUISettings.useWideLayout,
      loggingEnabled,
      safeMode,
      t,
      updateIsAvailable,
    ]
  );

  const copySupportSnapshot = useCallback(() => {
    if (copyText(supportSnapshot)) {
      message.success(t('about.actions.copySuccess'));
    } else {
      message.error(t('about.actions.copyError'));
    }
  }, [supportSnapshot, t]);

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
