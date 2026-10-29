/**
 * Cookie / advertising consent banner.
 *
 * Required before personalised advertising can be shown to visitors in the
 * EU, the UK and Switzerland, and the only way to honour a "do not sell"
 * request under the CCPA. The choice is stored locally and can be changed
 * at any time from the "Privacy settings" link in the footer.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  getConsentSnapshot,
  setConsent,
  subscribeConsent,
  type ConsentValue,
} from '@/lib/ads';

/** Bumped whenever the wording changes, so the banner shows again. */
const CONSENT_VERSION = 'v1';

export default function CookieConsent() {
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentSnapshot);
  /** True once the visitor has closed or answered the banner. */
  const [dismissed, setDismissed] = useState(false);
  /** True when the banner was reopened from the footer's "Privacy settings". */
  const [reopened, setReopened] = useState(false);

  // A visitor can reopen the banner from the footer link.
  useEffect(() => {
    const reopen = () => {
      setReopened(true);
      setDismissed(false);
    };
    window.addEventListener('geoarena:open-consent', reopen);
    return () => window.removeEventListener('geoarena:open-consent', reopen);
  }, []);

  // The banner shows until a choice is made, and can be reopened later.
  const show = reopened || (consent === null && !dismissed);

  const decide = (value: ConsentValue) => {
    setConsent(value);
    setDismissed(true);
    setReopened(false);
  };

  const close = () => {
    setDismissed(true);
    setReopened(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed bottom-0 left-0 right-0 z-[60] px-3 pb-3 sm:px-6 sm:pb-6"
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
          data-consent-version={CONSENT_VERSION}
        >
          <div className="max-w-4xl mx-auto rounded-2xl border border-orange-200 bg-white/95 shadow-2xl backdrop-blur-sm p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  We use cookies for advertising
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  USA GeoArena is free and supported by ads. We and our advertising partners use
                  cookies to show ads and to measure how they perform. You can accept all
                  cookies, keep only the necessary ones, or change your choice later under
                  &quot;Privacy settings&quot; in the footer. See our{' '}
                  <Link to="/privacy" className="underline font-medium text-primary">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Button
                    onClick={() => decide('granted')}
                    size="sm"
                    className="rounded-full px-5"
                  >
                    Accept all
                  </Button>
                  <Button
                    onClick={() => decide('denied')}
                    size="sm"
                    variant="outline"
                    className="rounded-full px-5"
                  >
                    Necessary only
                  </Button>
                  <Link
                    to="/privacy"
                    onClick={close}
                    className="text-xs text-gray-500 underline hover:text-primary"
                  >
                    Privacy policy
                  </Link>
                </div>
              </div>

              <button
                onClick={close}
                aria-label="Close and use necessary cookies only"
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
