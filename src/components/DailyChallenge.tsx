import { useState, useEffect, useRef } from 'react';
import Map, { Marker, MapLayerMouseEvent, Layer, Source, type SourceProps } from 'react-map-gl/maplibre';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, MapPin, Target, Award, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import {
  getDailyQuestions,
  calculateDistance,
  calculateScore,
  generateShareText,
  getDateString,
  type Question
} from '@/lib/game-data';
import { toast } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyleById, getDefaultMapStyleId, saveMapStylePreference, MAP_STYLES } from '@/lib/map-styles';

// Wrapper to prevent Dyad's tracking attributes from being passed to MapLibre Source
const CleanSource = (props: SourceProps & { children?: React.ReactNode }) => {
  const cleanProps = { ...props };
  delete (cleanProps as any)['data-dyad-id'];
  delete (cleanProps as any)['data-dyad-name'];
  return <Source {...cleanProps} />;
};

interface DailyChallengeProps {
  selectedDate?: string | null;
  onBack?: () => void;
}

export default function DailyChallenge({ selectedDate, onBack }: DailyChallengeProps) {
  const challengeDate = selectedDate ? new Date(selectedDate) : new Date();
  const [dailyQuestions] = useState<Question[]>(() => getDailyQuestions(challengeDate));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [questionScore, setQuestionScore] = useState<number>(0);
  const [totalGameScore, setTotalGameScore] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answers, setAnswers] = useState<Array<{ question: string; score: number; distance: number }>>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [perfectGuessCount, setPerfectGuessCount] = useState<number>(0);
  const mapRef = useRef<any>(null);
  const [mapStyleId, setMapStyleId] = useState('voyager');
   
      useEffect(() => {
        const savedStyle = localStorage.getItem('mapStyle');
        if (savedStyle) {
          setMapStyleId(savedStyle);
        }
      }, []);
  
    const { dailyCompleted, completeDaily, checkStreak } = useGameStore();
  const currentQuestion = dailyQuestions[currentQuestionIndex];

  // Create line GeoJSON when showing result
  const lineGeoJSON = showResult && userGuess ? {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [userGuess.lng, userGuess.lat],
        [currentQuestion.lng, currentQuestion.lat]
      ]
    }
  } : null;

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
    setTotalDistance(prev => prev + dist);
    if (dist < 25) setPerfectGuessCount(prev => prev + 1);
    setAnswers(prev => [...prev, {
      question: currentQuestion.text,
      score,
      distance: dist
    }]);
    setShowResult(true);

    // Center map between the two points with appropriate zoom
    if (mapRef.current) {
      const centerLng = (userGuess.lng + currentQuestion.lng) / 2;
      const centerLat = (userGuess.lat + currentQuestion.lat) / 2;
      
      // Calculate appropriate zoom based on distance
      // Closer guesses get higher zoom, farther guesses get lower zoom
      let zoom;
      if (dist < 100) zoom = 6;        // Very close: city level
      else if (dist < 500) zoom = 5;   // Close: regional level
      else if (dist < 1500) zoom = 4;  // Medium: country level
      else if (dist < 3000) zoom = 3;  // Far: multi-country level
      else zoom = 2;                   // Very far: continental level
      
      mapRef.current.flyTo({
        center: [centerLng, centerLat],
        zoom: zoom,
        duration: 1500
      });
    }

    toast.success(`${Math.round(dist)} km away! +${score} points`, {
      position: 'top-center'
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < dailyQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserGuess(null);
      setShowResult(false);
      setDistance(0);
      setQuestionScore(0);
      
      // Reset map to initial view
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [15, 45],
          zoom: 2,
          duration: 1000
        });
      }
    } else {
      completeDaily(totalGameScore, totalDistance, perfectGuessCount);
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
    setTotalDistance(0);
    setPerfectGuessCount(0);
  };

  const isArchiveMode = selectedDate !== null && selectedDate !== undefined;
  const isToday = !isArchiveMode || selectedDate === getDateString(new Date());

  if (dailyCompleted && !gameCompleted && isToday) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="text-8xl mb-8">🏆</div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800 font-[Caveat]">
            You've already played today!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Come back tomorrow for a new challenge and continue your streak!
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" className="rounded-full" onClick={resetGame}>
              Play again (demo)
            </Button>
            {onBack && (
              <Button size="lg" variant="outline" className="rounded-full" onClick={onBack}>
                Back to Archive
              </Button>
            )}
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
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white text-center py-10">
              <div className="text-7xl mb-6">
                {totalGameScore >= 9000 ? '🔥' : totalGameScore >= 8000 ? '🏆' : totalGameScore >= 7000 ? '⭐' : '🎯'}
              </div>
              <CardTitle className="text-5xl md:text-6xl font-bold mb-4 font-[Caveat]">Challenge Complete!</CardTitle>
              <p className="text-2xl opacity-90">{totalGameScore} / 10000 points</p>
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
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="rounded-full" size="sm">
                <X className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">GeoArena</h1>
                <p className="text-xs text-gray-500">
                  {isArchiveMode ? challengeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Daily Challenge'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">{totalGameScore}</span>
            </div>
            <Badge variant="outline" className="rounded-full">
              {currentQuestionIndex + 1} / {dailyQuestions.length}
            </Badge>

            {/* Map Style Selector */}
            <DropdownMenu className="relative">
              <DropdownMenuTrigger className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{getMapStyleById(mapStyleId).name}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white border rounded-md shadow-lg p-1">
                {MAP_STYLES.map(style => (
                  <DropdownMenuItem
                    key={style.id}
                    onClick={() => {
                      setMapStyleId(style.id);
                      saveMapStylePreference(style.id);
                    }}
                    className={"flex items-center gap-2 px-3 py-2 text-sm " + (mapStyleId === style.id ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100")}
                  >
                    <div className="w-5 h-5 flex-shrink-0">
                      {style.id === 'satellite' && (
                        <div className="bg-gray-200 w-4 h-4 rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                      {style.id === 'dark-matter' && (
                        <div className="bg-gray-800 w-4 h-4 rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {style.id === 'positron' && (
                        <div className="bg-gray-100 w-4 h-4 rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                      {style.id === 'terrain' && (
                        <div className="bg-green-100 w-4 h-4 rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-green-600" />
                        </div>
                      )}
                      {style.id === 'voyager' && (
                        <div className="bg-blue-100 w-4 h-4 rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <span className="flex-1">{style.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-3 sm:p-4 max-h-[38vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-primary/20 shadow-md rounded-2xl">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-lg sm:text-xl font-bold text-gray-800 leading-snug">
                      {currentQuestion.text}
                    </p>
                    {currentQuestion.hint && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">💡 {currentQuestion.hint}</p>
                    )}
                  </div>
                  <Badge className="rounded-full bg-gradient-to-r from-primary to-secondary text-xs shrink-0">
                    {currentQuestion.category}
                  </Badge>
                </div>
                
                {showResult && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1"
                  >
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-green-800">
                          {Math.round(distance)} km away
                        </p>
                        <p className="text-xs font-semibold text-green-600">+{questionScore} points</p>
                      </div>
                      <div className="text-3xl">
                        {questionScore >= 900 ? '🎯' : questionScore >= 600 ? '👍' : '📍'}
                      </div>
                    </div>
                    
                    {/* Interesting Facts */}
                    {currentQuestion.facts && currentQuestion.facts.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-900 mb-1">✨ Did you know?</p>
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

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 15,
            latitude: 45,
            zoom: 2
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={getMapStyleById(mapStyleId).url}
          onClick={handleMapClick}
        >
          {/* Line connecting guess to actual location */}
          {lineGeoJSON && (
            <CleanSource id="line" type="geojson" data={lineGeoJSON}>
              <Layer
                id="line-layer"
                type="line"
                paint={{
                  'line-color': '#ef4444',
                  'line-width': 3,
                  'line-dasharray': [2, 2]
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
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
          {!showResult && userGuess && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <Button
                onClick={handleSubmitGuess}
                size="lg"
                className="rounded-full shadow-2xl font-bold px-8 py-3 h-12 bg-primary hover:bg-primary/90 text-white cursor-pointer"
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
                className="rounded-full shadow-2xl font-bold px-8 py-3 h-12 bg-primary hover:bg-primary/90 text-white cursor-pointer"
              >
                {currentQuestionIndex < dailyQuestions.length - 1 ? 'Next Question' : 'Finish'}
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
