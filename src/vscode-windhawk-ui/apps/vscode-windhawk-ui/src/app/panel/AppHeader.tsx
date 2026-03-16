import {
  faCog,
  faHome,
  faInfo,
  faList,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Button } from 'antd';
import { PresetStatusColorType } from 'antd/lib/_util/colors';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AppUISettingsContext } from '../appUISettings';
import logo from './assets/logo-white.svg';

type StatusTone = 'default' | 'warning' | 'error';

const HeaderShell = styled.div`
  padding: 18px var(--app-horizontal-padding) 0;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: var(--app-card-padding);
  margin: 0 auto;
  width: 100%;
  max-width: calc(var(--app-max-width) + (var(--app-horizontal-padding) * 2));
  border: 1px solid var(--app-surface-border);
  border-radius: var(--app-surface-radius);
  background:
    linear-gradient(140deg, rgba(23, 125, 220, 0.16), transparent 38%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  box-shadow: var(--app-surface-shadow);
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLogo = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin: 0 auto 0 0;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  white-space: nowrap;
  user-select: none;
`;

const LogoImage = styled.img`
  height: 64px;
`;

const LogoWordmark = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const LogoTitle = styled.div`
  font-size: 38px;
  line-height: 0.95;
  font-family: Oxanium;
`;

const LogoSubtitle = styled.div`
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const HeaderButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const HeaderIcon = styled(FontAwesomeIcon)`
  margin-inline-end: 8px;
`;

const NavButton = styled(Button)`
  height: var(--app-nav-button-height);
  padding-inline: 16px;
  border-color: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: none;

  &.ant-btn:hover,
  &.ant-btn:focus {
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  &.ant-btn-primary,
  &.ant-btn-primary:hover,
  &.ant-btn-primary:focus {
    border-color: rgba(23, 125, 220, 0.45);
    background: rgba(23, 125, 220, 0.18);
    color: #fff;
  }
`;

const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusPill = styled.span<{ $tone: StatusTone }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: var(--app-status-pill-height);
  padding: 0 12px 0 28px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);

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
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.04);
  }
`;

type HeaderButton = {
  text: string;
  route: string;
  icon: IconDefinition;
  badge?: {
    status: PresetStatusColorType;
    title?: string;
  };
};

type StatusItem = {
  key: string;
  text: string;
  tone: StatusTone;
};

function AppHeader() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const {
    loggingEnabled,
    updateIsAvailable,
    safeMode,
    localUISettings,
  } = useContext(AppUISettingsContext);

  const buttons: HeaderButton[] = [
    {
      text: t('appHeader.home'),
      route: '/',
      icon: faHome,
    },
    {
      text: t('appHeader.explore'),
      route: '/mods-browser',
      icon: faList,
    },
    {
      text: t('appHeader.settings'),
      route: '/settings',
      icon: faCog,
      badge: loggingEnabled ? {
        status: 'warning',
        title: t('general.loggingEnabled'),
      } : undefined,
    },
    {
      text: t('appHeader.about'),
      route: '/about',
      icon: faInfo,
      badge: updateIsAvailable ? {
        status: 'error',
        title: t('about.update.title'),
      } : undefined,
    },
  ];

  const statusItems: StatusItem[] = [
    updateIsAvailable
      ? { key: 'update', text: t('appHeader.status.updateAvailable'), tone: 'error' as const }
      : null,
    safeMode
      ? { key: 'safeMode', text: t('appHeader.status.safeMode'), tone: 'warning' as const }
      : null,
    loggingEnabled
      ? { key: 'logging', text: t('appHeader.status.debugLogging'), tone: 'warning' as const }
      : null,
    localUISettings.interfaceDensity === 'compact'
      ? { key: 'compact', text: t('appHeader.status.compactDensity'), tone: 'default' as const }
      : null,
    localUISettings.useWideLayout
      ? { key: 'wide', text: t('appHeader.status.wideLayout'), tone: 'default' as const }
      : null,
  ].filter((item): item is StatusItem => item !== null);

  return (
    <HeaderShell>
      <Header>
        <HeaderTop>
          <HeaderLogo onClick={() => navigate('/')} type="button">
            <LogoImage src={logo} alt="logo" />
            <LogoWordmark>
              <LogoTitle>Windhawk</LogoTitle>
              <LogoSubtitle>{t('appHeader.tagline')}</LogoSubtitle>
            </LogoWordmark>
          </HeaderLogo>
          <HeaderButtonsWrapper>
            {buttons.map(({ text, route, icon, badge }) => (
              <Badge key={route} dot={!!badge} status={badge?.status} title={badge?.title}>
                <NavButton
                  type={location.pathname === route ? 'primary' : 'default'}
                  onClick={() => navigate(route)}
                >
                  <HeaderIcon icon={icon} />
                  {text}
                </NavButton>
              </Badge>
            ))}
          </HeaderButtonsWrapper>
        </HeaderTop>
        {statusItems.length > 0 && (
          <StatusRow>
            {statusItems.map(({ key, text, tone }) => (
              <StatusPill key={key} $tone={tone}>
                {text}
              </StatusPill>
            ))}
          </StatusRow>
        )}
      </Header>
    </HeaderShell>
  );
}

export default AppHeader;
