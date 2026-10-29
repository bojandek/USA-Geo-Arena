/**
 * The global leaderboard.
 *
 * The board shows the best rounds of everybody for the same day and the same
 * round, so two people can compare. It sits beside the personal board on the
 * scores page.
 *
 * When the server is not set up the component says so plainly and shows
 * nothing else - the personal board carries on working.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2, Trophy, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  fetchGlobalBoard,
  getBoardName,
  setBoardName,
  type GlobalEntry,
} from '@/lib/global-board';
import { formatPoints } from '@/lib/game-data';
import { todayKey } from '@/lib/date-utils';

interface GlobalLeaderboardProps {
  /** Which round the board is for. */
  region?: 'usa' | 'world';
  /** The day the board is for. Defaults to today. */
  day?: string;
}

export default function GlobalLeaderboard({ region = 'usa', day = todayKey() }: GlobalLeaderboardProps) {
  const [entries, setEntries] = useState<GlobalEntry[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchGlobalBoard(day, region).then((board) => {
      if (cancelled) return;
      setEntries(board.entries);
      setConfigured(board.configured);
      setError(board.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [day, region]);

  useEffect(() => {
    setName(getBoardName());
  }, []);

  function saveName() {
    setBoardName(name);
    setEditing(false);
  }

  return (
    <Card className="rounded-2xl border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-script">
          <Globe className="w-6 h-6 text-primary" />
          Global Leaderboard
        </CardTitle>
        <p className="text-sm text-gray-600">
          {region === 'world' ? "The world's best World rounds" : 'The best American rounds today'}
          {' · '}
          {day}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !configured ? (
          <p className="text-sm text-gray-500 py-4">
            The global board is not set up on this deployment yet. Your own scores
            are saved on this device as always.
          </p>
        ) : error ? (
          <p className="text-sm text-red-600 py-4">{error}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            Nobody has put a score on the board for this round yet. Be the first.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <motion.div
                key={`${entry.nickname}-${entry.created_at}-${index}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  index < 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="text-center w-8 shrink-0">
                  {index === 0 ? (
                    <span className="text-xl">🥇</span>
                  ) : index === 1 ? (
                    <span className="text-xl">🥈</span>
                  ) : index === 2 ? (
                    <span className="text-xl">🥉</span>
                  ) : (
                    <span className="text-sm text-gray-500">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400 shrink-0" />
                    {entry.nickname}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {entry.accuracy}% accuracy
                    </Badge>
                    {entry.streak > 1 && (
                      <span className="text-xs text-gray-500">🔥 {entry.streak}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">{formatPoints(entry.score)}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-gray-200">
          {editing ? (
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name on the board"
                maxLength={24}
                className="rounded-full flex-1"
                aria-label="Your name on the board"
              />
              <Button onClick={saveName} className="rounded-full px-5">
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                {name ? (
                  <>
                    You are on the board as <strong>{name}</strong>.
                  </>
                ) : (
                  'You are on the board without a name.'
                )}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="rounded-full text-xs"
              >
                <Trophy className="w-3 h-3 mr-1" />
                {name ? 'Change name' : 'Add a name'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
