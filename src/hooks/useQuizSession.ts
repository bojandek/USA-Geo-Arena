/**
 * Shared quiz-session logic used by the daily challenge, practice mode and
 * battle mode.
 *
 * Previously each of the three modes re-implemented the same flow (map click
 * -> distance -> score -> answers -> next -> results), which let the scoring
 * and completion behaviour drift apart. This hook is the single source of
 * truth for that flow.
 */

import { useCallback, useMemo, useState } from 'react';

import { calculateDistance, calculateScore, type Question } from '@/lib/game-data';

export interface QuizAnswer {
  questionId: string;
  question: string;
  score: number;
  distance: number;
}

export interface QuizSessionOptions {
  questions: Question[];
  /** Called once, when the last question has been answered. */
  onComplete?: (result: {
    totalScore: number;
    totalDistance: number;
    perfectCount: number;
    answers: QuizAnswer[];
  }) => void;
  /** A guess counts as "perfect" below this distance (km). */
  perfectDistanceKm?: number;
}

export interface QuizSession {
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | undefined;
  userGuess: { lat: number; lng: number } | null;
  showResult: boolean;
  distance: number;
  questionScore: number;
  totalScore: number;
  totalDistance: number;
  perfectGuessCount: number;
  answers: QuizAnswer[];
  isComplete: boolean;
  isLastQuestion: boolean;
  /** Records a guess made on the map. */
  guess: (lat: number, lng: number) => void;
  /** Scores the current guess. Returns false when there is nothing to score. */
  submit: () => boolean;
  /** Advances to the next question (or completes the session). */
  next: () => void;
  /** Restarts the session from the first question. */
  restart: () => void;
}

export function useQuizSession({
  questions,
  onComplete,
  perfectDistanceKm = 25,
}: QuizSessionOptions): QuizSession {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [distance, setDistance] = useState(0);
  const [questionScore, setQuestionScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [perfectGuessCount, setPerfectGuessCount] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  const guess = useCallback((lat: number, lng: number) => {
    setUserGuess({ lat, lng });
  }, []);

  const submit = useCallback(() => {
    if (!userGuess || !currentQuestion || showResult) return false;

    const dist = calculateDistance(
      userGuess.lat,
      userGuess.lng,
      currentQuestion.lat,
      currentQuestion.lng,
    );
    const score = calculateScore(dist);

    setDistance(dist);
    setQuestionScore(score);
    setTotalScore((prev) => prev + score);
    setTotalDistance((prev) => prev + dist);
    if (dist < perfectDistanceKm) setPerfectGuessCount((prev) => prev + 1);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        score,
        distance: dist,
      },
    ]);
    setShowResult(true);

    return true;
  }, [userGuess, currentQuestion, showResult, perfectDistanceKm]);

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
        answers,
      });
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setUserGuess(null);
    setShowResult(false);
    setDistance(0);
    setQuestionScore(0);
  }, [isLastQuestion, onComplete, totalScore, totalDistance, perfectGuessCount, answers]);

  const restart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserGuess(null);
    setShowResult(false);
    setDistance(0);
    setQuestionScore(0);
    setTotalScore(0);
    setTotalDistance(0);
    setPerfectGuessCount(0);
    setAnswers([]);
    setIsComplete(false);
  }, []);

  return useMemo(
    () => ({
      questions,
      currentQuestionIndex,
      currentQuestion,
      userGuess,
      showResult,
      distance,
      questionScore,
      totalScore,
      totalDistance,
      perfectGuessCount,
      answers,
      isComplete,
      isLastQuestion,
      guess,
      submit,
      next,
      restart,
    }),
    [
      questions,
      currentQuestionIndex,
      currentQuestion,
      userGuess,
      showResult,
      distance,
      questionScore,
      totalScore,
      totalDistance,
      perfectGuessCount,
      answers,
      isComplete,
      isLastQuestion,
      guess,
      submit,
      next,
      restart,
    ],
  );
}
