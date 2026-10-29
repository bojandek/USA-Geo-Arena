import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/lib/game-store';
import { parseDateKey } from '@/lib/date-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import Seo from '@/components/Seo';
import { formatPoints } from '@/lib/game-data';
import GlobalLeaderboard from '@/components/GlobalLeaderboard';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { getLeaderboard, gamesPlayed } = useGameStore();

  const topScores = getLeaderboard();

  return (
    <>
      <Seo
        title="Your Scores"
        description="Your best USA GeoArena rounds, ranked by score. See how close you came on every day you played."
        path="/leaderboard"
      />
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4">
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
              Personal Leaderboard
            </h1>
            <p className="text-lg text-gray-600">Your top 10 daily scores</p>
          </div>
        </div>

        {topScores.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-6">🎯</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 font-script mb-3">
              No scores yet!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Complete your first daily challenge to see your scores here
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="rounded-full px-8"
            >
              Start Playing
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {topScores.map((result, idx) => {
              const isTop3 = idx < 3;
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className={`rounded-2xl transition-all ${
                      isTop3 
                        ? 'border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg' 
                        : 'border border-gray-200'
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="text-center min-w-[60px]">
                          {medal ? (
                            <div className="text-4xl">{medal}</div>
                          ) : (
                            <div className="text-2xl font-bold text-gray-400">
                              #{idx + 1}
                            </div>
                          )}
                        </div>

                        {/* Date & Accuracy */}
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {parseDateKey(result.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className="rounded-full text-xs"
                            >
                              {result.accuracy}% accuracy
                            </Badge>
                            {result.score >= 900 && (
                              <span className="text-xl">🔥</span>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {formatPoints(result.score)}
                          </p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* The board of everybody, next to the player's own board. */}
        <div className="mt-8">
          <GlobalLeaderboard region="usa" />
        </div>

        {/* Stats Summary */}
        {topScores.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="rounded-2xl border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-script">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <Award className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                    <p className="text-2xl font-bold text-gray-800">
                      {formatPoints(topScores[0]?.score ?? 0)}
                    </p>
                    <p className="text-xs text-gray-600">Best Score</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <Medal className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold text-gray-800">
                      {gamesPlayed}
                    </p>
                    <p className="text-xs text-gray-600">Total Games</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <Trophy className="w-6 h-6 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold text-gray-800">
                      {topScores.filter(s => s.accuracy >= 80).length}
                    </p>
                    <p className="text-xs text-gray-600">80%+ Games</p>
                  </div>
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
