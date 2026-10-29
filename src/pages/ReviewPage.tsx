/**
 * Review page.
 *
 * The questions the player missed in their last round, ready for a second
 * attempt. A review is practice: it never touches the progression, the
 * streak or the leaderboard, it just gives the player a reason to come back
 * and learn the places they did not know.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';

import DailyChallenge from '@/components/DailyChallenge';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/game-store';
import { buildReviewQuestions, latestReviewableResult } from '@/lib/review';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { dailyHistory } = useGameStore();

  // The most recent round that kept its answers is the one worth reviewing.
  const questions = useMemo(() => {
    const latest = latestReviewableResult(dailyHistory);
    return buildReviewQuestions(latest?.answers);
  }, [dailyHistory]);

  if (questions.length === 0) {
    return (
      <>
        <Seo
          title="Review your missed questions"
          description="Try again the questions you got wrong in your last round."
          path="/review"
        />
        <div className="h-full overflow-y-auto flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-[Caveat] mb-3">
              Nothing to review
            </h2>
            <p className="text-gray-600 mb-8">
              You got every question right in your last round. Play the daily challenge and
              anything you miss will be waiting here.
            </p>
            <Button
              onClick={() => navigate('/daily')}
              size="lg"
              className="rounded-full font-semibold"
            >
              <Target className="w-5 h-5 mr-2" />
              Play today&apos;s challenge
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Review your missed questions"
        description="Try again the questions you got wrong in your last round."
        path="/review"
      />
      <DailyChallenge questions={questions} onBack={() => navigate('/')} />
    </>
  );
}