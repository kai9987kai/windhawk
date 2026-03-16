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

  // Without this the centered content looks too low.
  padding-bottom: 10vh;
`;

const SearchFilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
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
      insights={filterText.trim() ? insights : undefined}
      buttons={[
        {
          text: t('mod.details'),
          onClick: () => {
            setDetailsButtonClicked(true);
            navigate('/mods-browser/' + modId);
          },
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
                    // Keep dropdown open for filter changes
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
              // If we ever clicked on Details, go back.
              // Otherwise, we probably arrived from a different location,
              // go straight to the mods page.
              if (detailsButtonClicked) {
                navigate(-1);
              } else {
                navigate('/mods-browser');
              }
            }}
            installMod={(modSource) =>
              installMod({ modId: displayedModId, modSource })
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
