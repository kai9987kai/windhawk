import { faFilter, faSearch, faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Button, Empty, Modal, Result, Spin, Typography } from 'antd';
import { produce } from 'immer';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { AppUISettingsContext } from '../appUISettings';
import { DropdownModal, dropdownModalDismissed, InputWithContextMenu } from '../components/InputWithContextMenu';
import {
  editMod,
  forkMod,
  useCompileMod,
  useDeleteMod,
  useEnableMod,
  useGetRepositoryMods,
  useInstallMod,
  useUpdateInstalledModsDetails,
  useUpdateModRating,
} from '../webviewIPC';
import {
  ModConfig,
  ModMetadata,
  RepositoryDetails,
} from '../webviewIPCMessages';
import { mockModsBrowserOnlineRepositoryMods, useMockData } from './mockData';
import ModCard from './ModCard';
import ModDetails from './ModDetails';
import {
  buildDiscoveryMissionCandidates,
  DiscoveryMission,
  getDiscoveryMissions,
  getDiscoveryMissionByQuery,
  getSearchCorrection,
  getSearchRecovery,
  getRefinementSuggestions,
  normalizeProcessName,
  RankedMod,
  rankMods,
  SortingOrder,
} from './modDiscovery';

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CenteredContent = styled.div`
  margin: auto;
  padding-bottom: 10vh;
`;

const BrowseHero = styled.div`
  margin: -8px -8px 32px -8px;
  padding: 64px 32px;
  background: 
    radial-gradient(circle at 100% 0%, rgba(105, 192, 255, 0.25), transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(23, 125, 220, 0.15), transparent 40%),
    linear-gradient(135deg, rgba(15, 15, 15, 0.8) 0%, rgba(25, 25, 25, 0.6) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 32px -16px rgba(0, 0, 0, 0.4);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.015;
    pointer-events: none;
  }
`;

const HeroBadge = styled.span`
  background: rgba(23, 125, 220, 0.15);
  color: #69c0ff;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 12px;
  border-radius: 999px;
  width: fit-content;
  border: 1px solid rgba(23, 125, 220, 0.3);
`;

const HeroTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroDescription = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  max-width: 600px;
`;

const SearchFilterContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  margin: 0 -24px 32px -24px;
  background: rgba(18, 18, 18, 0.7);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
`;

const SearchMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const SearchSuggestions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SearchActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchMetaText = styled(Typography.Text)`
  color: rgba(255, 255, 255, 0.65);
`;

const DiscoveryPresetsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.2);
`;

const DiscoveryPresetsTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const DiscoveryPresetsDescription = styled(Typography.Text)`
  color: rgba(255, 255, 255, 0.65);
`;

const DiscoveryPresetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

const DiscoveryPresetCard = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ $active }) => (
    $active ? 'rgba(105, 192, 255, 0.6)' : 'rgba(255, 255, 255, 0.08)'
  )};
  border-radius: 16px;
  padding: 18px;
  text-align: left;
  color: inherit;
  background: ${({ $active }) => (
    $active ? 'rgba(23, 125, 220, 0.18)' : 'rgba(25, 25, 25, 0.4)'
  )};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);

  &:hover {
    border-color: rgba(105, 192, 255, 0.5);
    background: rgba(30, 30, 30, 0.6);
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
`;

const DiscoveryPresetLabel = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

const DiscoveryPresetDescription = styled.div`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.45;
`;

const DiscoveryPresetMeta = styled.div`
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const DiscoveryMissionsSection = styled(DiscoveryPresetsSection)`
  margin-top: 16px;
`;

const DiscoveryMissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 14px;
`;

const DiscoveryMissionCard = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid ${({ $active }) => (
    $active ? 'rgba(105, 192, 255, 0.6)' : 'rgba(255, 255, 255, 0.08)'
  )};
  border-radius: 20px;
  padding: 24px;
  background: ${({ $active }) => (
    $active ? 'rgba(23, 125, 220, 0.18)' : 'rgba(25, 25, 25, 0.4)'
  )};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border-color: rgba(105, 192, 255, 0.5);
    background: rgba(30, 30, 30, 0.6);
  }
`;

const DiscoveryMissionTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const DiscoveryMissionDescription = styled.div`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.45;
`;

const DiscoveryMissionCue = styled.div`
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.45;
`;

const DiscoveryMissionTokenRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const DiscoveryMissionToken = styled.span`
  border-radius: 999px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
`;

const DiscoveryMissionChecklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.45;
`;

const DiscoveryMissionChecklistItem = styled.div`
  display: flex;
  gap: 8px;

  &::before {
    content: '•';
    color: rgba(255, 255, 255, 0.5);
  }
`;

const DiscoveryMissionActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MissionWorkbenchSection = styled(DiscoveryPresetsSection)`
  margin-bottom: 20px;
`;

const MissionWorkbenchGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MissionWorkbenchColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const MissionWorkbenchCard = styled.div`
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(25, 25, 25, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.3);
`;

const MissionWorkbenchTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const MissionWorkbenchDescription = styled.div`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.45;
`;

const MissionWorkbenchMeta = styled.div`
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const MissionWorkbenchCandidates = styled.div`
  display: grid;
  gap: 12px;
`;

const MissionWorkbenchCandidate = styled.div`
  border-radius: 12px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
`;

const MissionWorkbenchCandidateTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
`;

const MissionWorkbenchCandidateMeta = styled.div`
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
`;

const MissionWorkbenchCandidateInsights = styled.div`
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.45;
`;

const SearchFilterInput = styled(InputWithContextMenu)`
  > .ant-input-prefix {
    margin-inline-end: 8px;
  }
`;

const IconButton = styled(Button)`
  padding-inline-start: 0;
  padding-inline-end: 0;
  min-width: 40px;
`;

const ModsContainer = styled.div<{ $extraBottomPadding?: boolean }>`
  ${({ $extraBottomPadding }) => css`
    padding-bottom: ${$extraBottomPadding ? 70 : 20}px;
  `}
`;

const ResultsMessageWrapper = styled.div`
  margin-top: 85px;
`;

const RecoveryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    calc(min(400px - 20px * 4 / 3, 100%))
  );
  gap: 20px;
  justify-content: center;
`;

const ProgressSpin = styled(Spin)`
  display: block;
  margin-inline-start: auto;
  margin-inline-end: auto;
  font-size: 32px;
`;

const FilterItemLabelWrapper = styled.span`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

interface FilterItemLabelProps {
  label: string;
  count?: number;
}

const FilterItemLabel = ({ label, count }: FilterItemLabelProps) => (
  <FilterItemLabelWrapper>
    <span>{label}</span>
    {count !== undefined && (
      <Badge
        count={count}
        color='rgba(255, 255, 255, 0.08)'
        style={{
          color: 'rgba(255, 255, 255, 0.65)',
          boxShadow: 'none',
          height: '18px',
          lineHeight: '18px',
          minWidth: '18px',
          padding: '0 6px',
        }}
      />
    )}
  </FilterItemLabelWrapper>
);

type ModDetailsType = {
  repository: {
    metadata: ModMetadata;
    details: RepositoryDetails;
  };
  installed?: {
    metadata: ModMetadata | null;
    config: ModConfig | null;
    userRating?: number;
  };
};

type DiscoveryPreset = {
  key: string;
  label: string;
  description: string;
  query: string;
  sortingOrder: SortingOrder;
};

