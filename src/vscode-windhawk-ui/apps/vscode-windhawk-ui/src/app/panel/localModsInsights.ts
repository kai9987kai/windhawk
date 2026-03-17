import { ModConfig, ModMetadata } from '../webviewIPCMessages';

export type LocalModDetails = {
  metadata: ModMetadata | null;
  config: ModConfig | null;
  updateAvailable: boolean;
  userRating?: number;
};

export type LocalModsOverview = {
  totalInstalled: number;
  enabled: number;
  updates: number;
  needsAttention: number;
  localDrafts: number;
  needsCompile: number;
  loggingEnabled: number;
};

function hasLoggingEnabled(config: ModConfig | null) {
  return !!(config?.loggingEnabled || config?.debugLoggingEnabled);
}

export function getLocalModsOverview(
  installedMods: Record<string, LocalModDetails>
): LocalModsOverview {
  const values = Object.entries(installedMods);
  const updates = values.filter(([, mod]) => mod.updateAvailable).length;
  const needsCompile = values.filter(([, mod]) => !mod.config).length;
  const loggingEnabled = values.filter(([, mod]) => hasLoggingEnabled(mod.config)).length;

  return {
    totalInstalled: values.length,
    enabled: values.filter(([, mod]) => mod.config && !mod.config.disabled).length,
    updates,
    needsAttention: values.filter(([, mod]) =>
      mod.updateAvailable || !mod.config || hasLoggingEnabled(mod.config)
    ).length,
    localDrafts: values.filter(([modId]) => modId.startsWith('local@')).length,
    needsCompile,
    loggingEnabled,
  };
}

export function matchesLocalModFilters(
  modId: string,
  mod: LocalModDetails,
  filterOptions: Set<string>
): boolean {
  if (filterOptions.has('enabled') && (!mod.config || mod.config.disabled)) {
    return false;
  }

  if (filterOptions.has('disabled') && mod.config && !mod.config.disabled) {
    return false;
  }

  if (filterOptions.has('update-available') && !mod.updateAvailable) {
    return false;
  }

  if (filterOptions.has('local-drafts') && !modId.startsWith('local@')) {
    return false;
  }

  if (filterOptions.has('needs-compile') && !!mod.config) {
    return false;
  }

  if (filterOptions.has('logging-enabled') && !hasLoggingEnabled(mod.config)) {
    return false;
  }

  return true;
}
