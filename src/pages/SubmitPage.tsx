/**
 * The page for sending in a question.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Seo from '@/components/Seo';
import SubmitQuestion from '@/components/SubmitQuestion';
import { Button } from '@/components/ui/button';

export default function SubmitPage() {
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="Send in a question"
        description="Know a stadium USA GeoArena has missed, or found a venue in the wrong place? Send in a question and help the next round."
        path="/submit"
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-white/60"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-script">
                Send in a question
              </h1>
              <p className="text-gray-600 text-sm">
                The best rounds are the ones players help with.
              </p>
            </div>
          </div>

          <SubmitQuestion />
        </div>
      </div>
    </>
  );
}
