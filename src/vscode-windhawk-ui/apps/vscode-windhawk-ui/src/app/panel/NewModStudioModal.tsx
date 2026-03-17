import { Button, Modal, Tag, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { copyTextToClipboard } from '../utils';
import { createNewMod } from '../webviewIPC';
import { aiPromptPacks, modStudioStarters } from './aiModStudio';

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 4px;
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

const StarterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
`;

const StarterCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
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
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
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

  const handleCreateStarter = (templateKey: 'default' | 'ai-ready') => {
    createNewMod({ templateKey });
    onClose();
  };

  const handleCopyPrompt = async (title: string, prompt: string) => {
    try {
      await copyTextToClipboard(prompt);
      message.success(t('newModStudio.copySuccess', { title }));
    } catch (error) {
      console.error('Failed to copy AI prompt:', error);
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
          <SectionTitle>{t('newModStudio.starters.title')}</SectionTitle>
          <SectionDescription>
            {t('newModStudio.starters.description')}
          </SectionDescription>
          <StarterGrid>
            {modStudioStarters.map((starter) => (
              <StarterCard key={starter.key}>
                <StarterHeader>
                  <StarterTitle>{starter.title}</StarterTitle>
                  {starter.key === 'ai-ready' && (
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
                  type={starter.key === 'ai-ready' ? 'primary' : 'default'}
                  onClick={() => handleCreateStarter(starter.key)}
                >
                  {starter.key === 'ai-ready'
                    ? t('newModStudio.starters.useAiReady')
                    : t('newModStudio.starters.useStandard')}
                </Button>
              </StarterCard>
            ))}
          </StarterGrid>
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
                <Button onClick={() => handleCopyPrompt(promptPack.title, promptPack.prompt)}>
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
