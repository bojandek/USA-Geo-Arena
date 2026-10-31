/**
 * A private tournament.
 *
 * The page a tournament link opens: the name, how long it stays open, the
 * table so far and a button to play. Every device plays the round once. The
 * guesses go to the server, which works out the score, so the table can be
 * trusted by everyone in the group.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Crown, Play, Trophy, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import DailyChallenge, { type CustomRoundConfig } from '@/components/DailyChallenge';
import Seo from '@/components/Seo';
import ShareSheet from '@/components/ShareSheet';
import { Button } from '@/components/ui/button';
import { questionsForIds, roundRegion } from '@/lib/custom-round';
import { shareGrid } from '@/lib/game-data';
import {
  fetchTournament,
  hasPlayed,
  markPlayed,
  submitTournamentRound,
  timeLeftLabel,
  toBoardAnswers,
  tournamentUrl,
  type TournamentEntry,
  type TournamentInfo,
} from '@/lib/tournament';

type Status = 'loading' | 'ready' | 'error' | 'playing';

const MEDALS = ['🥇', '🥈', '🥉'];

function Standings({ entries, highlight = true }: { entries: TournamentEntry[]; highlight?: boolean }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Nobody has played yet. Be the first on the table!
      </p>
    );
  }
  return (
    <ol className="divide-y divide-gray-100">
      {entries.map((entry, index) => (
        <li
          key={`${entry.nickname}-${entry.createdAt}`}
          className={`flex items-center gap-3 py-2 px-2 rounded-xl ${
            highlight && entry.you ? 'bg-primary/10' : ''
          }`}
        >
          <span className="w-7 text-center font-bold text-gray-500">{MEDALS[index] ?? index + 1}</span>
          <span className="flex-1 min-w-0 truncate font-semibold text-gray-800">
            {entry.nickname}
            {entry.you && <span className="ml-1 text-xs font-normal text-primary">(you)</span>}
          </span>
          <span className="text-xs text-gray-500">{entry.accuracy}%</span>
          <span className="w-16 text-right font-bold text-gray-800">{Math.round(entry.score)}</span>
        </li>
      ))}
    </ol>
  );
}

export default function TournamentPage() {
  const navigate = useNavigate();
  const { code: rawCode = '' } = useParams();
  const code = rawCode.toUpperCase();

  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [tournament, setTournament] = useState<TournamentInfo | null>(null);
  const [entries, setEntries] = useState<TournamentEntry[]>([]);
  const [played, setPlayed] = useState(() => hasPlayed(code));
  const [submitting, setSubmitting] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);

  const load = useCallback(async () => {
    const result = await fetchTournament(code);
    if (!result.ok) {
      setError(result.error);
      setStatus('error');
      return;
    }
    setTournament(result.data.tournament);
    setEntries(result.data.entries);
    // The server knows best: a device on the table has played, whatever
    // this browser remembers.
    if (result.data.entries.some((entry) => entry.you)) {
      markPlayed(code);
      setPlayed(true);
    }
    setStatus((current) => (current === 'playing' ? current : 'ready'));
  }, [code]);

  useEffect(() => {
    void load();
  }, [load]);

  const questions = useMemo(() => questionsForIds(tournament?.questionIds ?? []), [tournament]);
  const link = tournamentUrl(code);
  const name = tournament?.name ?? 'Private tournament';
  const rank = entries.findIndex((entry) => entry.you);

  const invite = useMemo(
    () => ({
      text: `Join my USA GeoArena tournament "${name}" 🏆 Code ${code}. One round, one shot - who knows the map best?`,
      url: link,
    }),
    [name, code, link],
  );

  const resultExtra = (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 text-left space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> {name}
        </div>
        {rank >= 0 && (
          <div className="text-sm font-semibold text-primary">
            #{rank + 1} of {entries.length}
          </div>
        )}
      </div>
      {submitting ? (
        <p className="text-sm text-gray-500">Saving your round...</p>
      ) : (
        <>
          {savedScore !== null && (
            <p className="text-xs text-gray-500">Counted on the table: {Math.round(savedScore)} points</p>
          )}
          <Standings entries={entries.slice(0, 10)} />
          <Button variant="outline" className="w-full rounded-full" onClick={() => setStatus('ready')}>
            See the full table
          </Button>
        </>
      )}
    </div>
  );

  const custom: CustomRoundConfig = {
    label: name,
    subtitle: `Tournament ${code}`,
    allowReplay: false,
    resultExtra,
    onFinish: async (result) => {
      markPlayed(code);
      setPlayed(true);
      setSubmitting(true);
      const response = await submitTournamentRound({
        code,
        answers: toBoardAnswers(result.answers),
        hintCost: result.hintCost,
      });
      setSubmitting(false);
      if (!response.ok) {
        toast.error(response.error);
        return;
      }
      setSavedScore(response.data.score);
      setEntries(response.data.entries);
    },
    share: (result) => ({
      text:
        `I scored ${Math.round(result.score)} in the "${name}" tournament on USA GeoArena 🏆\n` +
        `${shareGrid(result.answers)}\nJoin with code ${code} - it closes ${timeLeftLabel(
          tournament?.endsAt ?? '',
        ).replace(' left', '')} from now.`,
      url: link,
    }),
  };

  if (status === 'playing' && questions.length > 0) {
    return (
      <>
        <Seo title={name} description="A private USA GeoArena tournament." path={`/t/${code}`} />
        <DailyChallenge
          questions={questions}
          region={roundRegion(questions)}
          custom={custom}
          onBack={() => {
            setStatus('ready');
            void load();
          }}
        />
      </>
    );
  }

  const shell = (children: React.ReactNode) => (
    <>
      <Seo
        title={tournament ? `${name} - private tournament` : 'Private tournament'}
        description="Join a private USA GeoArena tournament: one round, one shot, one table for your group."
        path={`/t/${code}`}
      />
      <div className="h-full overflow-y-auto bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-xl mx-auto px-4 py-8 space-y-5">{children}</div>
      </div>
    </>
  );

  if (status === 'loading') {
    return shell(<p className="text-center text-gray-500 py-16">Loading the tournament...</p>);
  }

  if (status === 'error' || !tournament) {
    return shell(
      <div className="text-center py-10">
        <div className="text-7xl mb-6">🏟️</div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-[Caveat] mb-3">
          No tournament here
        </h2>
        <p className="text-gray-600 mb-8">{error || 'Check the code and try again.'}</p>
        <Button onClick={() => navigate('/create?tab=tournament')} size="lg" className="rounded-full font-semibold">
          <Wand2 className="w-5 h-5 mr-2" />
          Start your own
        </Button>
      </div>,
    );
  }

  const canPlay = !played && !tournament.ended && questions.length > 0;
  const leader = entries[0];

  return shell(
    <>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-gray-200 px-3 py-1 text-xs font-bold tracking-widest text-gray-600">
          CODE {code}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-[Caveat] mt-3">{name}</h1>
        <p className="text-gray-600 mt-1">
          Started by {tournament.createdBy} · {questions.length} questions
        </p>
        <div
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
            tournament.ended ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          <Clock className="w-4 h-4" /> {timeLeftLabel(tournament.endsAt)}
        </div>
      </div>

      {tournament.ended && leader && (
        <div className="rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 p-5 text-center">
          <Crown className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="text-sm text-amber-800 mt-1">Winner</div>
          <div className="text-2xl font-bold text-gray-800">{leader.nickname}</div>
          <div className="text-amber-800 font-semibold">{Math.round(leader.score)} points</div>
        </div>
      )}

      {canPlay ? (
        <Button
          size="lg"
          className="w-full rounded-full font-semibold text-lg py-6"
          onClick={() => setStatus('playing')}
        >
          <Play className="w-5 h-5 mr-2" /> Play your round
        </Button>
      ) : (
        !tournament.ended && (
          <p className="text-center text-sm text-gray-600">
            {rank >= 0
              ? `You are #${rank + 1} of ${entries.length}. Send the link and see who can beat you.`
              : 'You have played this tournament on this device.'}
          </p>
        )
      )}

      <div className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Table
          </h2>
          <span className="text-xs text-gray-500">
            {entries.length} player{entries.length === 1 ? '' : 's'}
          </span>
        </div>
        <Standings entries={entries} />
      </div>

      {!tournament.ended && (
        <div className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm space-y-3">
          <h2 className="font-bold text-gray-800">Invite your group</h2>
          <ShareSheet
            payload={invite}
            label="Send the invite"
            analytics={{ tournament: true }}
          />
        </div>
      )}
    </>,
  );
}
