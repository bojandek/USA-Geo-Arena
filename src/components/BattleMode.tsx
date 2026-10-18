import { useState, useEffect } from 'react';
import Map, { Marker, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Timer, Trophy, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  sampleQuestions, 
  calculateDistance, 
  calculateScore,
  type Question 
} from '@/lib/game-data';
import { toast } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';

interface BattleModeProps {
  onExit: () => void;
}

export default function BattleMode({ onExit }: BattleModeProps) {
  const [phase, setPhase] = useState<'searching' | 'countdown' | 'playing' | 'result'>('searching');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(sampleQuestions[0]);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [round, setRound] = useState(1);
  const maxRounds = 3;

  // Opponent data (simulirano)
  const opponentName = 'Marko P.';
  const opponentCountry = '🇭🇷';

  useEffect(() => {
    // Simulacija pronalaženja protivnika
    if (phase === 'searching') {
      const timer = setTimeout(() => {
        toast.success(`Opponent found: ${opponentName}!`);
        setPhase('countdown');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    // Countdown pre početka
    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'countdown' && countdown === 0) {
      setPhase('playing');
      setTimeLeft(30);
    }
  }, [phase, countdown]);

  useEffect(() => {
    // Timer tokom igranja
    if (phase === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'playing' && timeLeft === 0) {
      handleTimeout();
    }
  }, [phase, timeLeft]);

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (phase !== 'playing' || userGuess) return;
    
    const { lat, lng } = event.lngLat;
    setUserGuess({ lat, lng });
  };

  const handleSubmit = () => {
    if (!userGuess) return;

    const dist = calculateDistance(
      userGuess.lat,
      userGuess.lng,
      currentQuestion.lat,
      currentQuestion.lng
    );

    const score = calculateScore(dist);
    setPlayerScore(prev => prev + score);

    // Simuliraj protivnikov odgovor
    const opponentDist = Math.random() * 3000;
    const opponentRoundScore = calculateScore(opponentDist);
    setOpponentScore(prev => prev + opponentRoundScore);

    toast.success(`+${score} points!`);

    setTimeout(() => {
      if (round < maxRounds) {
        // Sledeća runda
        setRound(round + 1);
        setCurrentQuestion(sampleQuestions[round]);
        setUserGuess(null);
        setTimeLeft(30);
      } else {
        // Kraj igre
        setPhase('result');
      }
    }, 2000);
  };

  const handleTimeout = () => {
    toast.error('Time is up!');
    
    // Simuliraj protivnikov odgovor
    const opponentDist = Math.random() * 3000;
    const opponentRoundScore = calculateScore(opponentDist);
    setOpponentScore(prev => prev + opponentRoundScore);

    setTimeout(() => {
      if (round < maxRounds) {
        setRound(round + 1);
        setCurrentQuestion(sampleQuestions[round]);
        setUserGuess(null);
        setTimeLeft(30);
      } else {
        setPhase('result');
      }
    }, 2000);
  };

  // Searching Screen
  if (phase === 'searching') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 mx-auto mb-6"
          >
            <Users className="w-24 h-24 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Looking for opponent...
          </h2>
          <p className="text-gray-600">This may take a few seconds</p>
          <Button onClick={onExit} variant="ghost" className="mt-6">
            Cancel
          </Button>
        </motion.div>
      </div>
    );
  }

  // Countdown Screen
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-white">TI</span>
              </div>
              <p className="font-semibold text-gray-800">Ti</p>
            </div>
            
            <Zap className="w-12 h-12 text-yellow-500" />
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">{opponentCountry}</span>
              </div>
              <p className="font-semibold text-gray-800">{opponentName}</p>
            </div>
          </div>

          <motion.div
            key={countdown}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-9xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            {countdown}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Result Screen
  if (phase === 'result') {
    const won = playerScore > opponentScore;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className={`text-white text-center py-12 ${
              won 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-gray-500 to-gray-600'
            }`}>
              <div className="text-8xl mb-4">{won ? '🏆' : '💪'}</div>
              <CardTitle className="text-4xl font-bold mb-2">
                {won ? 'Victory!' : 'Defeat'}
              </CardTitle>
              <p className="text-xl opacity-90">
                {won ? 'Congratulations, you won!' : 'Better luck next time!'}
              </p>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-6 rounded-2xl text-center ${
                  won ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'
                }`}>
                  <p className="text-sm text-gray-600 mb-2">Ti</p>
                  <p className="text-4xl font-bold text-gray-800">{playerScore}</p>
                </div>
                <div className={`p-6 rounded-2xl text-center ${
                  !won ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                }`}>
                  <p className="text-sm text-gray-600 mb-2">{opponentName}</p>
                  <p className="text-4xl font-bold text-gray-800">{opponentScore}</p>
                </div>
              </div>

              {/* Rounds */}
              <div>
                <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-3">
                  Rounds
                </h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Round {r}</span>
                      <div className="flex gap-2">
                        <Badge variant={r <= round ? 'default' : 'outline'} className="rounded-full">
                          Complete
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={onExit} size="lg" className="flex-1 rounded-full font-semibold">
                  Back
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                >
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Timer className="w-5 h-5" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>

            {/* Round */}
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
              Round {round}/{maxRounds}
            </Badge>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm opacity-80">Ti</p>
              <p className="text-2xl font-bold">{playerScore}</p>
            </div>
            <div className="text-3xl">⚔️</div>
            <div className="text-left">
              <p className="text-sm opacity-80">{opponentName}</p>
              <p className="text-2xl font-bold">{opponentScore}</p>
            </div>
          </div>

          <Button onClick={onExit} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Question */}
      <div className="p-4">
        <motion.div
          key={round}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl mx-auto"
        >
          <Card className="border-2 border-purple-200 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <p className="text-2xl font-bold text-gray-800">
                {currentQuestion.text}
              </p>
              {currentQuestion.hint && (
                <p className="text-sm text-gray-500 mt-2">💡 {currentQuestion.hint}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
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
                className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg"
              />
            </Marker>
          )}
        </Map>

        {/* Submit Button */}
        {userGuess && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <Button
                onClick={handleSubmit}
                size="lg"
                className="rounded-full shadow-2xl font-semibold px-8 bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <Zap className="w-5 h-5 mr-2" />
                Submit Answer
              </Button>
            </motion.div>
          </div>
        )}

        {/* Instructions */}
        {!userGuess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-6 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                ⚡ Quick! Click on the map before time runs out
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
