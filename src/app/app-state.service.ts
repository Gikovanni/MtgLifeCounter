import { Injectable, computed, effect, signal } from '@angular/core';
import { appReducer } from '../state/appReducer';
import { createStorageAdapter } from '../core/storage';
import { createDefaultData, createExportPayload, formatDuration } from '../core/utils';
import { buildMatchesCsv } from '../core/utils';
import { readImportedTextFile, saveTextFile } from '../core/fileTransfer';
import { isValidExportPayload, restoreDataFromPayload } from '../core/validation';
import type { AppData, MatchSettings, ThemeMode } from '../core/types';
import type { AppAction } from '../state/appReducer';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly storageAdapter = createStorageAdapter();
  private readonly now = signal(Date.now());

  readonly data = signal<AppData>(createDefaultData());
  readonly hydrated = signal(false);
  readonly matchDurationLabel = computed(() => {
    const activeMatch = this.data().activeMatch;

    if (!activeMatch) {
      return '00:00';
    }

    return formatDuration(Math.max(0, this.now() - new Date(activeMatch.startedAt).getTime()));
  });

  constructor() {
    void this.hydrate();

    window.setInterval(() => {
      this.now.set(Date.now());
    }, 1000);

    effect(() => {
      document.documentElement.dataset.theme = this.data().settings.themeMode;
    });

    effect(() => {
      const hydrated = this.hydrated();
      const data = this.data();

      if (hydrated) {
        void this.storageAdapter.save(data);
      }
    });
  }

  private async hydrate() {
    const loadedData = await this.storageAdapter.load();
    this.data.set(loadedData);
    this.hydrated.set(true);
  }

  private dispatch(action: AppAction) {
    this.data.update((state) => appReducer(state, action));
  }

  startMatch(settings: MatchSettings) {
    this.dispatch({ type: 'startMatch', payload: settings });
  }

  updatePlayerLife(playerId: string, delta: number) {
    this.dispatch({ type: 'updateLife', payload: { playerId, delta } });
  }

  renamePlayer(playerId: string, name: string) {
    this.dispatch({ type: 'renamePlayer', payload: { playerId, name } });
  }

  updatePlayerBackground(playerId: string, backgroundImageDataUrl?: string) {
    this.dispatch({ type: 'updatePlayerBackground', payload: { playerId, backgroundImageDataUrl } });
  }

  addPlayer() {
    this.dispatch({ type: 'addPlayer' });
  }

  removePlayer(playerId: string) {
    this.dispatch({ type: 'removePlayer', payload: { playerId } });
  }

  setInitialLife(initialLife: number) {
    this.dispatch({ type: 'setInitialLife', payload: { initialLife } });
  }

  setLocation(locationId: string | null) {
    this.dispatch({ type: 'setLocation', payload: { locationId } });
  }

  resetActiveMatch() {
    this.dispatch({ type: 'resetActiveMatch' });
  }

  finishMatch(winnerPlayerId: string) {
    this.dispatch({ type: 'finishMatch', payload: { winnerPlayerId } });
  }

  clearActiveMatch() {
    this.dispatch({ type: 'clearActiveMatch' });
  }

  saveLocation(payload: { id?: string; name: string; notes: string }) {
    this.dispatch({ type: 'saveLocation', payload });
  }

  deleteLocation(locationId: string) {
    this.dispatch({ type: 'deleteLocation', payload: { locationId } });
  }

  saveSettings(payload: { defaultInitialLife: number; defaultPlayerCount: number }) {
    this.dispatch({ type: 'saveSettings', payload });
  }

  setThemeMode(themeMode: ThemeMode) {
    this.dispatch({ type: 'setThemeMode', payload: { themeMode } });
  }

  async exportJson() {
    const payload = createExportPayload(this.data());
    await saveTextFile(
      `gk-mtg-counter-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      'application/json'
    );
  }

  async exportCsv() {
    const data = this.data();
    await saveTextFile(
      `gk-mtg-counter-history-${new Date().toISOString().slice(0, 10)}.csv`,
      buildMatchesCsv(data.matchHistory, data.locations),
      'text/csv;charset=utf-8'
    );
  }

  async importJsonFile(file: File): Promise<{ ok: boolean; message: string }> {
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

    this.dispatch({
      type: 'restoreData',
      payload: restoreDataFromPayload(parsed, this.data())
    });

    return {
      ok: true,
      message: 'Backup importado com sucesso.'
    };
  }
}
