import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Trophy, Award, BarChart3, X, Calendar, Sparkles } from 'lucide-react';
import GameModeCard from '@/components/GameModeCard';
import DailyChallenge from '@/components/DailyChallenge';
import PracticeMode from '@/components/PracticeMode';
import BattleMode from '@/components/BattleMode';
import Archive from '@/components/Archive';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/lib/game-store';

type Page = 'home' | 'modes' | 'daily' | 'practice' | 'battle' | 'archive';

const Index = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showStreakReward, setShowStreakReward] = useState(false);
  const { streak, level, totalScore, gamesPlayed } = useGameStore();

  // Check for streak rewards on mount
  useEffect(() => {
    const lastShown = localStorage.getItem('last-streak-shown');
    const today = new Date().toISOString().split('T')[0];
    
    if (streak > 0 && lastShown !== today && gamesPlayed > 0) {
      setShowStreakReward(true);
      localStorage.setItem('last-streak-shown', today);
    }
  }, [streak, gamesPlayed]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pb-24">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 260,
                    damping: 20
                  }}
                  className="inline-block mb-8"
                >
                  <div className="relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-[2rem] flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-12 transition-transform duration-300">
                      <span className="text-6xl">🌍</span>
                    </div>
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Trophy className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-6xl sm:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent tracking-tight"
                >
                  GeoArena
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg sm:text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium"
                >
                  Guess sports locations around the world! Test your knowledge and compete with others.
                </motion.p>

                {/* User Stats Card */}
                {totalScore > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-md mx-auto mb-10"
                  >
                    <Card className="border-0 rounded-3xl shadow-medium hover:shadow-hard transition-all duration-300 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-black text-orange-600 mb-1">{level}</div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Level</p>
                          </div>
                          <div className="text-center border-x border-gray-200">
                            <div className="text-4xl font-black text-red-600 mb-1">{streak}</div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Streak 🔥</p>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-black text-pink-600 mb-1">{totalScore.toLocaleString()}</div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Points</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={() => setCurrentPage('modes')}
                    size="lg"
                    className="text-lg sm:text-xl px-10 sm:px-14 py-6 sm:py-8 rounded-full shadow-hard hover:shadow-glow hover:scale-105 transition-all duration-300 font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Trophy className="w-6 h-6 mr-3" />
                    Start Playing
                  </Button>
                </motion.div>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="border-0 rounded-3xl overflow-hidden shadow-medium hover:shadow-hard transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="text-7xl mb-6 inline-block">🎯</div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">Daily Challenge</h3>
                      <p className="text-gray-700 leading-relaxed">
                        10 new questions every day. Earn up to 10,000 points!
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="border-0 rounded-3xl overflow-hidden shadow-medium hover:shadow-hard transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="text-7xl mb-6 inline-block">⚔️</div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">Battle Mode</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Compete against other players in real-time!
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="sm:col-span-2 lg:col-span-1"
                >
                  <Card className="border-0 rounded-3xl overflow-hidden shadow-medium hover:shadow-hard transition-all duration-300 bg-gradient-to-br from-yellow-50 to-amber-100 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="text-7xl mb-6 inline-block">🔥</div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">Streaks & Levels</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Play every day and unlock achievements!
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        );

      case 'modes':
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4 pb-24">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage('home')}
                  className="mb-4 rounded-full"
                >
                  <X className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Choose Game Mode
                </h2>
                <p className="text-gray-600 text-lg">
                  Which challenge do you want today?
                </p>
              </motion.div>

              {/* Game Modes */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <GameModeCard
                  title="Daily Challenge"
                  description="10 questions about sports locations. New questions every day at midnight!"
                  icon="daily"
                  difficulty="medium"
                  badge="Popular"
                  onSelect={() => setCurrentPage('daily')}
                />

                <GameModeCard
                  title="Battle Mode"
                  description="Compete against other players in 3 fast rounds. Who's more accurate?"
                  icon="battle"
                  difficulty="hard"
                  onSelect={() => setCurrentPage('battle')}
                />

                <GameModeCard
                  title="Practice Mode"
                  description="Practice without limits. Perfect for learning new locations."
                  icon="practice"
                  difficulty="easy"
                  onSelect={() => setCurrentPage('practice')}
                />
              </motion.div>

              {/* Archive Button */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-6"
              >
                <Button
                  onClick={() => setCurrentPage('archive')}
                  variant="outline"
                  className="w-full h-auto py-4 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    <div className="text-left flex-1">
                      <div className="font-bold text-gray-800">Challenge Archive</div>
                      <div className="text-sm text-gray-600">Replay past daily challenges</div>
                    </div>
                  </div>
                </Button>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Card className="border-2 rounded-3xl">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-4">
                      Your Progress Today
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-800">0/1</div>
                        <p className="text-xs text-gray-600">Daily Challenge</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-800">0</div>
                        <p className="text-xs text-gray-600">Battle Wins</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-800">{streak}</div>
                        <p className="text-xs text-gray-600">Day Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case 'daily':
        return <DailyChallenge selectedDate={selectedDate} onBack={() => {
          setSelectedDate(null);
          setCurrentPage('modes');
        }} />;
      case 'practice':
        return <PracticeMode onBack={() => setCurrentPage('modes')} />;
      case 'battle':
        return <BattleMode onExit={() => setCurrentPage('modes')} />;
      case 'archive':
        return <Archive onBack={() => setCurrentPage('modes')} onSelectDate={(date) => {
          setSelectedDate(date);
          setCurrentPage('daily');
        }} />;
      default:
        return null;
    }
  };

  // Hide nav for game pages
  const showNav = ['home', 'modes'].includes(currentPage);

  return (
    <div className="min-h-screen">
      {renderPage()}
      
      {/* Bottom Navigation */}
      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-4 gap-2 py-3">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('home')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <Home className="w-5 h-5 mb-1" />
                <span className="text-xs">Home</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/stats')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <BarChart3 className="w-5 h-5 mb-1" />
                <span className="text-xs">Stats</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/leaderboard')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <Trophy className="w-5 h-5 mb-1" />
                <span className="text-xs">Scores</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/achievements')}
                className="flex-col h-auto py-2 rounded-xl"
              >
                <Award className="w-5 h-5 mb-1" />
                <span className="text-xs">Badges</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Streak Reward Modal */}
      <AnimatePresence>
        {showStreakReward && streak > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStreakReward(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <Card className="border-4 border-orange-300 rounded-3xl shadow-2xl bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-8xl mb-4"
                  >
                    🔥
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {streak} Day Streak!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You're on fire! Keep playing daily to maintain your streak.
                  </p>
                  
                  {streak >= 7 && (
                    <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-2xl">
                      <Sparkles className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                      <p className="text-sm font-semibold text-yellow-800">
                        Bonus: +{streak * 10} points
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => setShowStreakReward(false)}
                    size="lg"
                    className="rounded-full w-full"
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
