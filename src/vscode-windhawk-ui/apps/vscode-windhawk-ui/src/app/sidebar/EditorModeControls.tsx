import { Badge, Button, Switch, Tag, Tooltip, Typography, message } from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AppUISettingsContext } from '../appUISettings';
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
  useOpenExternal,
  useSetEditedModId,
} from '../webviewIPC';
import { EditorLaunchContext, ModMetadata } from '../webviewIPCMessages';
import {
  buildEditorAiPrompt,
  buildEditorChallengeBrief,
  buildEditorContextPacket,
  buildEditorReleasePacket,
  buildEditorVerificationChecklist,
  getCurrentCompileProfileKey,
  getEditorEvidenceCards,
  getEditorIterationPlan,
  getEditorProvocations,
  getEditorVerificationPack,
  getEditorWindowsActions,
  getEditorWindowsSurfaceLabels,
  getRecommendedCompileProfile,
  summarizeTargetProcesses,
} from './editorModeUtils';

const SidebarShell = styled.div`
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  min-height: 0;
  color: var(--vscode-foreground);
  background:
    radial-gradient(ellipse at top left, rgba(24, 144, 255, 0.15), transparent 60%),
    radial-gradient(ellipse at bottom right, rgba(138, 43, 226, 0.1), transparent 50%),
    var(--vscode-sideBar-background, var(--vscode-editor-background));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const SidebarScrollArea = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  gap: 14px;
  display: flex;
  flex-direction: column;
  padding: 12px;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
  }
`;

const PanelCard = styled.section<{ $accent?: string }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--vscode-widget-border, rgba(255, 255, 255, 0.1));
  background:
    linear-gradient(
      140deg,
      ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.08)'},
      rgba(255, 255, 255, 0.02) 46%
    ),
    rgba(10, 10, 10, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
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

const InlineActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
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

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
`;

const SectionKicker = styled(Typography.Text)`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.58));
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const SectionDescription = styled(Typography.Text)`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.7));
  line-height: 1.45;
`;

const EvidenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const EvidenceCard = styled.div<{
  $tone: 'positive' | 'neutral' | 'caution';
}>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  border-radius: 12px;
  padding: 12px 14px;
  background: ${({ $tone }) =>
    $tone === 'positive'
      ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(82, 196, 26, 0.02))'
      : $tone === 'caution'
        ? 'linear-gradient(135deg, rgba(250, 173, 20, 0.12), rgba(250, 173, 20, 0.03))'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))'};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'positive'
        ? 'rgba(82, 196, 26, 0.24)'
        : $tone === 'caution'
          ? 'rgba(250, 173, 20, 0.26)'
          : 'rgba(255, 255, 255, 0.08)'};
  backdrop-filter: blur(8px);
`;

const EvidenceLabel = styled(Typography.Text)`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.62));
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const EvidenceValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const EvidenceDetail = styled.div`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.72));
  line-height: 1.45;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const StatusCard = styled.div`
  min-width: 0;
  border-radius: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease-in-out;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border-color: rgba(255, 255, 255, 0.15);
  }
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

const SwitchField = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.01)
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
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

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionGroupTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.66));
`;

const ActionGroupDescription = styled.div`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.72));
  line-height: 1.45;
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

const RecommendationStrip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(0, 120, 212, 0.28);
  background: rgba(0, 120, 212, 0.12);
`;

const RecommendationLabel = styled(Typography.Text)`
  color: rgba(180, 220, 255, 0.9);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const RecommendationTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
