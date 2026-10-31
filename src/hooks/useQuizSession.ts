/**
 * Shared quiz-session logic used by the daily challenge, practice mode and
 * battle mode.
 *
 * Previously each of the three modes re-implemented the same flow (map click
 * -> distance -> score -> answers -> next -> results), which let the scoring
 * and completion behaviour drift apart. This hook is the single source of
 * truth for that flow.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { calculateDistance, calculateScore, type Question } from '@/lib/game-data';
import { scoreAnswer, stakeForQuestion, TIME_BONUS_WINDOW_SECONDS, computeAccuracy } from '@/lib/time-bonus';
import { roundScore } from '@/lib/numbers';

export interface QuizAnswer {
  questionId: string;
  question: string;
  score: number;
  distance: number;
  /** Points earned for answering quickly. */
  timeBonus: number;
  /** Points earned from how close the guess was. */
  locationPoints: number;
  /** How long the player took, in seconds. */
  elapsedSeconds: number;
  /**
   * True when the player gave up on the question rather than answering it.
   *
   * The question still counts as answered, so the round moves on, but it is
   * worth nothing.
   */
  gaveUp?: boolean;
  /**
   * The name of the place the player named, when they answered by clicking
   * on a place name rather than by dropping a pin.
   *
   * Naming the place is knowing the place, so it is worth the full points
   * even when the label itself sits a few kilometres from the ground.
   */
  namedPlace?: string;
  /**
   * Where the player dropped the pin.
   *
   * The guess travels to the server with the round, so the global board can
   * work the score out again from it instead of taking the browser's word
   * for what the round was worth.
   */
  guessLat?: number;
  guessLng?: number;
}

export interface QuizSessionOptions {
  questions: Question[];
  /** Called once, when the last question has been answered. */
  onComplete?: (result: {
    totalScore: number;
    totalDistance: number;
    perfectCount: number;
    timeBonus: number;
    answers: QuizAnswer[];
  }) => void;
  /** A guess counts as "perfect" below this distance (km). */
  perfectDistanceKm?: number;
  /**
   * Whether the player can see the question yet. The clock waits while this
   * is false, so a map that is still loading does not eat into the time
   * bonus. Defaults to true.
   */
  ready?: boolean;
}
export interface QuizSession {
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | undefined;
  userGuess: { lat: number; lng: number } | null;
  /**
   * The place the player named, when they answered by clicking on a name
   * rather than by dropping a pin.
   */
  namedPlace: string | null;
  showResult: boolean;
  distance: number;
  questionScore: number;
  /** Time bonus earned on the current question, so far. */
  questionTimeBonus: number;
  totalScore: number;
  totalDistance: number;
  perfectGuessCount: number;
  answers: QuizAnswer[];
  /**
   * How well the guesses were placed, as a percentage. The speed part of the
   * score is left out on purpose.
   */
  accuracy: number;
  isComplete: boolean;
  isLastQuestion: boolean;
  /** Seconds left in which the full time bonus can still be earned. */
  timeBonusSecondsLeft: number;
  /** Records a guess made on the map. */
  guess: (
    lat: number,
    lng: number,
    options?: { named?: string },
  ) => void;
  /** Scores the current guess. Returns false when there is nothing to score. */
  submit: () => boolean;
  /**
   * Takes points off the round, for a hint the player bought.
   *
   * The round can never go below zero: a player who spends more than they
   * have does not end up in the negative.
   */
  spendOnHint: (cost: number) => void;
  /**
   * Gives up on the current question.
   *
   * The question counts as answered so the round moves on, but it is worth
   * nothing. Being stuck should not cost a player the whole round.
   */
  giveUp: () => void;
  /** Advances to the next question (or completes the session). */
  next: () => void;
  /** Restarts the session from the first question. */
  restart: () => void;
}

