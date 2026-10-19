/**
 * React context around the pure game-state rules.
 *
 * The provider is intentionally thin: all rules live in `game-state.ts` so
 * they can be unit tested. Every exposed callback is memoised with
 * `useCallback` and the context value is memoised, which is what previously
 * caused an infinite render loop (an unstable function in an effect
 * dependency list that also wrote to state).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { todayKey } from './date-utils';
import {
  ALL_ACHIEVEMENTS,
  applyDailyCompletion,
  applyPracticeCompletion,
  buildArchiveEntries,
  buildLeaderboard,
  createInitialState,
  migrateState,
  type ArchiveEntry,
  type DailyResult,
  type GameState,
} from './game-state';

export { ALL_ACHIEVEMENTS };
export type { ArchiveEntry, DailyResult, GameState };

const STORAGE_KEY = 'geoarena-storage';

interface GameContextValue extends GameState {
  /** True when the daily challenge for today has been completed. */
  isTodayCompleted: boolean;
  /** Completes the daily challenge for `date` (defaults to today). */
  completeDaily: (params: {
    date?: string;
    score: number;
    totalDistance: number;
    perfectCount: number;
    maxScore?: number;
  }) => void;
  /** Records a finished practice round. Never affects progression. */
  completePractice: (score: number) => void;
  /** Top scores, highest first. */
  getLeaderboard: () => DailyResult[];
  /** Real archive entries for the last N days. */
  getArchive: (days?: number) => ArchiveEntry[];
  /** Wipes all progress (used by the "reset progress" action). */
  resetProgress: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

function loadState(): GameState {
  if (typeof localStorage === 'undefined') return createInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return migrateState(JSON.parse(raw));
  } catch {
    // Corrupted payload - start fresh instead of crashing the app.
    return createInitialState();
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);

  // Persist whenever the state changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be unavailable (private mode / quota) - the app still works.
    }
  }, [state]);

  const completeDaily = useCallback<GameContextValue['completeDaily']>((params) => {
    const { date = todayKey(), score, totalDistance, perfectCount, maxScore } = params;
    setState((prev) =>
      applyDailyCompletion(prev, { date, score, totalDistance, perfectCount, maxScore }),
    );
  }, []);

  const completePractice = useCallback<GameContextValue['completePractice']>((score) => {
    setState((prev) => applyPracticeCompletion(prev, score));
  }, []);

  const getLeaderboard = useCallback(
    () => buildLeaderboard(state.dailyHistory),
    [state.dailyHistory],
  );

  const getArchive = useCallback(
    (days?: number) => buildArchiveEntries(state.dailyHistory, days),
    [state.dailyHistory],
  );

  const resetProgress = useCallback(() => {
    setState(createInitialState());
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      isTodayCompleted: state.dailyHistory.some((entry) => entry.date === todayKey()),
      completeDaily,
      completePractice,
      getLeaderboard,
      getArchive,
      resetProgress,
    }),
    [state, completeDaily, completePractice, getLeaderboard, getArchive, resetProgress],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameStore(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameStore must be used within a GameProvider');
  }
  return context;
}

