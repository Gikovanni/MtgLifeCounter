import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS } from './constants';
import type {
  ActiveMatch,
  AppData,
  AppSettings,
  CompletedMatch,
  ExportPayload,
  LocationRecord,
  MatchSettings,
  Player,
  PlayerPreset
} from './types';

export const nowIso = () => new Date().toISOString();

export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const clampPlayerCount = (count: number) => Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count));

export const createPlayer = (index: number, initialLife: number, preset?: PlayerPreset | string): Player => ({
  id: createId(),
  name: typeof preset === 'string' ? preset : preset?.name ?? `Jogador ${index + 1}`,
  life: initialLife,
  color: PLAYER_COLORS[index % PLAYER_COLORS.length],
  backgroundImageDataUrl: typeof preset === 'string' ? undefined : preset?.backgroundImageDataUrl
});

export const createDefaultSettings = (): AppSettings => ({
  defaultInitialLife: 20,
  defaultPlayerCount: 4,
  themeMode: 'dark',
  playerNamePresets: ['Joao', 'Maria', 'Lucas', 'Pedro'],
  playerPresets: [
    { slot: 0, name: 'Joao' },
    { slot: 1, name: 'Maria' },
    { slot: 2, name: 'Lucas' },
    { slot: 3, name: 'Pedro' },
    { slot: 4, name: 'Daniel' },
    { slot: 5, name: 'Gabi' }
  ],
  lastSelectedLocationId: null
});

export const normalizeSettings = (settings: Partial<AppSettings> | undefined): AppSettings => {
  const defaults = createDefaultSettings();
  const legacyNames = settings?.playerNamePresets ?? defaults.playerNamePresets;
  const rawPresets: PlayerPreset[] =
    settings?.playerPresets ?? legacyNames.map((name, slot) => ({ slot, name }));

  return {
    ...defaults,
    ...settings,
    defaultPlayerCount: clampPlayerCount(settings?.defaultPlayerCount ?? defaults.defaultPlayerCount),
    themeMode: settings?.themeMode === 'light' ? 'light' : 'dark',
    playerNamePresets: legacyNames,
    playerPresets: Array.from({ length: MAX_PLAYERS }, (_, slot) => {
      const existing = rawPresets.find((preset) => preset.slot === slot);
      return {
        slot,
        name: existing?.name ?? legacyNames[slot] ?? `Jogador ${slot + 1}`,
        backgroundImageDataUrl: existing?.backgroundImageDataUrl
      };
    })
  };
};

export const createPlayers = (playerCount: number, initialLife: number, presets: PlayerPreset[]): Player[] =>
  Array.from({ length: clampPlayerCount(playerCount) }, (_, index) =>
    createPlayer(index, initialLife, presets[index])
  );

export const createActiveMatch = (settings: MatchSettings, appSettings: AppSettings): ActiveMatch => {
  const startedAt = nowIso();

  return {
    id: createId(),
    status: 'active',
    startedAt,
    updatedAt: startedAt,
    initialLife: settings.initialLife,
    players: createPlayers(settings.playerCount, settings.initialLife, appSettings.playerPresets),
    events: [],
    locationId: settings.locationId
  };
};

export const createDefaultData = (): AppData => {
  const settings = normalizeSettings(createDefaultSettings());

  return {
    schemaVersion: 1,
    settings,
    activeMatch: null,
    matchHistory: [],
    locations: []
  };
};

export const getMatchDurationMs = (match: Pick<ActiveMatch, 'startedAt'>, endedAt: string) =>
  Math.max(0, new Date(endedAt).getTime() - new Date(match.startedAt).getTime());

export const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const buildCompletedMatch = (
  match: ActiveMatch,
  winnerPlayerId: string,
  endedAt: string
): CompletedMatch => ({
  id: match.id,
  status: 'completed',
  startedAt: match.startedAt,
  endedAt,
  durationMs: getMatchDurationMs(match, endedAt),
  initialLife: match.initialLife,
  players: match.players,
  events: match.events,
  winnerPlayerId,
  locationId: match.locationId
});

export const createExportPayload = (data: AppData): ExportPayload => ({
  schemaVersion: 1,
  exportedAt: nowIso(),
  settings: data.settings,
  locations: data.locations,
  matchHistory: data.matchHistory
});

export const buildMatchesCsv = (matches: CompletedMatch[], locations: LocationRecord[]) => {
  const locationMap = new Map(locations.map((location) => [location.id, location.name]));
  const headers = [
    'match_id',
    'date',
    'duration_ms',
    'winner_name',
    'location',
    'players',
    'initial_life',
    'event_count'
  ];
  const rows = matches.map((match) => {
    const winnerName = match.players.find((player) => player.id === match.winnerPlayerId)?.name ?? '';
    const locationName = match.locationId ? locationMap.get(match.locationId) ?? '' : '';
    const players = match.players.map((player) => `${player.name} (${player.life})`).join(' | ');

    return [
      match.id,
      match.endedAt,
      String(match.durationMs),
      winnerName,
      locationName,
      players,
      String(match.initialLife),
      String(match.events.length)
    ];
  });

  return [headers, ...rows]
    .map((columns) => columns.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
};
