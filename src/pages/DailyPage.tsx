import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import RequireAuth from '@/components/RequireAuth';
import Seo from '@/components/Seo';
import { DEFAULT_REGION, getRegion, isRegionId, regionPath, type RegionId } from '@/lib/regions';
import { readChallengeScore } from '@/lib/challenge';
import { todayKey } from '@/lib/date-utils';
import { cachedRound, loadDailyRound } from '@/lib/daily-round';
import type { Question } from '@/lib/question-types';

/**
 * Daily challenge page.
 *
 * The optional `?date=YYYY-MM-DD` parameter replays an archived day.
 *
 * The round itself lives in the path - `/daily` for the American round and
 * `/world` for the world round - because the menu and the page title both
 * follow the path. A `?region=` parameter is still read, so links shared
 * before the world round had an address of its own keep working, but such a
 * link is sent straight on to the round's real address.
 */
export default function DailyPage({
  region: fixedRegion,
}: {
  /** Forces the round, used by the separate /world address. */
  region?: RegionId;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');
  const regionParam = searchParams.get('region');
  const region = fixedRegion ?? (isRegionId(regionParam) ? regionParam : DEFAULT_REGION);
  const regionConfig = getRegion(region);
  const isUsa = region === 'usa';
  // The score the player was challenged to beat, carried in the link.
  const challengeScore = readChallengeScore(searchParams);
  const isArchive = Boolean(date && date !== todayKey());

  // The day's questions come from the server, so they are loaded before the
  // round starts. A round already kept on the device starts at once.
  const day = date ?? todayKey();
  const roundKey = `${day}:${region}`;
  const [round, setRound] = useState<{ key: string; questions: Question[] } | null>(() => {
    const kept = cachedRound(day, region);
    return kept ? { key: roundKey, questions: kept } : null;
  });
  useEffect(() => {
    if (round?.key === roundKey) return;
    let cancelled = false;
    void loadDailyRound(day, region).then((questions) => {
      if (!cancelled) setRound({ key: roundKey, questions });
    });
    return () => {
      cancelled = true;
    };
  }, [day, region, roundKey, round?.key]);
  const questions = round?.key === roundKey ? round.questions : null;

  // The round belongs in the path, not in a query string. A link that still
  // carries ?region=world is sent to the world round's own address, so the
  // menu highlights the round that is actually open and the address can be
  // shared again. Everything else in the link, such as the day and the score
  // to beat, is carried over.
  useEffect(() => {
    if (fixedRegion || !isRegionId(regionParam) || regionParam === DEFAULT_REGION) return;
    const rest = new URLSearchParams(searchParams);
    rest.delete('region');
    const query = rest.toString();
    navigate(`${regionPath(regionParam)}${query ? `?${query}` : ''}`, { replace: true });
  }, [fixedRegion, regionParam, searchParams, navigate]);

  return (
    <>
      <Seo
        title={date ? 'Replay a past challenge' : `${regionConfig.label} Challenge`}
        description={
          isUsa
            ? 'Ten American questions, the same for everyone playing the USA round. Click the map, get as close to the answer as you can and score up to 1,300 points a day.'
            : 'Ten questions about stadiums, Olympic games, world records and racing circuits. Click the map, get as close to the answer as you can and score up to 1,300 points a day.'
        }
        path={date ? '/archive' : regionPath(region)}
      />
      {!questions ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isArchive ? (
        <RequireAuth>
          <DailyChallenge
            key={roundKey}
            selectedDate={date}
            region={region}
            round={questions}
            challengeScore={challengeScore}
            onBack={() => navigate('/archive')}
          />
        </RequireAuth>
      ) : (
        <DailyChallenge
          key={roundKey}
          selectedDate={date}
          region={region}
          round={questions}
          challengeScore={challengeScore}
          onBack={() => navigate('/')}
        />
      )}
    </>
  );
}
