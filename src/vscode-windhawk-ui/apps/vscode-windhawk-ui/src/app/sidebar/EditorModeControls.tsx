import { Badge, Button, Dropdown, Switch, Tag, Tooltip, Typography, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PopconfirmModal } from '../components/InputWithContextMenu';
import { copyTextToClipboard } from '../utils';
import {
  previewEditedMod,
  showLogOutput,
  stopCompileEditedMod,
  useCompileEditedMod,
  useCompileEditedModStart,
  useEditedModWasModified,
  useEnableEditedMod,
  useEnableEditedModLogging,
  useExitEditorMode,
  useSetEditedModId,
} from '../webviewIPC';
import { ModMetadata } from '../webviewIPCMessages';
import {
  buildEditorAiPrompt,
  buildEditorContextPacket,
  buildEditorReleasePacket,
  buildEditorVerificationChecklist,
  getEditorEvidenceCards,
  getEditorIterationPlan,
  getEditorVerificationPack,
  getRecommendedCompileProfile,
  summarizeTargetProcesses,
} from './editorModeUtils';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px;
  color: var(--vscode-foreground);
`;

const PanelCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--vscode-widget-border, rgba(255, 255, 255, 0.08));
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01)),
    var(--vscode-editor-background);
`;

const HeroEyebrow = styled(Typography.Text)`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.65));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px;
`;

const HeroTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

const HeroDescription = styled(Typography.Text)`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.7));
  line-height: 1.45;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const ModIdBox = styled.code`
  display: inline-block;
  border-radius: 999px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--vscode-foreground);
  overflow-wrap: anywhere;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const SectionDescription = styled(Typography.Text)`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.7));
  line-height: 1.45;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const StatusCard = styled.div`
  min-width: 0;
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const StatusLabel = styled(Typography.Text)`
  display: block;
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.62));
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatusValue = styled.div`
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const EvidenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
`;

const EvidenceCard = styled.div<{ $tone: 'positive' | 'neutral' | 'caution' }>`
  min-width: 0;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: ${({ $tone }) => (
    $tone === 'positive'
      ? 'rgba(82, 196, 26, 0.08)'
      : $tone === 'caution'
        ? 'rgba(250, 173, 20, 0.08)'
        : 'rgba(255, 255, 255, 0.03)'
  )};
`;

const EvidenceLabel = styled(Typography.Text)`
  display: block;
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.62));
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const EvidenceValue = styled.div`
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const EvidenceDetail = styled.div`
  margin-top: 6px;
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.72));
  line-height: 1.45;
`;

const SwitchField = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  border-radius: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const SwitchFieldText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const SwitchFieldTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

const ActionColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const CompileButtonBadge = styled(Badge)`
  display: block;
  cursor: default;

  > .ant-scroll-number {
    z-index: 3;
  }
`;

const FullWidthDropdownButton = styled(Dropdown.Button)`
  width: 100%;

  .ant-btn:not(.ant-dropdown-trigger) {
    width: calc(100% - 32px);
  }

  .ant-dropdown-trigger {
    width: 32px;
  }
`;

const WorkflowList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WorkflowItem = styled.div`
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const WorkflowTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

const WorkflowBody = styled.div`
  margin-top: 4px;
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.72));
  line-height: 1.45;
`;

const VerificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const VerificationItem = styled.div`
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const VerificationTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

const VerificationBody = styled.div`
  margin-top: 4px;
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.72));
  line-height: 1.45;
