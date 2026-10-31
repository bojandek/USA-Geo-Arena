/**
 * The rules of a private tournament.
 *
 * A tournament is a fixed set of questions, a code to join it by and a time
 * it closes. Everybody who has the code plays the same questions once, and
 * the best score when it closes wins. There are no accounts: a player is a
 * name and the hash of their device, the same as on the global board.
 *
 * The pieces that do not need the database live here, so they can be tested
 * on their own.
 */

import { questionPool } from '../../src/lib/question-pool.ts';
import type { Question } from '../../src/lib/question-types.ts';
import {
  CUSTOM_ROUND_MAX,
  CUSTOM_ROUND_MIN,
  questionsForIds,
  randomIds,
} from '../../src/lib/custom-round.ts';

/** How long a tournament can stay open, in days. */
export const TOURNAMENT_DAYS = [1, 3, 7] as const;

/** The letters a code is made of: no 0/O or 1/I/L, so it can be read aloud. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

/** A new code to join a tournament by. */
export function generateCode(random: () => number = Math.random): string {
  let code = '';
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** A code as the player typed it, or an empty string if it cannot be one. */
export function cleanCode(value: unknown): string {
  if (typeof value !== 'string') return '';
  const code = value.trim().toUpperCase();
  return code.length === CODE_LENGTH && [...code].every((letter) => CODE_ALPHABET.includes(letter))
    ? code
    : '';
}

/** How many days a tournament runs, rounded to one of the lengths on offer. */
export function cleanDays(value: unknown): number {
  const days = Number(value);
  return (TOURNAMENT_DAYS as readonly number[]).includes(days) ? days : 3;
}

/**
 * The questions of a new tournament.
 *
 * The ids the player picked are checked against the pool. Too few of them,
 * or none at all, and the tournament gets a random round of ten instead, so
 * a tournament can always be started with one tap.
 */
export function tournamentQuestionIds(
  value: unknown,
  random: () => number = Math.random,
): string[] {
  const ids = Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  const picked = questionsForIds(ids).map((question) => question.id);
  if (picked.length >= CUSTOM_ROUND_MIN) return picked;
  return randomIds(CUSTOM_ROUND_MAX, [], random, questionPool);
}

/** The questions of a tournament, in the order they were stored. */
export function tournamentQuestions(ids: unknown): Question[] {
  return Array.isArray(ids)
    ? questionsForIds(ids.filter((id): id is string => typeof id === 'string'))
    : [];
}

/** True when the tournament has closed. */
export function hasEnded(endsAt: string | null | undefined, now = Date.now()): boolean {
  const time = Date.parse(endsAt ?? '');
  return !Number.isFinite(time) || time <= now;
}
