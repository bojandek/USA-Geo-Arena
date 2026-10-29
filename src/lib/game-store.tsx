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
import { DEFAULT_REGION, type RegionId } from './regions';
import {
  ALL_ACHIEVEMENTS,
  applyDailyCompletion,
  applyPracticeCompletion,
  buildArchiveEntries,
  buildLeaderboard,
  createInitialState,
  migrateState,
  type ArchiveEntry,
  type DailyAnswer,
  type DailyResult,
  type GameState,
} from './game-state';

export { ALL_ACHIEVEMENTS };
export type { ArchiveEntry, DailyAnswer, DailyResult, GameState };

const STORAGE_KEY = 'geoarena-storage';

interface GameContextValue extends GameState {
  /** True when the daily challenge for today has been completed. */
  isTodayCompleted: boolean;
  /**
   * True when today's challenge for a specific region has been completed.
   * The world round and the American round are tracked separately.
   */
  isRegionCompleted: (region: RegionId) => boolean;
  /** Completes the daily challenge for `date` (defaults to today). */
  completeDaily: (params: {
    date?: string;
    region?: RegionId;
    score: number;
    totalDistance: number;
    perfectCount: number;
    timeBonus?: number;
    maxScore?: number;
    baseScore?: number;
    streakMultiplier?: number;
    answers?: DailyAnswer[];
  }) => void;
  /** Records a finished practice round. Never affects progression. */
  completePractice: (score: number) => void;
  /** Top scores, highest first. */
  getLeaderboard: () => DailyResult[];
  /** Real archive entries for the last N days. */
  getArchive: (days?: number, region?: RegionId) => ArchiveEntry[];
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
    const {
      date = todayKey(),
      region = DEFAULT_REGION,
      score,
      totalDistance,
      perfectCount,
      timeBonus,
      maxScore,
      baseScore,
      streakMultiplier,
      answers,
    } = params;
    setState((prev) =>
      applyDailyCompletion(prev, {
        date,
        region,
        score,
        totalDistance,
        perfectCount,
        timeBonus,
        maxScore,
        baseScore,
        streakMultiplier,
        answers,
      }),
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
    (days?: number, region?: RegionId) =>
      buildArchiveEntries(state.dailyHistory, days, todayKey(), region ?? DEFAULT_REGION),
    [state.dailyHistory],
  );

  const resetProgress = useCallback(() => {
    setState(createInitialState());
  }, []);

  const isRegionCompleted = useCallback(
    (region: RegionId) =>
      state.dailyHistory.some(
        (entry) =>
          entry.date === todayKey() && (entry.region ?? DEFAULT_REGION) === region,
      ),
    [state.dailyHistory],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      isTodayCompleted: state.dailyHistory.some((entry) => entry.date === todayKey()),
      isRegionCompleted,
      completeDaily,
      completePractice,
      getLeaderboard,
      getArchive,
      resetProgress,
    }),
    [state, isRegionCompleted, completeDaily, completePractice, getLeaderboard, getArchive, resetProgress],
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

