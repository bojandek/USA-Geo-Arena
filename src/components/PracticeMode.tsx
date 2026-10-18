import { useState } from 'react';
import { MapPin, Trophy, Target, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { calculateDistance, calculateScore } from '@/lib/game-data';
import { useGameStore } from '@/lib/game-store';

const PRACTICE_QUESTIONS = [
  {
    id: 'p1',
    question: 'Where is Marakana (Rajko Mitić Stadium) located?',
    answer: { lat: 44.7833, lng: 20.4667 },
    hint: 'Belgrade, Serbia',
    category: 'Football'
  },
  {
    id: 'p2',
    question: 'Location of the Wimbledon tennis complex?',
    answer: { lat: 51.4344, lng: -0.2141 },
    hint: 'London, United Kingdom',
    category: 'Tennis'
  },
  {
    id: 'p3',
    question: 'Where is Madison Square Garden located?',
    answer: { lat: 40.7505, lng: -73.9934 },
    hint: 'New York, USA',
    category: 'Basketball'
  },
  {
    id: 'p4',
    question: 'Location of Circuit de Monaco?',
    answer: { lat: 43.7347, lng: 7.4206 },
    hint: 'Monaco',
    category: 'Formula 1'
  },
  {
    id: 'p5',
    question: 'Where is MCG (Melbourne Cricket Ground) located?',
    answer: { lat: -37.8200, lng: 144.9834 },
    hint: 'Melbourne, Australia',
    category: 'Cricket'
  },
  {
    id: 'p6',
    question: 'Location of Camp Nou stadium?',
    answer: { lat: 41.3809, lng: 2.1228 },
    hint: 'Barcelona, Spain',
    category: 'Football'
  },
  {
    id: 'p7',
    question: 'Where is Tokyo Dome located?',
    answer: { lat: 35.7056, lng: 139.7519 },
    hint: 'Tokyo, Japan',
    category: 'Baseball'
  },
  {
    id: 'p8',
    question: 'Location of Wembley Stadium?',
    answer: { lat: 51.5560, lng: -0.2795 },
    hint: 'London, United Kingdom',
    category: 'Football'
  },
  {
    id: 'p9',
    question: 'Where is the Allianz Arena located?',
    answer: { lat: 48.2188, lng: 11.6247 },
    hint: 'Munich, Germany',
    category: 'Football'
  },
  {
    id: 'p10',
    question: 'Location of Fenway Park?',
    answer: { lat: 42.3467, lng: -71.0972 },
    hint: 'Boston, USA',
    category: 'Baseball'
  }
];

export default function PracticeMode({ onBack }: { onBack: () => void }) {
  const { updateScore } = useGameStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: string; score: number; distance: number }>>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const question = PRACTICE_QUESTIONS[currentQuestion];

  const handleMapClick = (event: any) => {
    if (showResult) return;
    const { lngLat } = event;
    setUserGuess({ lat: lngLat.lat, lng: lngLat.lng });
  };

  const handleSubmit = () => {
    if (!userGuess) return;

    const distance = calculateDistance(
      userGuess.lat,
      userGuess.lng,
      question.answer.lat,
      question.answer.lng
    );
    const points = calculateScore(distance);

    setScore(points);
    setTotalScore(prev => prev + points);
    setAnswers(prev => [...prev, { question: question.question, score: points, distance }]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < PRACTICE_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserGuess(null);
      setShowResult(false);
      setScore(0);
    } else {
      setGameComplete(true);
      updateScore(totalScore);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setUserGuess(null);
    setShowResult(false);
    setScore(0);
    setTotalScore(0);
    setAnswers([]);
    setGameComplete(false);
  };

  const handleShare = () => {
    const percentage = Math.round((totalScore / (PRACTICE_QUESTIONS.length * 1000)) * 100);
    const text = `GeoArena Practice Mode\nMy score: ${totalScore}/${PRACTICE_QUESTIONS.length * 1000} (${percentage}%)\n\nCan you do better? 🌍⚽`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  if (gameComplete) {
    const avgScore = Math.round(totalScore / PRACTICE_QUESTIONS.length);
    const accuracy = answers.filter(a => a.score >= 800).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Button
          variant="ghost"
          className="mb-4 text-white hover:bg-white/10"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

          <Card className="p-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white font-script mb-3">Training Complete!</h2>
                <p className="text-lg text-slate-300">Great job! 🎯</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary mb-1">{totalScore}</div>
                  <div className="text-sm text-slate-400">Total Points</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-amber-400 mb-1">{avgScore}</div>
                  <div className="text-sm text-slate-400">Average</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">{accuracy}</div>
                  <div className="text-sm text-slate-400">Accurate</div>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {answers.map((answer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3 text-sm"
                  >
                    <span className="text-slate-300 flex-1 text-left">
                      {idx + 1}. {answer.question.substring(0, 40)}...
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{answer.distance.toFixed(0)} km</span>
                      <span className={`font-bold ${
                        answer.score >= 800 ? 'text-green-400' :
                        answer.score >= 500 ? 'text-amber-400' :
                        'text-orange-400'
                      }`}>
                        {answer.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={handleRestart}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  Play Again
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-white text-sm">
              Question {currentQuestion + 1}/{PRACTICE_QUESTIONS.length}
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
              <span className="text-primary font-bold">{totalScore}</span>
              <span className="text-slate-400 ml-1">points</span>
            </div>
          </div>
        </div>

        <Card className="mb-4 p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
                  {question.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{question.question}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Hint: {question.hint}
              </p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-slate-700">
          <div className="relative h-[500px]">
            <Map
              initialViewState={{
                latitude: 20,
                longitude: 0,
                zoom: 1.5
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
              onClick={handleMapClick}
            >
              {userGuess && !showResult && (
                <Marker latitude={userGuess.lat} longitude={userGuess.lng}>
                  <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg animate-pulse" />
                </Marker>
              )}
              {showResult && userGuess && (
                <>
                  <Marker latitude={userGuess.lat} longitude={userGuess.lng}>
                    <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg" />
                  </Marker>
                  <Marker latitude={question.answer.lat} longitude={question.answer.lng}>
                    <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg" />
                  </Marker>
                </>
              )}
            </Map>

            {showResult && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <Card className="px-6 py-4 bg-slate-900/95 border-slate-700 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-1">+{score}</div>
                    <div className="text-sm text-slate-400">
                      {calculateDistance(
                        userGuess!.lat,
                        userGuess!.lng,
                        question.answer.lat,
                        question.answer.lng
                      ).toFixed(0)} km
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-4 flex gap-3">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={!userGuess}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
            >
              Submit Choice
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
            >
              {currentQuestion < PRACTICE_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
