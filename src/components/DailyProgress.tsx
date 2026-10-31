/**
 * The pieces that give a player a reason to come back tomorrow: the time
 * until the next round, the streak at stake, the day's missions and the
 * level bar. They read everything from the game store, so they can sit on
 * the home page and on the end of a round alike.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, animate } from 'framer-motion';
import { Clock, Flame, Snowflake, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { useGameStore } from '@/lib/game-store';
import { formatCountdown, msUntilNextDay, streakStatus } from '@/lib/activity';
import { missionStatuses } from '@/lib/missions';
import { levelProgress, streakMultiplier, totalXp } from '@/lib/game-state';
import { formatPoints } from '@/lib/game-data';
import { todayKey } from '@/lib/date-utils';
import { celebrate } from '@/lib/confetti';
import { playSound } from '@/lib/sound';
import { cn } from '@/lib/utils';

/** Milliseconds until midnight, ticking once a second. */
function useCountdown(): number {
  const [ms, setMs] = useState(() => msUntilNextDay());
  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilNextDay()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return ms;
}

/** A number that counts up to its value whenever the value changes. */
export function CountUp({
  value,
  from = 0,
  durationMs = 1200,
  className,
}: {
  value: number;
  from?: number;
  durationMs?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(from);
  useEffect(() => {
    const controls = animate(from, value, {
      duration: durationMs / 1000,
      ease: 'easeOut',
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [from, value, durationMs]);
  return <span className={cn('tabular-nums', className)}>{formatPoints(shown)}</span>;
}

/** "Next challenge in 5h 12m". */
export function NextChallengeCountdown({ className }: { className?: string }) {
  const ms = useCountdown();
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-white/80 border border-orange-200 px-4 py-2 text-sm font-semibold text-gray-700',
        className,
      )}
    >
      <Clock className="w-4 h-4 text-orange-500" />
      Next challenge in <span className="tabular-nums text-orange-600">{formatCountdown(ms)}</span>
    </div>
  );
}

/**
 * The streak at stake today. It says nothing when there is nothing to say,
 * and the most when the streak is about to end.
 */
export function StreakBanner({ className, playTo = '/daily' }: { className?: string; playTo?: string }) {
  const { streak, lastPlayedDate, streakFreezes } = useGameStore();
  const status = streakStatus({ streak, lastPlayedDate, streakFreezes });
  const ms = useCountdown();
  const nextMultiplier = streakMultiplier(status.streak + 1);

  if (status.kind === 'none') return null;

  if (status.kind === 'safe') {
    return (
      <div className={cn('flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm', className)}>
        <Flame className="w-5 h-5 text-orange-500 shrink-0" />
        <p className="text-green-900">
          <span className="font-bold">{status.streak}-day streak is safe.</span> Come back tomorrow to make it{' '}
          {status.streak + 1}
          {streakMultiplier(status.streak + 1) > streakMultiplier(status.streak) &&
            ` and unlock a ×${streakMultiplier(status.streak + 1)} XP multiplier`}
          .
        </p>
      </div>
    );
  }

  const tone =
    status.kind === 'lost'
      ? { box: 'bg-gray-50 border-gray-200', text: 'text-gray-800', Icon: Flame, icon: 'text-gray-400' }
      : status.kind === 'frozen'
        ? { box: 'bg-sky-50 border-sky-200', text: 'text-sky-900', Icon: Snowflake, icon: 'text-sky-500' }
        : { box: 'bg-orange-50 border-orange-300', text: 'text-orange-900', Icon: Flame, icon: 'text-orange-500' };

  const message =
    status.kind === 'lost' ? (
      <>
        <span className="font-bold">Your streak ended.</span> Play today to start a new one.
      </>
    ) : status.kind === 'frozen' ? (
      <>
        <span className="font-bold">A streak freeze will save your {status.streak}-day streak</span> - but only if you
        play in the next <span className="tabular-nums">{formatCountdown(ms)}</span>.
      </>
    ) : (
      <>
        <span className="font-bold">
          Your {status.streak}-day streak ends in <span className="tabular-nums">{formatCountdown(ms)}</span>.
        </span>{' '}
        {nextMultiplier > streakMultiplier(status.streak)
          ? `Play today to reach a ×${nextMultiplier} XP multiplier.`
          : 'Play today to keep it alive.'}
      </>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border px-4 py-3 text-sm', tone.box, className)}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <tone.Icon className={cn('w-5 h-5 shrink-0 mt-0.5', tone.icon)} />
        <p className={tone.text}>{message}</p>
      </div>
      <Link
        to={playTo}
        className="shrink-0 rounded-full bg-orange-500 px-4 py-1.5 text-center font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        Play now
      </Link>
    </motion.div>
  );
}

/** The day's three missions and how far the player is on each. */
export function MissionsCard({ className }: { className?: string }) {
  const { dailyHistory } = useGameStore();
  const statuses = missionStatuses(dailyHistory, todayKey());
  const ms = useCountdown();
  const done = statuses.filter((status) => status.done).length;

  return (
    <div className={cn('rounded-3xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm p-5 text-left', className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Daily missions
          </h3>
          <p className="text-xs text-gray-500">
            {done}/{statuses.length} done · new missions in <span className="tabular-nums">{formatCountdown(ms)}</span>
          </p>
        </div>
      </div>
      <ul className="space-y-3">
        {statuses.map(({ mission, current, done: complete }) => (
          <li key={mission.id} className="flex items-center gap-3">
            <span className="text-2xl leading-none w-8 text-center" aria-hidden>
              {mission.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={cn('text-sm font-medium', complete ? 'text-gray-400 line-through' : 'text-gray-800')}>
                  {mission.title}
                </p>
                <span
                  className={cn(
                    'shrink-0 text-xs font-bold rounded-full px-2 py-0.5',
                    complete ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700',
                  )}
                >
                  {complete ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />+{mission.reward} XP
                    </span>
                  ) : (
                    `+${mission.reward} XP`
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', complete ? 'bg-green-500' : 'bg-purple-500')}
                  initial={{ width: 0 }}
                  animate={{ width: `${(current / mission.target) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The level bar. Given `fromXp`, it fills from there to the player's XP now
 * and celebrates every level crossed on the way.
 */
export function XpBar({ fromXp, className }: { fromXp?: number; className?: string }) {
  const state = useGameStore();
  const xp = totalXp(state);
  const start = fromXp ?? xp;
  const [shownXp, setShownXp] = useState(start);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const lastLevel = useRef(levelProgress(start).level);

  useEffect(() => {
    if (start === xp) {
      setShownXp(xp);
      return;
    }
    const controls = animate(start, xp, {
      duration: 1.6,
      delay: 0.6,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setShownXp(latest);
        const level = levelProgress(latest).level;
        if (level > lastLevel.current) {
          lastLevel.current = level;
          setLevelUp(level);
          celebrate({ pieces: 140 });
          playSound('streak');
        }
      },
    });
    return () => controls.stop();
  }, [start, xp]);

  const progress = levelProgress(shownXp);
  const gained = Math.round(xp - start);

  return (
    <div className={cn('rounded-2xl border-2 border-purple-200 bg-white/80 p-4', className)}>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <motion.span
          key={progress.level}
          initial={{ scale: levelUp ? 1.6 : 1 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold text-purple-700"
        >
          Level {progress.level}
        </motion.span>
        <span className="text-xs text-gray-500 tabular-nums">
          {gained > 0 && <span className="font-bold text-purple-600 mr-2">+{formatPoints(gained)} XP</span>}
          {formatPoints(Math.round(progress.remaining))} XP to level {progress.level + 1}
        </span>
      </div>
      <div className="h-3 rounded-full bg-purple-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${progress.fraction * 100}%` }}
        />
      </div>
      {levelUp && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-sm font-bold text-purple-700"
        >
          🎉 Level up! You reached level {levelUp}.
        </motion.p>
      )}
    </div>
  );
}

/**
 * Announces missions the moment they are paid. It watches the claimed list,
 * so it fires once per mission wherever the round was finished.
 */
function useMissionToasts(): void {
  const { claimedMissions, dailyHistory } = useGameStore();
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (seen.current === null) {
      seen.current = new Set(claimedMissions);
      return;
    }
    const statuses = missionStatuses(dailyHistory, todayKey());
    for (const claim of claimedMissions) {
      if (seen.current.has(claim)) continue;
      seen.current.add(claim);
      const id = claim.slice(claim.indexOf(':') + 1);
      const mission = statuses.find((status) => status.mission.id === id)?.mission;
      if (mission) {
        toast.success(`${mission.icon} Mission complete: +${mission.reward} XP`, { description: mission.title });
      }
    }
  }, [claimedMissions, dailyHistory]);
}

/** Mounts the mission toasts once for the whole app. */
export function MissionToasts() {
  useMissionToasts();
  return null;
}
