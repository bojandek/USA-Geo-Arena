import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore, ALL_ACHIEVEMENTS } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock } from 'lucide-react';

export default function Achievements() {
  const navigate = useNavigate();
  const { achievements } = useGameStore();

  const unlockedIds = achievements.map(a => a.id);
  const unlockedCount = achievements.length;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
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
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 font-script mb-2">
              Achievements
            </h1>
            <p className="text-lg text-gray-600">
              Unlocked {unlockedCount} of {totalCount} ({progressPercentage}%)
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_ACHIEVEMENTS.map((achievement, idx) => {
            const isUnlocked = unlockedIds.includes(achievement.id);
            const unlockedAchievement = achievements.find(a => a.id === achievement.id);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className={`rounded-2xl transition-all ${
                    isUnlocked 
                      ? 'border-2 border-primary/30 bg-gradient-to-br from-white to-primary/5 shadow-lg' 
                      : 'border border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`text-5xl ${!isUnlocked && 'grayscale opacity-40'}`}>
                        {isUnlocked ? achievement.icon : <Lock className="w-12 h-12 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-gray-800">{achievement.title}</h3>
                          {isUnlocked && (
                            <Badge variant="default" className="rounded-full text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {achievement.description}
                        </p>
                        {unlockedAchievement?.unlockedAt && (
                          <p className="text-xs text-gray-500">
                            Unlocked {new Date(unlockedAchievement.unlockedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Motivational Footer */}
        {unlockedCount < totalCount && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <Card className="rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <p className="text-2xl md:text-3xl font-script text-gray-800 mb-2">
                  Keep Playing! 🎯
                </p>
                <p className="text-base text-gray-600">
                  {totalCount - unlockedCount} more achievements waiting to be unlocked
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
