/**
 * Make a round, or start a private tournament.
 *
 * Both start the same way: pick the places. A custom round then travels
 * inside its own link and needs nothing from the server. A tournament is kept
 * on the server, so a whole group plays the same questions once and the table
 * closes at a fixed time.
 */

import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Plus, Search, Shuffle, Trophy, Users, Wand2, X } from 'lucide-react';
import { toast } from 'sonner';

import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CUSTOM_ROUND_DEFAULT,
  CUSTOM_ROUND_MAX,
  CUSTOM_ROUND_MIN,
  buildPlayUrl,
  questionLabel,
  questionsForIds,
  randomIds,
  searchPool,
} from '@/lib/custom-round';
import { getBoardName, setBoardName } from '@/lib/global-board';
import { createTournament } from '@/lib/tournament';
import { trackEvent } from '@/lib/analytics';

type Tab = 'round' | 'tournament';

const DAY_OPTIONS = [
  { days: 1, label: '24 hours' },
  { days: 3, label: '3 days' },
  { days: 7, label: 'A week' },
];

export default function CreatePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'tournament' ? 'tournament' : 'round';

  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [nickname, setNickname] = useState(getBoardName());
  const [roundName, setRoundName] = useState('');
  const [days, setDays] = useState(3);
  const [busy, setBusy] = useState(false);

  const results = useMemo(() => searchPool(query, 40), [query]);
  const pickedQuestions = useMemo(() => questionsForIds(picked), [picked]);
  const full = picked.length >= CUSTOM_ROUND_MAX;

  const toggle = (id: string) => {
    setPicked((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (current.length >= CUSTOM_ROUND_MAX) {
        toast.info(`A round has at most ${CUSTOM_ROUND_MAX} questions`);
        return current;
      }
      return [...current, id];
    });
  };

  const fillRandom = () => {
    const target = tab === 'tournament' ? CUSTOM_ROUND_MAX : Math.max(CUSTOM_ROUND_DEFAULT, picked.length);
    setPicked((current) => [...current, ...randomIds(target - current.length, current)]);
  };

  const saveName = () => setBoardName(nickname);

  const handlePlay = () => {
    if (picked.length < CUSTOM_ROUND_MIN) {
      toast.error(`Pick at least ${CUSTOM_ROUND_MIN} questions`);
      return;
    }
    saveName();
    trackEvent('custom_round_created', { questions: picked.length });
    const url = new URL(buildPlayUrl({ ids: picked, by: nickname, name: roundName }));
    navigate(`${url.pathname}${url.search}`);
  };

  const handleTournament = async () => {
    saveName();
    setBusy(true);
    const result = await createTournament({
      name: roundName,
      days,
      // Fewer than the minimum and the server picks a random ten.
      questionIds: picked.length >= CUSTOM_ROUND_MIN ? picked : [],
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    trackEvent('tournament_created', { days, questions: picked.length });
    navigate(`/t/${result.data.code}`);
  };

  const tabClass = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors ${
      active ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-white/60'
    }`;

  return (
    <>
      <Seo
        title={tab === 'tournament' ? 'Start a private tournament' : 'Make your own round'}
        description="Pick the stadiums and venues yourself, play them and send the round to your friends - or start a private tournament for your group."
        path="/create"
      />
      <div className="h-full overflow-y-auto bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-[Caveat]">
              {tab === 'tournament' ? 'Private Tournament' : 'Make Your Own Round'}
            </h1>
            <p className="text-gray-600 mt-2">
              {tab === 'tournament'
                ? 'One code for your group. Everybody plays the same questions once, and the table closes on time.'
                : 'Pick the places, play them, and send your score as a challenge.'}
            </p>
          </div>

          <div className="flex gap-1 rounded-full bg-white/70 p-1 border border-gray-200">
            <button
              type="button"
              className={tabClass(tab === 'round')}
              onClick={() => setSearchParams({}, { replace: true })}
            >
              <Wand2 className="w-4 h-4" /> Custom round
            </button>
            <button
              type="button"
              className={tabClass(tab === 'tournament')}
              onClick={() => setSearchParams({ tab: 'tournament' }, { replace: true })}
            >
              <Users className="w-4 h-4" /> Tournament
            </button>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-5 space-y-4 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                Your name
                <Input
                  value={nickname}
                  maxLength={24}
                  placeholder="So your friends know who it is"
                  onChange={(event) => setNickname(event.target.value)}
                  onBlur={saveName}
                />
              </label>
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                {tab === 'tournament' ? 'Tournament name' : 'Round name'}
                <Input
                  value={roundName}
                  maxLength={40}
                  placeholder={tab === 'tournament' ? 'Office Cup' : 'Ballparks only'}
                  onChange={(event) => setRoundName(event.target.value)}
                />
              </label>
            </div>

            {tab === 'tournament' && (
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-700">Open for</div>
                <div className="flex gap-2">
                  {DAY_OPTIONS.map((option) => (
                    <button
                      key={option.days}
                      type="button"
                      onClick={() => setDays(option.days)}
                      className={`flex-1 rounded-full border py-2 text-sm font-semibold ${
                        days === option.days
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-700">
                  Your round · {picked.length}/{CUSTOM_ROUND_MAX}
                  {tab === 'tournament' && picked.length < CUSTOM_ROUND_MIN && (
                    <span className="font-normal text-gray-500"> (leave empty for a random ten)</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {picked.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setPicked([])}>
                      Clear
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="rounded-full" onClick={fillRandom} disabled={full}>
                    <Shuffle className="w-4 h-4 mr-1" /> Random
                  </Button>
                </div>
              </div>
              {pickedQuestions.length === 0 ? (
                <p className="text-sm text-gray-500 rounded-2xl border border-dashed border-gray-300 p-4 text-center">
                  Search below and tap a place to add it.
                </p>
              ) : (
                <ol className="flex flex-wrap gap-2">
                  {pickedQuestions.map((question, index) => (
                    <li
                      key={question.id}
                      className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary pl-3 pr-1.5 py-1 text-sm font-semibold"
                    >
                      <span className="text-xs opacity-70">{index + 1}.</span>
                      {questionLabel(question)}
                      <button
                        type="button"
                        aria-label={`Remove ${questionLabel(question)}`}
                        className="rounded-full p-0.5 hover:bg-primary/20"
                        onClick={() => toggle(question.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {tab === 'round' ? (
              <Button
                size="lg"
                className="w-full rounded-full font-semibold"
                onClick={handlePlay}
                disabled={picked.length < CUSTOM_ROUND_MIN}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {picked.length < CUSTOM_ROUND_MIN
                  ? `Pick ${CUSTOM_ROUND_MIN - picked.length} more`
                  : 'Play it & get the link'}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full rounded-full font-semibold"
                onClick={handleTournament}
                disabled={busy}
              >
                <Trophy className="w-5 h-5 mr-2" />
                {busy ? 'Starting...' : 'Start the tournament'}
              </Button>
            )}
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a stadium, a city or a country"
                className="pl-9"
              />
            </div>
            <ul className="divide-y divide-gray-100 max-h-[28rem] overflow-y-auto">
              {results.map((question) => {
                const selected = picked.includes(question.id);
                return (
                  <li key={question.id}>
                    <button
                      type="button"
                      onClick={() => toggle(question.id)}
                      disabled={!selected && full}
                      className="w-full flex items-center gap-3 py-2.5 text-left disabled:opacity-40"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-gray-800 truncate">
                          {questionLabel(question)}
                        </span>
                        <span className="block text-xs text-gray-500 truncate">
                          {question.country} · {question.text}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {results.length === 0 && (
                <li className="py-6 text-center text-sm text-gray-500">Nothing matches that search.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
