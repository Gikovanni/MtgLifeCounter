import { Injectable, computed, effect, signal } from '@angular/core';
import { appReducer } from './match-reducer.service';
import { createStorageAdapter } from './storage.service';
import { buildMatchesCsv, createDefaultData, createExportPayload, formatDuration } from '../utils/match.util';
import { readImportedTextFile, saveTextFile } from './export.service';
import { isValidExportPayload, restoreDataFromPayload } from '../utils/validation.util';
import type { AppData, MatchSettings, ThemeMode } from '../models/app-data.model';
import type { AppAction } from './match-reducer.service';

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

  updatePlayerLife(playerId: string, delta: number, recordHistory = true) {
    this.dispatch({ type: 'updateLife', payload: { playerId, delta, recordHistory } });
  }

  recordPlayerLifeChange(playerId: string, previousLife: number, nextLife: number) {
    this.dispatch({ type: 'recordLifeChange', payload: { playerId, previousLife, nextLife } });
  }

  rollDice(die: 6 | 20) {
    const result = Math.floor(Math.random() * die) + 1;
    this.dispatch({ type: 'rollDice', payload: { die, result } });
    return result;
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