export function useQuizSession({
  questions,
  onComplete,
  perfectDistanceKm = 25,
  ready = true,
}: QuizSessionOptions): QuizSession {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  /**
   * The place the player named, when they answered by clicking on a name.
   *
   * It is kept beside the guess because the two go together: the guess says
   * where on the map the player clicked, and the name says what they called
   * it.
   */
  const [namedPlace, setNamedPlace] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [distance, setDistance] = useState(0);
  const [questionScore, setQuestionScore] = useState(0);
  const [questionTimeBonus, setQuestionTimeBonus] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [perfectGuessCount, setPerfectGuessCount] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // When the current question started. A ref rather than state, because the
  // clock must keep running even when React is not re-rendering.
  const questionStartedAt = useRef<number>(Date.now());

  // Seconds left in the bonus window, ticked once a second.
  const [timeBonusSecondsLeft, setTimeBonusSecondsLeft] = useState(TIME_BONUS_WINDOW_SECONDS);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  // Restart the clock whenever a new question is shown, and again when the
  // player can first see it. This runs before the countdown effect below, so
  // the first tick already measures the new question and not the previous
  // one.
  useEffect(() => {
    questionStartedAt.current = Date.now();
    setTimeBonusSecondsLeft(TIME_BONUS_WINDOW_SECONDS);
  }, [currentQuestionIndex, ready]);

  // The countdown only matters while the player is still thinking, so it
  // stops as soon as the answer is in.
  useEffect(() => {
    if (showResult || isComplete || !ready) return;

    const tick = () => {
      const elapsed = (Date.now() - questionStartedAt.current) / 1000;
      setTimeBonusSecondsLeft(Math.max(0, Math.ceil(TIME_BONUS_WINDOW_SECONDS - elapsed)));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResult, isComplete, ready]);

  const guess = useCallback(
    (lat: number, lng: number, options?: { named?: string }) => {
      setUserGuess({ lat, lng });
      setNamedPlace(options?.named ?? null);
    },
    [],
  );

  const submit = useCallback(() => {
    if (!userGuess || !currentQuestion || showResult) return false;

    const dist = calculateDistance(
      userGuess.lat,
      userGuess.lng,
      currentQuestion.lat,
      currentQuestion.lng,
    );
    // A guess that named the place is worth the full points. The question
    // asked where the place is, and the player said where it is; the label
    // they clicked may sit a few kilometres from the ground, but they named
    // the right place.
    const distancePoints = namedPlace ? calculateScore(0) : calculateScore(dist);

    // The answer is worth 90% for the location and up to 10% for the speed.
    // Both are shares of the same distance points, so a fast wrong answer can
    // never beat a slow correct one. The stake is what the question is
    // worth: the last questions of a round are worth more.
    const elapsedSeconds = (Date.now() - questionStartedAt.current) / 1000;
    const { score, locationPoints, timePoints } = scoreAnswer(
      distancePoints,
      elapsedSeconds,
      stakeForQuestion(currentQuestionIndex),
    );

    setDistance(dist);
    setQuestionScore(score);
    setQuestionTimeBonus(timePoints);
    // The running total is rounded on every step, so it never drifts into
    // something like 321.000000003.
    setTotalScore((prev) => roundScore(prev + score));
    setTotalDistance((prev) => roundScore(prev + dist));
    if (namedPlace || dist < perfectDistanceKm) setPerfectGuessCount((prev) => prev + 1);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        score,
        distance: dist,
        timeBonus: timePoints,
        locationPoints,
        elapsedSeconds,
        guessLat: userGuess.lat,
        guessLng: userGuess.lng,
        ...(namedPlace ? { namedPlace } : {}),
      },
    ]);
    setShowResult(true);

    return true;
  }, [
    userGuess,
    currentQuestion,
    currentQuestionIndex,
    showResult,
    perfectDistanceKm,
    namedPlace,
  ]);

  const spendOnHint = useCallback((cost: number) => {
    const amount = Number(cost) || 0;
    if (amount <= 0) return;
    setTotalScore((prev) => roundScore(Math.max(0, prev - amount)));
  }, []);

  const giveUp = useCallback(() => {
    if (showResult || isComplete) return;
    if (!currentQuestion) return;
    setDistance(0);
    setQuestionScore(0);
    setQuestionTimeBonus(0);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        score: 0,
        distance: 0,
        timeBonus: 0,
        locationPoints: 0,
        elapsedSeconds: 0,
        gaveUp: true,
      },
    ]);
    setShowResult(true);
  }, [showResult, isComplete, currentQuestion]);

  const next = useCallback(() => {
    if (isLastQuestion) {
      setIsComplete(true);
      onComplete?.({
        totalScore,
        totalDistance,
        // The public contract of `onComplete` is `perfectCount`; the internal
        // state is named `perfectGuessCount`. Map it explicitly, otherwise the
        // consumer receives `undefined` and the counter turns into NaN.
        perfectCount: perfectGuessCount,
        timeBonus: answers.reduce((sum, a) => sum + a.timeBonus, 0),
        answers,
      });
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setUserGuess(null);
    setNamedPlace(null);
    setShowResult(false);
    setDistance(0);
    setQuestionScore(0);
    setQuestionTimeBonus(0);
    // The clock is reset here as well as in the effect, so the very first
    // tick of the new question already measures the new question.
    questionStartedAt.current = Date.now();
    setTimeBonusSecondsLeft(TIME_BONUS_WINDOW_SECONDS);
  }, [isLastQuestion, onComplete, totalScore, totalDistance, perfectGuessCount, answers]);

  /**
   * How well the guesses were placed, as a percentage.
   *
   * The speed part of the score is left out on purpose: accuracy is about
   * knowing where the place is, not about how fast the answer came.
   */
  const accuracy = useMemo(() => computeAccuracy(answers), [answers]);

  const restart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserGuess(null);
    setNamedPlace(null);
    setShowResult(false);
    setDistance(0);
    setQuestionScore(0);
    setQuestionTimeBonus(0);
    setTotalScore(0);
    setTotalDistance(0);
    setPerfectGuessCount(0);
    setAnswers([]);
    setIsComplete(false);
    questionStartedAt.current = Date.now();
    setTimeBonusSecondsLeft(TIME_BONUS_WINDOW_SECONDS);
  }, []);

  return useMemo(
    () => ({
      questions,
      currentQuestionIndex,
      currentQuestion,
      userGuess,
      namedPlace,
      showResult,
      distance,
      questionScore,
      questionTimeBonus,
      totalScore,
      totalDistance,
      perfectGuessCount,
      answers,
      isComplete,
      isLastQuestion,
      timeBonusSecondsLeft,
      accuracy,
      guess,
      submit,
      spendOnHint,
      giveUp,
      next,
      restart,
    }),
    [
      questions,
      currentQuestionIndex,
      currentQuestion,
      userGuess,
      namedPlace,
      showResult,
      distance,
      questionScore,
      questionTimeBonus,
      totalScore,
      totalDistance,
      perfectGuessCount,
      answers,
      isComplete,
      isLastQuestion,
      timeBonusSecondsLeft,
      accuracy,
      guess,
      submit,
      spendOnHint,
      giveUp,
      next,
      restart,
    ],
  );
}
