import { motion } from 'framer-motion';
import { Trophy, Target, Flame, TrendingUp, Award, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/lib/game-store';

export default function Profile() {
  const { 
    level, 
    totalScore, 
    streak, 
    badges, 
    gamesPlayed, 
    bestScore, 
    averageScore 
  } = useGameStore();

  const nextLevelScore = level * 5000;
  const progressToNextLevel = ((totalScore % 5000) / 5000) * 100;

  // Demo badges
  const allBadges = [
    { id: 'first-win', name: 'First Step', icon: '🎯', unlocked: badges.includes('first-win') },
    { id: 'perfect-5', name: 'Perfect Five', icon: '⭐', unlocked: badges.includes('perfect-5') },
    { id: 'streak-7', name: '7 Day Streak', icon: '🔥', unlocked: badges.includes('streak-7') },
    { id: 'streak-30', name: '30 Day Streak', icon: '💎', unlocked: badges.includes('streak-30') },
    { id: 'europe-master', name: 'Master of Europe', icon: '🌍', unlocked: badges.includes('europe-master') },
    { id: 'world-master', name: 'World Master', icon: '🌎', unlocked: badges.includes('world-master') },
    { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', unlocked: badges.includes('speed-demon') },
    { id: 'sharp-shooter', name: 'Sharp Eye', icon: '🎪', unlocked: badges.includes('sharp-shooter') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card className="border-2 border-primary/20 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30"
              >
                <Trophy className="w-14 h-14" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-lg px-4 py-1 rounded-full">
                Level {level}
              </Badge>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Progress to level {level + 1}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {totalScore % 5000} / 5000
                  </span>
                </div>
                <Progress value={progressToNextLevel} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-2xl">
                  <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-gray-800">{totalScore.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">Total Points</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-2xl">
                  <Flame className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-gray-800">{streak}</div>
                  <p className="text-xs text-gray-600">Day Streak</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-gray-800">{gamesPlayed}</div>
                  <p className="text-xs text-gray-600">Games Played</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-2xl">
                  <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-gray-800">{badges.length}</div>
                  <p className="text-xs text-gray-600">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-gray-200 rounded-3xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MapPin className="w-6 h-6 text-primary" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Best Score</p>
                  <p className="text-2xl font-bold text-gray-800">{bestScore}</p>
                </div>
                <Trophy className="w-10 h-10 text-green-600" />
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-gray-800">{averageScore}</p>
                </div>
                <Target className="w-10 h-10 text-blue-600" />
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Longest Streak</p>
                  <p className="text-2xl font-bold text-gray-800">{streak} days</p>
                </div>
                <Flame className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-gray-200 rounded-3xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="w-6 h-6 text-primary" />
                Badges ({badges.length}/{allBadges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`text-center p-4 rounded-2xl border-2 transition-all ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
                        : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                  >
                    <div className={`text-4xl mb-2 ${badge.unlocked ? '' : 'grayscale'}`}>
                      {badge.icon}
                    </div>
                    <p className={`text-xs font-medium ${badge.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                      {badge.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
