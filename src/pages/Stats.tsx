import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/lib/game-store';
import { parseDateKey } from '@/lib/date-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Seo from '@/components/Seo';
import { MAX_DAILY_SCORE, pointsForLevel } from '@/lib/game-state';
import { formatPoints } from '@/lib/game-data';
import { ArrowLeft, Target, Trophy, TrendingUp, MapPin, Award, Calendar, Flame, Zap, Snowflake } from 'lucide-react';
import StreakCalendar from '@/components/StreakCalendar';

export default function Stats() {
  const navigate = useNavigate();
  const {
    totalScore, 
    gamesPlayed, 
    bestScore, 
    averageScore,
    averageDistance,
    perfectGuesses,
    streak,
    level,
    dailyHistory,
    practiceGames,
    practiceBestScore,
    bestTimeBonus,
    streakFreezes,
  } = useGameStore();

  // The average score includes the speed share, but accuracy does not - it is
  // how close the guesses were, which is what the label promises.
  const accuracy = averageScore ? Math.round((averageScore / MAX_DAILY_SCORE) * 100) : 0;
  // The cost of a level grows with the level number, so the progress bar
  // shows the progress inside the current level.
  const levelFloor = pointsForLevel(level);
  const nextLevelScore = pointsForLevel(level + 1);
  const progressToNextLevel =
    nextLevelScore > levelFloor
      ? ((totalScore - levelFloor) / (nextLevelScore - levelFloor)) * 100
      : 0;

  return (
    <>
      <Seo
        title="Your Game Stats"
        description="Your USA GeoArena statistics: total score, best round, average distance, perfect guesses, current streak and level."
        path="/stats"
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-white/60"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 font-script mb-2">
              Your Statistics
            </h1>
            <p className="text-lg text-gray-600">Track your progress and achievements</p>
          </div>
        </div>

        {/* Level Progress */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-2 border-primary/20 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Level</p>
                  <p className="text-4xl md:text-5xl font-bold text-primary font-script">Level {level}</p>
                </div>
                <div className="text-7xl">
                  {level >= 20 ? '👑' : level >= 10 ? '🏆' : level >= 5 ? '⭐' : '🎯'}
                </div>
              </div>
              <Progress value={progressToNextLevel} className="h-3 mb-2" />
              <p className="text-sm text-gray-600">
                {formatPoints(Math.max(0, totalScore - levelFloor))} /{' '}
                {formatPoints(nextLevelScore - levelFloor)} points to Level {level + 1}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-2xl border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-gray-800">{formatPoints(totalScore)}</p>
                <p className="text-xs text-gray-600">Total Score</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="rounded-2xl border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-gray-800">{gamesPlayed}</p>
                <p className="text-xs text-gray-600">Games Played</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-2xl border-2 border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-gray-800">{accuracy}%</p>
                <p className="text-xs text-gray-600">Avg Accuracy</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="rounded-2xl border-2 border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-gray-800">{streak}</p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* The last thirteen weeks as a grid of days. A streak is a number
            until you can see it. */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38 }}
        >
          <Card className="mb-6 rounded-2xl border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-script">
                <Calendar className="w-6 h-6" />
                Your Last 13 Weeks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StreakCalendar history={dailyHistory} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6 rounded-2xl border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-script">
                <TrendingUp className="w-6 h-6" />
                Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">Best Score</span>
                </div>
                <Badge variant="default" className="rounded-full">
                  {formatPoints(bestScore)} pts
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Average Score</span>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {formatPoints(averageScore)} pts
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Average Distance</span>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {averageDistance} km
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">Perfect Guesses</span>
                </div>
                <Badge variant="default" className="rounded-full">
                  {perfectGuesses} × &lt; 25km
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium">Best Speed Bonus</span>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {bestTimeBonus} pts
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Snowflake className="w-5 h-5 text-sky-500" />
                  <span className="text-sm font-medium">Streak Freezes</span>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {streakFreezes} ❄️
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Battle Rounds</span>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {practiceGames} ({formatPoints(practiceBestScore)} best)
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent History */}
        {dailyHistory.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="rounded-2xl border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl font-script">Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dailyHistory.slice(-10).reverse().map((result, idx) => (
                    <div 
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {parseDateKey(result.date).toLocaleDateString('en-US', {
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500">{result.accuracy}% accuracy</p>
                      </div>
                      <Badge 
                        variant={result.score >= 8000 ? 'default' : 'secondary'}
                        className="rounded-full"
                      >
                        {formatPoints(result.score)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      </div>
    </>
  );
}
