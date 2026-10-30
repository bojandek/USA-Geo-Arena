/**
 * Daily missions.
 *
 * Three small goals a day, the same for every player, on top of the rounds
 * themselves. A round is a score; a mission is a reason to play it a certain
 * way - and a reason to play the other region too. Each mission is worth
 * bonus XP that counts towards the level, never towards the score on the
 * board, so the board stays a fair comparison of the answers alone.
 *
 * Everything here is a pure function of the day's results, so the progress
 * can never drift from what the player actually did.
 */

import type { DailyResult } from './game-state.ts';
import { DEFAULT_REGION } from './regions.ts';

/** How many missions a day offers. */
export const MISSIONS_PER_DAY = 3;

export interface Mission {
  id: string;
  title: string;
  icon: string;
  /** Bonus XP for completing the mission. */
  reward: number;
  /** The value `progress` has to reach. */
  target: number;
  /** How far the day's results go towards the target. */
  progress: (results: DailyResult[]) => number;
}

export interface MissionStatus {
  mission: Mission;
  /** Progress, capped at the target. */
  current: number;
  done: boolean;
}

const answersOf = (results: DailyResult[]) => results.flatMap((result) => result.answers ?? []);
const best = (results: DailyResult[], pick: (result: DailyResult) => number) =>
  results.reduce((max, result) => Math.max(max, pick(result)), 0);

/** Every mission the daily draw can pick from. */
export const ALL_MISSIONS: Mission[] = [
  {
    id: 'play_both',
    title: 'Play both the USA and the World challenge',
    icon: '🌎',
    reward: 150,
    target: 2,
    progress: (results) => new Set(results.map((result) => result.region ?? DEFAULT_REGION)).size,
  },
  {
    id: 'bullseye_2',
    title: 'Land 2 guesses within 25 km',
    icon: '🎯',
    reward: 100,
    target: 2,
    progress: (results) => answersOf(results).filter((answer) => answer.distance < 25).length,
  },
  {
    id: 'close_5',
    title: 'Get 5 guesses within 100 km',
    icon: '📍',
    reward: 100,
    target: 5,
    progress: (results) => answersOf(results).filter((answer) => answer.distance < 100).length,
  },
  {
    id: 'score_900',
    title: 'Score 900 points in a single round',
    icon: '⭐',
    reward: 120,
    target: 900,
    progress: (results) => best(results, (result) => result.score),
  },
  {
    id: 'speed_40',
    title: 'Earn 40 speed bonus points in a round',
    icon: '⚡',
    reward: 80,
    target: 40,
    progress: (results) => best(results, (result) => result.timeBonus ?? 0),
  },
  {
    id: 'accuracy_75',
    title: 'Finish a round with 75% accuracy',
    icon: '🦅',
    reward: 120,
    target: 75,
    progress: (results) => best(results, (result) => result.accuracy),
  },
  {
    id: 'no_blunder',
    title: 'Finish a round with no guess over 1,000 km off',
    icon: '🛡️',
    reward: 100,
    target: 1,
    progress: (results) =>
      results.some(
        (result) =>
          (result.answers?.length ?? 0) > 0 && result.answers!.every((answer) => answer.distance < 1000),
      )
        ? 1
        : 0,
  },
];

/** A small, stable hash of a string, used to draw the day's missions. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * The missions of a day, the same for every player.
 *
 * "Play both" is on the list every day: it is the mission that brings a
 * player to the second round, and the second round is the second habit.
 */
export function missionsForDay(dayKey: string): Mission[] {
  const [first, ...rest] = ALL_MISSIONS;
  const ranked = [...rest].sort((a, b) => hash(`${dayKey}:${a.id}`) - hash(`${dayKey}:${b.id}`));
  return [first, ...ranked.slice(0, MISSIONS_PER_DAY - 1)];
}

/** The progress of each of the day's missions. */
export function missionStatuses(history: DailyResult[], dayKey: string): MissionStatus[] {
  const results = history.filter((result) => result.date === dayKey);
  return missionsForDay(dayKey).map((mission) => {
    const value = Number(mission.progress(results)) || 0;
    return { mission, current: Math.min(value, mission.target), done: value >= mission.target };
  });
}

/** The id a completed mission is recorded under, so it is only paid once. */
export function missionClaimId(dayKey: string, missionId: string): string {
  return `${dayKey}:${missionId}`;
}
