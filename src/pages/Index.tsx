import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Award, BarChart3, Calendar, Sparkles, Flame, Zap, Play, Flag, Globe, Target, Wand2, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/lib/game-store';
import AdSlot from '@/components/AdSlot';
import NewsletterSignup from '@/components/NewsletterSignup';
import Seo from '@/components/Seo';
import { NEWSLETTER_COPY, NEWSLETTER_ENABLED } from '@/lib/newsletter';
import { formatDayLabel, todayKey } from '@/lib/date-utils';
import { lastPlayedBefore, streakStatus } from '@/lib/activity';
import { streakMultiplier } from '@/lib/game-state';
import { MissionsCard, NextChallengeCountdown, StreakBanner, XpBar } from '@/components/DailyProgress';
import { formatPoints } from '@/lib/game-data';
import { DEFAULT_REGION } from '@/lib/regions';
import { buildReviewQuestions, latestReviewableResult } from '@/lib/review';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';
import BrandIcon from '@/components/BrandIcon';

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
    title: 'USA Challenge',
    description: 'Ten American questions, the same for everyone. Keep your streak alive.',
    icon: Flag,
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'Every day',
  },
  {
    to: '/world',
    title: 'World Challenge',
    description: 'Formula 1, the Champions League and the rest of the world. Ten questions.',
    icon: Globe,
    gradient: 'from-orange-400 to-red-500',
    badge: 'Global',
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
  {
    to: '/create',
    title: 'Make a Round',
    description: 'Pick the places yourself, play them and send the link to your friends.',
    icon: Wand2,
    gradient: 'from-emerald-400 to-teal-600',
    badge: 'New',
  },
  {
    to: '/create?tab=tournament',
    title: 'Private Tournament',
    description: 'One code, the same questions for your group and a table that closes on time.',
    icon: Users,
    gradient: 'from-pink-500 to-rose-600',
    badge: 'New',
  },
];

const Index = () => {
  const {
    streak: savedStreak,
    lastPlayedDate,
    streakFreezes,
    totalScore,
    gamesPlayed,
    isTodayCompleted,
    isRegionCompleted,
    dailyHistory,
  } = useGameStore();
  // The saved streak only updates when a round is played; a lapsed streak
  // shows as zero right away instead of waiting for the next round.
  const streak = streakStatus({ streak: savedStreak, lastPlayedDate, streakFreezes }).streak;
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

  const bestScore = dailyHistory.reduce((max, entry) => Math.max(entry.score, max), 0);

  // The last round before today, used to ask the player to beat it.
  const previousRound = useMemo(
    () => lastPlayedBefore(dailyHistory, todayKey()),
    [dailyHistory],
  );

  // The questions from the last round that are worth another go.
  const reviewable = buildReviewQuestions(latestReviewableResult(dailyHistory)?.answers);

  return (
    <>
      <Seo
        title="USA GeoArena - Guess the Place"
        description="Ten daily questions about NFL, MLB, NBA and NHL stadiums, iconic race tracks and legendary American moments. Click the map, get closer, score up to 1,300 points a day."
        path="/"
      />
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
              <BrandIcon className="w-28 h-28 drop-shadow-2xl transform rotate-6 hover:rotate-12 transition-transform duration-300" />
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
            USA GeoArena
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Think you know American sport? Click the map, guess the stadium, and climb
            the leaderboard.
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
                {isRegionCompleted('usa') ? 'Replay today’s challenge' : 'Play today’s USA challenge'}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-14 text-lg font-semibold"
            >
              <Link to="/archive">
                <Calendar className="w-5 h-5 mr-2" />
                Play Archive
              </Link>
            </Button>
          </motion.div>

          {/* Both rounds done: the only thing left to say is when the next one opens. */}
          {isRegionCompleted('usa') && isRegionCompleted('world') && (
            <div className="mt-6">
              <NextChallengeCountdown />
            </div>
          )}

          {/* The last round before today, used to ask the player to beat it.
              "Your best is 940" is a record; "you scored 812 yesterday" is a
              challenge, and a challenge is what brings someone back. */}
          {previousRound && !isTodayCompleted && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm font-medium text-gray-600"
            >
              {formatDayLabel(previousRound.date, todayKey())} you scored{' '}
              <span className="font-bold text-gray-800">
                {formatPoints(previousRound.score)} points
              </span>
              . Beat it today.
            </motion.p>
          )}

          {/* The questions the player missed are the ones worth another go, and
              a second attempt is a reason to come back. */}
          {reviewable.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.52 }}
              className="mt-6"
            >
              <Link
                to="/review"
                className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur border border-orange-200 px-5 py-2 text-sm font-semibold text-orange-800 hover:bg-white hover:shadow-md transition-all"
              >
                <Target className="w-4 h-4" />
                Review {reviewable.length} question{reviewable.length > 1 ? 's' : ''} you missed
              </Link>
            </motion.div>
          )}

          {/* A direct line to the world round, for the players who want the
              global version - Formula 1, the Champions League and the rest. */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Link
              to="/world"
              className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur border border-orange-200 px-5 py-2 text-sm font-semibold text-orange-800 hover:bg-white hover:shadow-md transition-all"
            >
              <span className="text-base leading-none">🌍</span>
              Prefer world sports? {isRegionCompleted('world') ? 'Replay' : 'Play'} the World Challenge
            </Link>
          </motion.div>
        </motion.div>

        {/* The streak at stake, the day's missions and the level - the three
            reasons to play today and to come back tomorrow. */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.52 }}
          className="max-w-4xl mx-auto mb-6 space-y-4"
        >
          <StreakBanner />
          <div className="grid md:grid-cols-2 gap-4 items-start">
            <MissionsCard />
            <XpBar />
          </div>
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
              <p className="text-3xl font-bold text-gray-800">{formatPoints(totalScore)}</p>
              <p className="text-xs text-gray-500">Total score</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200 bg-white/70 backdrop-blur-sm text-center">
            <CardContent className="p-5">
              <BarChart3 className="w-7 h-7 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold text-gray-800">{formatPoints(bestScore)}</p>
              <p className="text-xs text-gray-500">Best score</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 bg-white/70 backdrop-blur-sm text-center">
            <CardContent className="p-5">
              <Award className="w-7 h-7 mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold text-gray-800">{gamesPlayed}</p>
              <p className="text-xs text-gray-500">Rounds played</p>
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
            Six ways to play — make your own round or start a tournament for your group.
          </motion.p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {MODE_CARDS.map((mode, index) => (
              <motion.div
                key={mode.to}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.08 }}
              >
                <Link
                  to={mode.to}
                  onClick={() =>
                    trackEvent(ANALYTICS_EVENTS.modeSelect, { mode: mode.title, to: mode.to })
                  }
                  className="block h-full"
                >
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

      {/* Newsletter - a softer, inline placement below the game modes. The
          stronger ask happens at the end of a finished round. */}
      {NEWSLETTER_ENABLED && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-orange-100 bg-white/60 px-6 py-5 sm:flex sm:items-center sm:gap-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold font-script text-gray-800">
                {NEWSLETTER_COPY.heading}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{NEWSLETTER_COPY.subheading}</p>
            </div>
            <NewsletterSignup variant="inline" source="home" className="mt-4 sm:mt-0 sm:w-96" />
          </div>
        </div>
      )}

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

                {streakMultiplier(streak) > 1 && (
                  <div className="mb-6 p-5 bg-yellow-100 border-2 border-yellow-300 rounded-2xl">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
                    <p className="text-xl font-script font-bold text-yellow-800">
                      Your points count ×{streakMultiplier(streak)}
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
    </>
  );
};

export default Index;

