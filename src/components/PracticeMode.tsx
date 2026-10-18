import { useState } from 'react';
import { MapPin, Trophy, Target, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { calculateDistance, calculateScore, generateShareText } from '@/lib/game-data';
import { useGameStore } from '@/lib/game-store';

const PRACTICE_QUESTIONS = [
  {
    id: 'p1',
    question: 'Gde se nalazi Marakana (Stadion Rajko Mitić)?',
    answer: { lat: 44.7833, lng: 20.4667 },
    hint: 'Beograd, Srbija',
    category: 'Fudbal'
  },
  {
    id: 'p2',
    question: 'Lokacija Wimbledon teniskog kompleksa?',
    answer: { lat: 51.4344, lng: -0.2141 },
    hint: 'London, Velika Britanija',
    category: 'Tenis'
  },
  {
    id: 'p3',
    question: 'Gde se nalazi Madison Square Garden?',
    answer: { lat: 40.7505, lng: -73.9934 },
    hint: 'Njujork, SAD',
    category: 'Košarka'
  },
  {
    id: 'p4',
    question: 'Lokacija Circuit de Monaco?',
    answer: { lat: 43.7347, lng: 7.4206 },
    hint: 'Monako',
    category: 'Formula 1'
  },
  {
    id: 'p5',
    question: 'Gde se nalazi MCG (Melbourne Cricket Ground)?',
    answer: { lat: -37.8200, lng: 144.9834 },
    hint: 'Melburn, Australija',
    category: 'Kriket'
  },
  {
    id: 'p6',
    question: 'Lokacija Camp Nou stadiona?',
    answer: { lat: 41.3809, lng: 2.1228 },
    hint: 'Barselona, Španija',
    category: 'Fudbal'
  },
  {
    id: 'p7',
    question: 'Gde se nalazi Tokyo Dome?',
    answer: { lat: 35.7056, lng: 139.7519 },
    hint: 'Tokio, Japan',
    category: 'Bejzbol'
  },
  {
    id: 'p8',
    question: 'Lokacija Wembley stadiona?',
    answer: { lat: 51.5560, lng: -0.2795 },
    hint: 'London, Velika Britanija',
    category: 'Fudbal'
  }
];

export default function PracticeMode({ onBack }: { onBack: () => void }) {
  const { addScore } = useGameStore();
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
      addScore(totalScore);
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
    const text = generateShareText(answers);
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Rezultat kopiran u clipboard!');
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
            Nazad
          </Button>

          <Card className="p-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Trening završen!</h2>
                <p className="text-slate-300">Odličan posao! 🎯</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary mb-1">{totalScore}</div>
                  <div className="text-sm text-slate-400">Ukupno bodova</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-amber-400 mb-1">{avgScore}</div>
                  <div className="text-sm text-slate-400">Prosek</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">{accuracy}</div>
                  <div className="text-sm text-slate-400">Precizno</div>
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
                  Podeli
                </Button>
                <Button
                  onClick={handleRestart}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  Igraj ponovo
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
            Nazad
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-white text-sm">
              Pitanje {currentQuestion + 1}/{PRACTICE_QUESTIONS.length}
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
              <span className="text-primary font-bold">{totalScore}</span>
              <span className="text-slate-400 ml-1">bodova</span>
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
              Potvrdi izbor
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
            >
              {currentQuestion < PRACTICE_QUESTIONS.length - 1 ? 'Sledeće pitanje' : 'Vidi rezultate'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
