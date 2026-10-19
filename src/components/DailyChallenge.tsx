import { useMemo, useRef, useState } from 'react';
import Map, {
  Marker,
  MapLayerMouseEvent,
  Layer,
  Source,
  type MapRef,
  type SourceProps,
} from 'react-map-gl/maplibre';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useGameStore } from '@/lib/game-store';
import { useQuizSession } from '@/hooks/useQuizSession';
import { getDailyQuestions, generateShareText, type Question } from '@/lib/game-data';
import { getDateString } from '@/lib/game-data';
import { formatFullDayLabel, todayKey } from '@/lib/date-utils';
import { DAILY_QUESTION_COUNT } from '@/lib/game-state';
import MapStyleSelect from '@/components/MapStyleSelect';
import { getMapStyleSource } from '@/lib/map-styles';
import { useMapStyle } from '@/hooks/useMapStyle';
import AdSlot from '@/components/AdSlot';

// Wrapper to prevent Dyad's tracking attributes from being passed to MapLibre Source
const CleanSource = (props: SourceProps & { children?: React.ReactNode }) => {
  const cleanProps: Record<string, unknown> = { ...props };
  delete cleanProps['data-dyad-id'];
  delete cleanProps['data-dyad-name'];
  return <Source {...(cleanProps as SourceProps)} />;
};

interface DailyChallengeProps {
  /** Day key (`YYYY-MM-DD`) to replay. Defaults to today. */
  selectedDate?: string | null;
  onBack?: () => void;
}

