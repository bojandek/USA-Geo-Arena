import { useState } from 'react';
import Map, { Marker, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Trophy,
  Target,
  ArrowLeft,
  Share2,
  RotateCcw,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { toast } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useGameStore } from '@/lib/game-store';
import { generateShareText, PRACTICE_QUESTIONS } from '@/lib/game-data';
import MapStyleSelect from '@/components/MapStyleSelect';
import { getMapStyleSource } from '@/lib/map-styles';
import { useMapStyle } from '@/hooks/useMapStyle';
import AdSlot from '@/components/AdSlot';

interface PracticeModeProps {
  onBack?: () => void;
}

export default function PracticeMode({ onBack }: PracticeModeProps) {
  const { completePractice } = useGameStore();
  const { mapStyleId } = useMapStyle();

  // The question panel floats above the map and can be collapsed.
  const [panelOpen, setPanelOpen] = useState(true);

  const session = useQuizSession({
    questions: PRACTICE_QUESTIONS,
    onComplete: ({ totalScore }) => {
      // Practice is tracked separately and never inflates the daily progression.
      completePractice(totalScore);
    },
  });

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

  const maxScore = PRACTICE_QUESTIONS.length * 1000;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const averageScore = answers.length ? Math.round(totalScore / answers.length) : 0;
  const accurateCount = answers.filter((a) => a.score >= 800).length;

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (showResult || isComplete) return;
    session.guess(event.lngLat.lat, event.lngLat.lng);
  };

  const handleShare = async () => {
    const shareText = generateShareText(totalScore, maxScore);

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: window.location.href });
      } catch {
        // The user dismissed the share sheet.
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

  // Result screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full pt-8">
          {onBack && (
            <Button variant="ghost" className="mb-4 text-white hover:bg-white/10" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <Card className="p-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white font-script mb-3">
                  Training Complete!
                </h2>
                <p className="text-lg text-slate-300">Great job! 🎯</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary mb-1">{totalScore}</div>
                  <div className="text-sm text-slate-400">Total Points</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-amber-400 mb-1">{averageScore}</div>
                  <div className="text-sm text-slate-400">Average</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">{accurateCount}</div>
                  <div className="text-sm text-slate-400">Accurate</div>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto text-left">
                {answers.map((answer, idx) => (
                  <div
                    key={answer.questionId + idx}
                    className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3 text-sm"
                  >
                    <span className="text-slate-300 flex-1 min-w-0 truncate">
                      {idx + 1}. {answer.question}
                    </span>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-slate-400">{Math.round(answer.distance)} km</span>
                      <span
                        className={`font-bold ${
                          answer.score >= 800
                            ? 'text-green-400'
                            : answer.score >= 500
                              ? 'text-amber-400'
                              : 'text-orange-400'
                        }`}
                      >
                        {answer.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={session.restart}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
              </div>
            </div>
          </Card>

          <AdSlot slot="afterGame" className="mt-4" />
        </div>
      </div>
    );
  }


  return (
    <div className="h-[100dvh] w-full relative overflow-hidden overflow-x-clip bg-slate-900">
      {/* ============ MAP - the base layer, it fills the whole screen ============ */}
      <div className="absolute inset-0">
        <Map
          initialViewState={{ latitude: 20, longitude: 0, zoom: 1.5 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={getMapStyleSource(mapStyleId)}
          onClick={handleMapClick}
        >
              {userGuess && !showResult && (
                <Marker latitude={userGuess.lat} longitude={userGuess.lng}>
                  <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg animate-pulse" />
                </Marker>
              )}
              {showResult && userGuess && currentQuestion && (
                <>
                  <Marker latitude={userGuess.lat} longitude={userGuess.lng}>
                    <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg" />
                  </Marker>
                  <Marker latitude={currentQuestion.lat} longitude={currentQuestion.lng}>
                    <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg" />
                  </Marker>
                </>
              )}
            </Map>
      </div>

      {/* ============ TOP BAR ============ */}
      <div className="absolute top-0 inset-x-0 z-30 pointer-events-none">
        <div className="pointer-events-auto px-3 pt-3 flex items-center gap-1.5">
          {onBack ? (
            <Button
              variant="secondary"
              onClick={onBack}
              size="icon"
              aria-label="Back"
              className="rounded-full shadow-md bg-slate-800/80 text-slate-200 hover:bg-slate-700/90 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur rounded-full px-3 py-1.5 shadow-md shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-white">Practice</span>
            </div>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-1 shrink-0 min-w-0">
            <span className="bg-slate-800/80 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md text-xs font-semibold text-slate-300">
              {currentQuestionIndex + 1}/{PRACTICE_QUESTIONS.length}
            </span>
            <span className="bg-slate-800/80 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md text-xs text-slate-400">
              <span className="text-primary font-bold">{totalScore}</span>
              <span className="ml-1">pts</span>
            </span>

            <MapStyleSelect className="bg-slate-800/80 backdrop-blur text-slate-200 shadow-md" />

            <Button
              variant="secondary"
              size="icon"
              onClick={() => setPanelOpen((open) => !open)}
              aria-label={panelOpen ? 'Hide the question and focus the map' : 'Show the question'}
              title={panelOpen ? 'Focus the map' : 'Show the question'}
              className="rounded-full shadow-md bg-slate-800/80 text-slate-200 hover:bg-slate-700/90 h-9 w-9"
            >
              {panelOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Hairline progress */}
        <div className="px-3 mt-2">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{
                width: `${((currentQuestionIndex + (showResult ? 1 : 0)) / PRACTICE_QUESTIONS.length) * 100}%`,
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
                  <Card className="border-slate-700 bg-slate-900/90 backdrop-blur shadow-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {currentQuestion && (
                            <>
                              <Badge className="text-[10px] px-2 py-0.5 mb-1.5 bg-slate-700 text-slate-300 rounded-full border-0 capitalize">
                                {currentQuestion.category}
                              </Badge>
                              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                                {currentQuestion.text}
                              </h2>
                              {currentQuestion.hint && (
                                <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
                                  <Target className="w-4 h-4 shrink-0" />
                                  {currentQuestion.hint}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {showResult && (
                        <motion.div
                          initial={{ scale: 0.97, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mt-3 flex items-center justify-between rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-2.5"
                        >
                          <div>
                            <p className="text-xl font-bold text-primary">+{questionScore}</p>
                            <p className="text-xs text-slate-400">{Math.round(distance)} km away</p>
                          </div>
                          <div className="text-3xl">
                            {questionScore >= 900 ? '🎯' : questionScore >= 600 ? '👍' : '📍'}
                          </div>
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

      {/* Hint */}
      {!userGuess && !showResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-[5rem] inset-x-0 z-10 px-3 pointer-events-none"
        >
          <p className="mx-auto w-fit text-xs font-medium text-slate-300 bg-slate-900/70 backdrop-blur px-3 py-1.5 rounded-full">
            👆 Click the map to mark the location
          </p>
        </motion.div>
      )}

      {/* ============ BOTTOM ACTION BAR ============ */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-3">
        <div className="mx-auto max-w-3xl">
          <Button
            onClick={showResult ? session.next : session.submit}
            disabled={!showResult && !userGuess}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg font-bold rounded-full shadow-2xl"
          >
            {showResult ? (isLastQuestion ? 'View Results' : 'Next Question') : 'Submit Answer'}
          </Button>
        </div>
      </div>
    </div>
  );
}


