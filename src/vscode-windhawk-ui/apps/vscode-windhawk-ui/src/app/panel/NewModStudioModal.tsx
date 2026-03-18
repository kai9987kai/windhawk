import { Button, Modal, Tag, Typography, message } from 'antd';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  AppUISettingsContext,
  recordRecentStudioLaunch,
} from '../appUISettings';
import { copyTextToClipboard } from '../utils';
import { createNewMod } from '../webviewIPC';
import { EditorLaunchContext } from '../webviewIPCMessages';
import {
  aiPromptPacks,
  buildStarterLaunchContext,
  buildStudioWorkflowPacket,
  buildVisualPresetLaunchContext,
  buildWorkflowLaunchContext,
  cliPlaybooks,
  getModSourceExtensionForAuthoringLanguage,
  getModStudioStartersForAuthoringLanguage,
  getStudioWorkflowRecipes,
  getVisualStudioPresetsForAuthoringLanguage,
  ModAuthoringLanguage,
  modStudioStarters,
} from './aiModStudio';

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 999px;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const SectionDescription = styled(Typography.Text)`
  color: rgba(255, 255, 255, 0.68);
`;

const StudioControls = styled.div`
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle at top right, rgba(24, 144, 255, 0.18), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.015));
  backdrop-filter: blur(14px);
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ControlHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
`;

const ControlTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const ControlDescription = styled(Typography.Text)`
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.45;
`;

const ControlOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const OptionButton = styled(Button)<{ $selected?: boolean }>`
  min-width: 172px;
  height: auto;
  padding: 10px 16px;
  border-radius: 999px;
  display: block;
  text-align: left;
  white-space: normal;
  border-color: ${({ $selected }) =>
    $selected ? 'rgba(24, 144, 255, 0.7)' : 'rgba(255, 255, 255, 0.14)'};
  background: ${({ $selected }) =>
    $selected
      ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.24), rgba(24, 144, 255, 0.08))'
      : 'rgba(255, 255, 255, 0.04)'};
  color: #fff;
  box-shadow: ${({ $selected }) =>
    $selected ? '0 0 18px rgba(24, 144, 255, 0.18)' : 'none'};

  &:hover,
  &:focus {
    color: #fff;
    border-color: rgba(24, 144, 255, 0.7);
    background: linear-gradient(
      135deg,
      rgba(24, 144, 255, 0.2),
      rgba(24, 144, 255, 0.06)
    );
  }
`;

const OptionLabel = styled.div`
  font-weight: 600;
`;

const OptionMeta = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.4;
`;

const StarterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
`;

const StarterCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.01)
  );
  backdrop-filter: blur(12px);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.02)
    );
  }
`;

const StarterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
`;

const StarterTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

const StarterHighlights = styled.ul`
  margin: 0;
  padding-inline-start: 18px;
  color: rgba(255, 255, 255, 0.76);

  > li + li {
    margin-top: 6px;
  }
`;

const PromptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
`;

const PromptCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(138, 43, 226, 0.2);
  background: linear-gradient(
    135deg,
    rgba(138, 43, 226, 0.08),
    rgba(138, 43, 226, 0.02)
  );
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(
      135deg,
      rgba(138, 43, 226, 0.12),
      rgba(138, 43, 226, 0.04)
    );
    border-color: rgba(138, 43, 226, 0.4);
    box-shadow: 0 8px 24px rgba(138, 43, 226, 0.15);
  }
`;

const PromptTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

const PromptPreview = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.84);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.45;
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
`;

const ToolCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.015)
  );
  backdrop-filter: blur(10px);
`;

const ToolTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

const ToolPreview = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.24);
  color: rgba(255, 255, 255, 0.84);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.45;
`;

const WorkflowBanner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(24, 144, 255, 0.26);
  background:
    radial-gradient(circle at top right, rgba(24, 144, 255, 0.14), transparent 40%),
    rgba(24, 144, 255, 0.08);
`;

const WorkflowBannerTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
`;

const WorkflowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
`;

const WorkflowCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.015)
  );
  backdrop-filter: blur(10px);
`;

const WorkflowTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

const WorkflowChecklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.45;
`;

const WorkflowChecklistItem = styled.div`
  display: flex;
  gap: 8px;

  &::before {
    content: '-';
    color: rgba(255, 255, 255, 0.48);
  }
`;

const WorkflowMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const WorkflowActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const InlineNote = styled.div`
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(24, 144, 255, 0.24);
  background: rgba(24, 144, 255, 0.08);
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.5;
`;

const FooterNote = styled.div`
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(250, 173, 20, 0.28);
  background: rgba(250, 173, 20, 0.08);
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.5;
`;

interface Props {
  open: boolean;
  onClose: () => void;
}

function NewModStudioModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const { localUISettings, setLocalUISettings } = useContext(AppUISettingsContext);

  const authoringLanguage = localUISettings.preferredAuthoringLanguage;
  const studioMode = localUISettings.preferredStudioMode;
  const starters = useMemo(
    () => getModStudioStartersForAuthoringLanguage(authoringLanguage),
    [authoringLanguage]
  );
  const visualPresets = useMemo(
    () => getVisualStudioPresetsForAuthoringLanguage(authoringLanguage),
    [authoringLanguage]
  );
  const workflowRecipes = useMemo(
    () => getStudioWorkflowRecipes(authoringLanguage, studioMode),
    [authoringLanguage, studioMode]
  );
  const recommendedWorkflow = workflowRecipes[0] || null;
  const recentStudioLaunches = useMemo(
    () =>
      localUISettings.recentStudioLaunches.filter(
        (
          launchContext
        ): launchContext is EditorLaunchContext & {
          templateKey: NonNullable<EditorLaunchContext['templateKey']>;
        } => launchContext.templateKey !== undefined
      ),
    [localUISettings.recentStudioLaunches]
  );

  const handleCreateStarter = (
    templateKey: (typeof modStudioStarters)[number]['key'],
    selectedAuthoringLanguage: ModAuthoringLanguage = authoringLanguage,
    launchContext?: EditorLaunchContext
  ) => {
    const nextLaunchContext = launchContext
      ? {
          ...launchContext,
          templateKey,
          authoringLanguage:
            launchContext.authoringLanguage ?? selectedAuthoringLanguage,
          studioMode: launchContext.studioMode ?? studioMode,
        }
      : undefined;

    setLocalUISettings(
      nextLaunchContext
        ? {
            preferredAuthoringLanguage:
              nextLaunchContext.authoringLanguage ?? selectedAuthoringLanguage,
            preferredStudioMode: nextLaunchContext.studioMode ?? studioMode,
            recentStudioLaunches: recordRecentStudioLaunch(
              localUISettings.recentStudioLaunches,
              nextLaunchContext
            ),
          }
        : {
            preferredAuthoringLanguage: selectedAuthoringLanguage,
            preferredStudioMode: studioMode,
          }
    );

    createNewMod({
      templateKey,
      authoringLanguage: selectedAuthoringLanguage,
      sourceExtension:
        getModSourceExtensionForAuthoringLanguage(selectedAuthoringLanguage),
      launchContext: nextLaunchContext,
    });
    onClose();
  };

  const getLaunchKindLabel = (launchContext: EditorLaunchContext) => {
    switch (launchContext.kind) {
      case 'workflow':
        return t('newModStudio.recent.workflowKind');
      case 'visual-preset':
        return t('newModStudio.recent.visualPresetKind');
      case 'starter':
      default:
        return t('newModStudio.recent.starterKind');
    }
  };

  const getTemplateTitle = (templateKey: string) =>
    modStudioStarters.find((starter) => starter.key === templateKey)?.title ??
    templateKey;

  const handleCopyText = async (title: string, text: string) => {
    try {
      await copyTextToClipboard(text);
      message.success(t('newModStudio.copySuccess', { title }));
    } catch (error) {
      console.error('Failed to copy studio content:', error);
      message.error(t('newModStudio.copyError'));
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      title={t('newModStudio.title')}
      centered
    >
      <ModalBody>
        <Section>
          <SectionTitle>{t('newModStudio.mode.title')}</SectionTitle>
          <SectionDescription>
            {t('newModStudio.mode.description')}
          </SectionDescription>
          <StudioControls>
            <ControlGroup>
              <ControlHeader>
                <ControlTitle>{t('newModStudio.mode.title')}</ControlTitle>
                <Tag color="blue">
                  {studioMode === 'visual'
                    ? t('newModStudio.mode.visual')
                    : t('newModStudio.mode.code')}
                </Tag>
              </ControlHeader>
              <ControlOptions>
                <OptionButton
                  $selected={studioMode === 'code'}
                  onClick={() =>
                    setLocalUISettings({ preferredStudioMode: 'code' })
                  }
                >
                  <OptionLabel>{t('newModStudio.mode.code')}</OptionLabel>
                  <OptionMeta>
                    {t('newModStudio.mode.codeDescription')}
                  </OptionMeta>
                </OptionButton>
                <OptionButton
                  $selected={studioMode === 'visual'}
                  onClick={() =>
                    setLocalUISettings({ preferredStudioMode: 'visual' })
                  }
                >
                  <OptionLabel>{t('newModStudio.mode.visual')}</OptionLabel>
                  <OptionMeta>
                    {t('newModStudio.mode.visualDescription')}
                  </OptionMeta>
                </OptionButton>
              </ControlOptions>
            </ControlGroup>
            <ControlGroup>
              <ControlHeader>
                <ControlTitle>{t('newModStudio.authoring.title')}</ControlTitle>
                <Tag color={authoringLanguage === 'python' ? 'gold' : 'default'}>
                  {authoringLanguage === 'python'
                    ? t('newModStudio.authoring.python')
                    : t('newModStudio.authoring.cpp')}
                </Tag>
              </ControlHeader>
              <ControlDescription>
                {t('newModStudio.authoring.description')}
              </ControlDescription>
              <ControlOptions>
                <OptionButton
                  $selected={authoringLanguage === 'cpp'}
                  onClick={() =>
                    setLocalUISettings({ preferredAuthoringLanguage: 'cpp' })
                  }
                >
                  <OptionLabel>{t('newModStudio.authoring.cpp')}</OptionLabel>
                  <OptionMeta>
                    {t('newModStudio.authoring.cppDescription')}
                  </OptionMeta>
                </OptionButton>
                <OptionButton
                  $selected={authoringLanguage === 'python'}
                  onClick={() =>
                    setLocalUISettings({
                      preferredAuthoringLanguage: 'python',
                    })
                  }
                >
                  <OptionLabel>
                    {t('newModStudio.authoring.python')}
                  </OptionLabel>
                  <OptionMeta>
                    {t('newModStudio.authoring.pythonDescription')}
                  </OptionMeta>
                </OptionButton>
              </ControlOptions>
            </ControlGroup>
          </StudioControls>
        </Section>

        <Section>
          <SectionTitle>{t('newModStudio.recent.title')}</SectionTitle>
          <SectionDescription>
            {t('newModStudio.recent.description')}
          </SectionDescription>
          {recentStudioLaunches.length > 0 ? (
            <WorkflowGrid>
              {recentStudioLaunches.map((launchContext, index) => (
                <WorkflowCard
                  key={[
                    launchContext.kind,
                    launchContext.title,
                    launchContext.templateKey,
                    launchContext.authoringLanguage,
                    launchContext.studioMode,
                  ].join('-')}
                >
                  <WorkflowMetaRow>
                    {index === 0 && (
                      <Tag color="blue">{t('newModStudio.recent.latest')}</Tag>
                    )}
                    <Tag color="geekblue">
                      {getLaunchKindLabel(launchContext)}
                    </Tag>
                    <Tag color="default">
                      {t('newModStudio.recent.templateLabel', {
                        template: getTemplateTitle(launchContext.templateKey),
                      })}
                    </Tag>
                    {launchContext.studioMode && (
                      <Tag color="cyan">
                        {launchContext.studioMode === 'visual'
                          ? t('newModStudio.mode.visual')
                          : t('newModStudio.mode.code')}
                      </Tag>
                    )}
                    {launchContext.authoringLanguage && (
                      <Tag
                        color={
                          launchContext.authoringLanguage === 'python'
                            ? 'gold'
                            : 'default'
                        }
                      >
                        {launchContext.authoringLanguage === 'python'
                          ? t('newModStudio.authoring.python')
                          : t('newModStudio.authoring.cpp')}
                      </Tag>
                    )}
                    {launchContext.checklist?.length ? (
                      <Tag color="green">
                        {t('newModStudio.recent.checklistLabel', {
                          count: launchContext.checklist.length,
                        })}
                      </Tag>
                    ) : null}
                    {launchContext.tools?.length ? (
                      <Tag color="purple">
                        {t('newModStudio.recent.toolsLabel', {
                          count: launchContext.tools.length,
                        })}
                      </Tag>
                    ) : null}
                    {launchContext.prompts?.length ? (
                      <Tag color="gold">
                        {t('newModStudio.recent.promptsLabel', {
                          count: launchContext.prompts.length,
                        })}
                      </Tag>
                    ) : null}
                  </WorkflowMetaRow>
                  <WorkflowTitle>{launchContext.title}</WorkflowTitle>
                  <SectionDescription>{launchContext.summary}</SectionDescription>
                  {launchContext.checklist?.length ? (
                    <WorkflowChecklist>
                      {launchContext.checklist.slice(0, 3).map((item) => (
                        <WorkflowChecklistItem
                          key={`${launchContext.title}-${item}`}
                        >
                          {item}
                        </WorkflowChecklistItem>
                      ))}
                    </WorkflowChecklist>
                  ) : null}
                  <WorkflowActions>
                    <Button
                      type="primary"
                      onClick={() =>
                        handleCreateStarter(
                          launchContext.templateKey,
                          launchContext.authoringLanguage ?? authoringLanguage,
                          launchContext
                        )
                      }
                    >
                      {t('newModStudio.recent.relaunchButton')}
                    </Button>
                    {launchContext.packet && (
                      <Button
                        onClick={() =>
                          handleCopyText(
                            launchContext.title,
                            launchContext.packet || ''
                          )
                        }
                      >
                        {t('newModStudio.recent.copyPacketButton')}
                      </Button>
                    )}
                  </WorkflowActions>
                </WorkflowCard>
              ))}
            </WorkflowGrid>
          ) : (
            <InlineNote>{t('newModStudio.recent.empty')}</InlineNote>
          )}
        </Section>

        <Section>
          <SectionTitle>
            {studioMode === 'visual'
              ? t('newModStudio.visual.title')
              : t('newModStudio.starters.title')}
          </SectionTitle>
          <SectionDescription>
            {studioMode === 'visual'
              ? t('newModStudio.visual.description')
              : t('newModStudio.starters.description')}
          </SectionDescription>
          {studioMode === 'visual' ? (
            <StarterGrid>
              {visualPresets.map((preset) => (
                <StarterCard key={preset.key}>
                  <StarterHeader>
                    <StarterTitle>{preset.title}</StarterTitle>
                    <Tag color={authoringLanguage === 'python' ? 'gold' : 'geekblue'}>
                      {authoringLanguage === 'python'
                        ? t('newModStudio.authoring.python')
                        : t('newModStudio.authoring.cpp')}
                    </Tag>
                  </StarterHeader>
                  <SectionDescription>{preset.description}</SectionDescription>
                  <Button
                    type="primary"
                    onClick={() =>
                      handleCreateStarter(
                        preset.templateKey,
                        authoringLanguage,
                        buildVisualPresetLaunchContext(
                          preset,
                          authoringLanguage
                        )
                      )
                    }
                  >
                    {t('newModStudio.visual.usePreset')}
                  </Button>
                </StarterCard>
              ))}
            </StarterGrid>
          ) : (
            <>
              {authoringLanguage === 'python' && (
                <InlineNote>{t('newModStudio.starters.pythonNote')}</InlineNote>
              )}
              <StarterGrid>
                {starters.map((starter) => (
                  <StarterCard key={starter.key}>
                    <StarterHeader>
                      <StarterTitle>{starter.title}</StarterTitle>
                      {starter.recommended && (
                        <Tag color="blue">{t('newModStudio.recommended')}</Tag>
                      )}
                    </StarterHeader>
                    <SectionDescription>{starter.description}</SectionDescription>
                    <StarterHighlights>
                      {starter.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </StarterHighlights>
                    <Button
                      type={starter.recommended ? 'primary' : 'default'}
                      onClick={() =>
                        handleCreateStarter(
                          starter.key,
                          authoringLanguage,
                          buildStarterLaunchContext(
                            starter,
                            authoringLanguage,
                            studioMode
                          )
                        )
                      }
                    >
                      {starter.actionLabel}
                    </Button>
                  </StarterCard>
                ))}
              </StarterGrid>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>{t('newModStudio.workflows.title')}</SectionTitle>
          <SectionDescription>
            {t('newModStudio.workflows.description')}
          </SectionDescription>
          {recommendedWorkflow && (
            <WorkflowBanner>
              <WorkflowBannerTitle>
                {t('newModStudio.workflows.recommended', {
                  title: recommendedWorkflow.title,
                })}
              </WorkflowBannerTitle>
              <SectionDescription>
                {recommendedWorkflow.description}
              </SectionDescription>
            </WorkflowBanner>
          )}
          <WorkflowGrid>
            {workflowRecipes.map((recipe) => (
              <WorkflowCard key={recipe.key}>
                <WorkflowTitle>{recipe.title}</WorkflowTitle>
                <SectionDescription>{recipe.description}</SectionDescription>
                <WorkflowMetaRow>
                  <Tag color="geekblue">
                    {t('newModStudio.workflows.starterLabel', {
                      template: recipe.recommendedTemplateKey,
                    })}
                  </Tag>
                  <Tag color="purple">
                    {t('newModStudio.workflows.toolsLabel', {
                      count: recipe.suggestedPlaybookKeys.length,
                    })}
                  </Tag>
                  <Tag color="gold">
                    {t('newModStudio.workflows.promptsLabel', {
                      count: recipe.suggestedPromptPackKeys.length,
                    })}
                  </Tag>
                </WorkflowMetaRow>
                <WorkflowChecklist>
                  {recipe.checklist.map((item) => (
                    <WorkflowChecklistItem key={item}>
                      {item}
                    </WorkflowChecklistItem>
                  ))}
                </WorkflowChecklist>
                <WorkflowActions>
                  <Button
                    type="primary"
                    onClick={() =>
                      handleCreateStarter(
                        recipe.recommendedTemplateKey,
                        authoringLanguage,
                        buildWorkflowLaunchContext(
                          recipe,
                          authoringLanguage,
                          studioMode
                        )
                      )
                    }
                  >
                    {t('newModStudio.workflows.launchButton')}
                  </Button>
                  <Button
                    onClick={() =>
                      handleCopyText(
                        recipe.title,
                        buildStudioWorkflowPacket(recipe)
                      )
                    }
                  >
                    {t('newModStudio.workflows.copyPacketButton')}
                  </Button>
                </WorkflowActions>
              </WorkflowCard>
            ))}
          </WorkflowGrid>
        </Section>

        <Section>
          <SectionTitle>{t('newModStudio.cli.title')}</SectionTitle>
          <SectionDescription>
            {t('newModStudio.cli.description')}
          </SectionDescription>
          <ToolsGrid>
            {cliPlaybooks.map((playbook) => (
              <ToolCard key={playbook.key}>
                <ToolTitle>{playbook.title}</ToolTitle>
                <SectionDescription>{playbook.description}</SectionDescription>
                <ToolPreview>{playbook.command}</ToolPreview>
                <Button
                  onClick={() =>
                    handleCopyText(playbook.title, playbook.command)
                  }
                >
                  {t('newModStudio.cli.copyButton')}
                </Button>
              </ToolCard>
            ))}
          </ToolsGrid>
        </Section>

        <Section>
          <SectionTitle>{t('newModStudio.prompts.title')}</SectionTitle>
          <SectionDescription>
            {t('newModStudio.prompts.description')}
          </SectionDescription>
          <PromptGrid>
            {aiPromptPacks.map((promptPack) => (
              <PromptCard key={promptPack.key}>
                <PromptTitle>{promptPack.title}</PromptTitle>
                <SectionDescription>{promptPack.description}</SectionDescription>
                <PromptPreview>{promptPack.prompt}</PromptPreview>
                <Button
                  onClick={() =>
                    handleCopyText(promptPack.title, promptPack.prompt)
                  }
                >
                  {t('newModStudio.prompts.copyButton')}
                </Button>
              </PromptCard>
            ))}
          </PromptGrid>
        </Section>
        <FooterNote>{t('newModStudio.footerNote')}</FooterNote>
      </ModalBody>
    </Modal>
  );
}

export default NewModStudioModal;
