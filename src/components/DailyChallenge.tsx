import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, {
  Marker,
  MapLayerMouseEvent,
  Layer,
  type MapRef,
} from 'react-map-gl/maplibre';
import type { GeoJSONSource, Map as MapLibreMap, PaddingOptions } from 'maplibre-gl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  MapPin,
  Target,
  Award,
  Share2,
  RotateCcw,
  Calendar,
  Maximize2,
  Minimize2,
  Timer,
  Zap,
  Snowflake,
  Flag,
  ZoomIn,
  Undo2,
  Swords,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useGameStore } from '@/lib/game-store';
import { isPro } from '@/lib/pro';
import { useQuizSession, type QuizAnswer } from '@/hooks/useQuizSession';
import { getDailyQuestionsForDay, generateShareText, buildShareUrl, formatPoints, type Question } from '@/lib/game-data';
import { betterThanPercent, fetchStanding, submitGlobalScore, type BoardAnswer } from '@/lib/global-board';
import {
  DEFAULT_REGION,
  getRegion,
  REGIONS,
  boundsForQuestion,
  frameForOutlyingAnswer,
  outlyingStateForQuestion,
  OUTLYING_LABEL_ZOOM,
  regionPath,
  toBoundsArray,
  type RegionId,
} from '@/lib/regions';
import { formatFullDayLabel, todayKey } from '@/lib/date-utils';
import { DAILY_QUESTION_COUNT, computeStreakWithFreeze, streakMultiplier, totalXp } from '@/lib/game-state';
import { CountUp, MissionsCard, NextChallengeCountdown, XpBar } from '@/components/DailyProgress';
import { roundScore } from '@/lib/numbers';
import { MAX_TIME_POINTS_PER_QUESTION, TIME_BONUS_WINDOW_SECONDS, LOCATION_SHARE, maxRoundScore, stakeForQuestion } from '@/lib/time-bonus';
import MapSelect from '@/components/MapSelect';
import { getMapStyleSource } from '@/lib/map-styles';
import { useMapStyle } from '@/hooks/useMapStyle';
import { useMapOptions } from '@/hooks/useMapOptions';
import { applyAtmosphere } from '@/lib/map-atmosphere';
import { placeNameAtPoint, setPlaceLabelsVisible } from '@/lib/map-places';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';
import { MISSED_DISTANCE_KM, buildReviewQuestions, latestReviewableResult } from '@/lib/review';
import { frameTwoPoints, worldWidthInPixels, CLOSE_UP_ZOOM, MARKER_CLEARANCE, arcCoordinates, revealPoint, toLineFeature, toPointFeature, globeFrame, globeAnswerFrame, clampPadding } from '@/lib/map-framing';
import { describeMissWithArrow } from '@/lib/geo';
import { playSound, getSoundSnapshot, isSoundEnabled, subscribeSound } from '@/lib/sound';
import { vibrate } from '@/lib/haptics';
import { celebrate } from '@/lib/confetti';
import { buildHintTiers, nextHint, secondsUntilFreeHint, FREE_HINT_DELAY_SECONDS } from '@/lib/hints';
import {
  buildChallengeUrl,
  challengeHeadline,
  challengeOutcome,
} from '@/lib/challenge';
import { reportPageUrl, wikipediaUrl } from '@/lib/question-links';
import { questionTeaser } from '@/lib/question-teaser';
import AdSlot from '@/components/AdSlot';
import NewsletterSignup from '@/components/NewsletterSignup';

/** The colour the line from the guess to the real place is drawn in. */
const LINE_COLOUR = '#ef4444';

interface DailyChallengeProps {
  /** Day key (`YYYY-MM-DD`) to replay. Defaults to today. */
  selectedDate?: string | null;
  /** Which region the round is drawn from. Defaults to the whole world. */
  region?: RegionId;
  /**
   * A fixed question set, used by the review mode.
   *
   * When it is given, the round is practice: it never touches the
   * progression, the streak or the leaderboard.
   */
  questions?: Question[];
  /**
   * The score the player has to beat, taken from the link they followed.
   *
   * It is null when nobody has challenged them.
   */
  challengeScore?: number | null;
  onBack?: () => void;
}

