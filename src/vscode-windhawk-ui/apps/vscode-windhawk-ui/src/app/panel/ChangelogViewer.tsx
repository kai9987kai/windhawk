import { Button, ConfigProvider, Empty, Select, Switch, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { InputWithContextMenu } from '../components/InputWithContextMenu';
import { copyTextToClipboard } from '../utils';
import ReactMarkdownCustom from '../components/ReactMarkdownCustom';
import {
  filterChangelogSections,
  parseChangelogSections,
  selectChangelogSections,
} from './changelogUtils';

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const SummaryCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
`;

const SummaryLabel = styled(Typography.Text)`
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const SummaryValue = styled.div`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 18px;
  font-weight: 600;
`;

const SearchInput = styled(InputWithContextMenu)`
  max-width: 360px;
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const ControlsCluster = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const SectionSelect = styled(Select)`
  min-width: 220px;
`;

const ControlLabel = styled(Typography.Text)`
  color: rgba(255, 255, 255, 0.65);
`;

interface Props {
  markdown: string;
  allowHtml?: boolean;
}

function ChangelogViewer({ markdown, allowHtml = false }: Props) {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState('');
  const [latestOnly, setLatestOnly] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const sections = useMemo(
    () => parseChangelogSections(markdown),
    [markdown]
  );
  const scopedSections = useMemo(
    () => selectChangelogSections(sections, {
      latestOnly,
      sectionIndex: latestOnly ? null : selectedSectionIndex,
    }),
    [latestOnly, sections, selectedSectionIndex]
  );
  const visibleSections = useMemo(
    () => filterChangelogSections(scopedSections, filterText),
    [scopedSections, filterText]
  );
  const sectionOptions = useMemo(
    () => sections.map((section, index) => ({
      value: index,
      label: section.heading || t('changelogViewer.controls.sectionFallback', {
        index: index + 1,
      }),
    })),
    [sections, t]
  );

  const latestHeading = sections[0]?.heading || t('changelogViewer.latestFallback');
  const totalHighlights = sections.reduce(
    (sum, section) => sum + section.bulletCount,
    0
  );
  const hasScopedSelection = latestOnly || selectedSectionIndex !== null;
  const visibleMarkdown = (filterText.trim() || hasScopedSelection)
    ? visibleSections.map((section) => section.markdown).join('\n\n')
    : markdown;

  useEffect(() => {
    if (
      selectedSectionIndex !== null &&
      (selectedSectionIndex < 0 || selectedSectionIndex >= sections.length)
    ) {
      setSelectedSectionIndex(null);
    }
  }, [sections.length, selectedSectionIndex]);

  useEffect(() => {
    if (copyState === 'idle') {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopyState('idle'), 1600);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const handleCopyVisibleMarkdown = async () => {
    try {
      await copyTextToClipboard(visibleMarkdown);
      setCopyState('copied');
    } catch (error) {
      console.error('Failed to copy changelog:', error);
      setCopyState('failed');
    }
  };

  return (
    <ViewerContainer>
      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>{t('changelogViewer.summary.latest')}</SummaryLabel>
          <SummaryValue>{latestHeading}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>{t('changelogViewer.summary.sections')}</SummaryLabel>
          <SummaryValue>{sections.length}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>{t('changelogViewer.summary.highlights')}</SummaryLabel>
          <SummaryValue>{totalHighlights}</SummaryValue>
        </SummaryCard>
      </SummaryGrid>
      <ControlsRow>
        <SearchInput
          allowClear
          value={filterText}
          placeholder={t('changelogViewer.searchPlaceholder') as string}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <ControlsCluster>
          <SectionSelect
            value={selectedSectionIndex ?? undefined}
            allowClear
            placeholder={t('changelogViewer.controls.jumpToRelease') as string}
            options={sectionOptions}
            disabled={latestOnly || sectionOptions.length === 0}
            onChange={(value) => setSelectedSectionIndex(
              typeof value === 'number' ? value : null
            )}
          />
          <ControlLabel>{t('changelogViewer.controls.latestOnly')}</ControlLabel>
          <Switch checked={latestOnly} onChange={setLatestOnly} />
          <Button
            disabled={!visibleMarkdown.trim()}
            onClick={handleCopyVisibleMarkdown}
          >
            {copyState === 'copied'
              ? t('changelogViewer.controls.copied')
              : copyState === 'failed'
                ? t('changelogViewer.controls.copyFailed')
                : t('general.copy')}
          </Button>
        </ControlsCluster>
      </ControlsRow>
      {filterText.trim() && !visibleSections.length ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('changelogViewer.noMatches')}
        />
      ) : (
        <ConfigProvider direction="ltr">
          <ReactMarkdownCustom
            markdown={visibleMarkdown}
            allowHtml={allowHtml}
            direction="ltr"
          />
        </ConfigProvider>
      )}
    </ViewerContainer>
  );
}

export default ChangelogViewer;
