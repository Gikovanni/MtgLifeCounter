import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';
import { appReducer } from './appReducer';
import { createStorageAdapter } from '../core/storage';
import { createDefaultData, createExportPayload, formatDuration } from '../core/utils';
import type { AppData, MatchSettings, ThemeMode } from '../core/types';
import { buildMatchesCsv } from '../core/utils';
import { readImportedTextFile, saveTextFile } from '../core/fileTransfer';
import { isValidExportPayload, restoreDataFromPayload } from '../core/validation';

interface AppContextValue {
  data: AppData;
  hydrated: boolean;
  matchDurationLabel: string;
  startMatch: (settings: MatchSettings) => void;
  updatePlayerLife: (playerId: string, delta: number) => void;
  renamePlayer: (playerId: string, name: string) => void;
  updatePlayerBackground: (playerId: string, backgroundImageDataUrl?: string) => void;
  addPlayer: () => void;
  removePlayer: (playerId: string) => void;
  setInitialLife: (initialLife: number) => void;
  setLocation: (locationId: string | null) => void;
  resetActiveMatch: () => void;
  finishMatch: (winnerPlayerId: string) => void;
  clearActiveMatch: () => void;
  saveLocation: (payload: { id?: string; name: string; notes: string }) => void;
  deleteLocation: (locationId: string) => void;
  saveSettings: (payload: { defaultInitialLife: number; defaultPlayerCount: number }) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  exportJson: () => Promise<void>;
  exportCsv: () => Promise<void>;
  importJsonFile: (file: File) => Promise<{ ok: boolean; message: string }>;
}

const AppContext = createContext<AppContextValue | null>(null);

const storageAdapter = createStorageAdapter();

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, dispatch] = useReducer(appReducer, undefined, createDefaultData);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let active = true;

    storageAdapter.load().then((loadedData) => {
      if (!active) {
        return;
      }

      startTransition(() => {
        dispatch({ type: 'hydrate', payload: loadedData });
        setHydrated(true);
      });
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    storageAdapter.save(data);
  }, [data, hydrated]);

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.themeMode;
  }, [data.settings.themeMode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const matchDurationLabel = useMemo(
    () =>
      data.activeMatch
        ? formatDuration(Math.max(0, now - new Date(data.activeMatch.startedAt).getTime()))
        : '00:00',
    [data.activeMatch, now]
  );

  const value: AppContextValue = {
    data,
    hydrated,
    matchDurationLabel,
    startMatch: (settings) => dispatch({ type: 'startMatch', payload: settings }),
    updatePlayerLife: (playerId, delta) => dispatch({ type: 'updateLife', payload: { playerId, delta } }),
    renamePlayer: (playerId, name) => dispatch({ type: 'renamePlayer', payload: { playerId, name } }),
    updatePlayerBackground: (playerId, backgroundImageDataUrl) =>
      dispatch({ type: 'updatePlayerBackground', payload: { playerId, backgroundImageDataUrl } }),
    addPlayer: () => dispatch({ type: 'addPlayer' }),
    removePlayer: (playerId) => dispatch({ type: 'removePlayer', payload: { playerId } }),
    setInitialLife: (initialLife) => dispatch({ type: 'setInitialLife', payload: { initialLife } }),
    setLocation: (locationId) => dispatch({ type: 'setLocation', payload: { locationId } }),
    resetActiveMatch: () => dispatch({ type: 'resetActiveMatch' }),
    finishMatch: (winnerPlayerId) => dispatch({ type: 'finishMatch', payload: { winnerPlayerId } }),
    clearActiveMatch: () => dispatch({ type: 'clearActiveMatch' }),
    saveLocation: (payload) => dispatch({ type: 'saveLocation', payload }),
    deleteLocation: (locationId) => dispatch({ type: 'deleteLocation', payload: { locationId } }),
    saveSettings: (payload) => dispatch({ type: 'saveSettings', payload }),
    setThemeMode: (themeMode) => dispatch({ type: 'setThemeMode', payload: { themeMode } }),
    exportJson: async () => {
      const payload = createExportPayload(data);
      await saveTextFile(
        `gk-mtg-counter-backup-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(payload, null, 2),
        'application/json'
      );
    },
    exportCsv: async () => {
      await saveTextFile(
        `gk-mtg-counter-history-${new Date().toISOString().slice(0, 10)}.csv`,
        buildMatchesCsv(data.matchHistory, data.locations),
        'text/csv;charset=utf-8'
      );
    },
    importJsonFile: async (file) => {
      let parsed: unknown;

      try {
        const text = await readImportedTextFile(file);
        parsed = JSON.parse(text) as unknown;
      } catch {
        return {
          ok: false,
          message: 'Nao foi possivel ler o arquivo informado.'
        };
      }

      if (!isValidExportPayload(parsed)) {
        return {
          ok: false,
          message: 'Arquivo invalido ou schema nao suportado.'
        };
      }

      dispatch({
        type: 'restoreData',
        payload: restoreDataFromPayload(parsed, data)
      });

      return {
        ok: true,
        message: 'Backup importado com sucesso.'
      };
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }

  return context;
};
