import type { AppData, AppSettings, CompletedMatch, ExportPayload, LocationRecord } from './types';
import { createDefaultData, normalizeSettings } from './utils';

const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isArray = Array.isArray;

const hasValidPlayers = (players: unknown) =>
  isArray(players) &&
  players.every(
    (player) =>
      player &&
      typeof player === 'object' &&
      isString((player as Record<string, unknown>).id) &&
      isString((player as Record<string, unknown>).name) &&
      isNumber((player as Record<string, unknown>).life) &&
      isString((player as Record<string, unknown>).color) &&
      (isString((player as Record<string, unknown>).backgroundImageDataUrl) ||
        (player as Record<string, unknown>).backgroundImageDataUrl === undefined)
  );

const hasValidEvents = (events: unknown) =>
  isArray(events) &&
  events.every(
    (event) =>
      event &&
      typeof event === 'object' &&
      isString((event as Record<string, unknown>).id) &&
      isString((event as Record<string, unknown>).playerId) &&
      isNumber((event as Record<string, unknown>).delta) &&
      isNumber((event as Record<string, unknown>).previousLife) &&
      isNumber((event as Record<string, unknown>).nextLife) &&
      isString((event as Record<string, unknown>).timestamp)
  );

const isLocation = (location: unknown): location is LocationRecord =>
  !!location &&
  typeof location === 'object' &&
  isString((location as Record<string, unknown>).id) &&
  isString((location as Record<string, unknown>).name) &&
  isString((location as Record<string, unknown>).notes) &&
  isString((location as Record<string, unknown>).createdAt) &&
  isString((location as Record<string, unknown>).updatedAt);

const isCompletedMatch = (match: unknown): match is CompletedMatch =>
  !!match &&
  typeof match === 'object' &&
  isString((match as Record<string, unknown>).id) &&
  isString((match as Record<string, unknown>).startedAt) &&
  isString((match as Record<string, unknown>).endedAt) &&
  isNumber((match as Record<string, unknown>).durationMs) &&
  isNumber((match as Record<string, unknown>).initialLife) &&
  isString((match as Record<string, unknown>).winnerPlayerId) &&
  (isString((match as Record<string, unknown>).locationId) ||
    (match as Record<string, unknown>).locationId === null) &&
  hasValidPlayers((match as Record<string, unknown>).players) &&
  hasValidEvents((match as Record<string, unknown>).events);

const isSettings = (settings: unknown): settings is AppSettings =>
  !!settings &&
  typeof settings === 'object' &&
  isNumber((settings as Record<string, unknown>).defaultInitialLife) &&
  isNumber((settings as Record<string, unknown>).defaultPlayerCount) &&
  ((settings as Record<string, unknown>).themeMode === undefined ||
    (settings as Record<string, unknown>).themeMode === 'dark' ||
    (settings as Record<string, unknown>).themeMode === 'light') &&
  isArray((settings as Record<string, unknown>).playerNamePresets) &&
  ((settings as Record<string, unknown>).playerNamePresets as unknown[]).every(isString) &&
  (isArray((settings as Record<string, unknown>).playerPresets) ||
    (settings as Record<string, unknown>).playerPresets === undefined) &&
  (isString((settings as Record<string, unknown>).lastSelectedLocationId) ||
    (settings as Record<string, unknown>).lastSelectedLocationId === null);

export const isValidExportPayload = (payload: unknown): payload is ExportPayload =>
  !!payload &&
  typeof payload === 'object' &&
  (payload as Record<string, unknown>).schemaVersion === 1 &&
  isString((payload as Record<string, unknown>).exportedAt) &&
  isSettings((payload as Record<string, unknown>).settings) &&
  isArray((payload as Record<string, unknown>).locations) &&
  ((payload as Record<string, unknown>).locations as unknown[]).every(isLocation) &&
  isArray((payload as Record<string, unknown>).matchHistory) &&
  ((payload as Record<string, unknown>).matchHistory as unknown[]).every(isCompletedMatch);

export const normalizeLoadedData = (rawData: Partial<AppData>): AppData => {
  const defaults = createDefaultData();
  const settings = normalizeSettings(rawData.settings);

  return {
    schemaVersion: 1,
    settings,
    activeMatch:
      rawData.activeMatch === undefined
        ? defaults.activeMatch
        : rawData.activeMatch
          ? {
              ...rawData.activeMatch,
              players: rawData.activeMatch.players.map((player, index) => ({
                ...player,
                backgroundImageDataUrl:
                  player.backgroundImageDataUrl ?? settings.playerPresets[index]?.backgroundImageDataUrl
              }))
            }
          : null,
    matchHistory: rawData.matchHistory ?? defaults.matchHistory,
    locations: rawData.locations ?? defaults.locations
  };
};

export const restoreDataFromPayload = (payload: ExportPayload, _currentData: AppData): AppData => {
  const settings = normalizeSettings(payload.settings);

  return {
    schemaVersion: 1,
    settings,
    activeMatch: null,
    matchHistory: payload.matchHistory,
    locations: payload.locations
  };
};
