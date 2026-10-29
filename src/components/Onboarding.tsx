/**
 * First-visit introduction.
 *
 * Shown once, the first time the site is opened. It explains the three things
 * a new player cannot work out on their own: that the guess is made by
 * clicking the map, that closeness is what earns points, and that playing
 * every day is what keeps the streak alive.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { hasSeenOnboarding, markOnboardingSeen, ONBOARDING_STEPS } from '@/lib/onboarding';

export default function Onboarding() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  // The overlay is only shown when the player has not seen it before. The
  // check runs after the first paint so it never blocks the home page.
  useEffect(() => {
    if (hasSeenOnboarding()) return;
    const timer = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  // The footer has a "How to play" link, which brings the introduction back.
  useEffect(() => {
    const reopen = () => setVisible(true);
    window.addEventListener('geoarena:open-onboarding', reopen);
    return () => window.removeEventListener('geoarena:open-onboarding', reopen);
  }, []);

  const finish = (goToGame: boolean) => {
    markOnboardingSeen();
    setVisible(false);
    if (goToGame) navigate('/daily');
  };

  const isLast = step === ONBOARDING_STEPS.length - 1;
  const current = ONBOARDING_STEPS[step];

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="How to play USA GeoArena"
        >
          <motion.div
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => finish(false)}
              aria-label="Skip the introduction"
              className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 pt-8 pb-6 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="text-6xl mb-4">{current.emoji}</div>
                  <h2 className="text-2xl font-bold text-gray-800 font-[Caveat] mb-2">
                    {current.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                    {current.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                {ONBOARDING_STEPS.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => setStep(index)}
                    aria-label={`Step ${index + 1}: ${item.title}`}
                    className={`h-2 rounded-full transition-all ${
                      index === step ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 mt-6">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={() => (isLast ? finish(true) : setStep((prev) => prev + 1))}
                    className="flex-1 rounded-full"
                >
                  {isLast ? "Let's play" : 'Next'}
                  {!isLast && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}