`;

const ModeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const ModeCard = styled.div<{ $recommended: boolean; $current: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 12px;
  padding: 14px;
  background: ${({ $recommended, $current }) =>
    $recommended
      ? 'linear-gradient(135deg, rgba(0, 120, 212, 0.2), rgba(0, 120, 212, 0.05))'
      : $current
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04))'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))'};
  border: 1px solid
    ${({ $recommended, $current }) =>
      $recommended
        ? 'rgba(0, 120, 212, 0.5)'
        : $current
          ? 'rgba(255, 255, 255, 0.25)'
          : 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(8px);
  box-shadow: ${({ $recommended, $current }) =>
    $recommended
      ? '0 4px 16px rgba(0, 120, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : $current
        ? '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'};
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $recommended, $current }) =>
      $recommended
        ? '0 6px 20px rgba(0, 120, 212, 0.3)'
        : '0 6px 16px rgba(0, 0, 0, 0.2)'};
    border-color: ${({ $recommended, $current }) =>
      $recommended
        ? 'rgba(0, 120, 212, 0.7)'
        : $current
          ? 'rgba(255, 255, 255, 0.35)'
          : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const ModeCardTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

const ModeCardBody = styled.div`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.72));
  line-height: 1.45;
`;

const WorkflowList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WorkflowItem = styled.div`
  border-radius: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease-in-out;
  border-left: 3px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border-left-color: rgba(24, 144, 255, 0.8);
    transform: translateX(2px);
  }
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

const ProvocationList = styled(WorkflowList)``;

const ProvocationItem = styled(WorkflowItem)`
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(138, 43, 226, 0.02));
  border-color: rgba(138, 43, 226, 0.2);
  border-left-color: rgba(138, 43, 226, 0.6);

  &:hover {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(138, 43, 226, 0.04));
    border-left-color: rgba(138, 43, 226, 0.9);
  }
`;

const ProvocationTitle = styled(WorkflowTitle)``;

const ProvocationBody = styled(WorkflowBody)``;

const VerificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const VerificationItem = styled.div`
  border-radius: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.08), rgba(82, 196, 26, 0.01));
  border: 1px solid rgba(82, 196, 26, 0.2);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease-in-out;
  border-left: 3px solid rgba(82, 196, 26, 0.5);

  &:hover {
    background: linear-gradient(135deg, rgba(82, 196, 26, 0.12), rgba(82, 196, 26, 0.03));
    border-left-color: rgba(82, 196, 26, 0.9);
    transform: translateX(2px);
  }
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

const WindowsActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const WindowsActionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 12px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.02));
  border: 1px solid rgba(24, 144, 255, 0.2);
  backdrop-filter: blur(8px);
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.05));
    border-color: rgba(24, 144, 255, 0.4);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  }
`;

const WindowsActionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

const WindowsActionBody = styled.div`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.72));
  line-height: 1.45;
`;

const FooterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid var(--vscode-widget-border, rgba(255, 255, 255, 0.08));
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent),
    var(--vscode-sideBar-background, var(--vscode-editor-background));
`;

const FooterText = styled(Typography.Text)`
  color: var(--vscode-descriptionForeground, rgba(255, 255, 255, 0.72));
  line-height: 1.45;
