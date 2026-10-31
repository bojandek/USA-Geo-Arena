/**
 * A custom round, opened from its link.
 *
 * Everything the round needs is in the address: the questions, who made it,
 * its name and the score to beat. Finishing it hands back a new link with the
 * player's own score in it, so the round keeps travelling from friend to
 * friend.
 */

import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';

import DailyChallenge, { type CustomRoundConfig } from '@/components/DailyChallenge';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { CUSTOM_ROUND_MIN, buildPlayUrl, readPlayParams, roundRegion } from '@/lib/custom-round';
import { shareGrid } from '@/lib/game-data';
import { getBoardName } from '@/lib/global-board';

export default function PlayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const round = useMemo(() => readPlayParams(location.search), [location.search]);

  const title = round.name || 'Custom Round';

  const custom = useMemo<CustomRoundConfig>(() => {
    const ids = round.questions.map((question) => question.id);
    return {
      label: title,
      subtitle: round.by ? `by ${round.by}` : `${round.questions.length} questions`,
      rivalName: round.by || undefined,
      share: (result) => ({
        text:
          `I scored ${Math.round(result.score)} on "${title}" in USA GeoArena 🌍\n` +
          `${shareGrid(result.answers)}\nCan you beat me?`,
        url: buildPlayUrl({ ids, by: getBoardName(), name: round.name, beat: result.score }),
      }),
    };
  }, [round, title]);

  if (round.questions.length < CUSTOM_ROUND_MIN) {
    return (
      <>
        <Seo title="Custom round" description="A round of stadiums and venues made by a friend." path="/play" />
        <div className="h-full overflow-y-auto flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6">🧭</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-[Caveat] mb-3">
              This round has gone missing
            </h2>
            <p className="text-gray-600 mb-8">
              The link is broken or too short. Ask your friend to send it again, or make a round of
              your own.
            </p>
            <Button onClick={() => navigate('/create')} size="lg" className="rounded-full font-semibold">
              <Wand2 className="w-5 h-5 mr-2" />
              Make a round
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={round.by ? `${title} by ${round.by}` : title}
        description={
          round.beat !== null
            ? `Score ${round.beat} to beat - can you find these places on the map?`
            : 'A round of stadiums and venues made by a friend. Can you find them on the map?'
        }
        path="/play"
      />
      <DailyChallenge
        key={location.search}
        questions={round.questions}
        region={roundRegion(round.questions)}
        challengeScore={round.beat}
        custom={custom}
        onBack={() => navigate('/')}
      />
    </>
  );
}
