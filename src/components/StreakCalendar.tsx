/**
 * The last thirteen weeks as a grid of days.
 *
 * This is the one part of the statistics page that shows a shape rather than
 * a number. A run of filled squares and a run of empty ones says more about a
 * habit than any total can.
 */

import { useMemo } from 'react';

import { activityLevel, buildActivityGrid } from '@/lib/activity';
import { formatPoints } from '@/lib/game-data';
import { formatDayLabel, todayKey } from '@/lib/date-utils';
import type { DailyResult } from '@/lib/game-state';

/** The colour of each level, from nothing played to a full round. */
const LEVEL_CLASSES = [
  'bg-gray-200 dark:bg-gray-700',
  'bg-orange-100 dark:bg-orange-900/50',
  'bg-orange-200 dark:bg-orange-800/60',
  'bg-orange-300 dark:bg-orange-700/70',
  'bg-orange-400 dark:bg-orange-600/80',
  'bg-primary dark:bg-primary',
];

const WEEKDAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

export default function StreakCalendar({
  history,
  className = '',
}: {
  history: DailyResult[];
  className?: string;
}) {
  const today = todayKey();
  const cells = useMemo(() => buildActivityGrid(history, today), [history, today]);
  const played = cells.filter((cell) => cell.played).length;

  // The month each column starts in, so the grid can be read at a glance.
  const monthLabels = useMemo(() => {
    const labels: (string | null)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const first = cells[i];
      const month = first ? first.date.slice(5, 7) : null;
      const previous = labels[labels.length - 1];
      labels.push(month && month !== previous ? month : null);
    }
    return labels;
  }, [cells]);

  return (
    <div className={className}>
      <div className="flex gap-2">
        {/* The weekday labels down the side. */}
        <div className="grid grid-rows-7 gap-1 text-[10px] text-gray-400 pt-4 shrink-0">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} className="h-3 flex items-center">
              {label}
            </span>
          ))}
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1 w-fit">
            {cells.map((cell) => {
              const level = cell.played ? activityLevel(cell.score) : 0;
              const title = cell.future
                ? formatDayLabel(cell.date, today)
                : cell.played
                  ? `${formatDayLabel(cell.date, today)}: ${formatPoints(cell.score)} points`
                  : `${formatDayLabel(cell.date, today)}: not played`;
              return (
                <span
                  key={cell.date}
                  title={title}
                  aria-label={title}
                  className={`h-3 w-3 rounded-[3px] ${LEVEL_CLASSES[level]} ${
                    cell.future ? 'opacity-30' : ''
                  }`}
                />
              );
            })}
          </div>

          {/* The month each column starts in. */}
          <div className="grid grid-flow-col gap-1 w-fit mt-1 ml-0">
            {monthLabels.map((label, i) => (
              <span key={i} className="w-3 text-[10px] text-gray-400">
                {label ? new Date(2000, Number(label) - 1, 1).toLocaleDateString('en-US', { month: 'short' }) : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-[11px] text-gray-500">
        <span>
          {played} day{played === 1 ? '' : 's'} played in the last 13 weeks
        </span>
        <span className="flex items-center gap-1">
          Less
          {LEVEL_CLASSES.map((className, i) => (
            <span key={i} className={`h-3 w-3 rounded-[3px] ${className}`} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}