export default function DailyChallenge({
  selectedDate,
  region,
  questions,
  challengeScore = null,
  onBack,
}: DailyChallengeProps) {
  const today = todayKey();
  const challengeDate = selectedDate ?? today;
  const isArchiveMode = challengeDate !== today;
  /** A review round plays a fixed set of questions and is never recorded. */
  const isReview = Boolean(questions);
  const navigate = useNavigate();

  const regionId = region ?? DEFAULT_REGION;
  const regionConfig = getRegion(regionId);
  // The map view for this region: how the round opens, how far the player may
  // pan, and how the planet is drawn. The American round is framed on the
  // country and drawn flat; the world round is framed on the globe.
  const mapCenter = regionConfig.view.center;
  const mapZoom = regionConfig.view.zoom;
  const mapBounds = regionConfig.view.bounds;
  // The air around the planet and the names on it are the player's choice,
  // and so is the projection on the world round. The American round stays
  // flat: a globe of one country is mostly empty space.
  const { options: mapOptions } = useMapOptions();
  const regionProjection = regionConfig.view.projection ?? 'mercator';
  const projection =
    regionProjection === 'globe' && mapOptions.projection !== 'region'
      ? mapOptions.projection
      : regionProjection;
  const isGlobe = projection === 'globe';

  const {
    completeDaily,
    isRegionCompleted,
    dailyHistory,
    streak,
    streakFreezes,
    lastPlayedDate,
    achievements,
    totalScore: savedTotalScore,
    bonusXp,
  } = useGameStore();

  // The XP and the badges the player had before the round, so the end of the
  // round can show what the round itself earned. Kept in a ref so the
  // completion handler always reads the latest values.
  const progressRef = useRef({ xp: 0, achievementIds: [] as string[] });
  progressRef.current = {
    xp: totalXp({ totalScore: savedTotalScore, bonusXp }),
    achievementIds: achievements.map((achievement) => achievement.id),
  };
  const [roundStart, setRoundStart] = useState<{ xp: number; achievementIds: string[] } | null>(null);
  // The share of today's players the round beat, once the board has answered.
  const [betterThan, setBetterThan] = useState<number | null>(null);

  // The question set is derived from the day and the region, so it never
  // changes mid-session. A review round brings its own set.
  //
  // The day key is the whole input. Reading it back out of a `Date` moved
  // the round a day into the past in every timezone behind UTC, so a player
  // in Los Angeles was playing yesterday's questions while the board and the
  // streak said today.
  const dailyQuestions: Question[] = useMemo(
    () => questions ?? getDailyQuestionsForDay(challengeDate, regionId),
    [questions, challengeDate, regionId],
  );

  const { mapStyleId } = useMapStyle();

  // Whether the game is allowed to make a noise. A visitor who has turned the
  // sound off has asked for quiet, and the game stays quiet.
  const soundOn = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    getSoundSnapshot,
  );
  const mapRef = useRef<MapRef>(null);

  // The question panel floats above the map. It can be collapsed so the map
  // gets the whole screen while the player explores.
  const [panelOpen, setPanelOpen] = useState(true);

  // The height of the question card.
  //
  // It is measured rather than guessed, because the card is taller once the
  // answer is on the screen: the distance, the facts and the buttons all
  // appear. The map is framed around the free area under it, so that a
  // marker is never hidden behind the card.
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    const measure = () => {
      // The height is rounded, and the state is only changed when it really
      // changed. A card that is growing would otherwise re-render the whole
      // screen on every frame of its growth.
      const height = Math.round(node.getBoundingClientRect().height);
      setPanelHeight((previous) => (previous === height ? previous : height));
    };
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [panelOpen]);

  // The camera the map has to move to once the answer is shown.
  const [camera, setCamera] = useState<{ center: [number, number]; zoom: number; padding: PaddingOptions } | null>(null);
  // Counts how many times the map has loaded. The map is remounted when the
  // region changes, and anything drawn on it has to be drawn again.
  const [mapEpoch, setMapEpoch] = useState(0);
  // True while the map is down at street level on the real place, rather than
  // framed on both markers.
  const [closeUp, setCloseUp] = useState(false);

  // The answers are kept in a ref, because the completion handler is built
  // before the session that produces them.
  const answersRef = useRef<QuizAnswer[]>([]);

  // The points spent on hints during the round. The server takes them off the
  // score as well, so the number on the board and the number in the game are
  // the same number.
  const hintSpendRef = useRef<number>(0);

  // The streak multiplier is worked out from the streak the player was on when
  // the round started, so the bonus is never a surprise - the game shows the
  // multiplier while the player is answering. A review round and an archived
  // day are practice, so neither earns one.
  const multiplier = useMemo(
    () => (isArchiveMode || isReview ? 1 : streakMultiplier(streak)),
    [isArchiveMode, isReview, streak],
  );

  // A question is worth 100 points, except in the last three of the round,
  // where the stake rises. A full round of ten is worth 1,300.
  const maxScore = maxRoundScore(dailyQuestions.length);

  const handleComplete = useCallback(({
    totalScore,
    totalDistance,
    perfectCount,
    timeBonus,
  }: {
    totalScore: number;
    totalDistance: number;
    perfectCount: number;
    timeBonus: number;
  }) => {
    // The bonus is added on top of the round rather than folded into each
    // answer, so the player can see where the extra points came from.
    const bonus = roundScore(Math.max(0, totalScore * (multiplier - 1)));
    const finalScore = roundScore(totalScore + bonus);

    // The streak outcome is worked out before the round is written, so the
    // player can be told straight away when a freeze saved the streak.
    const outcome = isArchiveMode || isReview
      ? null
      : computeStreakWithFreeze(streak, lastPlayedDate, challengeDate, streakFreezes);

    // A review round is practice, so it is never written to the history and
    // never touches the progression.
    if (!isReview) {
      setRoundStart(progressRef.current);
      completeDaily({
        date: challengeDate,
        region: regionId,
        score: finalScore,
        baseScore: totalScore,
        streakMultiplier: multiplier,
        totalDistance,
        perfectCount,
        timeBonus,
        maxScore,
        answers: answersRef.current,
      });
    }

    trackEvent(ANALYTICS_EVENTS.roundComplete, {
      region: regionId,
      score: finalScore,
      base_score: totalScore,
      distance_km: Math.round(totalDistance),
      perfect: perfectCount,
      speed_bonus: timeBonus,
      streak_multiplier: multiplier,
      questions: dailyQuestions.length,
      review: isReview,
    });

    // The round goes on the global board, so the player can be compared with
    // everybody else who played the same round. The guesses go up, not the
    // score: the server works the round out again from them, so the number
    // on the board is one the rules produce rather than one the browser
    // claimed.
    if (!isReview && !isArchiveMode) {
      const answers: BoardAnswer[] = answersRef.current.map((answer) => ({
        id: answer.questionId,
        lat: typeof answer.guessLat === 'number' ? answer.guessLat : null,
        lng: typeof answer.guessLng === 'number' ? answer.guessLng : null,
        elapsedSeconds: answer.elapsedSeconds,
        gaveUp: answer.gaveUp === true,
        named: Boolean(answer.namedPlace),
      }));

      void submitGlobalScore({
        day: challengeDate,
        region: regionId === 'world' ? 'world' : 'usa',
        answers,
        streak,
        hintCost: hintSpendRef.current,
      }).then((result) => {
        // A board that is not set up on this deployment is not worth a
        // message. A board that refused the score is: the player has to know
        // that their round did not count.
        if (!result.ok && result.configured) {
          toast.error(
            result.error ?? 'Your score did not reach the global board.',
            { position: 'top-center' },
          );
          return;
        }
        if (!result.ok) return;
        void fetchStanding(challengeDate, regionId === 'world' ? 'world' : 'usa', finalScore).then(
          (standing) => setBetterThan(betterThanPercent(standing)),
        );
      });
    }

    toast.success(
      isReview
        ? 'Review finished! 🎯'
        : isArchiveMode
          ? 'Archive day updated! 🗺️'
          : 'Daily challenge completed! 🏆',
      { position: 'top-center' },
    );

    if (bonus > 0) {
      toast.success(`Streak bonus: +${formatPoints(bonus)} points 🔥 ${multiplier}×`, {
        position: 'top-center',
      });
    }

    // The round is over. A round where every answer was inside 25 km earns
    // more confetti than an ordinary one.
    playSound('complete');
    vibrate('celebrate', soundOn);
    const perfect = perfectCount >= dailyQuestions.length;
    celebrate({ pieces: perfect ? 170 : 90 });

    if (outcome?.freezeUsed) {
      toast.success(
        `Your streak freeze saved your ${outcome.streak}-day streak! ❄️`,
        { position: 'top-center' },
      );
    } else if (outcome?.freezeEarned) {
      toast.success('Streak freeze earned - it covers a day you miss! ❄️', {
        position: 'top-center',
      });
    }
  }, [
    completeDaily,
    challengeDate,
    regionId,
    isArchiveMode,
    isReview,
    streak,
    lastPlayedDate,
    streakFreezes,
    multiplier,
    dailyQuestions.length,
    maxScore,
    soundOn,
  ]);

  const session = useQuizSession({ questions: dailyQuestions, onComplete: handleComplete });
  const {
    currentQuestion,
    currentQuestionIndex,
    userGuess,
    showResult,
    distance,
    questionScore,
    questionTimeBonus,
    totalScore,
    answers,
    isComplete,
    isLastQuestion,
    timeBonusSecondsLeft,
    spendOnHint,
  } = session;

  // The card stays open when the answer is on the screen.
  //
  // The card is at its tallest exactly when the player wants to look at the
  // map: the distance, the facts and the buttons all arrive at once. It used
  // to fold itself into a thin strip at that moment, which took the answer
  // away from the player at the exact moment they wanted to read it.
  //
  // The card is capped instead, so it can never swallow the screen, and the
  // whole panel can still be put away with the button beside it - that is
  // what is there for when the player wants the map and nothing else.
  
  // A question is worth 100 points, except in the last three of the round,
  // where the stake rises. A full round of ten is worth 1,300.
  const stake = stakeForQuestion(currentQuestionIndex);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  // The streak bonus is added on top of the round, as its own line, so the
  // player can see where the extra points came from.
  const streakBonus = roundScore(Math.max(0, totalScore * (multiplier - 1)));
  const finalScore = roundScore(totalScore + streakBonus);
  // Accuracy is how close the guesses were, so it is measured on the location
  // points alone. The speed share and the streak bonus say nothing about it.
  const locationPoints = answers.reduce((sum, a) => sum + a.locationPoints, 0);
  const accuracy =
    maxScore > 0
      ? Math.round((locationPoints / (maxScore * LOCATION_SHARE)) * 100)
      : 0;

  // How the round went against the score the player was challenged to beat.
  const outcome = useMemo(
    () => (challengeScore === null ? null : challengeOutcome(challengeScore, finalScore)),
    [challengeScore, finalScore],
  );

  /**
   * Sends a challenge to somebody else.
   *
   * The score to beat travels inside the link, so there is no account, no
   * server and nothing to set up. The person who opens it plays the same ten
   * questions and finds out where they stood.
   */
  const handleChallengeFriend = async () => {
    const url = buildChallengeUrl(finalScore, regionId);
    const text = `I scored ${formatPoints(finalScore)} points on today's ${regionConfig.label} Challenge. Can you beat me? 🏆`;

    trackEvent(ANALYTICS_EVENTS.challengeFriend, {
      region: regionId,
      score: finalScore,
    });

    if (navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // The share sheet was dismissed, so the link is copied instead.
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success('Challenge link copied - send it to a friend!');
    } catch {
      toast.error('Could not copy the challenge link');
    }
  };
  const averageDistance = answers.length
    ? Math.round(answers.reduce((sum, a) => sum + a.distance, 0) / answers.length)
    : 0;

  // The total speed bonus earned across the whole round.
  const totalTimeBonus = answers.reduce((sum, a) => sum + a.timeBonus, 0);

  // How many questions the player got wrong, which is what the review mode
  // would offer them.
  const missedCount = answers.filter((a) => a.distance > MISSED_DISTANCE_KM).length;

  // The questions from the last finished round that are worth trying again.
  const reviewable = useMemo(
    () => buildReviewQuestions(latestReviewableResult(dailyHistory)?.answers),
    [dailyHistory],
  );

  // The last answer is appended the moment a guess is scored, so it carries
  // the exact numbers the player earned.
  const lastAnswer = answers[answers.length - 1];

  // The completion handler needs the answers, but it is built before the
  // session that produces them - so the answers are mirrored into a ref.
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Measurement: one event when the round opens, one per answer.
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.roundStart, {
      region: regionId,
      questions: dailyQuestions.length,
      archive: isArchiveMode,
    });
  }, [regionId, dailyQuestions.length, isArchiveMode]);

  useEffect(() => {
    if (!showResult || !lastAnswer) return;
    trackEvent(ANALYTICS_EVENTS.guessSubmitted, {
      region: regionId,
      distance_km: Math.round(lastAnswer.distance),
      points: lastAnswer.score,
      seconds: Math.round(lastAnswer.elapsedSeconds),
      perfect: lastAnswer.distance < 25,
    });
  }, [showResult, lastAnswer, regionId]);

  // The line from the guess to the real place.
  //
  // It is a curve rather than a straight line. A straight line reads as a
  // measurement; a curve reads as a journey, and it keeps clear of the two
  // markers instead of running through them.
  //
  // The curve is worked out in the normalised Mercator square, where the whole
  // world is one unit across. That means its shape comes from where the two
  // places are and not from how far the map happens to be zoomed in, so the
  // line does not twitch while the camera is moving.
  const fullLine = useMemo(() => {
    if (!showResult || !userGuess || !currentQuestion) return null;
    return arcCoordinates(
      [userGuess.lng, userGuess.lat],
      [currentQuestion.lng, currentQuestion.lat],
    );
  }, [showResult, userGuess, currentQuestion]);

  // The line is drawn on the map directly, rather than through the Source
  // component. The whole curve is added once; only the small dot at its tip
  // moves afterwards.
  const lineHeadRef = useRef<GeoJSONSource | null>(null);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const remove = (sourceId: string, layerId: string) => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };

    if (!fullLine) {
      remove('line', 'line-layer');
      remove('line-head', 'line-head-layer');
      lineHeadRef.current = null;
      return;
    }

    // The whole curve is put on the map once. Redrawing its geometry on every
    // animation frame made the map re-tessellate and upload it to the GPU,
    // which is what made the screen stutter.
    const line = toLineFeature(fullLine);
    const start = revealPoint(fullLine, 0);

    const existing = map.getSource('line') as GeoJSONSource | undefined;
    if (existing) {
      existing.setData(line);
    } else {
      map.addSource('line', { type: 'geojson', data: line });
      map.addLayer({
        id: 'line-layer',
        type: 'line',
        source: 'line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': LINE_COLOUR,
          'line-width': 3,
          'line-dasharray': [1.6, 1.6],
          'line-opacity': 0.9,
        },
      });
    }

    // A small dot rides along the finished line. Updating one point per frame
    // is cheap; updating the whole curve sixty times a second is not.
    const headExisting = map.getSource('line-head') as GeoJSONSource | undefined;
    if (headExisting) {
      headExisting.setData(toPointFeature(start));
      lineHeadRef.current = headExisting;
    } else {
      map.addSource('line-head', {
        type: 'geojson',
        data: toPointFeature(start),
      });
      map.addLayer({
        id: 'line-head-layer',
        type: 'circle',
        source: 'line-head',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ef4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      lineHeadRef.current = map.getSource('line-head') as GeoJSONSource;
    }
  }, [fullLine, mapEpoch]);

  // The small dot glides from the guess to the real place.
  //
  // The curve itself is already complete, so no geometry is rebuilt here.
  // Only one point is updated per frame, which keeps the map smooth even on
  // phones and while the camera is moving.
  useEffect(() => {
    if (!showResult || !fullLine) return;
    const head = lineHeadRef.current;
    if (!head) return;

    let frame = 0;
    const started = performance.now();
    const duration = 750;

    const draw = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);

      head.setData(toPointFeature(revealPoint(fullLine, progress)));

      if (progress < 1) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [showResult, fullLine, mapEpoch]);
  // Which way the answer lay. A distance says the player was wrong; a
  // direction says what to do differently next time.
  const missDirection = useMemo(() => {
    if (!showResult || !userGuess || !currentQuestion) return null;
    return describeMissWithArrow(userGuess, currentQuestion, distance);
  }, [showResult, userGuess, currentQuestion, distance]);

  // The sound and the buzz when the answer is revealed. A guess inside 25 km
  // is a hit and sounds like one; everything else sounds like a miss.
  //
  // The preference is read at the moment the answer arrives rather than being
  // an effect dependency. Otherwise switching the sound back on would replay
  // the previous answer's sound as if it had just been answered again.
  useEffect(() => {
    if (!showResult || !lastAnswer) return;
    const hit = lastAnswer.distance < 25;
    playSound(hit ? 'correct' : 'wrong');
    vibrate(hit ? 'correct' : 'wrong', isSoundEnabled());
  }, [showResult, lastAnswer]);

  // How many hints the player has taken on this question, and how long they
  // have been on it. The free hint has to be waited for.
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const isProUser = isPro();

  useEffect(() => {
    setHintsRevealed(0);
    setQuestionElapsed(0);
    const started = Date.now();
    const timer = window.setInterval(() => {
      setQuestionElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentQuestionIndex]);

  const hintTiers = useMemo(
    () => (currentQuestion ? buildHintTiers(currentQuestion) : []),
    [currentQuestion],
  );
  const revealedHints = hintTiers.slice(0, hintsRevealed);
  const availableHint = nextHint(hintTiers, hintsRevealed);
  const freeHintReady = isProUser || questionElapsed >= FREE_HINT_DELAY_SECONDS;

  // Somewhere to read more about the place, and somewhere to say that the
  // question is wrong.
  const wikiLink = useMemo(
    () => (currentQuestion ? wikipediaUrl(currentQuestion) : null),
    [currentQuestion],
  );
  const teaser = useMemo(
    () => (currentQuestion ? questionTeaser(currentQuestion) : ''),
    [currentQuestion],
  );

  const handleTakeHint = useCallback(() => {
    const tier = nextHint(hintTiers, hintsRevealed);
    if (!tier) return;
    // The free hint is free, but it is not free to take straight away.
    // Pro users get hints instantly and do not spend points on them.
    if (tier.cost === 0 && !freeHintReady) return;
    if (tier.cost > 0 && !isProUser) {
      spendOnHint(tier.cost);
      // The board is told about it too, so the score there is the score here.
      hintSpendRef.current += tier.cost;
      toast.info(`Hint bought: −${tier.cost} points`, { position: 'top-center' });
    }
    setHintsRevealed((prev) => prev + 1);
  }, [hintTiers, hintsRevealed, freeHintReady, isProUser, spendOnHint]);

  /**
   * The name of the place under the cursor, when it is the answer.
   *
   * The map draws the names of towns and cities, and a player who knows
   * where they are can answer by clicking on the name rather than by
   * dropping a pin on the right pixel. That matters most in Alaska and in
   * Hawaii, where the pin has to land in the right few hundred metres and
   * the name of the town is right there on the screen.
   *
   * Only a name that is the answer counts. A name that is a long way from
   * the answer - the label of a whole state, say - is not.
   */
  const placeNameAtPointEvent = useCallback(
    (event: MapLayerMouseEvent): string | null => {
      const map = mapRef.current?.getMap();
      if (!map) return null;
      return placeNameAtPoint(map, event.point, currentQuestionRef.current);
    },
    [],
  );

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (showResult || isComplete) return;

    // A player who named the place has answered the question, even when the
    // name on the map is a few kilometres from the ground itself.
    const named = placeNameAtPointEvent(event);
    if (named) {
      session.guess(event.lngLat.lat, event.lngLat.lng, { named });
      toast.success(`🏙️ ${named} — that's the one!`, { position: 'top-center' });
      playSound('click');
      vibrate('tap', soundOn);
      return;
    }

    session.guess(event.lngLat.lat, event.lngLat.lng);
    playSound('click');
    vibrate('tap', soundOn);
  };

  // In development the map instance is exposed on the window, so the framing
  // and the region bounds can be inspected from the console. The whole block
  // is dropped from production builds.
  //
  // The instance is published again whenever a new map has loaded. The map is
  // remounted when the region changes, and a reader that only ever got the
  // first one would be looking at the American map while the world round was
  // on the screen - which is exactly the sort of thing that gets a working
  // round reported as a broken one.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const publish = () => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      (window as unknown as { __geoarenaMap?: unknown }).__geoarenaMap = map;
    };
    publish();
    const timer = window.setTimeout(publish, 1200);
    return () => window.clearTimeout(timer);
  }, [mapEpoch]);

  // The map has to show BOTH markers after the answer: the one the player
  // placed and the real one. The camera is worked out from the projection of
  // the map itself, because the distance between the two can be anything from
  // a few metres to most of the way round the planet.
  const frameBothMarkers = useCallback(() => {
    if (!mapRef.current || !userGuess || !currentQuestion) return;
    const map = mapRef.current.getMap();
    // The pan limit is lifted for the answer. It is a promise that the middle
    // of the screen stays over the country, and on a tall phone screen it also
    // stops the map zooming out far enough for both pins to fit - the limit
    // has to cover the screen at every zoom it allows. Nothing is being
    // guessed any more, so the map may as well be free to move; the limit goes
    // back on with the next question.
    map.setMaxBounds(null);
    const container = map.getContainer();
    const zoom = map.getZoom();

    // The padding keeps the markers clear of the question card at the top
    // and of the answer button at the bottom.
    //
    // The card is measured rather than guessed, because it grows when the
    // answer is shown: the distance, the facts and the buttons all appear.
    // A guessed height would let the card cover a marker.
    //
    // What is measured is where the card *ends*, not how tall it is. On a
    // phone the card starts below the row of chips, so a pin placed just under
    // the card's height lands under the card itself.
    //
    // The room a marker needs around itself is added on top, because the
    // camera is worked out from where the two points are, and a point is
    // narrower than the pin that stands on it.
    const narrow = window.innerWidth < 640;
    let covered = 0;
    if (panelOpen) {
      const card = panelRef.current;
      const cardBottom = card
        ? card.getBoundingClientRect().bottom - container.getBoundingClientRect().top
        : 0;
      covered = Math.max(panelHeight, cardBottom, 0);
    }
    // The padding is kept inside the screen. A card that is taller than the
    // window would otherwise ask for a free area that does not exist, and the
    // camera would be framed for nothing.
    const padding = clampPadding(
      {
        top: covered + 20 + MARKER_CLEARANCE.top,
        bottom: (narrow ? 120 : 140) + MARKER_CLEARANCE.bottom,
        // A globe is round, so it only needs a little room at the sides: the
        // card is above it, not beside it. Narrow sides let the sphere use
        // the width of the screen instead of shrinking into the middle of it.
        left: (isGlobe ? 24 : narrow ? 50 : 100) + MARKER_CLEARANCE.left,
        right: (isGlobe ? 24 : narrow ? 50 : 100) + MARKER_CLEARANCE.right,
      },
      container.clientWidth,
      container.clientHeight,
    );

    // On the globe the camera is worked out on the sphere. The old code
    // turned the globe into a flat map here, which is exactly what must not
    // happen while the globe is on.
    if (isGlobe) {
      const frame = globeAnswerFrame({
        guess: userGuess,
        answer: currentQuestion,
        width: container.clientWidth,
        height: container.clientHeight,
        padding,
      });
      setCamera({ center: frame.center, zoom: frame.zoom, padding });
      return;
    }

    // The camera has to look at the middle of the free area - the part of the
    // map the card and the answer button leave alone - and not at the middle
    // of the screen. The padding is how the map is told where the free area
    // is: the point the camera looks at is put in the middle of the padded
    // area. Without it the markers are framed for the whole screen, the one
    // at the top ends up behind the card, and the map does not look full.
    //
    // It is applied only while the target is measured, then restored in the
    // same task. The real change travels through easeTo, which interpolates
    // padding instead of jumping every tile on the screen at once.
    const previousPadding = map.getPadding();
    map.setPadding(padding);

    const a = map.project([userGuess.lng, userGuess.lat]);
    const b = map.project([currentQuestion.lng, currentQuestion.lat]);
    const worldWidth = worldWidthInPixels(
      a,
      b,
      currentQuestion.lng - userGuess.lng,
      512 * Math.pow(2, zoom),
    );

    const framing = frameTwoPoints({
      a,
      b,
      worldWidth,
      zoom,
      width: container.clientWidth,
      height: container.clientHeight,
      padding,
      // The map already has this padding while the points are measured, so
      // the camera target must not be moved into the free area a second time.
      accountForPadding: false,
      // The zoom is allowed in far enough for the difference between the two
      // pins to be seen. At street level - which is where the zoom used to
      // stop - a guess a hundred metres out puts the two pins a few pixels
      // apart, and the player cannot tell how close they were. A guess that
      // was right on the money needs no close-up: the pins are on the same
      // spot, and there is no difference to look at.
      maxZoom: distance < 0.05 ? 14 : 17,
    });

    const middle = map.unproject([framing.midpoint.x, framing.midpoint.y]);
    map.setPadding(previousPadding);
    setCamera({ center: [middle.lng, middle.lat], zoom: framing.zoom, padding });
  }, [userGuess, currentQuestion, panelHeight, panelOpen, isGlobe, distance]);

  // "Look closer" drops the map down to street level on the real place.
  //
  // This is the picture of the venue that is always right: the map itself.
  // A photograph of a stadium cannot promise the same thing, and a photograph
  // of the wrong stadium is worse than no photograph at all.
  const handleLookCloser = useCallback(() => {
    if (!mapRef.current || !currentQuestion) return;
    const map = mapRef.current.getMap();
    // Eased, not flown: a flight zooms out to show the route and then zooms
    // back in, and on a map that is already close in that reads as a jump.
    map.easeTo({
      center: [currentQuestion.lng, currentQuestion.lat],
      zoom: CLOSE_UP_ZOOM,
      duration: 1200,
    });
    setCloseUp(true);
  }, [currentQuestion]);

  // Going back re-frames both markers. The framing does not depend on the
  // zoom the map happens to be at, so this works from the close-up view.
  const handleShowComparison = useCallback(() => {
    setCloseUp(false);
    frameBothMarkers();
  }, [frameBothMarkers]);

  const handleSubmitGuess = () => {
    const submitted = session.submit();
    if (!submitted) return;
    // The map is not moved here. The answer makes the card taller, and the
    // framing has to know how tall the card is before it can work out where
    // the two markers belong. Moving the map now would move it twice - once
    // to a place the taller card no longer leaves free, and once to the right
    // one - and the map reads as jumping back.
  };

  // The map is framed once the answer is on the screen and the card has
  // stopped growing.
  //
  // The card grows when the answer arrives - the distance, the facts and the
  // buttons all appear - and the framing has to know how tall it is, or a
  // marker ends up behind it. Every change of the card's height starts the
  // wait again, so the map is moved once, to the right place, instead of
  // three times to three nearly the same places.
  useEffect(() => {
    if (!showResult) return;
    const timer = window.setTimeout(() => frameBothMarkers(), 180);
    return () => window.clearTimeout(timer);
  }, [panelHeight, showResult, frameBothMarkers]);
  // The camera is moved once the result is on the screen. Doing it in the
  // click handler does not work: the map puts its view back where it was as
  // soon as the result is drawn, so the move has to happen after that.
  useEffect(() => {
    if (!camera || !mapRef.current) return;
    const map = mapRef.current.getMap();
    const target = camera;

    // The map eases to the place rather than flying to it. A flight zooms out
    // to show the whole route and then zooms in again, and on a map that is
    // already showing a whole country that reads as a flicker every single
    // time an answer is given.
    //
    // Anything still moving is stopped first, so that two movements cannot
    // fight over the camera and pull it about.
    map.stop();

    // The move takes as long as it needs to. Going from a whole country to a
    // single venue is a long way, and doing it in the same time as a small
    // move makes the map look as if it is being snatched away.
    const zoomChange = Math.abs(target.zoom - map.getZoom());
    const duration = Math.round(
      Math.max(650, Math.min(1400, 650 + zoomChange * 80)),
    );
    map.easeTo({
      center: target.center,
      zoom: target.zoom,
      padding: target.padding,
      duration,
    });

    // A render in the middle of the movement can cancel it, which would
    // leave the map showing the old view. The place is checked once the
    // movement has had time to finish, and put right if it did not stick.
    //
    // The map is only put right when it is nearly there. A player who has
    // panned the map while it was moving has meant to go somewhere else, and
    // the map must not drag them back to where it wanted them to be.
    const timer = window.setTimeout(() => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const nearlyThere =
        Math.abs(zoom - target.zoom) < 0.4 &&
        Math.abs(center.lng - target.center[0]) < 0.4 &&
        Math.abs(center.lat - target.center[1]) < 0.4;
      const exactlyThere =
        Math.abs(zoom - target.zoom) < 0.01 &&
        Math.abs(center.lng - target.center[0]) < 0.001 &&
        Math.abs(center.lat - target.center[1]) < 0.001;
      if (nearlyThere && !exactlyThere) {
        map.jumpTo({
          center: target.center,
          zoom: target.zoom,
          padding: target.padding,
        });
      }
    }, duration + 250);

    return () => window.clearTimeout(timer);
  }, [camera]);

  // The map is framed on the region when the round starts, and again whenever
  // the player moves on. Fitting the area rather than sitting at a fixed zoom
  // is what makes the whole country visible on a phone and on a desktop.
  const resetView = useCallback(
    (duration: number) => {
      if (!mapRef.current) return;
      const map = mapRef.current.getMap();
      // The card at the top and the button at the bottom are the reason the
      // map is framed on an area rather than on the whole window.
      const padding = { top: 130, bottom: 130, left: 70, right: 70 };
      // The globe is round, so it only needs a little room at the sides to
      // stay clear of the edge of the screen - the card is above it, not
      // beside it. Narrow side padding is what lets the sphere use the width
      // of a phone instead of shrinking into the middle of it.
      const globePadding = { top: 130, bottom: 130, left: 24, right: 24 };

      // The globe is framed by its own diameter rather than by a box. A sphere
      // fitted with bounds comes out a different size on every screen - it
      // filled a phone screen and would not fit a short window - while the
      // sphere's width in pixels depends only on the zoom. The padding puts
      // the middle of the globe in the middle of the free area, under the card.
      if (isGlobe) {
        // The answer view keeps the sphere now, but it is set again here so
        // that a style reload or an older state can never leave the world
        // round on a flat map.
        map.setProjection({ type: projection });
        map.setPadding(globePadding);
        const container = map.getContainer();
        const { zoom: fittedZoom } = globeFrame(
          container.clientWidth - globePadding.left - globePadding.right,
          container.clientHeight - globePadding.top - globePadding.bottom,
        );
        const zoom = fittedZoom + (regionConfig.view.globeZoomBoost ?? 0);
        const center: [number, number] = [mapCenter[0], mapCenter[1]];
        if (duration > 0) map.easeTo({ center, zoom, duration });
        else map.jumpTo({ center, zoom });
        return;
      }

      // Back on a flat map, any padding left over from a globe round would
      // shift the country off centre.
      map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
      const fit = regionConfig.view.fit;
      if (fit) {
        map.fitBounds(fit, { padding, duration });
      } else {
        // Eased, not flown: a flight zooms out to show the route, and the map
        // is already showing the whole country. The detour reads as a jump.
        map.easeTo({ center: mapCenter, zoom: mapZoom, duration });
      }
    },
    [regionConfig, mapCenter, mapZoom, isGlobe, projection],
  );

  // The map follows the question.
  //
  // For a question on the mainland this is the country. For a question in
  // Alaska or Hawaii it is that part of the country instead, because nobody
  // thinks to pan that far off the edge of the screen. The map is not moved
  // when the player is answering, only when the question changes, so a player
  // who has found the spot is not dragged away from it.
  // The map is created after the question is known, so the question is kept
  // in a place the map load handler can reach.
  const currentQuestionRef = useRef(currentQuestion);
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  const outlyingState = useMemo(
    () => (currentQuestion ? outlyingStateForQuestion(currentQuestion) : null),
    [currentQuestion],
  );

  /**
   * Puts the map where the question is.
   *
   * The limits move with the question, so that the middle of the screen can
   * reach Alaska and Hawaii. They are set before the map is framed, because
   * a limit that the centre is outside of would pull the map straight back.
   */
  const applyFraming = useCallback(
    (map: MapLibreMap, question: Question, duration: number) => {
      // A globe cannot be held inside a box. The limits are worked out on
      // the flat map, and a player who has asked for a globe has to be free
      // to spin it.
      map.setMaxBounds(
        isGlobe ? null : boundsForQuestion(question, regionId),
      );

      // The globe is the whole planet. There is nothing to frame per question,
      // and moving the camera on every question would undo the spin the player
      // has just given it, so the round keeps one frame from start to finish.
      if (isGlobe) {
        resetView(duration);
        return;
      }

      // The answer framing leaves a padding on the map, so that the two
      // markers sit in the free area under the card. This frame has a padding
      // of its own, and the old one would be folded in on top of it and push
      // the country off the centre of the screen.
      map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });

      const outlying = frameForOutlyingAnswer(question.lat, question.lng);
      const fit = outlying ?? regionConfig.view.fit;
      if (!fit) return;

      const padding = { top: 130, bottom: 130, left: 70, right: 70 };

      // A frame over Alaska is wide, and a wide frame comes out much further
      // out than the zoom at which the names of the towns are written. The
      // camera is worked out first so that it can be pulled in far enough
      // for the name to be on the screen - the map travels there on its own,
      // so it has to arrive somewhere the player can read.
      const camera = map.cameraForBounds(fit, { padding });
      if (!camera) {
        map.fitBounds(fit, { padding, duration });
        return;
      }
      // The camera may come back without a zoom, and a frame with no zoom
      // is no frame at all, so the map is asked to fit the box directly.
      const zoom = camera.zoom ?? map.getZoom();
      const fitted = outlying
        ? Math.max(zoom, OUTLYING_LABEL_ZOOM)
        : zoom;
      map.easeTo({ center: camera.center, zoom: fitted }, { duration });
    },
    [regionConfig, regionId, isGlobe, resetView],
  );

  /**
   * Runs when the map has loaded.
   *
   * The map does not exist before this, which is why the framing has to
   * wait for it: a question in Alaska cannot be framed on a map that is not
   * there yet.
   */
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    // The map is a new object after the region changes, so anything that was
    // put on the old one is gone. The counter tells the line to put itself
    // back on the new map.
    setMapEpoch((epoch) => epoch + 1);
    const question = currentQuestionRef.current;
    if (question) applyFraming(map, question, 0);
    else resetView(0);
  }, [applyFraming, resetView]);

  // The air around the map and the names written on it.
  //
  // Both are the player's choice, and both have to be put on the map again
  // every time the style is loaded: a new style comes with its own layers,
  // and the ones that draw the place names go with the old style.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const apply = () => {
      applyAtmosphere(map, mapOptions.atmosphere);
      setPlaceLabelsVisible(map, mapOptions.labels);
    };

    apply();
    map.on('style.load', apply);
    return () => {
      map.off('style.load', apply);
    };
  }, [mapOptions.atmosphere, mapOptions.labels, mapEpoch]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !currentQuestion) return;
    // The globe keeps one frame for the whole round; it is re-framed when the
    // player moves on instead. See the framing effect below.
    if (isGlobe) return;
    applyFraming(map, currentQuestion, 900);
  }, [currentQuestion, applyFraming, isGlobe]);

  // The framing is applied once the map has loaded, and again whenever the
  // region changes.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    // The listener is named so that it can be taken off again by name.
    // Removing every "load" listener instead would take the map's own with it.
    const onLoad = () => {
      const question = currentQuestionRef.current;
      if (question) applyFraming(map, question, 0);
      else resetView(0);
    };
    resetView(0);
    map.once('load', onLoad);
    return () => {
      map.off('load', onLoad);
    };
  }, [regionId, resetView, applyFraming]);

  const handleNextQuestion = () => {
    session.next();
    setCamera(null);
    setCloseUp(false);
    // The map is moved to the new question by the effect that follows the
    // question, so that it can go to Alaska or Hawaii when it has to. The
    // globe is not moved that way - it is the whole planet whatever the
    // question - so it goes back to the framed world here.
    if (isGlobe) resetView(900);
  };

  const handleShare = async () => {
    const shareText = generateShareText(
      finalScore,
      maxScore,
      totalTimeBonus,
      regionId,
      multiplier,
    );

    trackEvent(ANALYTICS_EVENTS.share, {
      region: regionId,
      score: finalScore,
      streak_multiplier: multiplier,
    });

    // The link points at the share route, which draws a card for this score
    // and then sends the visitor on to the game. Social networks read the
    // picture from that address, so the preview shows the actual result.
    const shareUrl = buildShareUrl({
      score: finalScore,
      maxScore: maxScore * multiplier,
      streak: streak,
      region: regionId,
    });

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl });
      } catch {
        // The user dismissed the share sheet - nothing to report.
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success('Results copied to clipboard!');
      } catch {
        toast.error('Could not copy to clipboard');
      }
    }
  };

  const handleRestart = () => {
    session.restart();
    setCamera(null);
    setRoundStart(null);
    setBetterThan(null);
    // Back to the region's own opening view - the whole country for the
    // American round, the whole planet for the world round.
    resetView(800);
  };

  // "Already played today" screen - shown only for today, and it always
  // offers a way forward (replay) so the player is never stuck.
  if (!isReview && isRegionCompleted(regionId) && !isComplete && !isArchiveMode) {
    const todayResult = dailyHistory.find(
      (entry) => entry.date === today && (entry.region ?? DEFAULT_REGION) === regionId,
    );
    return (
      <div className="h-full overflow-y-auto flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="text-8xl mb-8">🏆</div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800 font-[Caveat]">
            You&apos;ve already played today!
          </h2>
          <p className="text-gray-600 mb-8">
            {todayResult
              ? `Your ${regionConfig.label} score today was ${formatPoints(todayResult.score)} points (${todayResult.accuracy}%).`
              : `You have already completed today\u{2019}s ${regionConfig.label.toLowerCase()} challenge.`}
          </p>
          {/* The streak and the freezes in hand - this is the moment the
              player decides whether to come back tomorrow. */}
          {(streak > 0 || streakFreezes > 0) && (
            <p className="text-gray-600 mb-8 -mt-4 text-sm">
              <span className="font-semibold text-gray-700">🔥 {streak} day streak</span>
              {streakFreezes > 0 && (
                <span>
                  {' · '}
                  ❄️ {streakFreezes} freeze{streakFreezes > 1 ? 's' : ''} in hand
                </span>
              )}
            </p>
          )}
          <div className="mb-6 -mt-2">
            <NextChallengeCountdown />
          </div>
          <MissionsCard className="mb-8" />
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRestart} size="lg" className="rounded-full font-semibold">
              <RotateCcw className="w-5 h-5 mr-2" />
              Replay today’s challenge
            </Button>
            <Button
              onClick={() => navigate('/archive')}
              size="lg"
              variant="outline"
              className="rounded-full font-semibold"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Play Archive
            </Button>
          </div>

          {/* The questions the player missed are still worth another go. */}
          {reviewable.length > 0 && (
            <Button
              onClick={() => navigate('/review')}
              variant="outline"
              size="lg"
              className="mt-4 rounded-full font-semibold"
            >
              <Target className="w-5 h-5 mr-2" />
              Review {reviewable.length} missed question{reviewable.length > 1 ? 's' : ''}
            </Button>
          )}

          {/* The other region is a different challenge, so it is still open. */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Try the other region
            </p>
            <div className="flex items-center justify-center gap-2">
              {REGIONS.filter((item) => item.id !== regionId).map((item) => (
                <Button
                  key={item.id}
                  onClick={() => navigate(regionPath(item.id))}
                  variant="outline"
                  className="rounded-full font-semibold"
                >
                  <span className="mr-2">{item.emoji}</span>
                  Play the {item.label} challenge
                </Button>
              ))}
            </div>
          </div>

          {/* They already played today, so the next one is tomorrow - the
              best possible moment to offer the daily email. */}
          <div className="mt-8 text-left">
            <NewsletterSignup variant="card" source="daily-already-played" />
          </div>
        </motion.div>
      </div>
    );
  }


  // Result screen
  if (isComplete) {
    const newAchievements = roundStart
      ? achievements.filter((achievement) => !roundStart.achievementIds.includes(achievement.id))
      : [];
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white text-center py-10">
              <div className="text-7xl mb-6">
                {totalScore >= 1170 ? '🔥' : totalScore >= 1040 ? '🏆' : totalScore >= 910 ? '⭐' : '🎯'}
              </div>
              <CardTitle className="text-5xl md:text-6xl font-bold mb-4 font-[Caveat]">
                Challenge Complete!
              </CardTitle>
              <p className="text-2xl opacity-90">
                <CountUp value={finalScore} className="font-bold" /> / {formatPoints(maxScore * multiplier)} points
              </p>
              {betterThan !== null && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="mt-2 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold"
                >
                  🌎 Better than {betterThan}% of today&apos;s players
                </motion.p>
              )}
              {streakBonus > 0 && (
                <p className="text-sm font-semibold text-orange-50 mt-1">
                  🔥 {multiplier}× streak bonus: +{formatPoints(streakBonus)}
                </p>
              )}
              <Progress value={percentage} className="mt-6 h-3 bg-white/20" />
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* How the round went against the score the player was
                  challenged to beat. */}
              {outcome && challengeScore !== null && (
                <div
                  className={`rounded-2xl p-4 text-center border-2 ${
                    outcome === 'won'
                      ? 'bg-green-50 border-green-200'
                      : outcome === 'tie'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <p className="text-xl font-bold text-gray-800">
                    {challengeHeadline(outcome)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    You scored {formatPoints(finalScore)} · they scored{' '}
                    {formatPoints(challengeScore)}
                  </p>
                </div>
              )}

              {/* What the round earned: XP towards the level, any badge it
                  unlocked, and where the day's missions stand. */}
              {roundStart && (
                <>
                  <XpBar fromXp={roundStart.xp} />
                  {newAchievements.length > 0 && (
                    <div className="space-y-2">
                      {newAchievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 2.2 + index * 0.3, type: 'spring', stiffness: 260, damping: 18 }}
                          className="flex items-center gap-3 rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-3"
                        >
                          <span className="text-3xl" aria-hidden>
                            {achievement.icon}
                          </span>
                          <div className="text-left">
                            <p className="text-xs font-bold uppercase tracking-wide text-yellow-700">
                              Badge unlocked
                            </p>
                            <p className="font-bold text-gray-800">{achievement.title}</p>
                            <p className="text-xs text-gray-600">{achievement.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {!isReview && !isArchiveMode && (
                <>
                  <MissionsCard />
                  <div className="text-center">
                    <NextChallengeCountdown />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded-2xl">
                  <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-gray-800">{accuracy}%</div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <Award className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-gray-800">{answers.length}</div>
                  <div className="text-xs text-gray-600">Questions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-2xl">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-gray-800">{averageDistance}</div>
                  <div className="text-xs text-gray-600">Average (km)</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-2xl">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <div className="text-2xl font-bold text-gray-800">{formatPoints(totalTimeBonus)}</div>
                  <div className="text-xs text-gray-600">Speed bonus</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Your Answers</h3>
                {answers.map((answer, idx) => (
                  <div key={answer.questionId + idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {idx + 1}. {answer.question}
                      </p>
                      <p className="text-xs text-gray-500">
                        {answer.gaveUp
                          ? 'given up'
                          : `${Math.round(answer.distance)} km away`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {answer.timeBonus > 0 && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                          <Zap className="w-3 h-3" />
                          +{answer.timeBonus}
                        </span>
                      )}
                      <Badge variant={answer.score >= 90 ? 'default' : 'secondary'} className="rounded-full">
                        {formatPoints(answer.score)} points
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* The questions the player missed are the ones worth trying
                  again, and a second attempt is a reason to come back. */}
              {!isReview && missedCount > 0 && (
                <Button
                  onClick={() => navigate('/review')}
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full font-semibold"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Review {missedCount} missed question{missedCount > 1 ? 's' : ''}
                </Button>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={handleShare} size="lg" className="flex-1 rounded-full font-semibold">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Results
                </Button>
                <Button
                  onClick={handleChallengeFriend}
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-full"
                >
                  <Swords className="w-5 h-5 mr-2" />
                  Challenge a friend
                </Button>
                <Button onClick={handleRestart} variant="outline" size="lg" className="flex-1 rounded-full">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* The daily email is offered right after a finished round - that is
              the moment the player is most motivated to keep the streak. */}
          <NewsletterSignup variant="card" source="daily-results" className="mt-4" />

          <AdSlot slot="afterGame" className="mt-4" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden overflow-x-clip bg-gray-50">
      {/* ============ MAP - the base layer, it fills the whole screen ============ */}
      <div className="absolute inset-0">
        <Map
          ref={mapRef}
          // The key remounts the map when the region changes, so the new
          // region opens framed on its own country instead of the whole globe.
          key={regionId}
          initialViewState={{
            longitude: mapCenter[0],
            latitude: mapCenter[1],
            zoom: mapZoom,
          }}
          maxBounds={toBoundsArray(mapBounds)}
          // The world must be on the screen once. Letting the map repeat it
          // puts the same continent at both edges, which reads as a bug.
          renderWorldCopies={false}
          // The world round is a sphere and the American round is a flat map.
          // A single country on a globe is mostly empty space, and the whole
          // planet on a flat map is a strip that wraps round on itself.
          // The player can overrule it from the map options.
          projection={projection}
          style={{ width: '100%', height: '100%' }}
          mapStyle={getMapStyleSource(mapStyleId)}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
        >
          {/* The guess the player placed. */}
          {userGuess && (
            <Marker longitude={userGuess.lng} latitude={userGuess.lat}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-7 h-7 bg-primary rounded-full border-[3px] border-white shadow-lg flex items-center justify-center"
              >
                <MapPin className="w-4 h-4 text-white" />
              </motion.div>
            </Marker>
          )}

          {/* The real place. It is the same pin as the guess, in green, so the
              two read as the same kind of thing and neither is hidden behind
              the other when the guess was dead on. */}
          {showResult && currentQuestion && (
            <Marker longitude={currentQuestion.lng} latitude={currentQuestion.lat}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-7 h-7 bg-green-500 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center"
              >
                <MapPin className="w-4 h-4 text-white" />
              </motion.div>
            </Marker>
          )}
        </Map>
      </div>

      {/* ============ THE TOP BAND ============ */}
      {/* The progress line sits exactly on the boundary between the site menu
          and the map. The question card hangs on it and the controls sit just
          below, so the whole top of the screen reads as one band. */}
      <div className="absolute top-0 inset-x-0 z-30 flex flex-col">
        {/* ============ THE SEAM ============ */}
        <div className="h-0.5 bg-gray-900/10 pointer-events-none order-0 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{
              width: `${((currentQuestionIndex + 1) / dailyQuestions.length) * 100}%`,
            }}
          />
        </div>

        {/* ============ THE ROW ============ */}
        {/* On a wide screen the question sits between the two groups of
            controls. On a narrow one it wraps onto its own line. */}
        <div className="pointer-events-auto px-3 pt-2 flex flex-wrap items-start gap-2 order-1">
          <div className="order-1 flex items-center gap-1.5 shrink-0">
          {onBack && (
            <Button
              variant="secondary"
              onClick={onBack}
              size="icon"
              aria-label="Back"
              className="rounded-full shadow-md bg-white/90 text-gray-700 hover:bg-white shrink-0 h-9 w-9"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-full pl-1 pr-3 py-1 shadow-md shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-bold text-gray-800">
                {isReview
                  ? 'Review'
                  : isArchiveMode
                    ? 'Archive day'
                    : `${regionConfig.shortLabel} Challenge`}
              </p>
              <p className="text-[10px] text-gray-500 truncate max-w-[9rem]">
                {isReview
                  ? `${dailyQuestions.length} missed questions`
                  : isArchiveMode
                    ? formatFullDayLabel(challengeDate)
                    : '10 questions'}
              </p>
            </div>
          </div>
          </div>

          <div className="order-2 xl:order-3 ml-auto xl:ml-0 flex items-center gap-1 shrink-0 min-w-0">
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-bold text-gray-700">{totalScore}</span>
            </span>
            {/* What the streak is worth, shown while the player is answering so
                the bonus is never a surprise on the results screen. */}
            {multiplier > 1 && (
              <span
                className="flex items-center gap-1 bg-orange-50/95 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md border border-orange-200"
                title={`Your ${streak}-day streak makes this round worth ${multiplier}× the points`}
              >
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-700">{multiplier}×</span>
              </span>
            )}
            {/* Streak freezes in hand. Each one covers a day the player misses,
                so it is worth showing that they are protected. */}
            {streakFreezes > 0 && (
              <span
                className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md"
                title="Streak freezes - each one covers a day you miss"
              >
                <Snowflake className="h-3.5 w-3.5 text-sky-500" />
                <span className="text-xs font-bold text-gray-700">{streakFreezes}</span>
              </span>
            )}
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-gray-700">
                {currentQuestionIndex + 1}/{dailyQuestions.length}
              </span>
            </span>

            {/* When the answer is in Alaska or Hawaii the map has travelled
                there, and the player is told so. */}
            {outlyingState && (
              <span
                className="flex items-center gap-1 bg-sky-50/95 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md border border-sky-200"
                title={`This question is in ${outlyingState}. The map has moved there.`}
              >
                <MapPin className="h-3.5 w-3.5 text-sky-600" />
                <span className="text-xs font-bold text-sky-800">{outlyingState}</span>
              </span>
            )}

            <MapSelect
              className="bg-white/90 backdrop-blur shadow-md"
              projection={projection}
              canChangeProjection={regionProjection === 'globe'}
            />

            <Button
              variant="secondary"
              size="icon"
              onClick={() => setPanelOpen((open) => !open)}
              aria-label={panelOpen ? 'Hide the question and focus the map' : 'Show the question'}
              title={panelOpen ? 'Focus the map' : 'Show the question'}
              className="rounded-full shadow-md bg-white/90 text-gray-700 hover:bg-white h-9 w-9"
            >
              {panelOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

      {/* ============ QUESTION PANEL ============ */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key="question-panel"
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            ref={panelRef}
            // The question sits between the two groups of controls on a wide
            // screen. `basis-0` is what puts it there: `flex-1` on its own
            // lets the question take the width of its text, and a row that is
            // wider than the screen wraps - which is how the controls ended up
            // on a line of their own under the question.
            className="order-3 xl:order-2 basis-full xl:basis-0 xl:flex-1 min-w-0 pointer-events-none"
          >
            <div className="pointer-events-auto w-full mx-auto max-w-3xl">
              <AnimatePresence mode="wait" initial={false}>
                {/* The card stays open when the answer is on the screen. The
                    answer and the real place on the map are the two things
                    the player is looking at, and a card that folds itself
                    away takes the first of them with it. The whole panel can
                    still be put away with the button beside it. */}
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-primary/15 shadow-md rounded-2xl bg-white/90 backdrop-blur max-h-[60vh] sm:max-h-[45vh] overflow-y-auto overscroll-contain">
                    <CardContent className="p-3 sm:p-4">
                      {/* Somebody challenged this player. The score to beat is
                          shown for the whole round, so it is always in front of
                          them while they are answering. */}
                      {challengeScore !== null && !isComplete && (
                        <div className="mb-2.5 flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 px-3 py-2">
                          <Trophy className="w-4 h-4 text-primary shrink-0" />
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">
                            A friend scored {formatPoints(challengeScore)} points.
                            Beat them.
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                        {/* The question may break anywhere, and it may use the
                            whole width of the card. On a narrow screen the
                            badges drop to their own row; from a tablet up they
                            sit beside the text. */}
                        <p className="text-base sm:text-lg font-bold text-gray-800 leading-snug min-w-0 flex-1 basis-full sm:basis-0 break-words">
                          {currentQuestion?.text}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          {/* The time bonus is a bonus, never a penalty: the
                              countdown turns amber and then red, but the
                              question stays answerable for as long as the
                              player wants. */}
                          {!showResult && (
                            <span
                              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold transition-colors ${
                                timeBonusSecondsLeft <= 5
                                  ? 'bg-red-100 text-red-700'
                                  : timeBonusSecondsLeft <= 10
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}
                              title={`Answer within ${TIME_BONUS_WINDOW_SECONDS} seconds for up to ${MAX_TIME_POINTS_PER_QUESTION} bonus points`}
                            >
                              <Timer className="w-3 h-3" />
                              {timeBonusSecondsLeft}s
                            </span>
                          )}
                          <Badge className="rounded-full bg-gradient-to-r from-primary to-secondary text-xs shrink-0 capitalize">
                            {currentQuestion?.category}
                          </Badge>
                          {/* The stake rises for the last questions of a round,
                              so the player can see what is on the line. */}
                          {stake > 100 && (
                            <Badge className="rounded-full bg-amber-500 text-white text-xs shrink-0 font-bold">
                              {stake} pts
                            </Badge>
                          )}
                          {/* A sponsored question is always labelled. A question
                              that carries an advert without saying so is not
                              advertising, it is a trick. */}
                          {currentQuestion?.sponsor && (
                            <Badge className="rounded-full bg-slate-600 text-white text-[10px] shrink-0">
                              Sponsored: {currentQuestion.sponsor.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* A harmless fact before the guess. It deliberately
                          avoids the venue and the town in the hint. */}
                      {!showResult && teaser && (
                        <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
                          <span className="font-semibold text-gray-600">✨ Teaser:</span>{' '}
                          {teaser}
                        </p>
                      )}

                      {/* Hints. The first one is free, but it has to be waited
                          for; the ones after it are bought with points, so
                          being stuck is a decision rather than a dead end. */}
                      {!showResult && (
                        <div className="mt-1.5">
                          {revealedHints.map((tier, index) => (
                            <p
                              key={index}
                              className="text-xs sm:text-sm text-gray-600"
                            >
                              💡 {tier.label}: {tier.text}
                            </p>
                          ))}
                          {availableHint && (
                            <button
                              type="button"
                              onClick={handleTakeHint}
                              disabled={availableHint.cost === 0 && !freeHintReady}
                              className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 disabled:text-gray-400 disabled:hover:text-gray-400 transition-colors text-left"
                            >
                              {availableHint.cost === 0
                                ? freeHintReady
                                  ? '💡 Take a free hint'
                                  : `💡 Free hint in ${secondsUntilFreeHint(hintsRevealed, questionElapsed, isProUser)}s`
                                : isProUser
                                  ? `💡 ${availableHint.label} — free`
                                  : `💡 ${availableHint.label} — ${availableHint.cost} points`}
                            </button>
                          )}
                        </div>
                      )}

                      {showResult && (
                        <motion.div
                          initial={{ scale: 0.97, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mt-3 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                              <div className="flex h-full flex-row gap-3 sm:items-stretch">
                                <div className="min-w-0 flex-1">
                              {/* The answer itself. The question asked where
                                  the place is, and the answer is the name of
                                  the place - without it the player is left
                                  looking at a pin and a distance. */}
                              <p className="text-base font-bold text-green-900 break-words">
                                {currentQuestion?.venue ??
                                  currentQuestion?.hint ??
                                  'You found it'}
                              </p>
                              <p className="text-xs font-semibold text-green-700 mt-0.5 flex items-center gap-1">
                                <span aria-hidden="true" className="shrink-0">
                                  {questionScore >= 90 ? '🎯' : questionScore >= 60 ? '👍' : (
                                    <MapPin className="w-3.5 h-3.5 text-green-500" />
                                  )}
                                </span>
                                <span className="truncate">
                                  {lastAnswer?.gaveUp
                                    ? 'You gave up'
                                    : lastAnswer?.namedPlace
                                      ? `You named ${lastAnswer.namedPlace}`
                                      : `${Math.round(distance)} km away`}
                                </span>
                              </p>
                              <p className="text-xs font-semibold text-green-600">
                                +{formatPoints(questionScore)} points
                              </p>
                              {questionTimeBonus > 0 && (
                                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
                                  <Zap className="w-3 h-3" />
                                  +{formatPoints(questionTimeBonus)} speed bonus
                                </p>
                              )}
                              {missDirection && (
                                <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mt-1">
                                  <span aria-hidden="true">{missDirection.arrow}</span>
                                  {missDirection.text}
                                </p>
                              )}
                            </div>
                                {currentQuestion?.image && (
                                  <figure className="w-[45%] shrink-0 sm:w-1/2 sm:self-stretch">
                                    <a
                                      href={currentQuestion.image.creditUrl}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      title={`${currentQuestion.image.alt} — ${currentQuestion.image.credit}`}
                                      className="block h-full"
                                    >
                                      <img
                                        src={currentQuestion.image.url}
                                        alt={currentQuestion.image.alt}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-24 w-full rounded-lg border border-green-200 object-cover sm:h-full"
                                      />
                                    </a>
                                  </figure>
                                )}
                              </div>
                            </div>

                          {currentQuestion?.facts && currentQuestion.facts.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                              <p className="text-xs font-bold text-blue-900 mb-1">💡 Did you know?</p>
                              <ul className="space-y-1">
                                {currentQuestion.facts.map((fact, idx) => (
                                  <li key={idx} className="text-xs text-blue-800">
                                    • {fact}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          </div>

                          {currentQuestion?.image && (
                            <p className="text-[10px] leading-tight text-gray-500 truncate">
                              {currentQuestion.image.illustrative && (
                                <span
                                  className="font-semibold text-amber-700"
                                  title="A stock photo, not a picture of the exact place"
                                >
                                  Illustrative photo ·{' '}
                                </span>
                              )}
                              {currentQuestion.image.creditUrl ? (
                                <a
                                  href={currentQuestion.image.creditUrl}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  title={currentQuestion.image.credit}
                                  className="underline hover:text-gray-700"
                                >
                                  {currentQuestion.image.credit}
                                </a>
                              ) : (
                                currentQuestion.image.credit
                              )}
                            </p>
                          )}

                          {/* Somewhere to go with the answer, and somewhere to
                              say that the answer is wrong. */}
                          {(wikiLink || currentQuestion) && (
                            <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
                              {wikiLink && (
                                <a
                                  href={wikiLink}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="inline-flex items-center gap-1 hover:text-gray-800"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  Read more on Wikipedia
                                </a>
                              )}
                              {currentQuestion && (
                                <a
                                  href={reportPageUrl(currentQuestion)}
                                  className="inline-flex items-center gap-1 hover:text-gray-800"
                                >
                                  <Flag className="w-3 h-3" />
                                  Report a problem
                                </a>
                              )}
                            </div>
                          )}

                          {/* The map itself is the picture of the venue, and
                              it is the only one that is always right. */}
                          <Button
                            onClick={closeUp ? handleShowComparison : handleLookCloser}
                            variant="outline"
                            size="sm"
                            className="w-full rounded-full font-semibold bg-white/90 hover:bg-white"
                          >
                            {closeUp ? (
                              <>
                                <Undo2 className="w-4 h-4 mr-2" />
                                Back to my guess
                              </>
                            ) : (
                              <>
                                <ZoomIn className="w-4 h-4 mr-2" />
                                Look closer
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>

      {/* Hint, shown while the player has not marked anything yet */}
      {!userGuess && !showResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-[5rem] inset-x-0 z-10 px-3 pointer-events-none"
        >
          <p className="mx-auto w-fit text-xs font-medium text-gray-600 bg-white/85 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
            👆 Click the map to mark the location
          </p>
        </motion.div>
      )}

      {/* A legend, so it is obvious which marker is which. */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-[5rem] inset-x-0 z-10 px-3 pointer-events-none"
        >
          <div className="mx-auto w-fit flex items-center gap-2 sm:gap-3 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow-md">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow" />
              Your guess
            </span>
            <span className="h-3 w-px bg-gray-300" />
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow" />
              Correct answer
            </span>
            <span className="h-3 w-px bg-gray-300" />
            <span className="font-bold text-gray-800 whitespace-nowrap">
              {Math.round(distance)} km apart
            </span>
          </div>
        </motion.div>
      )}

      {/* ============ BOTTOM ACTION BAR ============ */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-3">
        <div className="mx-auto max-w-3xl flex items-center gap-2">
          <Button
            onClick={showResult ? handleNextQuestion : handleSubmitGuess}
            disabled={!showResult && !userGuess}
            size="lg"
            className="flex-1 rounded-full shadow-2xl font-bold h-12 bg-primary hover:bg-primary/90 text-white cursor-pointer"
          >
            {showResult ? (isLastQuestion ? 'Finish' : 'Next Question') : 'Submit Answer'}
          </Button>
        </div>
      </div>
    </div>
  );
}