`;

type ModDetailsCommon = {
  modId: string;
  modWasModified: boolean;
  metadata?: ModMetadata | null;
  launchContext?: EditorLaunchContext | null;
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
  const { localUISettings } = useContext(AppUISettingsContext);

  const [modId, setModId] = useState(initialModDetails.modId);
  const [metadata, setMetadata] = useState(initialModDetails.metadata || null);
  const [launchContext, setLaunchContext] = useState(
    initialModDetails.launchContext || null
  );
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
    setLaunchContext(initialModDetails.launchContext || null);
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

  const { openExternal, openExternalPending } = useOpenExternal(
    useCallback(
      (data) => {
        if (!data.succeeded) {
          message.error(data.error || (t('sidebar.openError') as string));
        }
      },
      [t]
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
  const launchToolCommands = useMemo(
    () =>
      (launchContext?.tools || [])
        .filter((tool) => !!tool.command)
        .map((tool) => `- ${tool.title}: ${tool.command}`)
        .join('\n'),
    [launchContext]
  );
  const launchPromptList = useMemo(
    () =>
      (launchContext?.prompts || [])
        .map((prompt) => `- ${prompt.title}`)
        .join('\n'),
    [launchContext]
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
  const provocations = useMemo(
    () => getEditorProvocations(metadata, editorSessionState),
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
  const currentCompileProfileKey = useMemo(
    () => getCurrentCompileProfileKey(editorSessionState),
    [editorSessionState]
  );
  const windowsSurfaceLabels = useMemo(
    () => getEditorWindowsSurfaceLabels(metadata),
    [metadata]
  );
  const windowsActionLimit =
    localUISettings.windowsQuickActionDensity === 'expanded'
      ? Number.POSITIVE_INFINITY
      : 4;
  const windowsActions = useMemo(
    () => getEditorWindowsActions(metadata, windowsActionLimit),
    [metadata, windowsActionLimit]
  );
  const editorAssistanceLabel = useMemo(() => {
    switch (localUISettings.editorAssistanceLevel) {
      case 'streamlined':
        return t('settings.workflow.editorAssistance.options.streamlined');
      case 'guided':
        return t('settings.workflow.editorAssistance.options.guided');
      case 'full':
      default:
        return t('settings.workflow.editorAssistance.options.full');
    }
  }, [localUISettings.editorAssistanceLevel, t]);
  const showEvidenceSection =
    localUISettings.editorAssistanceLevel !== 'streamlined';
  const showVerificationSection =
    localUISettings.editorAssistanceLevel !== 'streamlined';
  const showWorkflowSection =
    localUISettings.editorAssistanceLevel !== 'streamlined';
  const showProvocationSection =
    localUISettings.editorAssistanceLevel !== 'streamlined';
  const showAiSection = localUISettings.editorAssistanceLevel === 'full';
  const showLaunchSection = !!launchContext;

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

  const getCompileProfileLabel = useCallback(
    (key: 'current' | 'disabled' | 'logging' | 'disabled-logging') => {
      switch (key) {
        case 'disabled':
          return t('sidebar.compileMenu.disabled');
        case 'logging':
          return t('sidebar.compileMenu.logging');
        case 'disabled-logging':
          return t('sidebar.compileMenu.disabledLogging');
        case 'current':
        default:
          return t('sidebar.compileMenu.current');
      }
    },
    [t]
  );

  const compileProfileMode = getCompileProfileLabel(currentCompileProfileKey);
  const windowsSurfaceSummary = windowsSurfaceLabels.join(', ');

  const runCompileProfile = useCallback(
    (profileKey: 'current' | 'disabled' | 'logging' | 'disabled-logging') => {
      switch (profileKey) {
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
    },
    [runCompile]
  );

  const runRecommendedCompile = useCallback(() => {
    switch (recommendedCompileProfile.key) {
      case 'disabled':
      case 'logging':
      case 'disabled-logging':
      case 'current':
      default:
        runCompileProfile(recommendedCompileProfile.key);
        break;
    }
  }, [recommendedCompileProfile.key, runCompileProfile]);

  const openWindowsSurface = useCallback(
    (uri: string) => {
      openExternal({
        uri,
      });
    },
    [openExternal]
  );

  const compileModeCards = useMemo(
    () => [
      {
        key: 'current',
        label: t('sidebar.compileMenu.current'),
        description: t('sidebar.compileModes.currentDescription', {
          mode: compileProfileMode,
        }),
      },
      {
        key: 'disabled',
        label: t('sidebar.compileMenu.disabled'),
        description: t('sidebar.compileModes.disabledDescription'),
      },
      {
        key: 'logging',
        label: t('sidebar.compileMenu.logging'),
        description: t('sidebar.compileModes.loggingDescription'),
      },
      {
        key: 'disabled-logging',
        label: t('sidebar.compileMenu.disabledLogging'),
        description: t('sidebar.compileModes.disabledLoggingDescription'),
      },
    ],
    [compileProfileMode, t]
  );

  return (
    <SidebarShell>
      <SidebarScrollArea>
        <PanelCard $accent="rgba(0, 120, 212, 0.16)">
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
          <Tag
            color={
              localUISettings.editorAssistanceLevel === 'streamlined'
                ? 'gold'
                : localUISettings.editorAssistanceLevel === 'guided'
                  ? 'blue'
                  : 'geekblue'
            }
          >
            {editorAssistanceLabel}
          </Tag>
        </TagRow>
        <MetaRow>
          <Tooltip title={t('sidebar.modId')} placement="bottom">
            <ModIdBox>{modId}</ModIdBox>
          </Tooltip>
          <InlineActions>
            <Button
              size="small"
              onClick={() =>
                copyTextWithFeedback(modId, t('sidebar.copyModIdSuccess'))
              }
            >
              {t('sidebar.copyModId')}
            </Button>
            <PopconfirmModal
              placement="bottom"
              disabled={!(modWasModified && !isModCompiled) || compileEditedModPending}
              title={t('sidebar.exitConfirmation')}
              okText={t('sidebar.exitButtonOk')}
              cancelText={t('sidebar.exitButtonCancel')}
              onConfirm={() => exitEditorMode({ saveToDrafts: false })}
            >
              <Button
                size="small"
                danger
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
          </InlineActions>
        </MetaRow>
        <TagRow>
          {windowsSurfaceLabels.map((surfaceLabel) => (
            <Tag key={surfaceLabel}>{surfaceLabel}</Tag>
          ))}
        </TagRow>
      </PanelCard>

      {showLaunchSection && launchContext && (
        <PanelCard $accent="rgba(24, 144, 255, 0.14)">
          <SectionHeader>
            <div>
              <SectionKicker>{t('sidebar.sectionKickers.launch')}</SectionKicker>
              <SectionTitle>{t('sidebar.sections.launch')}</SectionTitle>
            </div>
          </SectionHeader>
          <SectionDescription>{t('sidebar.sections.launchDescription')}</SectionDescription>
          <RecommendationStrip>
            <RecommendationLabel>
              {t('sidebar.launchBrief.kicker')}
            </RecommendationLabel>
            <RecommendationTitle>{launchContext.title}</RecommendationTitle>
            <SectionDescription>{launchContext.summary}</SectionDescription>
          </RecommendationStrip>
          <TagRow>
            {launchContext.templateKey && (
              <Tag color="geekblue">
                {t('sidebar.launchBrief.templateLabel', {
                  template: launchContext.templateKey,
                })}
              </Tag>
            )}
            {launchContext.studioMode && (
              <Tag color="purple">
                {t('sidebar.launchBrief.modeLabel', {
                  mode: launchContext.studioMode,
                })}
              </Tag>
            )}
            {launchContext.authoringLanguage && (
              <Tag color="gold">
                {t('sidebar.launchBrief.languageLabel', {
                  language: launchContext.authoringLanguage,
                })}
              </Tag>
            )}
            {!!launchContext.tools?.length && (
              <Tag color="cyan">
                {t('sidebar.launchBrief.toolsLabel', {
                  count: launchContext.tools.length,
                })}
              </Tag>
            )}
            {!!launchContext.prompts?.length && (
              <Tag color="magenta">
                {t('sidebar.launchBrief.promptsLabel', {
                  count: launchContext.prompts.length,
                })}
              </Tag>
            )}
          </TagRow>
          {!!launchContext.checklist?.length && (
            <WorkflowList>
              {launchContext.checklist.map((item) => (
                <WorkflowItem key={item}>
                  <WorkflowTitle>{item}</WorkflowTitle>
                </WorkflowItem>
              ))}
            </WorkflowList>
          )}
          {!!launchContext.tools?.length && (
            <ActionGroup>
              <ActionGroupTitle>{t('sidebar.launchBrief.toolsTitle')}</ActionGroupTitle>
              <WorkflowList>
                {launchContext.tools.map((tool) => (
                  <WorkflowItem key={tool.key}>
                    <WorkflowTitle>{tool.title}</WorkflowTitle>
                    {tool.command && <WorkflowBody>{tool.command}</WorkflowBody>}
                  </WorkflowItem>
                ))}
              </WorkflowList>
            </ActionGroup>
          )}
          {!!launchContext.prompts?.length && (
            <ActionGroup>
              <ActionGroupTitle>{t('sidebar.launchBrief.promptsTitle')}</ActionGroupTitle>
              <WorkflowList>
                {launchContext.prompts.map((prompt) => (
                  <WorkflowItem key={prompt.key}>
                    <WorkflowTitle>{prompt.title}</WorkflowTitle>
                  </WorkflowItem>
                ))}
              </WorkflowList>
            </ActionGroup>
          )}
          <ActionGrid>
            {!!launchContext.packet && (
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    launchContext.packet || '',
                    t('sidebar.launchBrief.copiedPacket')
                  )
                }
              >
                {t('sidebar.launchBrief.copyPacket')}
              </Button>
            )}
            {!!launchToolCommands && (
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    launchToolCommands,
                    t('sidebar.launchBrief.copiedTools')
                  )
                }
              >
                {t('sidebar.launchBrief.copyTools')}
              </Button>
            )}
            {!!launchPromptList && (
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    launchPromptList,
                    t('sidebar.launchBrief.copiedPrompts')
                  )
                }
              >
                {t('sidebar.launchBrief.copyPrompts')}
              </Button>
            )}
          </ActionGrid>
        </PanelCard>
      )}

      <PanelCard $accent="rgba(0, 188, 140, 0.14)">
        <SectionHeader>
          <div>
            <SectionKicker>{t('sidebar.sectionKickers.status')}</SectionKicker>
            <SectionTitle>{t('sidebar.sections.status')}</SectionTitle>
          </div>
        </SectionHeader>
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
          <StatusCard>
            <StatusLabel>{t('sidebar.cards.surface')}</StatusLabel>
            <StatusValue>{windowsSurfaceSummary}</StatusValue>
          </StatusCard>
          <StatusCard>
            <StatusLabel>{t('sidebar.cards.nextCompile')}</StatusLabel>
            <StatusValue>{recommendedCompileProfile.label}</StatusValue>
          </StatusCard>
        </StatusGrid>
      </PanelCard>

      {showEvidenceSection && (
        <PanelCard $accent="rgba(250, 173, 20, 0.14)">
          <SectionHeader>
            <div>
              <SectionKicker>{t('sidebar.sectionKickers.evidence')}</SectionKicker>
              <SectionTitle>{t('sidebar.sections.evidence')}</SectionTitle>
            </div>
          </SectionHeader>
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
      )}

      <PanelCard $accent="rgba(0, 120, 212, 0.16)">
        <SectionHeader>
          <div>
            <SectionKicker>{t('sidebar.sectionKickers.controls')}</SectionKicker>
            <SectionTitle>{t('sidebar.sections.controls')}</SectionTitle>
          </div>
        </SectionHeader>
        <SectionDescription>
          {t('sidebar.sections.controlsDescription', {
            mode: compileProfileMode,
          })}
        </SectionDescription>
        <RecommendationStrip>
          <RecommendationLabel>
            {t('sidebar.recommendationLabel')}
          </RecommendationLabel>
          <RecommendationTitle>{recommendedCompileProfile.label}</RecommendationTitle>
          <SectionDescription>{recommendedCompileProfile.rationale}</SectionDescription>
        </RecommendationStrip>
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
            <Button
              block
              danger
              onClick={() => stopCompileEditedMod()}
            >
              {t('sidebar.stopCompilation')}
            </Button>
          ) : (
            <Button
              block
              type="primary"
              onClick={() => runRecommendedCompile()}
            >
              {t('sidebar.runRecommendedCompile')}
            </Button>
          )}
        </CompileButtonBadge>
        <ModeGrid>
          {compileModeCards.map((modeCard) => (
            <ModeCard
              key={modeCard.key}
              $current={currentCompileProfileKey === modeCard.key}
              $recommended={recommendedCompileProfile.key === modeCard.key}
            >
              <ModeCardTitle>{modeCard.label}</ModeCardTitle>
              <TagRow>
                {currentCompileProfileKey === modeCard.key && (
                  <Tag color="blue">{t('sidebar.compileModes.active')}</Tag>
                )}
                {recommendedCompileProfile.key === modeCard.key && (
                  <Tag color="green">{t('sidebar.compileModes.recommended')}</Tag>
                )}
              </TagRow>
              <ModeCardBody>{modeCard.description}</ModeCardBody>
              <Button
                block
                size="small"
                type={recommendedCompileProfile.key === modeCard.key ? 'primary' : 'default'}
                disabled={compileEditedModPending}
                onClick={() =>
                  runCompileProfile(modeCard.key as 'current' | 'disabled' | 'logging' | 'disabled-logging')
                }
              >
                {t('sidebar.compileModes.runMode')}
              </Button>
            </ModeCard>
          ))}
        </ModeGrid>
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
      </PanelCard>

      <PanelCard $accent="rgba(56, 142, 60, 0.14)">
        <SectionHeader>
          <div>
            <SectionKicker>{t('sidebar.sectionKickers.windows')}</SectionKicker>
            <SectionTitle>{t('sidebar.sections.windows')}</SectionTitle>
          </div>
        </SectionHeader>
        <SectionDescription>{t('sidebar.sections.windowsDescription')}</SectionDescription>
        <WindowsActionGrid>
          {windowsActions.map((action) => (
            <WindowsActionCard key={action.key}>
              <WindowsActionTitle>{action.title}</WindowsActionTitle>
              <WindowsActionBody>{action.description}</WindowsActionBody>
              <Button
                block
                size="small"
                disabled={openExternalPending}
                onClick={() => openWindowsSurface(action.uri)}
              >
                {t('sidebar.windows.open')}
              </Button>
            </WindowsActionCard>
          ))}
        </WindowsActionGrid>
      </PanelCard>

      {showProvocationSection && (
        <PanelCard $accent="rgba(186, 104, 200, 0.14)">
          <SectionHeader>
            <div>
              <SectionKicker>{t('sidebar.sectionKickers.provocations')}</SectionKicker>
              <SectionTitle>{t('sidebar.sections.provocations')}</SectionTitle>
            </div>
          </SectionHeader>
          <SectionDescription>
            {t('sidebar.sections.provocationsDescription')}
          </SectionDescription>
          <ProvocationList>
            {provocations.map((provocation) => (
              <ProvocationItem key={provocation.key}>
                <ProvocationTitle>{provocation.title}</ProvocationTitle>
                <ProvocationBody>{provocation.body}</ProvocationBody>
              </ProvocationItem>
            ))}
          </ProvocationList>
          {showAiSection && (
            <Button
              block
              onClick={() =>
                copyTextWithFeedback(
                  buildEditorChallengeBrief(modId, metadata, editorSessionState),
                  t('sidebar.ai.copiedChallengeBrief')
                )
              }
            >
              {t('sidebar.ai.challengeBrief')}
            </Button>
          )}
        </PanelCard>
      )}

      {showVerificationSection && (
        <PanelCard $accent="rgba(82, 196, 26, 0.14)">
          <SectionHeader>
            <div>
              <SectionKicker>{t('sidebar.sectionKickers.verification')}</SectionKicker>
              <SectionTitle>{t('sidebar.sections.verification')}</SectionTitle>
            </div>
          </SectionHeader>
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
                  buildEditorVerificationChecklist(
                    modId,
                    metadata,
                    editorSessionState
                  ),
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
      )}

      {showAiSection && (
        <PanelCard $accent="rgba(255, 140, 0, 0.14)">
          <SectionHeader>
            <div>
              <SectionKicker>{t('sidebar.sectionKickers.ai')}</SectionKicker>
              <SectionTitle>{t('sidebar.sections.ai')}</SectionTitle>
            </div>
          </SectionHeader>
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
          <ActionGroup>
            <ActionGroupTitle>{t('sidebar.ai.understandingTitle')}</ActionGroupTitle>
            <ActionGroupDescription>
              {t('sidebar.ai.understandingDescription')}
            </ActionGroupDescription>
            <ActionGrid>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'explain-scope',
                      modId,
                      metadata,
                      editorSessionState
                    ),
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
                    buildEditorAiPrompt(
                      'explain-api',
                      modId,
                      metadata,
                      editorSessionState
                    ),
                    t('sidebar.ai.copiedExplainApi')
                  )
                }
              >
                {t('sidebar.ai.explainApi')}
              </Button>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'explain-terms',
                      modId,
                      metadata,
                      editorSessionState
                    ),
                    t('sidebar.ai.copiedExplainTerms')
                  )
                }
              >
                {t('sidebar.ai.explainTerms')}
              </Button>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'usage-examples',
                      modId,
                      metadata,
                      editorSessionState
                    ),
                    t('sidebar.ai.copiedUsageExamples')
                  )
                }
              >
                {t('sidebar.ai.usageExamples')}
              </Button>
            </ActionGrid>
          </ActionGroup>
          <ActionGroup>
            <ActionGroupTitle>{t('sidebar.ai.challengeTitle')}</ActionGroupTitle>
            <ActionGroupDescription>
              {t('sidebar.ai.challengeDescription')}
            </ActionGroupDescription>
            <ActionGrid>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'review',
                      modId,
                      metadata,
                      editorSessionState
                    ),
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
                    buildEditorAiPrompt(
                      'challenge-assumptions',
                      modId,
                      metadata,
                      editorSessionState
                    ),
                    t('sidebar.ai.copiedChallengeAssumptions')
                  )
                }
              >
                {t('sidebar.ai.challengeAssumptions')}
              </Button>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'counterexample-hunt',
                      modId,
                      metadata,
                      editorSessionState
                    ),
                    t('sidebar.ai.copiedCounterexampleHunt')
                  )
                }
              >
                {t('sidebar.ai.counterexampleHunt')}
              </Button>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'best-practices',
                      modId,
                      metadata,
                      editorSessionState
                    ),
                    t('sidebar.ai.copiedBestPractices')
                  )
                }
              >
                {t('sidebar.ai.bestPractices')}
              </Button>
            </ActionGrid>
          </ActionGroup>
          <ActionGroup>
            <ActionGroupTitle>{t('sidebar.ai.validationTitle')}</ActionGroupTitle>
            <ActionGroupDescription>
              {t('sidebar.ai.validationDescription')}
            </ActionGroupDescription>
            <ActionGrid>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'test-plan',
                      modId,
                      metadata,
                      editorSessionState
                    ),
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
                    buildEditorAiPrompt(
                      'compile-recovery',
                      modId,
                      metadata,
                      editorSessionState
                    ),
                    t('sidebar.ai.copiedCompileRecovery')
                  )
                }
              >
                {t('sidebar.ai.compileRecovery')}
              </Button>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'docs',
                      modId,
                      metadata,
                      editorSessionState
                    ),
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
            </ActionGrid>
          </ActionGroup>
          <ActionGroup>
            <ActionGroupTitle>{t('sidebar.ai.buildTitle')}</ActionGroupTitle>
            <ActionGroupDescription>
              {t('sidebar.ai.buildDescription')}
            </ActionGroupDescription>
            <ActionGrid>
              <Button
                block
                onClick={() =>
                  copyTextWithFeedback(
                    buildEditorAiPrompt(
                      'scaffold',
                      modId,
                      metadata,
                      editorSessionState
                    ),
                    t('sidebar.ai.copiedScaffold')
                  )
                }
              >
                {t('sidebar.ai.scaffold')}
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
          </ActionGroup>
        </PanelCard>
      )}

      {showWorkflowSection && (
        <PanelCard $accent="rgba(255, 99, 71, 0.14)">
          <SectionHeader>
            <div>
              <SectionKicker>{t('sidebar.sectionKickers.workflow')}</SectionKicker>
              <SectionTitle>{t('sidebar.sections.workflow')}</SectionTitle>
            </div>
          </SectionHeader>
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
      )}
      </SidebarScrollArea>

      <FooterBar>
        <FooterText>{t('sidebar.footerNote')}</FooterText>
        <PopconfirmModal
          placement="top"
          disabled={!(modWasModified && !isModCompiled) || compileEditedModPending}
          title={t('sidebar.exitConfirmation')}
          okText={t('sidebar.exitButtonOk')}
          cancelText={t('sidebar.exitButtonCancel')}
          onConfirm={() => exitEditorMode({ saveToDrafts: false })}
        >
          <Button
            type="primary"
            danger
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
      </FooterBar>
    </SidebarShell>
  );
}

export default EditorModeControls;