export default function DailyChallenge({ selectedDate, onBack }: DailyChallengeProps) {
  const today = todayKey();
  const challengeDate = selectedDate ?? today;
  const isArchiveMode = challengeDate !== today;

  const { completeDaily, isTodayCompleted, dailyHistory } = useGameStore();

  // The question set is derived from the day, so it never changes mid-session.
  const dailyQuestions: Question[] = useMemo(
    () => getDailyQuestions(new Date(challengeDate)),
    [challengeDate],
  );

  const { mapStyleId } = useMapStyle();
  const mapRef = useRef<MapRef>(null);

  // The question panel floats above the map. It can be collapsed so the map
  // gets the whole screen while the player explores.
  const [panelOpen, setPanelOpen] = useState(true);

  const handleComplete = ({
    totalScore,
    totalDistance,
    perfectCount,
  }: {
    totalScore: number;
    totalDistance: number;
    perfectCount: number;
  }) => {
    completeDaily({
      date: challengeDate,
      score: totalScore,
      totalDistance,
      perfectCount,
      maxScore: dailyQuestions.length * 1000,
    });
    toast.success(
      isArchiveMode ? 'Archive day updated! 🗺️' : 'Daily challenge completed! 🏆',
      { position: 'top-center' },
    );
  };

  const session = useQuizSession({ questions: dailyQuestions, onComplete: handleComplete });

  const {
    currentQuestion,
    currentQuestionIndex,
    userGuess,
    showResult,
    distance,
    questionScore,
    totalScore,
    answers,
    isComplete,
    isLastQuestion,
  } = session;

  const maxScore = dailyQuestions.length * 1000;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const averageDistance = answers.length
    ? Math.round(answers.reduce((sum, a) => sum + a.distance, 0) / answers.length)
    : 0;

  // Line connecting the guess to the actual location
  const lineGeoJSON = showResult && userGuess && currentQuestion ? {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [userGuess.lng, userGuess.lat],
        [currentQuestion.lng, currentQuestion.lat],
      ],
    },
  } : null;

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (showResult || isComplete) return;
    session.guess(event.lngLat.lat, event.lngLat.lng);
  };

  const handleSubmitGuess = () => {
    const submitted = session.submit();
    if (!submitted) return;

    // Center the map between the two points with an appropriate zoom.
    if (mapRef.current && userGuess && currentQuestion) {
      const centerLng = (userGuess.lng + currentQuestion.lng) / 2;
      const centerLat = (userGuess.lat + currentQuestion.lat) / 2;
      const dist = distance || 0;

      let zoom: number;
      if (dist < 100) zoom = 6;        // Very close: city level
      else if (dist < 500) zoom = 5;   // Close: regional level
      else if (dist < 1500) zoom = 4;  // Medium: country level
      else if (dist < 3000) zoom = 3;  // Far: multi-country level
      else zoom = 2;                   // Very far: continental level

      mapRef.current.getMap().flyTo({ center: [centerLng, centerLat], zoom, duration: 1500 });
    }
  };

  const handleNextQuestion = () => {
    const wasLast = isLastQuestion;
    session.next();

    if (!wasLast && mapRef.current) {
      mapRef.current.getMap().flyTo({ center: [15, 45], zoom: 2, duration: 1000 });
    }
  };

  const handleShare = async () => {
    const shareText = generateShareText(totalScore, maxScore);

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: window.location.href });
      } catch {
        // The user dismissed the share sheet - nothing to report.
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Results copied to clipboard!');
      } catch {
        toast.error('Could not copy to clipboard');
      }
    }
  };

  const handleRestart = () => {
    session.restart();
    if (mapRef.current) {
      mapRef.current.getMap().flyTo({ center: [15, 45], zoom: 2, duration: 800 });
    }
  };

  // "Already played today" screen - shown only for today, and it always
  // offers a way forward (replay) so the player is never stuck.
  if (isTodayCompleted && !isComplete && !isArchiveMode) {
    const todayResult = dailyHistory.find((entry) => entry.date === today);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
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
              ? `Your score today was ${todayResult.score.toLocaleString()} points (${todayResult.accuracy}%).`
              : 'You have already completed today’s daily challenge.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRestart} size="lg" className="rounded-full font-semibold">
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outline" size="lg" className="rounded-full font-semibold">
                Back
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }


  // Result screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white text-center py-10">
              <div className="text-7xl mb-6">
                {totalScore >= 9000 ? '🔥' : totalScore >= 8000 ? '🏆' : totalScore >= 7000 ? '⭐' : '🎯'}
              </div>
              <CardTitle className="text-5xl md:text-6xl font-bold mb-4 font-[Caveat]">
                Challenge Complete!
              </CardTitle>
              <p className="text-2xl opacity-90">
                {totalScore.toLocaleString()} / {maxScore.toLocaleString()} points
              </p>
              <Progress value={percentage} className="mt-6 h-3 bg-white/20" />
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded-2xl">
                  <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-gray-800">{percentage}%</div>
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
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Your Answers</h3>
                {answers.map((answer, idx) => (
                  <div key={answer.questionId + idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {idx + 1}. {answer.question}
                      </p>
                      <p className="text-xs text-gray-500">{Math.round(answer.distance)} km away</p>
                    </div>
                    <Badge variant={answer.score >= 900 ? 'default' : 'secondary'} className="rounded-full shrink-0 ml-2">
                      {answer.score} points
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={handleShare} size="lg" className="flex-1 rounded-full font-semibold">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Results
                </Button>
                <Button onClick={handleRestart} variant="outline" size="lg" className="flex-1 rounded-full">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>

          <AdSlot slot="afterGame" className="mt-4" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden overflow-x-clip bg-gray-50">
      {/* ============ MAP - the base layer, it fills the whole screen ============ */}
      <div className="absolute inset-0">
        <Map
          ref={mapRef}
          initialViewState={{ longitude: 15, latitude: 45, zoom: 2 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={getMapStyleSource(mapStyleId)}
          onClick={handleMapClick}
        >
          {lineGeoJSON && (
            <CleanSource id="line" type="geojson" data={lineGeoJSON}>
              <Layer
                id="line-layer"
                type="line"
                paint={{
                  'line-color': '#ef4444',
                  'line-width': 3,
                  'line-dasharray': [2, 2],
                }}
              />
            </CleanSource>
          )}

          {userGuess && (
            <Marker longitude={userGuess.lng} latitude={userGuess.lat}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center"
              >
                <MapPin className="w-5 h-5 text-white" />
              </motion.div>
            </Marker>
          )}

          {showResult && currentQuestion && (
            <Marker longitude={currentQuestion.lng} latitude={currentQuestion.lat}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
            </Marker>
          )}
        </Map>
      </div>

      {/* ============ TOP BAR ============ */}
      <div className="absolute top-0 inset-x-0 z-30 pointer-events-none">
        <div className="pointer-events-auto px-3 pt-3 flex items-center gap-1.5">
          {onBack && (
            <Button
              variant="secondary"
              onClick={onBack}
              size="icon"
              aria-label="Back"
              className="rounded-full shadow-md bg-white/90 text-gray-700 hover:bg-white shrink-0"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-full pl-1 pr-3 py-1 shadow-md shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-bold text-gray-800">GeoArena</p>
              <p className="text-[10px] text-gray-500 truncate max-w-[9rem]">
                {isArchiveMode ? formatFullDayLabel(challengeDate) : 'Daily Challenge'}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1 shrink-0 min-w-0">
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-bold text-gray-700">{totalScore}</span>
            </span>
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-gray-700">
                {currentQuestionIndex + 1}/{dailyQuestions.length}
              </span>
            </span>

            <MapStyleSelect className="bg-white/90 backdrop-blur shadow-md" />

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
        </div>

        {/* Hairline progress through the daily set */}
        <div className="px-3 mt-2">
          <div className="h-1 rounded-full bg-gray-900/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{
                width: `${((currentQuestionIndex + (showResult ? 1 : 0)) / dailyQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>
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
            className="absolute top-[4.75rem] inset-x-0 z-20 px-3 pointer-events-none"
          >
            <div className="pointer-events-auto mx-auto max-w-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-2 border-primary/20 shadow-xl rounded-2xl bg-white/95 backdrop-blur">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-lg sm:text-xl font-bold text-gray-800 leading-snug">
                          {currentQuestion?.text}
                        </p>
                        <Badge className="rounded-full bg-gradient-to-r from-primary to-secondary text-xs shrink-0 capitalize">
                          {currentQuestion?.category}
                        </Badge>
                      </div>

                      {currentQuestion?.hint && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                          💡 {currentQuestion.hint}
                        </p>
                      )}

                      {showResult && (
                        <motion.div
                          initial={{ scale: 0.97, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
                        >
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                            <div>
                              <p className="text-base font-bold text-green-800">
                                {Math.round(distance)} km away
                              </p>
                              <p className="text-xs font-semibold text-green-600">
                                +{questionScore} points
                              </p>
                            </div>
                            <div className="text-3xl">
                              {questionScore >= 900 ? '🎯' : questionScore >= 600 ? '👍' : '📍'}
                            </div>
                          </div>

                          {currentQuestion?.facts && currentQuestion.facts.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                              <p className="text-xs font-bold text-blue-900 mb-1">💡 Did you know?</p>
                              <ul className="space-y-1">
                                {currentQuestion.facts.slice(0, 2).map((fact, idx) => (
                                  <li key={idx} className="text-xs text-blue-800 line-clamp-2">
                                    • {fact}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
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


