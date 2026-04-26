import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import type { AppData } from './types';
import { STORAGE_KEY } from './constants';
import { createDefaultData } from './utils';
import { normalizeLoadedData } from './validation';

export interface StorageAdapter {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
}

class PreferencesStorageAdapter implements StorageAdapter {
  async load() {
    const result = await Preferences.get({ key: STORAGE_KEY });

    if (!result.value) {
      return createDefaultData();
    }

    try {
      return normalizeLoadedData(JSON.parse(result.value) as AppData);
    } catch {
      return createDefaultData();
    }
  }

  async save(data: AppData) {
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(data)
    });
  }
}

class LocalStorageAdapter implements StorageAdapter {
  async load() {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return createDefaultData();
    }

    try {
      return normalizeLoadedData(JSON.parse(rawValue) as AppData);
    } catch {
      return createDefaultData();
    }
  }

  async save(data: AppData) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export const createStorageAdapter = (): StorageAdapter => {
  if (Capacitor.isPluginAvailable('Preferences')) {
    return new PreferencesStorageAdapter();
  }

  return new LocalStorageAdapter();
};
