import { MAX_PLAYERS, MIN_PLAYERS } from '../constants/storage-keys';
import type {
  ActiveMatch,
  AppData,
  CompletedMatch,
  LifeChangeEvent,
  LocationRecord,
  MatchSettings,
  Player
} from '../models/app-data.model';
import {
  buildCompletedMatch,
  clampPlayerCount,
  createActiveMatch,
  createId,
  createPlayer,
  nowIso
} from '../utils/match.util';

export type AppAction =
  | { type: 'hydrate'; payload: AppData }
  | { type: 'startMatch'; payload: MatchSettings }
  | { type: 'updateLife'; payload: { playerId: string; delta: number } }
  | { type: 'renamePlayer'; payload: { playerId: string; name: string } }
  | { type: 'updatePlayerBackground'; payload: { playerId: string; backgroundImageDataUrl?: string } }
  | { type: 'addPlayer' }
  | { type: 'removePlayer'; payload: { playerId: string } }
  | { type: 'setInitialLife'; payload: { initialLife: number } }
  | { type: 'setLocation'; payload: { locationId: string | null } }
  | { type: 'resetActiveMatch' }
  | { type: 'finishMatch'; payload: { winnerPlayerId: string } }
  | { type: 'saveLocation'; payload: { id?: string; name: string; notes: string } }
  | { type: 'deleteLocation'; payload: { locationId: string } }
  | { type: 'restoreData'; payload: AppData }
  | { type: 'clearActiveMatch' }
  | { type: 'saveSettings'; payload: { defaultInitialLife: number; defaultPlayerCount: number } }
  | { type: 'setThemeMode'; payload: { themeMode: AppData['settings']['themeMode'] } };

const updateActiveMatch = (match: ActiveMatch, partial: Partial<ActiveMatch>): ActiveMatch => ({
  ...match,
  ...partial,
  updatedAt: nowIso()
});

const createLifeChangeEvent = (player: Player, delta: number): LifeChangeEvent => ({
  id: createId(),
  playerId: player.id,
  delta,
  previousLife: player.life,
  nextLife: player.life + delta,
  timestamp: nowIso()
});

const createReplacementMatch = (data: AppData, overrides?: Partial<MatchSettings>) =>
  createActiveMatch(
    {
      initialLife: overrides?.initialLife ?? data.settings.defaultInitialLife,
      playerCount: overrides?.playerCount ?? data.settings.defaultPlayerCount,
      locationId:
        overrides?.locationId === undefined
          ? data.settings.lastSelectedLocationId
          : overrides.locationId
    },
    data.settings
  );