`;

type ModDetailsCommon = {
  modId: string;
  modWasModified: boolean;
  metadata?: ModMetadata | null;
};

type ModDetailsNotCompiled = ModDetailsCommon & {
  compiled: false;
};

type ModDetailsCompiled = ModDetailsCommon & {
  compiled: true;
  disabled: boolean;
  loggingEnabled: boolean;
  debugLoggingEnabled: boolean;
};

export type ModDetails = ModDetailsNotCompiled | ModDetailsCompiled;

interface Props {
  initialModDetails: ModDetails;
  onExitEditorMode?: () => void;
}

function EditorModeControls({ initialModDetails, onExitEditorMode }: Props) {
  const { t } = useTranslation();

  const [modId, setModId] = useState(initialModDetails.modId);
  const [metadata, setMetadata] = useState(initialModDetails.metadata || null);
  const [modWasModified, setModWasModified] = useState(
    initialModDetails.modWasModified
  );
  const [isModCompiled, setIsModCompiled] = useState(initialModDetails.compiled);
  const [isModDisabled, setIsModDisabled] = useState(
    initialModDetails.compiled && initialModDetails.disabled
  );
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(
    initialModDetails.compiled && initialModDetails.loggingEnabled
  );
  const [compilationFailed, setCompilationFailed] = useState(false);

  useEffect(() => {
    setModId(initialModDetails.modId);
    setMetadata(initialModDetails.metadata || null);
    setModWasModified(initialModDetails.modWasModified);
    setIsModCompiled(initialModDetails.compiled);
    setIsModDisabled(initialModDetails.compiled ? initialModDetails.disabled : false);
    setIsLoggingEnabled(
      initialModDetails.compiled ? initialModDetails.loggingEnabled : false
    );
  }, [initialModDetails]);

  useSetEditedModId(
    useCallback((data) => {
      setModId(data.modId);
    }, [])
  );

  const { enableEditedMod } = useEnableEditedMod(
    useCallback((data) => {
      if (data.succeeded) {
        setIsModDisabled(!data.enabled);
      }
    }, [])
  );

  const { enableEditedModLogging } = useEnableEditedModLogging(
    useCallback((data) => {
      if (data.succeeded) {
        setIsLoggingEnabled(data.enabled);
      }
    }, [])
  );

  const { compileEditedMod, compileEditedModPending } = useCompileEditedMod(
    useCallback((data) => {
      if (data.succeeded) {
        if (data.clearModified) {
          setModWasModified(false);
        }

        setCompilationFailed(false);
        setIsModCompiled(true);
      } else {
        setCompilationFailed(true);
      }
    }, [])
  );

  const { exitEditorMode } = useExitEditorMode(
    useCallback(
      (data) => {
        if (data.succeeded) {
          onExitEditorMode?.();
        }
      },
      [onExitEditorMode]
    )
  );

  const runCompile = useCallback(
    (options?: { disabled?: boolean; loggingEnabled?: boolean }) => {
      if (compileEditedModPending) {
        return;
      }

      const disabled = options?.disabled ?? isModDisabled;
      const loggingEnabled = options?.loggingEnabled ?? isLoggingEnabled;

      setIsModDisabled(disabled);
      setIsLoggingEnabled(loggingEnabled);
      setCompilationFailed(false);
      compileEditedMod({
        disabled,
        loggingEnabled,
      });
    },
    [
      compileEditedMod,
      compileEditedModPending,
      isLoggingEnabled,
      isModDisabled,
    ]
  );

  useCompileEditedModStart(
    useCallback(() => {
      runCompile();
    }, [runCompile])
  );

  useEditedModWasModified(
    useCallback(() => {
      setModWasModified(true);
      setCompilationFailed(false);
    }, [])
  );

  const displayName = metadata?.name || modId;
  const scopeSummary = useMemo(
    () => summarizeTargetProcesses(metadata?.include),
    [metadata?.include]
  );
  const editorSessionState = useMemo(
    () => ({
      modWasModified,
      isModCompiled,
      isModDisabled,
      isLoggingEnabled,
      compilationFailed,
    }),
    [
      compilationFailed,
      isLoggingEnabled,
      isModCompiled,
      isModDisabled,
      modWasModified,
    ]
  );

  const buildStatus = compileEditedModPending
    ? t('sidebar.status.compiling')
    : compilationFailed
      ? t('sidebar.status.needsAttention')
      : isModCompiled
        ? t('sidebar.status.compiled')
        : t('sidebar.status.notCompiled');
  const stateStatus = modWasModified
    ? t('sidebar.status.modified')
    : t('sidebar.status.synced');
  const runtimeStatus = isModDisabled
    ? t('sidebar.status.disabled')
    : t('sidebar.status.enabled');
  const compileProfileMode = isModDisabled
    ? isLoggingEnabled
      ? t('sidebar.compileMenu.disabledLogging')
      : t('sidebar.compileMenu.disabled')
    : isLoggingEnabled
      ? t('sidebar.compileMenu.logging')
      : t('sidebar.compileMenu.current');

  const evidenceCards = useMemo(
    () => getEditorEvidenceCards(metadata, editorSessionState),
    [editorSessionState, metadata]
  );
  const recommendedCompileProfile = useMemo(
    () => getRecommendedCompileProfile(metadata, editorSessionState),
    [editorSessionState, metadata]
  );
  const workflowItems = useMemo(
    () => getEditorIterationPlan(metadata, editorSessionState),
    [editorSessionState, metadata]
  );
  const verificationItems = useMemo(
    () => getEditorVerificationPack(metadata, editorSessionState),
    [editorSessionState, metadata]
  );
  const contextPacket = useMemo(
    () => buildEditorContextPacket(modId, metadata, editorSessionState),
    [editorSessionState, metadata, modId]
  );

  const copyTextWithFeedback = async (
    text: string,
    successMessage: string
  ) => {
    try {
      await copyTextToClipboard(text);
      message.success(successMessage);
    } catch (error) {
      console.error('Failed to copy editor helper text:', error);
      message.error(t('sidebar.copyError'));
    }
  };

  const compileMenuItems = [
    {
      key: 'current',
      label: t('sidebar.compileMenu.current'),
      onClick: () => runCompile(),
    },
    {
      key: 'disabled',
      label: t('sidebar.compileMenu.disabled'),
      onClick: () => runCompile({ disabled: true, loggingEnabled: false }),
    },
    {
      key: 'logging',
      label: t('sidebar.compileMenu.logging'),
      onClick: () => runCompile({ disabled: false, loggingEnabled: true }),
    },
    {
      key: 'disabled-logging',
      label: t('sidebar.compileMenu.disabledLogging'),
      onClick: () => runCompile({ disabled: true, loggingEnabled: true }),
    },
  ];
  const runRecommendedCompile = useCallback(() => {
    switch (recommendedCompileProfile.key) {
      case 'disabled':
        runCompile({ disabled: true, loggingEnabled: false });
        break;
      case 'logging':
        runCompile({ disabled: false, loggingEnabled: true });
        break;
      case 'disabled-logging':
        runCompile({ disabled: true, loggingEnabled: true });
        break;
      case 'current':
      default:
        runCompile();
        break;
    }
  }, [recommendedCompileProfile.key, runCompile]);

  return (
    <SidebarContainer>
      <PanelCard>
        <HeroEyebrow>{t('sidebar.editorTitle')}</HeroEyebrow>
        <HeroTitle>{displayName}</HeroTitle>
        <HeroDescription>
          {t('sidebar.editorDescription')}
        </HeroDescription>
        <TagRow>
          <Tag color={modWasModified ? 'gold' : 'green'}>{stateStatus}</Tag>
          <Tag color={compilationFailed ? 'red' : isModCompiled ? 'blue' : 'default'}>
            {buildStatus}
          </Tag>
          <Tag color={isModDisabled ? 'default' : 'cyan'}>{runtimeStatus}</Tag>
          {isLoggingEnabled && <Tag color="purple">{t('sidebar.loggingTag')}</Tag>}
        </TagRow>
        <MetaRow>
          <Tooltip title={t('sidebar.modId')} placement="bottom">
            <ModIdBox>{modId}</ModIdBox>
          </Tooltip>
          <Button
            size="small"
            onClick={() =>
              copyTextWithFeedback(modId, t('sidebar.copyModIdSuccess'))
            }
          >
            {t('sidebar.copyModId')}
          </Button>
        </MetaRow>
      </PanelCard>

      <PanelCard>
        <SectionTitle>{t('sidebar.sections.status')}</SectionTitle>
        <SectionDescription>{t('sidebar.sections.statusDescription')}</SectionDescription>
        <StatusGrid>
          <StatusCard>
            <StatusLabel>{t('sidebar.cards.state')}</StatusLabel>
            <StatusValue>{stateStatus}</StatusValue>
          </StatusCard>
          <StatusCard>
            <StatusLabel>{t('sidebar.cards.build')}</StatusLabel>
            <StatusValue>{buildStatus}</StatusValue>
          </StatusCard>
          <StatusCard>
            <StatusLabel>{t('sidebar.cards.scope')}</StatusLabel>
            <StatusValue>{scopeSummary}</StatusValue>
          </StatusCard>
          <StatusCard>
            <StatusLabel>{t('sidebar.cards.version')}</StatusLabel>
            <StatusValue>{metadata?.version || t('sidebar.unknownValue')}</StatusValue>
          </StatusCard>
        </StatusGrid>
      </PanelCard>

      <PanelCard>
        <SectionTitle>{t('sidebar.sections.evidence')}</SectionTitle>
        <SectionDescription>{t('sidebar.sections.evidenceDescription')}</SectionDescription>
        <EvidenceGrid>
          {evidenceCards.map((card) => (
            <EvidenceCard key={card.key} $tone={card.tone}>
              <EvidenceLabel>{card.label}</EvidenceLabel>
              <EvidenceValue>{card.value}</EvidenceValue>
              <EvidenceDetail>{card.detail}</EvidenceDetail>
            </EvidenceCard>
          ))}
        </EvidenceGrid>
      </PanelCard>

      <PanelCard>
        <SectionTitle>{t('sidebar.sections.controls')}</SectionTitle>
        <SectionDescription>
          {t('sidebar.sections.controlsDescription', {
            mode: compileProfileMode,
          })}
        </SectionDescription>
        <SectionDescription>
          {t('sidebar.sections.recommendedCompileDescription', {
            mode: recommendedCompileProfile.label,
          })}
        </SectionDescription>
        <Button
          block
          onClick={() => runRecommendedCompile()}
          disabled={compileEditedModPending}
        >
          {t('sidebar.runRecommendedCompile')}
        </Button>
        <SwitchField>
          <SwitchFieldText>
            <SwitchFieldTitle>{t('sidebar.enableMod')}</SwitchFieldTitle>
            <SectionDescription>{t('sidebar.descriptions.enableMod')}</SectionDescription>
          </SwitchFieldText>
          <Tooltip
            title={!isModCompiled && t('sidebar.notCompiled')}
            placement="bottomRight"
          >
            <Switch
              checked={!isModDisabled}
              disabled={!isModCompiled}
              onChange={(checked) => enableEditedMod({ enable: checked })}
            />
          </Tooltip>
        </SwitchField>
        <SwitchField>
          <SwitchFieldText>
            <SwitchFieldTitle>{t('sidebar.enableLogging')}</SwitchFieldTitle>
            <SectionDescription>{t('sidebar.descriptions.enableLogging')}</SectionDescription>
          </SwitchFieldText>
          <Tooltip
            title={!isModCompiled && t('sidebar.notCompiled')}
            placement="bottomRight"
          >
            <Switch
              checked={isLoggingEnabled}
              disabled={!isModCompiled}
              onChange={(checked) =>
                enableEditedModLogging({ enable: checked })
              }
            />
          </Tooltip>
        </SwitchField>
        <ActionColumn>
          <CompileButtonBadge
            count={compilationFailed ? '!' : undefined}
            size={compilationFailed ? 'small' : undefined}
            title={
              compilationFailed
                ? (t('sidebar.compilationFailed') as string)
                : undefined
            }
            dot={modWasModified && !compilationFailed}
            status={modWasModified && !compilationFailed ? 'warning' : undefined}
          >
            {compileEditedModPending ? (
              <FullWidthDropdownButton
                type="primary"
                loading
                menu={{
                  items: [
                    {
                      key: 'stop',
                      label: t('sidebar.stopCompilation'),
                      onClick: () => stopCompileEditedMod(),
                    },
                  ],
                }}
              >
                {t('general.compiling')}
              </FullWidthDropdownButton>
            ) : (
              <FullWidthDropdownButton
                type="primary"
                menu={{ items: compileMenuItems }}
                onClick={() => runCompile()}
              >
                {t('sidebar.compile')}
              </FullWidthDropdownButton>
            )}
          </CompileButtonBadge>
          <ActionGrid>
            <Tooltip title={!isModCompiled && t('sidebar.notCompiled')}>
              <Button
                block
                disabled={!isModCompiled}
                onClick={() => previewEditedMod()}
              >
                {t('sidebar.preview')}
              </Button>
            </Tooltip>
            <Button block onClick={() => showLogOutput()}>
              {t('sidebar.showLogOutput')}
            </Button>
          </ActionGrid>
        </ActionColumn>
      </PanelCard>

      <PanelCard>
        <SectionTitle>{t('sidebar.sections.verification')}</SectionTitle>
        <SectionDescription>{t('sidebar.sections.verificationDescription')}</SectionDescription>
        <VerificationList>
          {verificationItems.map((item) => (
            <VerificationItem key={item.key}>
              <VerificationTitle>{item.title}</VerificationTitle>
              <VerificationBody>{item.detail}</VerificationBody>
            </VerificationItem>
          ))}
        </VerificationList>
        <ActionGrid>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(
                buildEditorVerificationChecklist(modId, metadata, editorSessionState),
                t('sidebar.verification.copiedChecklist')
              )
            }
          >
            {t('sidebar.verification.copyChecklist')}
          </Button>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(
                buildEditorReleasePacket(modId, metadata, editorSessionState),
                t('sidebar.verification.copiedReleasePacket')
              )
            }
          >
            {t('sidebar.verification.copyReleasePacket')}
          </Button>
        </ActionGrid>
      </PanelCard>

      <PanelCard>
        <SectionTitle>{t('sidebar.sections.ai')}</SectionTitle>
        <SectionDescription>{t('sidebar.sections.aiDescription')}</SectionDescription>
        <ActionColumn>
          <Button
            block
            type="primary"
            onClick={() =>
              copyTextWithFeedback(
                contextPacket,
                t('sidebar.ai.copiedContextPack')
              )
            }
          >
            {t('sidebar.ai.contextPack')}
          </Button>
        </ActionColumn>
        <ActionGrid>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(
                buildEditorAiPrompt('scaffold', modId, metadata, editorSessionState),
                t('sidebar.ai.copiedScaffold')
              )
            }
          >
            {t('sidebar.ai.scaffold')}
          </Button>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(
                buildEditorAiPrompt('review', modId, metadata, editorSessionState),
                t('sidebar.ai.copiedReview')
              )
            }
          >
            {t('sidebar.ai.review')}
          </Button>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(
                buildEditorAiPrompt('explain-scope', modId, metadata, editorSessionState),
                t('sidebar.ai.copiedExplainScope')
              )
            }
          >
            {t('sidebar.ai.explainScope')}
          </Button>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(
                buildEditorAiPrompt('test-plan', modId, metadata, editorSessionState),
                t('sidebar.ai.copiedTestPlan')
              )
            }
          >
            {t('sidebar.ai.testPlan')}
          </Button>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(
                buildEditorAiPrompt('docs', modId, metadata, editorSessionState),
                t('sidebar.ai.copiedDocs')
              )
            }
          >
            {t('sidebar.ai.docs')}
          </Button>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(
                buildEditorAiPrompt(
                  'release-notes',
                  modId,
                  metadata,
                  editorSessionState
                ),
                t('sidebar.ai.copiedReleaseNotes')
              )
            }
          >
            {t('sidebar.ai.releaseNotes')}
          </Button>
          <Button
            block
            onClick={() =>
              copyTextWithFeedback(contextPacket, t('sidebar.ai.copiedBrief'))
            }
          >
            {t('sidebar.ai.brief')}
          </Button>
        </ActionGrid>
      </PanelCard>

      <PanelCard>
        <SectionTitle>{t('sidebar.sections.workflow')}</SectionTitle>
        <SectionDescription>{t('sidebar.sections.workflowDescription')}</SectionDescription>
        <WorkflowList>
          {workflowItems.map((item) => (
            <WorkflowItem key={item.key}>
              <WorkflowTitle>{item.title}</WorkflowTitle>
              <WorkflowBody>{item.body}</WorkflowBody>
            </WorkflowItem>
          ))}
        </WorkflowList>
      </PanelCard>

      <PopconfirmModal
        placement="bottom"
        disabled={!(modWasModified && !isModCompiled) || compileEditedModPending}
        title={t('sidebar.exitConfirmation')}
        okText={t('sidebar.exitButtonOk')}
        cancelText={t('sidebar.exitButtonCancel')}
        onConfirm={() => exitEditorMode({ saveToDrafts: false })}
      >
        <Button
          type="primary"
          danger
          block
          disabled={compileEditedModPending}
          onClick={
            modWasModified && !isModCompiled
              ? undefined
              : () => exitEditorMode({ saveToDrafts: modWasModified })
          }
        >
          {t('sidebar.exit')}
        </Button>
      </PopconfirmModal>
    </SidebarContainer>
  );
}

export default EditorModeControls;
