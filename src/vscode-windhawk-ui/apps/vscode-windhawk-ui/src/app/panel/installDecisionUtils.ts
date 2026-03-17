import { ModMetadata, RepositoryDetails } from '../webviewIPCMessages';

export type InstallSourceData = Partial<{
  source: string | null;
  readme: string | null;
  initialSettings: unknown[] | null;
}>;

export type InstallDecisionAction =
  | 'install-now'
  | 'install-disabled'
  | 'review-source'
  | 'review-details'
  | 'review-changelog';

export type InstallDecisionRecommendation = {
  key: InstallDecisionAction;
  title: string;
  description: string;
  recommended: boolean;
};

function normalizeProcessName(process: string): string {
  return process.includes('\\')
    ? process.substring(process.lastIndexOf('\\') + 1)
    : process;
}

function getTargetSummary(modMetadata: ModMetadata) {
  const include = (modMetadata.include || []).filter(Boolean);
  const wildcardTargets = include.some(
    (entry) => entry.includes('*') || entry.includes('?')
  );
  const normalizedTargets = Array.from(
    new Set(include.map((entry) => normalizeProcessName(entry)))
  );

  return {
    wildcardTargets,
    targetCount: wildcardTargets ? 999 : normalizedTargets.length,
  };
}

export function getInstallDecisionRecommendations(
  modMetadata: ModMetadata,
  repositoryDetails: RepositoryDetails | undefined,
  installSourceData: InstallSourceData | undefined
): InstallDecisionRecommendation[] {
  const { wildcardTargets, targetCount } = getTargetSummary(modMetadata);
  const hasSource = !!installSourceData?.source;
  const hasReadme = !!installSourceData?.readme;
  const hasSettings = !!installSourceData?.initialSettings?.length;
  const strongCommunity = !!(
    repositoryDetails &&
    repositoryDetails.users >= 2000 &&
    repositoryDetails.rating >= 8.5
  );
  const recentlyUpdated = !!(
    repositoryDetails &&
    (Date.now() - repositoryDetails.updated) / (24 * 60 * 60 * 1000) <= 120
  );
  const staleUpdate = !!(
    repositoryDetails &&
    (Date.now() - repositoryDetails.updated) / (24 * 60 * 60 * 1000) > 180
  );

  let recommendedAction: InstallDecisionAction = 'review-source';

  if (wildcardTargets || targetCount >= 4 || !hasSource) {
    recommendedAction = 'install-disabled';
  } else if (targetCount === 0) {
    recommendedAction = 'review-details';
  } else if (staleUpdate) {
    recommendedAction = 'review-changelog';
  } else if (strongCommunity && recentlyUpdated && hasSource) {
    recommendedAction = 'install-now';
  }

  return [
    {
      key: 'install-now',
      title: 'Install now',
      description: strongCommunity && recentlyUpdated
        ? 'Signals are strong enough for a direct install if you already trust the mod author.'
        : 'Use when the scope is focused and you already reviewed enough evidence.',
      recommended: recommendedAction === 'install-now',
    },
    {
      key: 'install-disabled',
      title: 'Install disabled first',
      description: wildcardTargets || targetCount >= 4 || !hasSource
        ? 'Safer for broad scope, limited reviewability, or uncertain first runs.'
        : 'Good for risky shell tweaks when you want the files installed before enabling.',
      recommended: recommendedAction === 'install-disabled',
    },
    {
      key: 'review-source',
      title: 'Review source first',
      description: hasSource
        ? 'Inspect hook targets and process scope before the first live run.'
        : 'Source is not available in this view, so rely on details and changelog instead.',
      recommended: recommendedAction === 'review-source',
    },
    {
      key: 'review-details',
      title: 'Review details',
      description: hasReadme || hasSettings
        ? 'Use the readme and settings to confirm what the mod actually changes.'
        : 'Metadata is limited, so confirm author, targeting, and purpose before installing.',
      recommended: recommendedAction === 'review-details',
    },
    {
      key: 'review-changelog',
      title: 'Review changelog',
      description: 'Check recent compatibility notes and regressions before committing to the install.',
      recommended: recommendedAction === 'review-changelog',
    },
  ];
}

export function buildInstallDecisionChecklist(
  modMetadata: ModMetadata,
  repositoryDetails: RepositoryDetails | undefined,
  installSourceData: InstallSourceData | undefined
): string[] {
  const { wildcardTargets, targetCount } = getTargetSummary(modMetadata);
  const checks = [
    'Confirm which Windows surface you expect this mod to change before enabling it.',
    'Review at least one evidence source such as source, details, settings, or changelog.',
  ];

  if (wildcardTargets || targetCount >= 4) {
    checks.push('Prefer a disabled-first install for broad process scope.');
  } else if (targetCount > 0) {
    checks.push('Exercise the targeted process manually after install and before long-term use.');
  }

  if (!installSourceData?.source) {
    checks.push('Treat limited reviewability as higher risk and verify behavior manually.');
  }

  if (
    repositoryDetails &&
    (Date.now() - repositoryDetails.updated) / (24 * 60 * 60 * 1000) > 180
  ) {
    checks.push('Check changelog and Windows version compatibility because the mod has not been updated recently.');
  }

  return checks;
}
