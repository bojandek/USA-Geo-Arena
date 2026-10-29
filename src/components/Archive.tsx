import { motion } from 'framer-motion';
import { Calendar, Trophy, ArrowLeft, Play, Lock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { formatDayLabel, parseDateKey, todayKey } from '@/lib/date-utils';
import { formatPoints } from '@/lib/game-data';
import { DEFAULT_REGION, getRegion, REGIONS, type RegionId } from '@/lib/regions';

interface ArchiveProps {
  /** Which region's results are shown. */
  region?: RegionId;
  onBack?: () => void;
  onSelectDate: (date: string) => void;
  /** Called when the player picks a different region. */
  onSelectRegion?: (region: RegionId) => void;
}

export default function Archive({ region = DEFAULT_REGION, onBack, onSelectDate, onSelectRegion }: ArchiveProps) {
  const { getArchive } = useGameStore();
  const today = todayKey();
  const regionConfig = getRegion(region);

  // Real history - the archive used to show random mock scores.
  const entries = getArchive(30, region);

  const getScoreColor = (score: number) => {
    if (score >= 900) return 'text-yellow-500';
    if (score >= 800) return 'text-green-500';
    if (score >= 700) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 900) return '🔥';
    if (score >= 800) return '🏆';
    if (score >= 700) return '⭐';
    return '🎯';
  };

  const playedCount = entries.filter((entry) => entry.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4 rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-script mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Challenge Archive
            </h1>
            <p className="text-lg text-gray-600">
              {playedCount} of {entries.length} days played · replay any past challenge
            </p>

            {/* The archive holds one result per day per region, so the region
                has to be picked here as well. */}
            {onSelectRegion && (
              <div className="mt-6 inline-flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-md">
                {REGIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectRegion(item.id)}
                    aria-pressed={item.id === region}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      item.id === region
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="leading-none">{item.emoji}</span>
                    {item.shortLabel}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 text-sm text-gray-500">
              Showing the {regionConfig.label.toLowerCase()} round
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardTitle className="text-2xl font-script">Last 30 days</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {entries.map((entry, index) => {
                  const isToday = entry.date === today;
                  const date = parseDateKey(entry.date);

                  return (
                    <motion.div
                      key={entry.date}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.02 }}
                      className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                        entry.locked ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-600">
                              {date.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="text-xl font-bold text-gray-800">{date.getDate()}</div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 text-lg truncate">
                              {formatDayLabel(entry.date, today)}
                            </h3>
                            {entry.completed && (
                              <Badge
                                variant="outline"
                                className="rounded-full text-xs bg-green-50 text-green-700 border-green-300"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          {entry.score !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Score:</span>
                              <span className={`text-lg font-bold ${getScoreColor(entry.score)}`}>
                                {formatPoints(entry.score)} {getScoreEmoji(entry.score)}
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              {isToday ? 'Play today’s challenge' : 'Not played yet'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        {entry.locked ? (
                          <Button variant="ghost" disabled className="rounded-full">
                            <Lock className="w-5 h-5" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => onSelectDate(entry.date)}
                            className="rounded-full"
                            variant={entry.completed ? 'outline' : 'default'}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {entry.completed ? 'Replay' : 'Play'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Info card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-2 border-yellow-200 bg-yellow-50/60 rounded-2xl">
            <CardContent className="p-6 flex items-start gap-4">
              <Trophy className="w-8 h-8 text-yellow-500 shrink-0" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">How replay works</h3>
                <p className="text-gray-600 text-sm">
                  Every day has the same 10 questions for all players. Replaying a past day
                  updates that day&apos;s score in your archive — it never changes your streak
                  or your total points, so your daily record stays honest.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

