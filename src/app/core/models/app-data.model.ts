export type MatchStatus = 'active' | 'completed';

export type ThemeMode = 'dark' | 'light';

export interface Player {
  id: string;
  name: string;
  life: number;
  color: string;
  backgroundImageDataUrl?: string;
}

export interface LifeChangeEvent {
  id: string;
  playerId: string;
  delta: number;
  previousLife: number;
  nextLife: number;
  timestamp: string;
}

export interface LocationRecord {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchSettings {
  initialLife: number;
  playerCount: number;
  locationId: string | null;
}

export interface PlayerPreset {
  slot: number;
  name: string;
  backgroundImageDataUrl?: string;
}

export interface ActiveMatch {
  id: string;
  status: 'active';
  startedAt: string;
  updatedAt: string;
  initialLife: number;
  players: Player[];
  events: LifeChangeEvent[];
  locationId: string | null;
}

export interface CompletedMatch {
  id: string;
  status: 'completed';
  startedAt: string;
  endedAt: string;
  durationMs: number;
  initialLife: number;
  players: Player[];
  events: LifeChangeEvent[];
  winnerPlayerId: string;
  locationId: string | null;
}

export interface AppSettings {
  defaultInitialLife: number;
  defaultPlayerCount: number;
  themeMode: ThemeMode;
  playerNamePresets: string[];
  playerPresets: PlayerPreset[];
  lastSelectedLocationId: string | null;
}

export interface AppData {
  schemaVersion: 1;
  settings: AppSettings;
  activeMatch: ActiveMatch | null;
  matchHistory: CompletedMatch[];
  locations: LocationRecord[];
}

export interface ExportPayload {
  schemaVersion: 1;
  exportedAt: string;
  settings: AppSettings;
  locations: LocationRecord[];
  matchHistory: CompletedMatch[];
}
