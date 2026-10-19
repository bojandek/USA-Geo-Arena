import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Award, BarChart3, Calendar, Sparkles, Flame, Target, Zap, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/lib/game-store';
import AdSlot from '@/components/AdSlot';
import { todayKey } from '@/lib/date-utils';

interface ModeCard {
  to: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  gradient: string;
  badge?: string;
}

const MODE_CARDS: ModeCard[] = [
  {
    to: '/daily',
    title: 'Daily Challenge',
    description: '10 questions, the same for everyone. Keep your streak alive.',
    icon: Trophy,
    gradient: 'from-orange-400 to-red-500',
    badge: 'Every day',
  },
  {
    to: '/practice',
    title: 'Practice',
    description: 'Train without pressure. Practice never affects your score.',
    icon: Target,
    gradient: 'from-green-400 to-emerald-500',
    badge: 'Unlimited',
  },
  {
    to: '/battle',
    title: 'Battle',
    description: '3 rounds against a rival. 30 seconds per question.',
    icon: Zap,
    gradient: 'from-blue-400 to-purple-500',
    badge: '3 rounds',
  },
  {
    to: '/archive',
    title: 'Archive',
    description: 'Replay any past day and improve your old scores.',
    icon: Calendar,
    gradient: 'from-yellow-400 to-amber-500',
  },
];

const Index = () => {
  const { streak, level, totalScore, gamesPlayed, isTodayCompleted, dailyHistory } = useGameStore();
  const [showStreakReward, setShowStreakReward] = useState(false);

  // Show the streak celebration once per day, and only for a real streak.
  useEffect(() => {
    const lastShown = localStorage.getItem('last-streak-shown');
    const today = todayKey();

    if (streak > 1 && lastShown !== today && gamesPlayed > 0) {
      setShowStreakReward(true);
      localStorage.setItem('last-streak-shown', today);
    }
  }, [streak, gamesPlayed]);

  const bestScore = dailyHistory.reduce((max, entry) => Math.max(max, entry.score), 0);

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="inline-block mb-8"
          >
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-[2rem] flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-12 transition-transform duration-300">
                <span className="text-6xl">🌍</span>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-5xl md:text-7xl font-bold font-script mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent"
          >
            GeoArena
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Think you know the place? Click the map, guess the location, and climb the
            leaderboard.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button asChild size="lg" className="rounded-full px-8 h-14 text-lg font-semibold shadow-xl">
              <Link to="/daily">
                <Play className="w-5 h-5 mr-2" />
                {isTodayCompleted ? 'Replay today’s challenge' : 'Play today’s challenge'}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-14 text-lg font-semibold"
            >
              <Link to="/practice">Free practice</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16"
        >
          <Card className="border-2 border-orange-200 bg-white/70 backdrop-blur-sm text-center">
            <CardContent className="p-5">
              <Flame className="w-7 h-7 mx-auto mb-2 text-orange-500" />
              <p className="text-3xl font-bold text-gray-800">{streak}</p>
              <p className="text-xs text-gray-500">Day streak</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-yellow-200 bg-white/70 backdrop-blur-sm text-center">
            <CardContent className="p-5">
              <Trophy className="w-7 h-7 mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-bold text-gray-800">{totalScore.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total score</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200 bg-white/70 backdrop-blur-sm text-center">
            <CardContent className="p-5">
              <BarChart3 className="w-7 h-7 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold text-gray-800">{bestScore.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Best score</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 bg-white/70 backdrop-blur-sm text-center">
            <CardContent className="p-5">
              <Award className="w-7 h-7 mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold text-gray-800">Level {level}</p>
              <p className="text-xs text-gray-500">{gamesPlayed} played</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-3xl md:text-4xl font-bold font-script text-gray-800 mb-2"
          >
            Choose a category
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-center text-gray-600 mb-10"
          >
            Four ways to play — every one of them is in the menu at the top of the page.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-5">
            {MODE_CARDS.map((mode, index) => (
              <motion.div
                key={mode.to}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.08 }}
              >
                <Link to={mode.to} className="block h-full">
                  <Card className="h-full border-2 border-primary/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all group">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${mode.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}
                      >
                        <mode.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-script">
                            {mode.title}
                          </h3>
                          {mode.badge && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                              {mode.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{mode.description}</p>
                        <span className="inline-flex items-center text-primary font-semibold text-sm">
                          <Play className="w-4 h-4 mr-1" />
                          Play now
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot slot="home" className="pb-8" />
      </div>

      {/* Streak Reward Modal */}
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
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full"
          >
            <Card className="border-4 border-orange-300 rounded-3xl shadow-2xl bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-9xl mb-6"
                >
                  🔥
                </motion.div>
                <h2 className="text-5xl md:text-6xl font-script font-bold text-gray-800 mb-4">
                  {streak} Day Streak!
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  You&apos;re on fire! Keep playing daily to maintain your streak.
                </p>

                {streak >= 7 && (
                  <div className="mb-6 p-5 bg-yellow-100 border-2 border-yellow-300 rounded-2xl">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
                    <p className="text-xl font-script font-bold text-yellow-800">
                      Bonus: +{Math.min(streak * 2, 200)} points
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
    </div>
  );
};

export default Index;

