import { useState, useEffect } from 'react';
import Map, { Marker, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, MapPin, Target, Award, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/lib/game-store';
import { 
  sampleQuestions, 
  calculateDistance, 
  calculateScore, 
  generateShareText,
  type Question 
} from '@/lib/game-data';
import { toast } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function DailyChallenge() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [questionScore, setQuestionScore] = useState<number>(0);
  const [totalGameScore, setTotalGameScore] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answers, setAnswers] = useState<Array<{ question: string; score: number; distance: number }>>([]);

  const { dailyCompleted, completeDaily, checkStreak } = useGameStore();
  const currentQuestion = sampleQuestions[currentQuestionIndex];

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (showResult || gameCompleted) return;
    
    const { lat, lng } = event.lngLat;
    setUserGuess({ lat, lng });
  };

  const handleSubmitGuess = () => {
    if (!userGuess || !currentQuestion) return;

    const dist = calculateDistance(
      userGuess.lat,
      userGuess.lng,
      currentQuestion.lat,
      currentQuestion.lng
    );

    const score = calculateScore(dist);
    setDistance(dist);
    setQuestionScore(score);
    setTotalGameScore(prev => prev + score);
    setAnswers(prev => [...prev, { 
      question: currentQuestion.text, 
      score, 
      distance: dist 
    }]);
    setShowResult(true);

    toast.success(`${Math.round(dist)} km away! +${score} points`);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserGuess(null);
      setShowResult(false);
      setDistance(0);
      setQuestionScore(0);
    } else {
      completeDaily(totalGameScore);
      setGameCompleted(true);
      toast.success('Daily challenge completed! 🎉');
    }
  };

  const handleShare = async () => {
    const shareText = generateShareText(totalGameScore);
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Results copied to clipboard!');
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setUserGuess(null);
    setShowResult(false);
    setDistance(0);
    setQuestionScore(0);
    setTotalGameScore(0);
    setGameCompleted(false);
    setAnswers([]);
  };

  if (dailyCompleted && !gameCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="text-8xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            You've already played today!
          </h2>
          <p className="text-gray-600 mb-6">
            Come back tomorrow for a new challenge and continue your streak!
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" className="rounded-full" onClick={resetGame}>
              Play again (demo)
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameCompleted) {
    const percentage = Math.round((totalGameScore / 10000) * 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white text-center py-8">
              <div className="text-6xl mb-4">
                {totalGameScore >= 9000 ? '🔥' : totalGameScore >= 8000 ? '🏆' : totalGameScore >= 7000 ? '⭐' : '🎯'}
              </div>
              <CardTitle className="text-3xl font-bold mb-2">Challenge Complete!</CardTitle>
              <p className="text-xl opacity-90">{totalGameScore} / 10000 points</p>
              <Progress value={percentage} className="mt-4 h-3 bg-white/20" />
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
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.round(answers.reduce((sum, a) => sum + a.distance, 0) / answers.length)}
                  </div>
                  <div className="text-xs text-gray-600">Average (km)</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Your Answers</h3>
                {answers.map((answer, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Question {idx + 1}</p>
                      <p className="text-xs text-gray-500">{Math.round(answer.distance)} km</p>
                    </div>
                    <Badge variant={answer.score >= 900 ? 'default' : 'secondary'} className="rounded-full">
                      {answer.score} points
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleShare}
                  size="lg"
                  className="flex-1 rounded-full font-semibold"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Results
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                >
                  New Game
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">GeoArena</h1>
                <p className="text-xs text-gray-500">Daily Challenge</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">{totalGameScore}</span>
            </div>
            <Badge variant="outline" className="rounded-full">
              {currentQuestionIndex + 1} / {sampleQuestions.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="max-w-7xl mx-auto"
          >
            <Card className="border-2 border-primary/20 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-800 mb-2">
                      {currentQuestion.text}
                    </p>
                    {currentQuestion.hint && (
                      <p className="text-sm text-gray-500">💡 {currentQuestion.hint}</p>
                    )}
                  </div>
                  <Badge className="rounded-full bg-gradient-to-r from-primary to-secondary">
                    {currentQuestion.category}
                  </Badge>
                </div>
                
                {showResult && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-green-800">
                          {Math.round(distance)} km away
                        </p>
                        <p className="text-sm text-green-600">+{questionScore} points</p>
                      </div>
                      <div className="text-4xl">
                        {questionScore >= 900 ? '🎯' : questionScore >= 600 ? '👍' : '📍'}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          initialViewState={{
            longitude: 15,
            latitude: 45,
            zoom: 2
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          onClick={handleMapClick}
        >
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
          
          {showResult && (
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

        {/* Action Buttons */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
          {!showResult && userGuess && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <Button
                onClick={handleSubmitGuess}
                size="lg"
                className="rounded-full shadow-2xl font-semibold px-8"
              >
                Submit Answer
              </Button>
            </motion.div>
          )}
          
          {showResult && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <Button
                onClick={handleNextQuestion}
                size="lg"
                className="rounded-full shadow-2xl font-semibold px-8"
              >
                {currentQuestionIndex < sampleQuestions.length - 1 ? 'Next Question' : 'Finish'}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Instructions */}
        {!userGuess && !showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-6 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                👆 Click on the map to mark the location
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
