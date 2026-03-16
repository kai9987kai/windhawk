import React from 'react';
import { AppUISettings } from './webviewIPCMessages';

export type InterfaceDensity = 'comfortable' | 'compact';

export type LocalUISettings = {
  interfaceDensity: InterfaceDensity;
  reduceMotion: boolean;
  useWideLayout: boolean;
};

export const defaultLocalUISettings: LocalUISettings = {
  interfaceDensity: 'comfortable',
  reduceMotion: false,
  useWideLayout: false,
};

export const localUISettingsStorageKey = 'windhawk.local-ui-settings.v1';

function getStorage(storage?: Storage | null) {
  if (storage !== undefined) {
    return storage ?? null;
  }

  return typeof window !== 'undefined' ? window.localStorage : null;
}

function isInterfaceDensity(value: unknown): value is InterfaceDensity {
  return value === 'comfortable' || value === 'compact';
}

export function normalizeLocalUISettings(value: unknown): LocalUISettings {
  if (!value || typeof value !== 'object') {
    return defaultLocalUISettings;
  }

  const candidate = value as Partial<Record<keyof LocalUISettings, unknown>>;

  return {
    interfaceDensity: isInterfaceDensity(candidate.interfaceDensity)
      ? candidate.interfaceDensity
      : defaultLocalUISettings.interfaceDensity,
    reduceMotion:
      typeof candidate.reduceMotion === 'boolean'
        ? candidate.reduceMotion
        : defaultLocalUISettings.reduceMotion,
    useWideLayout:
      typeof candidate.useWideLayout === 'boolean'
        ? candidate.useWideLayout
        : defaultLocalUISettings.useWideLayout,
  };
}

export function mergeLocalUISettings(
  current: LocalUISettings,
  updates: Partial<LocalUISettings>
) {
  return normalizeLocalUISettings({
    ...current,
    ...updates,
  });
}

export function readLocalUISettings(storage?: Storage | null) {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return defaultLocalUISettings;
  }

  try {
    return normalizeLocalUISettings(
      JSON.parse(
        targetStorage.getItem(localUISettingsStorageKey) ?? 'null'
      )
    );
  } catch {
    return defaultLocalUISettings;
  }
}

export function writeLocalUISettings(
  settings: LocalUISettings,
  storage?: Storage | null
) {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return;
  }

  try {
    targetStorage.setItem(
      localUISettingsStorageKey,
      JSON.stringify(settings)
    );
  } catch {
    // Ignore storage write errors so the UI remains usable in restricted hosts.
  }
}

export type AppUISettingsContextType = Partial<AppUISettings> & {
  localUISettings: LocalUISettings;
  setLocalUISettings: (updates: Partial<LocalUISettings>) => void;
  resetLocalUISettings: () => void;
};

export const AppUISettingsContext =
  React.createContext<AppUISettingsContextType>({
    localUISettings: defaultLocalUISettings,
    setLocalUISettings: () => undefined,
    resetLocalUISettings: () => undefined,
  });
