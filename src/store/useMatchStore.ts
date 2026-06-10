import { create } from 'zustand';
import type { Match, MatchEvent, Player } from '@/types/match';
import { currentMatch as initialMatch } from '@/data/mockData';

const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const MAX_UNDO_STACK = 50;

interface MatchState {
  currentMatch: Match;
  selectedMatchId: string | null;
  undoStack: Match[];

  setCurrentMatch: (match: Match) => void;
  startMatch: () => void;
  pauseMatch: () => void;
  resetMatch: () => void;
  setTime: (time: string) => void;
  nextPeriod: () => void;
  addScore: (teamType: 'home' | 'away', points?: number) => void;
  subtractScore: (teamType: 'home' | 'away', points?: number) => void;
  addEvent: (event: MatchEvent) => void;
  addTimeout: (teamType: 'home' | 'away') => void;
  setStarter: (teamId: string, playerId: string, isStarter: boolean) => void;
  updatePlayerStat: (teamId: string, playerId: string, stat: Partial<Player>) => void;
  finishMatch: () => void;
  pushSnapshot: () => void;
  undo: () => void;
  canUndo: () => boolean;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  currentMatch: cloneDeep(initialMatch),
  selectedMatchId: null,
  undoStack: [],

  pushSnapshot: () => {
    set((state) => {
      const newStack = [...state.undoStack, cloneDeep(state.currentMatch)];
      if (newStack.length > MAX_UNDO_STACK) {
        newStack.shift();
      }
      return { undoStack: newStack };
    });
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const newStack = [...state.undoStack];
      const prevMatch = newStack.pop()!;
      return {
        currentMatch: prevMatch,
        undoStack: newStack
      };
    });
  },

  canUndo: () => {
    return get().undoStack.length > 0;
  },

  setCurrentMatch: (match) => {
    set({ currentMatch: cloneDeep(match), undoStack: [] });
  },

  startMatch: () => {
    get().pushSnapshot();
    set((state) => ({
      currentMatch: {
        ...state.currentMatch,
        isRunning: true,
        status: 'ongoing'
      }
    }));
  },

  pauseMatch: () => {
    set((state) => ({
      currentMatch: {
        ...state.currentMatch,
        isRunning: false
      }
    }));
  },

  resetMatch: () => {
    set({
      currentMatch: cloneDeep(initialMatch),
      undoStack: []
    });
  },

  setTime: (time) => {
    set((state) => ({
      currentMatch: {
        ...state.currentMatch,
        currentTime: time
      }
    }));
  },

  nextPeriod: () => {
    get().pushSnapshot();
    set((state) => {
      const nextP = state.currentMatch.period + 1;
      if (nextP > state.currentMatch.totalPeriods) {
        return state;
      }
      return {
        currentMatch: {
          ...state.currentMatch,
          period: nextP,
          currentTime: '00:00',
          isRunning: false
        }
      };
    });
  },

  addScore: (teamType, points = 1) => {
    set((state) => {
      const key = teamType === 'home' ? 'homeTeam' : 'awayTeam';
      return {
        currentMatch: {
          ...state.currentMatch,
          [key]: {
            ...state.currentMatch[key],
            score: state.currentMatch[key].score + points
          }
        }
      };
    });
  },

  subtractScore: (teamType, points = 1) => {
    set((state) => {
      const key = teamType === 'home' ? 'homeTeam' : 'awayTeam';
      const newScore = Math.max(0, state.currentMatch[key].score - points);
      return {
        currentMatch: {
          ...state.currentMatch,
          [key]: {
            ...state.currentMatch[key],
            score: newScore
          }
        }
      };
    });
  },

  addEvent: (event) => {
    set((state) => ({
      currentMatch: {
        ...state.currentMatch,
        events: [...state.currentMatch.events, event]
      }
    }));
  },

  addTimeout: (teamType) => {
    set((state) => {
      const key = teamType === 'home' ? 'home' : 'away';
      const current = state.currentMatch.timeouts[key];
      if (current <= 0) return state;
      return {
        currentMatch: {
          ...state.currentMatch,
          timeouts: {
            ...state.currentMatch.timeouts,
            [key]: current - 1
          }
        }
      };
    });
  },

  setStarter: (teamId, playerId, isStarter) => {
    get().pushSnapshot();
    set((state) => {
      const teamKey = teamId === state.currentMatch.homeTeam.id ? 'homeTeam' : 'awayTeam';
      const team = state.currentMatch[teamKey];
      const updatedPlayers = team.players.map(p =>
        p.id === playerId ? { ...p, isStarter } : p
      );
      return {
        currentMatch: {
          ...state.currentMatch,
          [teamKey]: {
            ...team,
            players: updatedPlayers
          }
        }
      };
    });
  },

  updatePlayerStat: (teamId, playerId, stat) => {
    set((state) => {
      const teamKey = teamId === state.currentMatch.homeTeam.id ? 'homeTeam' : 'awayTeam';
      const team = state.currentMatch[teamKey];
      const updatedPlayers = team.players.map(p =>
        p.id === playerId ? { ...p, ...stat } : p
      );
      return {
        currentMatch: {
          ...state.currentMatch,
          [teamKey]: {
            ...team,
            players: updatedPlayers
          }
        }
      };
    });
  },

  finishMatch: () => {
    set((state) => ({
      currentMatch: {
        ...state.currentMatch,
        status: 'finished',
        isRunning: false
      }
    }));
  }
}));
