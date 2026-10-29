/**
 * A single ad placement.
 *
 * The AdSense script is only loaded once the slot is close to the viewport,
 * which keeps the first paint fast and means no ad request is made before
 * the visitor has actually seen the page content.
 *
 * Renders nothing at all when advertising is not configured, so there are no
 * empty boxes in development.
 */

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  AD_SLOTS,
  ADSENSE_CLIENT_ID,
  isAdSlotActive,
  loadAdSense,
  requestAd,
  type AdSlotName,
} from '@/lib/ads';
import { getProStatus } from '@/lib/pro';

interface AdSlotProps {
  /** Which placement this is. */
  slot: AdSlotName;
  className?: string;
  /** Set to false to hide the "Advertisement" label (never do this for ads). */
  labelled?: boolean;
}

export default function AdSlot({ slot, className, labelled = true }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const requested = useRef(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // A Pro device does not see advertising at all. The mark is checked when
  // the page comes into view, so buying a licence on another tab takes
  // effect straight away.
  useEffect(() => {
    function refresh() {
      setIsPro(getProStatus().isPro);
    }
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('geoarena:pro-changed', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('geoarena:pro-changed', refresh);
    };
  }, []);

  const active = isAdSlotActive(slot) && !isPro;

  // Only start loading once the slot is nearly visible.
  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  // Request the ad.
  useEffect(() => {
    if (!active || !nearViewport || requested.current) return;
    requested.current = true;

    try {
      requestAd();
    } catch {
      setFailed(true);
      return;
    }

    loadAdSense().catch(() => setFailed(true));
  }, [active, nearViewport]);

  if (!active || failed) return null;

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      role="complementary"
      aria-label="Advertisement"
      data-ad-slot-name={slot}
    >
      <div className="rounded-2xl border border-orange-100/80 bg-white/50 overflow-hidden">
        {labelled && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 text-center pt-2.5">
            Advertisement
          </p>
        )}
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={AD_SLOTS[slot]}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
