import { faGithubAlt } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowLeft,
  faArrowRight,
  faHeart,
  faHome,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Card, ConfigProvider, Dropdown, Modal, Rate, Tooltip, Typography } from 'antd';
import { useContext, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import EllipsisText from '../components/EllipsisText';
import { PopconfirmModal } from '../components/InputWithContextMenu';
import { sanitizeUrl } from '../utils';
import { ModConfig, ModMetadata, RepositoryDetails } from '../webviewIPCMessages';
import DevModeAction from './DevModeAction';
import {
  buildInstallDecisionChecklist,
  getInstallDecisionRecommendations,
  InstallDecisionAction,
  InstallSourceData,
} from './installDecisionUtils';
import ModMetadataLine from './ModMetadataLine';

const TextAsIconWrapper = styled.span`
  position: relative;
  display: inline-block;
  width: 1ch;
  font-size: 18px;
  line-height: 18px;
  color: transparent;
  user-select: none;

  &::before {
    content: 'X';
    position: absolute;
    inset: 0;
    color: rgba(255, 255, 255, 0.88);
  }
`;

const ModDetailsHeaderWrapper = styled.div`
  display: flex;
  margin-bottom: 4px;

  > :first-child {
    flex-shrink: 0;
    margin-inline-end: 12px;
    // Center vertically with text:
    margin-top: -8px;
  }

  // https://stackoverflow.com/q/26465745
  .ant-card-meta {
    min-width: 0;
  }
`;

const CardTitleWrapper = styled.div`
  padding-bottom: 4px;
`;

const CardTitleFirstLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 8px;

  > * {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  > :not(:first-child) {
    font-size: 14px;
    font-weight: normal;
  }
`;

const CardTitleModId = styled.div`
  border-radius: 2px;
  background: #444;
  padding: 0 4px;
`;

const CardTitleDescription = styled(EllipsisText)`
  display: block !important;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
  font-weight: normal;
`;

const ModRate = styled(Rate)`
  line-height: 0.7;
`;

const HeartIcon = styled(FontAwesomeIcon)`
  color: #ff4d4f;
  margin-inline-end: 4px;
`;

const CardTitleButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;

  // Fixes a button alignment bug.
  > .ant-tooltip-disabled-compatible-wrapper,
  > .ant-popover-disabled-compatible-wrapper {
    font-size: 0;
  }
`;

const ModInstallationAlert = styled(Alert)`
  line-height: 1.2;
`;

const ModInstallationModalContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 24px;
`;

const ModInstallationDetails = styled.div`
  display: grid;
  grid-template-columns: 20px auto;
  align-items: center;
  row-gap: 4px;
`;

const ModInstallationDetailsVerified = styled.span`
  text-decoration: underline dotted;
  cursor: help;
`;

const ModInstallationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModInstallationSectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

const ModInstallationSectionDescription = styled(Typography.Text)`
  color: rgba(255, 255, 255, 0.65);
`;

const ModInstallationSignalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
`;

const ModInstallationSignalCard = styled.div<{ $tone: 'neutral' | 'positive' | 'caution' }>`
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: ${({ $tone }) => (
    $tone === 'positive'
      ? 'rgba(82, 196, 26, 0.08)'
      : $tone === 'caution'
        ? 'rgba(250, 173, 20, 0.08)'
        : 'rgba(255, 255, 255, 0.02)'
  )};
`;

const ModInstallationSignalLabel = styled(Typography.Text)`
  display: block;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const ModInstallationSignalValue = styled.div`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
`;

const ModInstallationReviewActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ModInstallationStrategyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

const ModInstallationStrategyCard = styled.div<{ $recommended: boolean }>`
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid ${({ $recommended }) => (
    $recommended ? 'rgba(24, 144, 255, 0.55)' : 'rgba(255, 255, 255, 0.08)'
  )};
  background: ${({ $recommended }) => (
    $recommended ? 'rgba(24, 144, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)'
  )};
`;

const ModInstallationStrategyTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const ModInstallationStrategyDescription = styled.div`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.45;
`;

const ModInstallationChecklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ModInstallationChecklistItem = styled.div`
  display: flex;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.45;

  &::before {
    content: '•';
    color: rgba(255, 255, 255, 0.48);
  }
`;

type InstallReviewTab = 'details' | 'code' | 'changelog';
type InstallSignalTone = 'neutral' | 'positive' | 'caution';

type InstallSignal = {
  key: string;
  label: string;
  value: string;
  tone: InstallSignalTone;
};

export type ModStatus =
  | 'not-installed'
  | 'installed-not-compiled'
  | 'disabled'
  | 'enabled';

function VerifiedLabel() {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={
        <Trans
          t={t}
          i18nKey="installModal.verifiedTooltip"
          components={[<strong />]}
        />
      }
      placement="bottom"
    >
      <ModInstallationDetailsVerified>
        {t('installModal.verified')}
      </ModInstallationDetailsVerified>
    </Tooltip>
  );
}

function ModInstallationDetailsGrid(props: { modMetadata: ModMetadata }) {
  const { t } = useTranslation();

  const { modMetadata } = props;

  return (
    <ModInstallationDetails>
      {modMetadata.author && (
        <>
          <FontAwesomeIcon icon={faUser} />
          <div>
            <strong>{t('installModal.modAuthor')}:</strong> {modMetadata.author}
          </div>
        </>
      )}
      {modMetadata.homepage && (
        <>
          <FontAwesomeIcon icon={faHome} />
          <div>
            <strong>{t('installModal.homepage')}:</strong>{' '}
            <a href={sanitizeUrl(modMetadata.homepage)}>{modMetadata.homepage}</a>
          </div>
        </>
      )}
      {modMetadata.github && (
        <>
          <FontAwesomeIcon icon={faGithubAlt} />
          <div>
            <strong>
              {t('installModal.github')} (<VerifiedLabel />
              ):
            </strong>{' '}
            <a href={sanitizeUrl(modMetadata.github)}>
              {modMetadata.github.replace(
                /^https:\/\/github\.com\/([a-z0-9-]+)$/i,
                '$1'
              )}
            </a>
          </div>
        </>
      )}
      {modMetadata.twitter && (
        <>
          <TextAsIconWrapper>𝕏</TextAsIconWrapper>
          <div>
            <strong>
              {t('installModal.twitter')} (<VerifiedLabel />
              ):
            </strong>{' '}
            <a href={sanitizeUrl(modMetadata.twitter)}>
              {modMetadata.twitter.replace(
                /^https:\/\/(?:twitter|x)\.com\/([a-z0-9_]+)$/i,
                '@$1'
              )}
            </a>
          </div>
        </>
      )}
    </ModInstallationDetails>
  );
}

function formatRelativeUpdate(timestamp: number, locale: string): string {
  const dayInMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((timestamp - Date.now()) / dayInMs);
  const absDays = Math.abs(diffDays);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absDays < 45) {
    return formatter.format(diffDays, 'day');
  }

  if (absDays < 540) {
    return formatter.format(Math.round(diffDays / 30), 'month');
  }

  return formatter.format(Math.round(diffDays / 365), 'year');
}

function normalizeProcessName(process: string): string {
  return process.includes('\\')
    ? process.substring(process.lastIndexOf('\\') + 1)
    : process;
}

function getTargetingSummary(
  t: ReturnType<typeof useTranslation>['t'],
  modMetadata: ModMetadata
): { value: string; tone: InstallSignalTone } {
  const include = (modMetadata.include || []).filter(Boolean);
  if (!include.length) {
    return {
      value: t('installModal.values.metadataLimited') as string,
      tone: 'neutral',
    };
  }

  if (include.some((entry) => entry.includes('*') || entry.includes('?'))) {
    return {
      value: t('installModal.values.allProcesses') as string,
      tone: 'caution',
    };
  }

  const processes = Array.from(
    new Set(include.map((entry) => normalizeProcessName(entry)))
  );

  if (processes.length === 1) {
    return {
      value: processes[0],
      tone: 'positive',
    };
  }

  if (processes.length <= 3) {
    return {
      value: processes.join(', '),
      tone: 'neutral',
    };
  }

  return {
    value: t('installModal.values.processPlusMore', {
      first: processes[0],
      count: processes.length - 1,
    }) as string,
    tone: processes.length >= 6 ? 'caution' : 'neutral',
  };
}

function buildReviewabilitySummary(
  t: ReturnType<typeof useTranslation>['t'],
  installSourceData?: InstallSourceData
): string {
  const items: string[] = [];

  if (installSourceData?.source) {
    items.push(t('installModal.values.sourceCode') as string);
  }

  items.push(t('installModal.values.changelog') as string);

  if (installSourceData?.initialSettings?.length) {
    items.push(t('installModal.values.settings') as string);
  }

  if (installSourceData?.readme) {
    items.push(t('installModal.values.readme') as string);
  }

  return items.join(' | ');

  return items.join(' · ');
}

function buildInstallSignals(
  t: ReturnType<typeof useTranslation>['t'],
  locale: string,
  modMetadata: ModMetadata,
  repositoryDetails: RepositoryDetails | undefined,
  installSourceData: InstallSourceData | undefined
): InstallSignal[] {
  const targeting = getTargetingSummary(t, modMetadata);
  const reviewability = buildReviewabilitySummary(t, installSourceData);

  return [
    {
      key: 'community',
      label: t('installModal.signals.community') as string,
      value: repositoryDetails
        ? (t('installModal.values.communitySummary', {
          users: repositoryDetails.users.toLocaleString(),
          rating: (repositoryDetails.rating / 2).toFixed(1),
        }) as string)
        : (t('installModal.values.noCommunityData') as string),
      tone: repositoryDetails && repositoryDetails.users >= 1000 ? 'positive' : 'neutral',
    },
    {
      key: 'targeting',
      label: t('installModal.signals.targeting') as string,
      value: targeting.value,
      tone: targeting.tone,
    },
    {
      key: 'freshness',
      label: t('installModal.signals.freshness') as string,
      value: repositoryDetails
        ? (t('installModal.values.updatedRelative', {
          when: formatRelativeUpdate(repositoryDetails.updated, locale),
        }) as string)
        : (t('installModal.values.metadataLimited') as string),
      tone: repositoryDetails &&
        (Date.now() - repositoryDetails.updated) / (24 * 60 * 60 * 1000) <= 90
        ? 'positive'
        : 'neutral',
    },
    {
      key: 'reviewability',
      label: t('installModal.signals.reviewability') as string,
      value: reviewability,
      tone: installSourceData?.source ? 'positive' : 'neutral',
    },
  ];
}

interface Props {
  topNode?: React.ReactNode;
  modId: string;
  modMetadata: ModMetadata;
  modConfig?: ModConfig;
  installSourceData?: InstallSourceData;
  modStatus: ModStatus;
  updateAvailable: boolean;
  installedVersionIsLatest: boolean;
  isDowngrade: boolean;
  userRating?: number;
  repositoryDetails?: RepositoryDetails;
  callbacks: {
    goBack: () => void;
    installMod?: (options?: { disabled?: boolean }) => void;
    openTab?: (tab: InstallReviewTab) => void;
    updateMod?: () => void;
    forkModFromSource?: () => void;
    compileMod: () => void;
    enableMod: (enable: boolean) => void;
    editMod: () => void;
    forkMod: () => void;
    deleteMod: () => void;
    updateModRating: (newRating: number) => void;
    onOpenVersionModal?: () => void;
  };
}

function ModDetailsHeader(props: Props) {
  const { t, i18n } = useTranslation();

  const { modId, modMetadata, modConfig, modStatus, callbacks } = props;

  const { direction } = useContext(ConfigProvider.ConfigContext);

  let displayModId = props.modId;
  let isLocalMod = false;
  if (modId.startsWith('local@')) {
    displayModId = modId.slice('local@'.length);
    isLocalMod = true;
  }

  const displayModName = modMetadata.name || displayModId;

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const installSignals = useMemo(
    () => buildInstallSignals(
      t,
      i18n.language,
      modMetadata,
      props.repositoryDetails,
      props.installSourceData
    ),
    [i18n.language, modMetadata, props.installSourceData, props.repositoryDetails, t]
  );
  const installRecommendations = useMemo(
    () => getInstallDecisionRecommendations(
      modMetadata,
      props.repositoryDetails,
      props.installSourceData
    ),
    [modMetadata, props.installSourceData, props.repositoryDetails]
  );
  const installChecklist = useMemo(
    () => buildInstallDecisionChecklist(
      modMetadata,
      props.repositoryDetails,
      props.installSourceData
    ),
    [modMetadata, props.installSourceData, props.repositoryDetails]
  );

  const handleReviewTab = (tab: InstallReviewTab) => {
    callbacks.openTab?.(tab);
    setIsInstallModalOpen(false);
  };
  const handleInstallDecision = (action: InstallDecisionAction) => {
    if (action === 'install-disabled') {
      callbacks.installMod?.({ disabled: true });
      setIsInstallModalOpen(false);
      return;
    }

    if (action === 'install-now') {
      callbacks.installMod?.();
      setIsInstallModalOpen(false);
      return;
    }

    if (action === 'review-source') {
      handleReviewTab('code');
      return;
    }

    if (action === 'review-changelog') {
      handleReviewTab('changelog');
      return;
    }

    handleReviewTab('details');
  };

  return (
    <ModDetailsHeaderWrapper>
      <Button
        type="text"
        icon={<FontAwesomeIcon icon={direction === 'rtl' ? faArrowRight : faArrowLeft} />}
        onClick={() => callbacks.goBack()}
      />
      <Card.Meta
        title={
          <>
            {props.topNode}
            <CardTitleWrapper>
              <CardTitleFirstLine>
                <div>{displayModName}</div>
                <Tooltip
                  title={t('modDetails.header.modId')}
                  placement="bottom"
                >
                  <CardTitleModId>{displayModId}</CardTitleModId>
                </Tooltip>
              </CardTitleFirstLine>
              <ModMetadataLine
                modMetadata={modMetadata}
                customProcesses={modConfig && {
                  include: modConfig.includeCustom,
                  exclude: modConfig.excludeCustom,
                  includeExcludeCustomOnly: modConfig.includeExcludeCustomOnly,
                  patternsMatchCriticalSystemProcesses: modConfig.patternsMatchCriticalSystemProcesses,
                }}
                repositoryDetails={props.repositoryDetails}
              />
              {modMetadata.description && (
                <CardTitleDescription tooltipPlacement="bottom">
                  {modMetadata.description}
                </CardTitleDescription>
              )}
              {modStatus !== 'not-installed' &&
                modStatus !== 'installed-not-compiled' &&
                !isLocalMod && (
                  <ModRate
                    value={props.userRating}
                    onChange={(newRating) =>
                      callbacks.updateModRating(newRating)
                    }
                  />
                )}
              <CardTitleButtons>
                {props.updateAvailable && (
                  <Tooltip
                    title={
                      props.installedVersionIsLatest &&
                      t('modDetails.header.updateNotNeeded')
                    }
                    placement="bottom"
                  >
                    {/* Wrap in div to prevent taking 100% width */}
                    <div>
                      <Dropdown.Button
                        type="primary"
                        size="small"
                        disabled={
                          !callbacks.updateMod || props.installedVersionIsLatest
                        }
                        onClick={() => callbacks.updateMod?.()}
                        menu={{
                          items: [
                            {
                              key: 'choose',
                              label: t('modDetails.version.chooseVersion'),
                              onClick: callbacks.onOpenVersionModal,
                            },
                          ],
                        }}
                      >
                        {props.isDowngrade
                          ? t('mod.downgrade')
                          : t('mod.update')}
                      </Dropdown.Button>
                    </div>
                  </Tooltip>
                )}
                {modStatus === 'not-installed' ? (
                  !props.updateAvailable && (
                    // Wrap in div to prevent taking 100% width
                    <div>
                      <Dropdown.Button
                        type="primary"
                        size="small"
                        disabled={!callbacks.installMod}
                        onClick={() => setIsInstallModalOpen(true)}
                        menu={{
                          items: [
                            {
                              key: 'choose',
                              label: t('modDetails.version.chooseVersion'),
                              onClick: callbacks.onOpenVersionModal,
                            },
                          ],
                        }}
                      >
                        {t('mod.install')}
                      </Dropdown.Button>
                    </div>
                  )
                ) : modStatus === 'installed-not-compiled' ? (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => callbacks.compileMod()}
                  >
                    {t('mod.compile')}
                  </Button>
                ) : modStatus === 'enabled' ? (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => callbacks.enableMod(false)}
                  >
                    {t('mod.disable')}
                  </Button>
                ) : modStatus === 'disabled' ? (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => callbacks.enableMod(true)}
                  >
                    {t('mod.enable')}
                  </Button>
                ) : (
                  ''
                )}
                {modStatus !== 'not-installed' &&
                  isLocalMod && (
                    <DevModeAction
                      popconfirmPlacement="bottom"
                      onClick={() => callbacks.editMod()}
                      renderButton={(onClick) => (
                        <Button type="primary" size="small" onClick={onClick}>
                          {t('mod.edit')}
                        </Button>
                      )}
                    />
                  )}
                {modStatus !== 'not-installed' ? (
                  <>
                    <DevModeAction
                      popconfirmPlacement="bottom"
                      onClick={() => callbacks.forkMod()}
                      renderButton={(onClick) => (
                        <Button type="primary" size="small" onClick={onClick}>
                          {t('mod.fork')}
                        </Button>
                      )}
                    />
                    <PopconfirmModal
                      placement="bottom"
                      title={t('mod.removeConfirm')}
                      okText={t('mod.removeConfirmOk')}
                      cancelText={t('mod.removeConfirmCancel')}
                      okButtonProps={{ danger: true }}
                      onConfirm={() => callbacks.deleteMod()}
                    >
                      <Button type="primary" size="small">
                        {t('mod.remove')}
                      </Button>
                    </PopconfirmModal>
                  </>
                ) : (
                  <DevModeAction
                    disabled={!callbacks.forkModFromSource}
                    popconfirmPlacement="bottom"
                    onClick={() => callbacks.forkModFromSource?.()}
                    renderButton={(onClick) => (
                      <Button
                        type="primary"
                        size="small"
                        disabled={!callbacks.forkModFromSource}
                        onClick={onClick}
                      >
                        {t('mod.fork')}
                      </Button>
                    )}
                  />
                )}
                {modMetadata.donateUrl && (
                  <Button
                    type="primary"
                    size="small"
                    href={sanitizeUrl(modMetadata.donateUrl)}
                    target="_blank"
                  >
                    <HeartIcon icon={faHeart} />
                    {t('mod.donate')}
                  </Button>
                )}
              </CardTitleButtons>
            </CardTitleWrapper>
          </>
        }
      />
      <Modal
        title={t('installModal.title', {
          mod: displayModName,
        })}
        open={isInstallModalOpen}
        width={760}
        centered={true}
        onCancel={() => {
          setIsInstallModalOpen(false);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsInstallModalOpen(false)}>
            {t('installModal.cancelButton')}
          </Button>,
          <Button
            key="disabled"
            onClick={() => handleInstallDecision('install-disabled')}
            disabled={!callbacks.installMod}
          >
            {t('installModal.installDisabledButton')}
          </Button>,
          <Button
            key="accept"
            type="primary"
            onClick={() => handleInstallDecision('install-now')}
            disabled={!callbacks.installMod}
          >
            {t('installModal.acceptButton')}
          </Button>,
        ]}
      >
        <ModInstallationModalContent>
          <ModInstallationAlert
            message={<h3>{t('installModal.warningTitle')}</h3>}
            description={t('installModal.warningDescription')}
            type="warning"
            showIcon
          />
          <ModInstallationSection>
            <ModInstallationSectionTitle>
              {t('installModal.snapshotTitle')}
            </ModInstallationSectionTitle>
            <ModInstallationSectionDescription>
              {t('installModal.snapshotDescription')}
            </ModInstallationSectionDescription>
            <ModInstallationSignalsGrid>
              {installSignals.map((signal) => (
                <ModInstallationSignalCard
                  key={signal.key}
                  $tone={signal.tone}
                >
                  <ModInstallationSignalLabel>
                    {signal.label}
                  </ModInstallationSignalLabel>
                  <ModInstallationSignalValue>
                    {signal.value}
                  </ModInstallationSignalValue>
                </ModInstallationSignalCard>
              ))}
            </ModInstallationSignalsGrid>
          </ModInstallationSection>
          <ModInstallationSection>
            <ModInstallationSectionTitle>
              {t('installModal.strategyTitle')}
            </ModInstallationSectionTitle>
            <ModInstallationSectionDescription>
              {t('installModal.strategyDescription')}
            </ModInstallationSectionDescription>
            <ModInstallationStrategyGrid>
              {installRecommendations.map((recommendation) => (
                <ModInstallationStrategyCard
                  key={recommendation.key}
                  $recommended={recommendation.recommended}
                >
                  <ModInstallationStrategyTitle>
                    {recommendation.title}
                    {recommendation.recommended
                      ? ` · ${t('installModal.recommended')}`
                      : ''}
                  </ModInstallationStrategyTitle>
                  <ModInstallationStrategyDescription>
                    {recommendation.description}
                  </ModInstallationStrategyDescription>
                  <Button
                    size="small"
                    style={{ marginTop: 10 }}
                    onClick={() => handleInstallDecision(recommendation.key)}
                  >
                    {t('installModal.useStrategyButton')}
                  </Button>
                </ModInstallationStrategyCard>
              ))}
            </ModInstallationStrategyGrid>
          </ModInstallationSection>
          <ModInstallationDetailsGrid modMetadata={modMetadata} />
          <ModInstallationSection>
            <ModInstallationSectionTitle>
              {t('installModal.reviewTitle')}
            </ModInstallationSectionTitle>
            <ModInstallationSectionDescription>
              {t('installModal.reviewDescription')}
            </ModInstallationSectionDescription>
            <ModInstallationReviewActions>
              <Button onClick={() => handleReviewTab('details')}>
                {t('installModal.viewDetailsButton')}
              </Button>
              <Button onClick={() => handleReviewTab('code')}>
                {t('installModal.viewSourceButton')}
              </Button>
              <Button onClick={() => handleReviewTab('changelog')}>
                {t('installModal.viewChangelogButton')}
              </Button>
            </ModInstallationReviewActions>
          </ModInstallationSection>
          <ModInstallationSection>
            <ModInstallationSectionTitle>
              {t('installModal.checklistTitle')}
            </ModInstallationSectionTitle>
            <ModInstallationSectionDescription>
              {t('installModal.checklistDescription')}
            </ModInstallationSectionDescription>
            <ModInstallationChecklist>
              {installChecklist.map((item) => (
                <ModInstallationChecklistItem key={item}>
                  <span>{item}</span>
                </ModInstallationChecklistItem>
              ))}
            </ModInstallationChecklist>
          </ModInstallationSection>
        </ModInstallationModalContent>
      </Modal>
    </ModDetailsHeaderWrapper>
  );
}

export default ModDetailsHeader;
