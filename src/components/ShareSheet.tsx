/**
 * Every way to send a finished round.
 *
 * One big button opens the phone's own share sheet, with the picture of the
 * round attached where the phone allows it. Under it sits a button for each
 * network a round usually goes to, a copy button and a button that saves the
 * picture - so the round can be sent from a desktop just as easily.
 */

import { useState } from 'react';
import { Download, Link2, MessageCircle, Send, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';
import { renderResultCard, type ResultCardData } from '@/lib/result-card';
import {
  shareClipboardText,
  shareTargetUrl,
  type ShareChannel,
  type SharePayload,
} from '@/lib/share-links';

interface ShareSheetProps {
  payload: SharePayload;
  /** The picture of the round. Without one there is no picture to attach or save. */
  card?: ResultCardData;
  /** Extra fields for the analytics event, such as the region or the score. */
  analytics?: Record<string, string | number | boolean>;
  /** The words on the big button. */
  label?: string;
  /** The name the saved picture gets. */
  fileName?: string;
}

export default function ShareSheet({
  payload,
  card,
  analytics = {},
  label = 'Share & challenge',
  fileName = 'geoarena-result.png',
}: ShareSheetProps) {
  const [busy, setBusy] = useState(false);

  const track = (channel: ShareChannel) =>
    trackEvent(ANALYTICS_EVENTS.share, { ...analytics, channel });

  const copy = async (quiet = false) => {
    try {
      await navigator.clipboard.writeText(shareClipboardText(payload));
      if (!quiet) toast.success('Link copied - send it to a friend!');
      return true;
    } catch {
      if (!quiet) toast.error('Could not copy the link');
      return false;
    }
  };

  const imageFile = async (): Promise<File | null> => {
    if (!card) return null;
    const blob = await renderResultCard(card);
    return blob ? new File([blob], fileName, { type: 'image/png' }) : null;
  };

  const handleNative = async () => {
    track('native');
    if (!navigator.share) {
      if (await copy(true)) toast.success('Result copied - paste it anywhere!');
      else toast.error('Could not copy the result');
      return;
    }
    setBusy(true);
    try {
      // The picture goes along where the phone can take a file. Some phones
      // drop the link when a file is attached, so the link stays in the text.
      const file = await imageFile().catch(() => null);
      const withFile = file && navigator.canShare?.({ files: [file] });
      await navigator.share(
        withFile
          ? { text: shareClipboardText(payload), files: [file] }
          : { text: payload.text, url: payload.url },
      );
    } catch (error) {
      // A dismissed share sheet is not an error worth reporting.
      if ((error as Error)?.name !== 'AbortError') await copy();
    } finally {
      setBusy(false);
    }
  };

  const handleChannel = (channel: 'whatsapp' | 'x' | 'facebook' | 'telegram') => {
    track(channel);
    window.open(shareTargetUrl(channel, payload), '_blank', 'noopener,noreferrer');
  };

  const handleImage = async () => {
    track('image');
    setBusy(true);
    try {
      const blob = card ? await renderResultCard(card) : null;
      if (!blob) throw new Error('no canvas');
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(href), 2000);
      toast.success('Picture saved - post it to your story!');
    } catch {
      toast.error('Could not make the picture');
    } finally {
      setBusy(false);
    }
  };

  const channelClass =
    'flex flex-col items-center gap-1 rounded-2xl border border-gray-200 bg-white py-2.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50';

  return (
    <div className="space-y-3">
      <Button
        onClick={handleNative}
        disabled={busy}
        size="lg"
        className="w-full rounded-full font-semibold"
      >
        <Share2 className="w-5 h-5 mr-2" />
        {label}
      </Button>
      <div className={`grid gap-2 ${card ? 'grid-cols-6' : 'grid-cols-5'}`}>
        <button type="button" className={channelClass} onClick={() => handleChannel('whatsapp')}>
          <MessageCircle className="w-5 h-5 text-green-600" />
          WhatsApp
        </button>
        <button type="button" className={channelClass} onClick={() => handleChannel('x')}>
          <span className="w-5 h-5 flex items-center justify-center font-black text-gray-900">X</span>
          Post
        </button>
        <button type="button" className={channelClass} onClick={() => handleChannel('facebook')}>
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white font-black text-sm">
            f
          </span>
          Facebook
        </button>
        <button type="button" className={channelClass} onClick={() => handleChannel('telegram')}>
          <Send className="w-5 h-5 text-sky-500" />
          Telegram
        </button>
        <button
          type="button"
          className={channelClass}
          onClick={() => {
            track('copy');
            void copy();
          }}
        >
          <Link2 className="w-5 h-5 text-gray-600" />
          Copy
        </button>
        {card && (
          <button type="button" className={channelClass} onClick={handleImage} disabled={busy}>
            <Download className="w-5 h-5 text-primary" />
            Picture
          </button>
        )}
      </div>
    </div>
  );
}
