import { create } from 'zustand';
import type { Match, MatchEvent, Player, MatchConfirmation } from '@/types/match';
import { currentMatch as initialMatch, matchList } from '@/data/mockData';

const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const MAX_UNDO_STACK = 50;

const getInitialFinishedMatches = (): Match[] => {
  return matchList
    .filter(m => m.status === 'finished')
    .map(m => cloneDeep(m));
};

interface MatchState {
  currentMatch: Match;
  selectedMatchId: string | null;
  undoStack: Match[];
  finishedMatches: Match[];

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
  setConfirmation: (confirmation: Partial<MatchConfirmation>) => void;
  finishMatch: () => void;
  pushSnapshot: () => void;
  undo: () => void;
  canUndo: () => boolean;
  loadFinishedMatch: (matchId: string) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  currentMatch: cloneDeep(initialMatch),
  selectedMatchId: null,
  undoStack: [],
  finishedMatches: getInitialFinishedMatches(),

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

  setConfirmation: (confirmation) => {
    set((state) => ({
      currentMatch: {
        ...state.currentMatch,
        confirmation: {
          ...state.currentMatch.confirmation,
          ...confirmation
        } as MatchConfirmation
      }
    }));
  },

  finishMatch: () => {
    const now = new Date();
    const confirmedAt = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    set((state) => {
      const finishedMatch = {
        ...state.currentMatch,
        status: 'finished' as const,
        isRunning: false,
        confirmation: {
          ...state.currentMatch.confirmation,
          confirmedAt
        }
      };
      const existingIndex = state.finishedMatches.findIndex(m => m.id === finishedMatch.id);
      let newFinishedMatches;
      if (existingIndex >= 0) {
        newFinishedMatches = [...state.finishedMatches];
        newFinishedMatches[existingIndex] = finishedMatch;
      } else {
        newFinishedMatches = [...state.finishedMatches, finishedMatch];
      }
      return {
        currentMatch: finishedMatch,
        finishedMatches: newFinishedMatches
      };
    });
  },

  loadFinishedMatch: (matchId) => {
    const match = get().finishedMatches.find(m => m.id === matchId);
    if (match) {
      set({ currentMatch: cloneDeep(match), undoStack: [] });
    }
  }
}));