export const appReducer = (state: AppData, action: AppAction): AppData => {
  switch (action.type) {
    case 'hydrate':
      return action.payload;
    case 'restoreData':
      return action.payload;
    case 'saveSettings':
      return {
        ...state,
        settings: {
          ...state.settings,
          defaultInitialLife: action.payload.defaultInitialLife,
          defaultPlayerCount: clampPlayerCount(action.payload.defaultPlayerCount)
        }
      };
    case 'setThemeMode':
      return {
        ...state,
        settings: {
          ...state.settings,
          themeMode: action.payload.themeMode
        }
      };
    case 'startMatch':
      return {
        ...state,
        settings: {
          ...state.settings,
          defaultInitialLife: action.payload.initialLife,
          defaultPlayerCount: clampPlayerCount(action.payload.playerCount),
          lastSelectedLocationId: action.payload.locationId
        },
        activeMatch: createActiveMatch(action.payload, state.settings)
      };
    case 'updateLife': {
      if (!state.activeMatch) {
        return state;
      }

      const targetPlayer = state.activeMatch.players.find(
        (player) => player.id === action.payload.playerId
      );

      if (!targetPlayer) {
        return state;
      }

      const event = createLifeChangeEvent(targetPlayer, action.payload.delta);

      return {
        ...state,
        activeMatch: updateActiveMatch(state.activeMatch, {
          players: state.activeMatch.players.map((player) =>
            player.id === action.payload.playerId ? { ...player, life: event.nextLife } : player
          ),
          events: [...state.activeMatch.events, event]
        })
      };
    }
    case 'renamePlayer': {
      if (!state.activeMatch) {
        return state;
      }

      const players = state.activeMatch.players.map((player) =>
        player.id === action.payload.playerId ? { ...player, name: action.payload.name } : player
      );
      const playerIndex = players.findIndex((player) => player.id === action.payload.playerId);
      const playerPresets = state.settings.playerPresets.map((preset) =>
        preset.slot === playerIndex ? { ...preset, name: action.payload.name } : preset
      );
      const presets = playerPresets.map((preset) => preset.name);

      return {
        ...state,
        settings: {
          ...state.settings,
          playerNamePresets: presets,
          playerPresets
        },
        activeMatch: updateActiveMatch(state.activeMatch, {
          players
        })
      };
    }
    case 'updatePlayerBackground': {
      if (!state.activeMatch) {
        return state;
      }

      const playerIndex = state.activeMatch.players.findIndex(
        (player) => player.id === action.payload.playerId
      );

      if (playerIndex < 0) {
        return state;
      }

      const players = state.activeMatch.players.map((player) =>
        player.id === action.payload.playerId
          ? { ...player, backgroundImageDataUrl: action.payload.backgroundImageDataUrl }
          : player
      );
      const playerPresets = state.settings.playerPresets.map((preset) =>
        preset.slot === playerIndex
          ? { ...preset, backgroundImageDataUrl: action.payload.backgroundImageDataUrl }
          : preset
      );

      return {
        ...state,
        settings: {
          ...state.settings,
          playerPresets
        },
        activeMatch: updateActiveMatch(state.activeMatch, { players })
      };
    }
    case 'addPlayer': {
      if (!state.activeMatch) {
        return state;
      }

      if (state.activeMatch.players.length >= MAX_PLAYERS) {
        return state;
      }

      const nextIndex = state.activeMatch.players.length;
      const players = [
        ...state.activeMatch.players,
        createPlayer(nextIndex, state.activeMatch.initialLife, state.settings.playerPresets[nextIndex])
      ];

      return {
        ...state,
        settings: {
          ...state.settings,
          defaultPlayerCount: players.length
        },
        activeMatch: updateActiveMatch(state.activeMatch, { players })
      };
    }
    case 'removePlayer': {
      if (!state.activeMatch) {
        return state;
      }

      if (state.activeMatch.players.length <= MIN_PLAYERS) {
        return state;
      }

      const players = state.activeMatch.players.filter((player) => player.id !== action.payload.playerId);
      const events = state.activeMatch.events.filter((event) => event.playerId !== action.payload.playerId);

      return {
        ...state,
        settings: {
          ...state.settings,
          defaultPlayerCount: players.length
        },
        activeMatch: updateActiveMatch(state.activeMatch, { players, events })
      };
    }
    case 'setInitialLife':
      if (!state.activeMatch) {
        return {
          ...state,
          settings: {
            ...state.settings,
            defaultInitialLife: action.payload.initialLife
          }
        };
      }

      return {
        ...state,
        settings: {
          ...state.settings,
          defaultInitialLife: action.payload.initialLife
        },
        activeMatch: updateActiveMatch(state.activeMatch, {
          initialLife: action.payload.initialLife,
          players: state.activeMatch.players.map((player) => ({
            ...player,
            life: action.payload.initialLife
          })),
          events: []
        })
      };
    case 'setLocation':
      if (!state.activeMatch) {
        return {
          ...state,
          settings: {
            ...state.settings,
            lastSelectedLocationId: action.payload.locationId
          }
        };
      }

      return {
        ...state,
        settings: {
          ...state.settings,
          lastSelectedLocationId: action.payload.locationId
        },
        activeMatch: updateActiveMatch(state.activeMatch, {
          locationId: action.payload.locationId
        })
      };
    case 'resetActiveMatch':
      if (!state.activeMatch) {
        return state;
      }

      return {
        ...state,
        activeMatch: createReplacementMatch(state, {
          initialLife: state.activeMatch.initialLife,
          playerCount: state.activeMatch.players.length,
          locationId: state.activeMatch.locationId
        })
      };
    case 'finishMatch': {
      if (!state.activeMatch) {
        return state;
      }

      const endedAt = nowIso();
      const completedMatch: CompletedMatch = buildCompletedMatch(
        state.activeMatch,
        action.payload.winnerPlayerId,
        endedAt
      );

      return {
        ...state,
        matchHistory: [completedMatch, ...state.matchHistory],
        activeMatch: null
      };
    }
    case 'saveLocation': {
      const timestamp = nowIso();
      let locations: LocationRecord[];
      let nextLocationId: string | null = state.activeMatch?.locationId ?? null;

      if (action.payload.id) {
        locations = state.locations.map((location) =>
          location.id === action.payload.id
            ? {
                ...location,
                name: action.payload.name,
                notes: action.payload.notes,
                updatedAt: timestamp
              }
            : location
        );
        nextLocationId = action.payload.id;
      } else {
        const createdLocation: LocationRecord = {
          id: createId(),
          name: action.payload.name,
          notes: action.payload.notes,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        locations = [createdLocation, ...state.locations];
        nextLocationId = createdLocation.id;
      }

      return {
        ...state,
        locations,
        settings: {
          ...state.settings,
          lastSelectedLocationId: nextLocationId
        },
        activeMatch: nextLocationId && state.activeMatch
          ? updateActiveMatch(state.activeMatch, { locationId: nextLocationId })
          : state.activeMatch
      };
    }
    case 'deleteLocation': {
      const locations = state.locations.filter((location) => location.id !== action.payload.locationId);
      const activeLocationId =
        state.activeMatch?.locationId === action.payload.locationId ? null : state.activeMatch?.locationId ?? null;
      const lastSelectedLocationId =
        state.settings.lastSelectedLocationId === action.payload.locationId
          ? null
          : state.settings.lastSelectedLocationId;

      return {
        ...state,
        locations,
        settings: {
          ...state.settings,
          lastSelectedLocationId
        },
        activeMatch: state.activeMatch
          ? updateActiveMatch(state.activeMatch, {
              locationId: activeLocationId
            })
          : null,
        matchHistory: state.matchHistory.map((match) =>
          match.locationId === action.payload.locationId ? { ...match, locationId: null } : match
        )
      };
    }
    case 'clearActiveMatch':
      return {
        ...state,
        activeMatch: null
      };
    default:
      return state;
  }
};