const extractItemsWithCounts = (
  repositoryMods: Record<string, { repository: { metadata: ModMetadata } }> | null,
  keyPrefix: string,
  extractItems: (mod: { repository: { metadata: ModMetadata } }) => string[]
) => {
  if (!repositoryMods) {
    return [];
  }

  const itemCounts = new Map<string, { count: number; casings: Map<string, number> }>();

  for (const mod of Object.values(repositoryMods)) {
    const items = extractItems(mod);
    for (const item of items) {
      if (!item) {
        continue;
      }

      const lowerItem = item.toLowerCase();
      const existing = itemCounts.get(lowerItem);
      if (existing) {
        existing.count++;
        const casingCount = existing.casings.get(item);
        existing.casings.set(item, (casingCount || 0) + 1);
      } else {
        const casings = new Map<string, number>();
        casings.set(item, 1);
        itemCounts.set(lowerItem, { count: 1, casings });
      }
    }
  }

  return Array.from(itemCounts.entries())
    .map(([lowerName, { count, casings }]) => {
      // Find the most common casing, or first lexicographically if tied
      const displayName = Array.from(casings.entries()).reduce(
        (best, [casing, casingCount]) => {
          if (casingCount > best.count || (casingCount === best.count && casing < best.casing)) {
            return { casing, count: casingCount };
          }
          return best;
        },
        { casing: '', count: 0 }
      ).casing;

      return {
        name: displayName,
        count,
        key: `${keyPrefix}:${lowerName}`,
        lowerName,
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.lowerName.localeCompare(b.lowerName);
    });
};

const extractAuthorsWithCounts = (
  repositoryMods: Record<string, { repository: { metadata: ModMetadata } }> | null
) => {
  return extractItemsWithCounts(
    repositoryMods,
    'author',
    (mod) => mod.repository.metadata.author ? [mod.repository.metadata.author] : []
  );
};

const extractProcessesWithCounts = (
  repositoryMods: Record<string, { repository: { metadata: ModMetadata } }> | null
) => {
  return extractItemsWithCounts(
    repositoryMods,
    'process',
    (mod) => {
      const processes = mod.repository.metadata.include || [];
      const validProcesses: string[] = [];

      for (const process of processes) {
        if (!process) {
          continue;
        }

        // Include "*" as-is
        if (process === '*') {
          validProcesses.push('*');
        } else if (process.includes('*') || process.includes('?')) {
          // Skip other wildcard patterns
          continue;
        } else {
          validProcesses.push(normalizeProcessName(process));
        }
      }

      return validProcesses;
    }
  );
};

const appendSearchRefinement = (currentQuery: string, refinement: string) => {
  const trimmedQuery = currentQuery.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const normalizedRefinement = refinement.trim().toLowerCase();

  if (!normalizedRefinement || normalizedQuery.includes(normalizedRefinement)) {
    return trimmedQuery;
  }

  return trimmedQuery ? `${trimmedQuery} ${refinement}` : refinement;
};

const useFilterState = () => {
  const [filterText, setFilterText] = useState('');
  const [filterOptions, setFilterOptions] = useState<Set<string>>(new Set());
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showAllProcesses, setShowAllProcesses] = useState(false);

  const handleFilterChange = useCallback((key: string) => {
    setFilterOptions((prevOptions) => {
      const newOptions = new Set(prevOptions);

      // Handle mutually exclusive filters for installation status
      if (key === 'installed' && newOptions.has('not-installed')) {
        newOptions.delete('not-installed');
      } else if (key === 'not-installed' && newOptions.has('installed')) {
        newOptions.delete('installed');
      }

      // Toggle the clicked option
      if (newOptions.has(key)) {
        newOptions.delete(key);
      } else {
        newOptions.add(key);
      }

      return newOptions;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterOptions(new Set());
    setShowAllAuthors(false);
    setShowAllProcesses(false);
  }, []);

  return {
    filterText,
    setFilterText,
    filterOptions,
    filterDropdownOpen,
    setFilterDropdownOpen,
    showAllAuthors,
    setShowAllAuthors,
    showAllProcesses,
    setShowAllProcesses,
    handleFilterChange,
    handleClearFilters,
  };
};

interface Props {
  ContentWrapper: React.ComponentType<
    React.ComponentPropsWithoutRef<'div'> & { $hidden?: boolean }
  >;
}

function ModsBrowserOnline({ ContentWrapper }: Props) {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { modId: displayedModId } = useParams<{ modId: string }>();

  const [initialDataPending, setInitialDataPending] = useState(true);
  const [repositoryMods, setRepositoryMods] = useState<Record<
    string,
    ModDetailsType
  > | null>(mockModsBrowserOnlineRepositoryMods);

  const [sortingOrder, setSortingOrder] =
    useState<SortingOrder>('smart-relevance');

  // Filter state
  const {
    filterText,
    setFilterText,
    filterOptions,
    filterDropdownOpen,
    setFilterDropdownOpen,
    showAllAuthors,
    setShowAllAuthors,
    showAllProcesses,
    setShowAllProcesses,
    handleFilterChange,
    handleClearFilters,
  } = useFilterState();

  // Extract filter data
  const authorFilters = useMemo(
    () => extractAuthorsWithCounts(repositoryMods),
    [repositoryMods]
  );

  const processFilters = useMemo(
    () => extractProcessesWithCounts(repositoryMods),
    [repositoryMods]
  );

  const filteredMods = useMemo(() => {
    return Object.entries(repositoryMods || {})
      .filter(([, mod]) => {
        // Apply category filters - if none selected, show all
        if (filterOptions.size === 0) {
          return true;
        }

        // Collect selected authors and processes
        const selectedAuthors: string[] = [];
        const selectedProcesses: string[] = [];
        let installedFilter: boolean | null = null;

        for (const key of filterOptions) {
          if (key.startsWith('author:')) {
            selectedAuthors.push(key.substring('author:'.length));
          } else if (key.startsWith('process:')) {
            selectedProcesses.push(key.substring('process:'.length));
          } else if (key === 'installed') {
            installedFilter = true;
          } else if (key === 'not-installed') {
            installedFilter = false;
          }
        }

        // Check installation status filter
        if (installedFilter !== null) {
          const isInstalled = mod.installed !== undefined;
          if (isInstalled !== installedFilter) {
            return false;
          }
        }

        // Check author filter (OR logic within authors)
        if (selectedAuthors.length > 0) {
          const author = mod.repository.metadata.author?.toLowerCase();
          if (!author || !selectedAuthors.some(a => a === author)) {
            return false;
          }
        }

        // Check process filter (OR logic within processes)
        if (selectedProcesses.length > 0) {
          const processes = (mod.repository.metadata.include || [])
            .map(p => normalizeProcessName(p).toLowerCase())
            .filter(p => p); // Remove empty strings
          if (!selectedProcesses.some(sp => processes.includes(sp))) {
            return false;
          }
        }

        return true;
      });
  }, [repositoryMods, filterOptions]);

  const rankedMods = useMemo(
    () => rankMods(filteredMods, filterText, sortingOrder),
    [filteredMods, filterText, sortingOrder]
  );

  const searchCorrection = useMemo(
    () => getSearchCorrection(filteredMods, filterText),
    [filteredMods, filterText]
  );

  const correctedRankedMods = useMemo(
    () => searchCorrection
      ? rankMods(filteredMods, searchCorrection.correctedQuery, 'smart-relevance')
      : [],
    [filteredMods, searchCorrection]
  );

  const searchRecovery = useMemo(
    () => rankedMods.length === 0
      ? getSearchRecovery(filteredMods, filterText)
      : null,
    [filteredMods, filterText, rankedMods.length]
  );

  const refinementSuggestions = useMemo(
    () => getRefinementSuggestions(rankedMods, filterText),
    [rankedMods, filterText]
  );

  const discoveryPresets = useMemo<DiscoveryPreset[]>(
    () => [
      {
        key: 'fresh',
        label: t('explore.presets.items.fresh.title') as string,
        description: t('explore.presets.items.fresh.description') as string,
        query: '',
        sortingOrder: 'last-updated',
      },
      {
        key: 'favorites',
        label: t('explore.presets.items.favorites.title') as string,
        description: t('explore.presets.items.favorites.description') as string,
        query: '',
        sortingOrder: 'popular-top-rated',
      },
      {
        key: 'taskbar',
        label: t('explore.presets.items.taskbar.title') as string,
        description: t('explore.presets.items.taskbar.description') as string,
        query: 'taskbar',
        sortingOrder: 'smart-relevance',
      },
      {
        key: 'explorer',
        label: t('explore.presets.items.explorer.title') as string,
        description: t('explore.presets.items.explorer.description') as string,
        query: 'explorer',
        sortingOrder: 'smart-relevance',
      },
      {
        key: 'start-menu',
        label: t('explore.presets.items.startMenu.title') as string,
        description: t('explore.presets.items.startMenu.description') as string,
        query: 'start menu',
        sortingOrder: 'smart-relevance',
      },
      {
        key: 'audio',
        label: t('explore.presets.items.audio.title') as string,
        description: t('explore.presets.items.audio.description') as string,
        query: 'audio',
        sortingOrder: 'smart-relevance',
      },
      {
        key: 'notifications',
        label: t('explore.presets.items.notifications.title') as string,
        description: t(
          'explore.presets.items.notifications.description'
        ) as string,
        query: 'notifications',
        sortingOrder: 'smart-relevance',
      },
      {
        key: 'window-management',
        label: t('explore.presets.items.windowManagement.title') as string,
        description: t(
          'explore.presets.items.windowManagement.description'
        ) as string,
        query: 'window management',
        sortingOrder: 'smart-relevance',
      },
      {
        key: 'input',
        label: t('explore.presets.items.input.title') as string,
        description: t('explore.presets.items.input.description') as string,
        query: 'input',
        sortingOrder: 'smart-relevance',
      },
      {
        key: 'appearance',
        label: t('explore.presets.items.appearance.title') as string,
        description: t('explore.presets.items.appearance.description') as string,
        query: 'appearance',
        sortingOrder: 'smart-relevance',
      },
    ],
    [t]
  );
  const discoveryMissions = useMemo<DiscoveryMission[]>(
    () => getDiscoveryMissions(),
    []
  );

  const discoveryPresetCounts = useMemo(() => {
    const mods = Object.entries(repositoryMods || {});

    return Object.fromEntries(
      discoveryPresets.map((preset) => [
        preset.key,
        rankMods(mods, preset.query, preset.sortingOrder).length,
      ])
    ) as Record<string, number>;
  }, [discoveryPresets, repositoryMods]);
  const activeDiscoveryMission = useMemo(
    () => getDiscoveryMissionByQuery(filterText, sortingOrder),
    [filterText, sortingOrder]
  );
  const activeDiscoveryMissionCandidates = useMemo(
    () => activeDiscoveryMission && filterOptions.size === 0
      ? buildDiscoveryMissionCandidates(rankedMods)
      : [],
    [activeDiscoveryMission, filterOptions.size, rankedMods]
  );

  const { devModeOptOut } = useContext(AppUISettingsContext);

  const { getRepositoryMods } = useGetRepositoryMods(
    useCallback((data) => {
      setRepositoryMods(data.mods);
      setInitialDataPending(false);
    }, [])
  );

  useEffect(() => {
    let pending = false;
    if (!useMockData) {
      getRepositoryMods({});
      pending = true;
    }

    setInitialDataPending(pending);
  }, [getRepositoryMods]);

  useUpdateInstalledModsDetails(
    useCallback(
      (data) => {
        if (repositoryMods) {
          const installedModsDetails = data.details;
          setRepositoryMods(
            produce(repositoryMods, (draft) => {
              for (const [modId, updatedDetails] of Object.entries(
                installedModsDetails
              )) {
                const details = draft[modId]?.installed;
                if (details) {
                  const { userRating } = updatedDetails;
                  details.userRating = userRating;
                }
              }
            })
          );
        }
      },
      [repositoryMods]
    )
  );

  const { installMod, installModPending, installModContext } = useInstallMod<{
    updating: boolean;
  }>(
    useCallback(
      (data) => {
        const { installedModDetails } = data;
        if (installedModDetails && repositoryMods) {
          const modId = data.modId;
          setRepositoryMods(
            produce(repositoryMods, (draft) => {
              draft[modId].installed = installedModDetails;
            })
          );
        }
      },
      [repositoryMods]
    )
  );

  const { compileMod, compileModPending } = useCompileMod(
    useCallback(
      (data) => {
        const { compiledModDetails } = data;
        if (compiledModDetails && repositoryMods) {
          const modId = data.modId;
          setRepositoryMods(
            produce(repositoryMods, (draft) => {
              draft[modId].installed = compiledModDetails;
            })
          );
        }
      },
      [repositoryMods]
    )
  );

  const { enableMod } = useEnableMod(
    useCallback(
      (data) => {
        if (data.succeeded && repositoryMods) {
          const modId = data.modId;
          setRepositoryMods(
            produce(repositoryMods, (draft) => {
              const config = draft[modId].installed?.config;
              if (config) {
                config.disabled = !data.enabled;
              }
            })
          );
        }
      },
      [repositoryMods]
    )
  );

  const { deleteMod } = useDeleteMod(
    useCallback(
      (data) => {
        if (data.succeeded && repositoryMods) {
          const modId = data.modId;
          setRepositoryMods(
            produce(repositoryMods, (draft) => {
              delete draft[modId].installed;
            })
          );
        }
      },
      [repositoryMods]
    )
  );

  const { updateModRating } = useUpdateModRating(
    useCallback(
      (data) => {
        if (data.succeeded && repositoryMods) {
          const modId = data.modId;
          setRepositoryMods(
            produce(repositoryMods, (draft) => {
              const installed = draft[modId].installed;
              if (installed) {
                installed.userRating = data.rating;
              }
            })
          );
        }
      },
      [repositoryMods]
    )
  );

  const [infiniteScrollLoadedItems, setInfiniteScrollLoadedItems] =
    useState(30);

  const resetInfiniteScrollLoadedItems = () => setInfiniteScrollLoadedItems(30);
  const openModDetails = useCallback((modId: string) => {
    setDetailsButtonClicked(true);
    navigate('/mods-browser/' + modId);
  }, [navigate]);

  const [detailsButtonClicked, setDetailsButtonClicked] = useState(false);

  // Block all navigation when modal is open
  const modalIsOpen = installModPending || compileModPending;

  useBlocker(({ currentLocation, nextLocation }) => {
    return modalIsOpen && currentLocation.pathname !== nextLocation.pathname;
  });

  if (initialDataPending) {
    return (
      <CenteredContainer>
        <CenteredContent>
          <ProgressSpin size="large" tip={t('general.loading')} />
        </CenteredContent>
      </CenteredContainer>
    );
  }

  if (!repositoryMods) {
    return (
      <CenteredContainer>
        <CenteredContent>
          <Result
            status="error"
            title={t('general.loadingFailedTitle')}
            subTitle={t('general.loadingFailedSubtitle')}
            extra={[
              <Button
                type="primary"
                key="try-again"
                onClick={() => getRepositoryMods({})}
              >
                {t('general.tryAgain')}
              </Button>,
            ]}
          />
        </CenteredContent>
      </CenteredContainer>
    );
  }

  const renderModCard = ({ modId, mod, insights }: RankedMod) => (
    <ModCard
      key={modId}
      ribbonText={
        mod.installed
          ? mod.installed.metadata?.version !==
            mod.repository.metadata.version
            ? (t('mod.updateAvailable') as string)
            : (t('mod.installed') as string)
          : undefined
      }
      title={mod.repository.metadata.name || modId}
      description={mod.repository.metadata.description}
      modMetadata={mod.repository.metadata}
      repositoryDetails={mod.repository.details}
      insights={insights.length > 0 ? insights : undefined}
      buttons={[
        {
          text: t('mod.details'),
          onClick: () => openModDetails(modId),
        },
      ]}
    />
  );

  return (
    <>
      <ContentWrapper
        id="ModsBrowserOnline-ContentWrapper"
        $hidden={!!displayedModId}
      >
        <ModsContainer $extraBottomPadding={!devModeOptOut}>
          <BrowseHero>
            <HeroBadge>{t('appHeader.explore')}</HeroBadge>
            <HeroTitle>{t('explore.pageTitle') || "Discover Windhawk Mods"}</HeroTitle>
            <HeroDescription>{t('explore.pageDescription') || "Enhance your Windows experience with community-driven customizations."}</HeroDescription>
          </BrowseHero>
          <SearchFilterContainer>
            <SearchFilterInput
              prefix={<FontAwesomeIcon icon={faSearch} />}
              placeholder={t('modSearch.placeholder') as string}
              allowClear
              value={filterText}
              onChange={(e) => {
                resetInfiniteScrollLoadedItems();
                setFilterText(e.target.value);
              }}
            />
            <DropdownModal
              placement="bottomRight"
              trigger={['click']}
              arrow={true}
              open={filterDropdownOpen}
              onOpenChange={setFilterDropdownOpen}
              menu={{
                style: { maxHeight: '400px', overflowY: 'overlay' },
                items: [
                  {
                    type: 'group',
                    label: t('explore.filter.installationStatus'),
                    children: [
                      {
                        label: t('explore.filter.installed'),
                        key: 'installed',
                      },
                      {
                        label: t('explore.filter.notInstalled'),
                        key: 'not-installed',
                      },
                    ],
                  },
                  {
                    type: 'group',
                    label: t('explore.filter.author'),
                    children: [
                      ...(showAllAuthors ? authorFilters : authorFilters.slice(0, 5)).map(author => ({
                        label: <FilterItemLabel label={author.name} count={author.count} />,
                        key: author.key,
                      })),
                      ...(authorFilters.length > 5 && !showAllAuthors ? [{
                        label: t('explore.filter.showMore'),
                        key: 'show-more-authors',
                      }] : []),
                    ],
                  },
                  {
                    type: 'group',
                    label: t('explore.filter.process'),
                    children: [
                      ...(showAllProcesses ? processFilters : processFilters.slice(0, 5)).map(process => ({
                        label: <FilterItemLabel label={process.name} count={process.count} />,
                        key: process.key,
                      })),
                      ...(processFilters.length > 5 && !showAllProcesses ? [{
                        label: t('explore.filter.showMore'),
                        key: 'show-more-processes',
                      }] : []),
                    ],
                  },
                  {
                    type: 'divider',
                  },
                  {
                    label: t('explore.filter.clearFilters'),
                    key: 'clear-filters',
                  },
                ],
                selectedKeys: Array.from(filterOptions),
                onClick: (e) => {
                  if (e.key === 'clear-filters') {
                    dropdownModalDismissed();
                    handleClearFilters();
                    setFilterDropdownOpen(false);
                    resetInfiniteScrollLoadedItems();
                  } else if (e.key === 'show-more-authors') {
                    setShowAllAuthors(true);
                  } else if (e.key === 'show-more-processes') {
                    setShowAllProcesses(true);
                  } else {
                    handleFilterChange(e.key);
                    resetInfiniteScrollLoadedItems();
                  }
                },
              }}
            >
              <IconButton
                type={filterOptions.size > 0 ? 'primary' : undefined}
              >
                <FontAwesomeIcon icon={faFilter} />
              </IconButton>
            </DropdownModal>
            <DropdownModal
              placement="bottomRight"
              trigger={['click']}
              arrow={true}
              menu={{
                items: [
                  {
                    label: t('explore.search.smartRelevance'),
                    key: 'smart-relevance',
                  },
                  {
                    label: t('explore.search.popularAndTopRated'),
                    key: 'popular-top-rated',
                  },
                  { label: t('explore.search.popular'), key: 'popular' },
                  { label: t('explore.search.topRated'), key: 'top-rated' },
                  { label: t('explore.search.newest'), key: 'newest' },
                  {
                    label: t('explore.search.lastUpdated'),
                    key: 'last-updated',
                  },
                  {
                    label: t('explore.search.alphabeticalOrder'),
                    key: 'alphabetical',
                  },
                ],
                selectedKeys: [sortingOrder],
                onClick: (e) => {
                  dropdownModalDismissed();
                  resetInfiniteScrollLoadedItems();
                  setSortingOrder(e.key as SortingOrder);
                },
              }}
            >
              <IconButton>
                <FontAwesomeIcon icon={faSort} />
              </IconButton>
            </DropdownModal>
          </SearchFilterContainer>
          {!filterText.trim() && filterOptions.size === 0 && (
            <>
              <DiscoveryPresetsSection>
                <DiscoveryPresetsTitle>
                  {t('explore.presets.title')}
                </DiscoveryPresetsTitle>
                <DiscoveryPresetsDescription>
                  {t('explore.presets.description')}
                </DiscoveryPresetsDescription>
                <DiscoveryPresetsGrid>
                  {discoveryPresets.map((preset) => (
                    <DiscoveryPresetCard
                      key={preset.key}
                      $active={
                        filterText === preset.query &&
                        sortingOrder === preset.sortingOrder
                      }
                      onClick={() => {
                        setFilterText(preset.query);
                        setSortingOrder(preset.sortingOrder);
                        handleClearFilters();
                      }}
                    >
                      <DiscoveryPresetLabel>{preset.label}</DiscoveryPresetLabel>
                      <DiscoveryPresetDescription>
                        {preset.description}
                      </DiscoveryPresetDescription>
                      <DiscoveryPresetMeta>
                        {discoveryPresetCounts[preset.key] || 0}{' '}
                        {t('explore.presets.countSuffix') || "Results"}
                      </DiscoveryPresetMeta>
                    </DiscoveryPresetCard>
                  ))}
                </DiscoveryPresetsGrid>
              </DiscoveryPresetsSection>
              <DiscoveryMissionsSection>
                <DiscoveryPresetsTitle>
                  {t('explore.missions.title')}
                </DiscoveryPresetsTitle>
                <DiscoveryPresetsDescription>
                  {t('explore.missions.description')}
                </DiscoveryPresetsDescription>
                <DiscoveryMissionsGrid>
                  {discoveryMissions.map((mission) => (
                    <DiscoveryMissionCard
                      key={mission.key}
                      $active={activeDiscoveryMission?.key === mission.key}
                    >
                      <DiscoveryMissionTitle>{mission.title}</DiscoveryMissionTitle>
                      <DiscoveryMissionDescription>
                        {mission.description}
                      </DiscoveryMissionDescription>
                      <DiscoveryMissionCue>
                        <strong>{t('explore.missions.cueLabel') || "Research Cue"}:</strong> {mission.researchCue}
                      </DiscoveryMissionCue>
                      <DiscoveryMissionTokenRow>
                        {mission.followUpQueries.map((query) => (
                          <DiscoveryMissionToken key={query}>
                            {query}
                          </DiscoveryMissionToken>
                        ))}
                      </DiscoveryMissionTokenRow>
                      <DiscoveryMissionActions>
                        <Button
                          type='primary'
                          size='small'
                          ghost
                          onClick={() => {
                            setFilterText(mission.query);
                            setSortingOrder(mission.sortingOrder);
                            handleClearFilters();
                          }}
                        >
                          {t('explore.missions.startAction') || "Start Mission"}
                        </Button>
                      </DiscoveryMissionActions>
                    </DiscoveryMissionCard>
                  ))}
                </DiscoveryMissionsGrid>
              </DiscoveryMissionsSection>
            </>
          )}
          {activeDiscoveryMission && filterOptions.size === 0 && (
            <MissionWorkbenchSection>
              <DiscoveryPresetsTitle>
                {t('explore.missions.workbenchTitle') || "Mission Workbench"}
              </DiscoveryPresetsTitle>
              <DiscoveryPresetsDescription>
                {t('explore.missions.workbenchDescription') || "Active mission targets and verification steps."}
              </DiscoveryPresetsDescription>
              <MissionWorkbenchGrid>
                <MissionWorkbenchColumn>
                  <MissionWorkbenchCard>
                    <MissionWorkbenchTitle>
                      {activeDiscoveryMission.title}
                    </MissionWorkbenchTitle>
                    <MissionWorkbenchDescription>
                      {activeDiscoveryMission.description}
                    </MissionWorkbenchDescription>
                    <MissionWorkbenchMeta>
                      {t('explore.missions.checksLabel') || "Verification Checks"}
                    </MissionWorkbenchMeta>
                    <DiscoveryMissionChecklist>
                      {activeDiscoveryMission.verificationChecks.map((check) => (
                        <DiscoveryMissionChecklistItem key={check}>
                          {check}
                        </DiscoveryMissionChecklistItem>
                      ))}
                    </DiscoveryMissionChecklist>
                  </MissionWorkbenchCard>
                </MissionWorkbenchColumn>
                <MissionWorkbenchColumn>
                  <MissionWorkbenchCandidates>
                    {activeDiscoveryMissionCandidates.map((candidate) => (
                      <MissionWorkbenchCandidate key={candidate.modId}>
                        <MissionWorkbenchCandidateTitle>
                          {candidate.displayName}
                        </MissionWorkbenchCandidateTitle>
                        <MissionWorkbenchCandidateMeta>
                          {candidate.author}
                        </MissionWorkbenchCandidateMeta>
                        <MissionWorkbenchCandidateInsights>
                          {candidate.insightSummary}
                        </MissionWorkbenchCandidateInsights>
                        <DiscoveryMissionActions>
                          <Button
                            size="small"
                            onClick={() => openModDetails(candidate.modId)}
                          >
                            {t('mod.details')}
                          </Button>
                        </DiscoveryMissionActions>
                      </MissionWorkbenchCandidate>
                    ))}
                  </MissionWorkbenchCandidates>
                </MissionWorkbenchColumn>
              </MissionWorkbenchGrid>
            </MissionWorkbenchSection>
          )}
          {(filterText.trim() || filterOptions.size > 0) && (
            <SearchMetaRow>
              <SearchMetaText>
                {filterText.trim()
                  ? sortingOrder === 'smart-relevance'
                    ? t('explore.discovery.smartResults', {
                      count: rankedMods.length,
                    })
                    : t('explore.discovery.filteredResults', {
                      count: rankedMods.length,
                    })
                  : t('explore.discovery.filteredOnly', {
                    count: rankedMods.length,
                  })}
              </SearchMetaText>
              <SearchActions>
                {filterText.trim() &&
                  sortingOrder === 'smart-relevance' &&
                  searchCorrection &&
                  correctedRankedMods.length > rankedMods.length && (
                    <SearchSuggestions>
                      <SearchMetaText>
                        {t('modSearch.didYouMean')}
                      </SearchMetaText>
                      <Button
                        size="small"
                        onClick={() => {
                          resetInfiniteScrollLoadedItems();
                          setFilterText(searchCorrection.correctedQuery);
                        }}
                      >
                        {searchCorrection.correctedQuery}
                      </Button>
                    </SearchSuggestions>
                  )}
                {filterText.trim() &&
                  sortingOrder === 'smart-relevance' &&
                  refinementSuggestions.length > 0 && (
                    <SearchSuggestions>
                      <SearchMetaText>
                        {t('explore.discovery.refineWith')}
                      </SearchMetaText>
                      {refinementSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion.key}
                          size="small"
                          onClick={() => {
                            resetInfiniteScrollLoadedItems();
                            setFilterText((prevValue) =>
                              appendSearchRefinement(prevValue, suggestion.queryText)
                            );
                          }}
                        >
                          {suggestion.label}
                        </Button>
                      ))}
                    </SearchSuggestions>
                  )}
              </SearchActions>
            </SearchMetaRow>
          )}
          {rankedMods.length === 0 ? (
            <ResultsMessageWrapper>
              <RecoveryContainer>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t('modSearch.noResults')}
                />
                {searchRecovery && (
                  <>
                    <SearchSuggestions>
                      <SearchMetaText>
                        {searchRecovery.reason === 'correction'
                          ? t('modSearch.recoveryByCorrection')
                          : t('modSearch.recoveryByBroadening')}
                      </SearchMetaText>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          resetInfiniteScrollLoadedItems();
                          setFilterText(searchRecovery.suggestedQuery);
                        }}
                      >
                        {t('modSearch.tryRecoveredQuery', {
                          query: searchRecovery.suggestedQuery,
                        })}
                      </Button>
                    </SearchSuggestions>
                    <SearchMetaText>
                      {t('modSearch.closestMatches')}
                    </SearchMetaText>
                    <ModsGrid>
                      {searchRecovery.results.map(renderModCard)}
                    </ModsGrid>
                  </>
                )}
              </RecoveryContainer>
            </ResultsMessageWrapper>
          ) : (
            <InfiniteScroll
              dataLength={infiniteScrollLoadedItems}
              next={() =>
                setInfiniteScrollLoadedItems(
                  Math.min(
                    infiniteScrollLoadedItems + 30,
                    rankedMods.length
                  )
                )
              }
              hasMore={infiniteScrollLoadedItems < rankedMods.length}
              loader={null}
              scrollableTarget="ModsBrowserOnline-ContentWrapper"
              style={{ overflow: 'visible' }} // for the ribbon
            >
              <ModsGrid>
                {rankedMods
                   .slice(0, infiniteScrollLoadedItems)
                   .map(renderModCard)}
              </ModsGrid>
            </InfiniteScroll>
          )}
        </ModsContainer>
      </ContentWrapper>
      {displayedModId && (
        <ContentWrapper>
          <ModDetails
            modId={displayedModId}
            installedModDetails={repositoryMods[displayedModId].installed}
            repositoryModDetails={repositoryMods[displayedModId].repository}
            goBack={() => {
              if (detailsButtonClicked) {
                navigate(-1);
              } else {
                navigate('/mods-browser');
              }
            }}
            installMod={(modSource, options) =>
              installMod({ modId: displayedModId, modSource, disabled: options?.disabled })
            }
            updateMod={(modSource, disabled) =>
              installMod(
                { modId: displayedModId, modSource, disabled },
                { updating: true }
              )
            }
            forkModFromSource={(modSource) =>
              forkMod({ modId: displayedModId, modSource })
            }
            compileMod={() => compileMod({ modId: displayedModId })}
            enableMod={(enable) => enableMod({ modId: displayedModId, enable })}
            editMod={() => editMod({ modId: displayedModId })}
            forkMod={() => forkMod({ modId: displayedModId })}
            deleteMod={() => deleteMod({ modId: displayedModId })}
            updateModRating={(newRating) =>
              updateModRating({ modId: displayedModId, rating: newRating })
            }
          />
        </ContentWrapper>
      )}
      {(installModPending || compileModPending) && (
        <Modal open={true} closable={false} footer={null}>
          <ProgressSpin
            size="large"
            tip={
              installModPending
                ? installModContext?.updating
                  ? t('general.updating')
                  : t('general.installing')
                : compileModPending
                  ? t('general.compiling')
                  : ''
            }
          />
        </Modal>
      )}
    </>
  );
}

export default ModsBrowserOnline;
