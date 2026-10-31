/**
 * Newsletter signup.
 *
 * The form posts directly to the newsletter provider, so no backend is
 * needed. The submit uses `fetch` in `no-cors` mode to keep the visitor on
 * the page; the provider sends a double opt-in confirmation, which is what
 * makes the subscription lawful under GDPR and keeps the list free of typos.
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  NEWSLETTER_COPY,
  NEWSLETTER_FIELD,
  NEWSLETTER_UNSUBSCRIBE_URL,
  getNewsletterState,
  isValidEmail,
  subscribeToNewsletter,
} from '@/lib/newsletter';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';

interface NewsletterSignupProps {
  /** 'card' is a standalone panel, 'inline' is a single line. */
  variant?: 'card' | 'inline';
  /** Marks which placement this is, for your own reference. */
  source: string;
  className?: string;
  /** Dark background (practice mode). */
  dark?: boolean;
}

type Status = 'idle' | 'sending' | 'error';

export default function NewsletterSignup({
  variant = 'card',
  source,
  className,
  dark = false,
}: NewsletterSignupProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [subscribed, setSubscribed] = useState(() => getNewsletterState() === 'subscribed');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();

    if (!isValidEmail(value)) {
      setError(NEWSLETTER_COPY.errorInvalid);
      return;
    }

    setError('');
    setStatus('sending');

    const outcome = await subscribeToNewsletter(value, source);
    if (!outcome.ok) {
      setError(outcome.error ?? '');
      setStatus('error');
      return;
    }
    setSubscribed(true);
    trackEvent(ANALYTICS_EVENTS.newsletterSignup, { source, variant });
  };

  const inputClass = cn(
    'h-11 flex-1 rounded-full border px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20',
    dark
      ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40'
      : 'border-gray-200 bg-white text-gray-800 placeholder:text-gray-400',
  );

  const fieldId = `newsletter-${variant}-${source}`;

  const body = subscribed ? (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-4 py-3',
        dark
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800',
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          dark ? 'bg-emerald-500/20' : 'bg-emerald-500',
        )}
      >
        <Check className="h-4 w-4 text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{NEWSLETTER_COPY.successTitle}</p>
        <p className={cn('text-xs', dark ? 'text-emerald-300/70' : 'text-emerald-700/80')}>
          {NEWSLETTER_COPY.successBody}
        </p>
      </div>
      {NEWSLETTER_UNSUBSCRIBE_URL && (
        <a
          href={NEWSLETTER_UNSUBSCRIBE_URL}
          className={cn(
            'shrink-0 text-xs underline underline-offset-2',
            dark ? 'text-emerald-300/70' : 'text-emerald-700/80',
          )}
        >
          Unsubscribe
        </a>
      )}
    </div>
  ) : (
    <form onSubmit={handleSubmit} data-newsletter-source={source}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={fieldId} className="sr-only">
          Email address
        </label>
        <input
          id={fieldId}
          name={NEWSLETTER_FIELD}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={inputClass}
        />
        <Button
          type="submit"
          disabled={status === 'sending'}
          className={cn(
            'h-11 shrink-0 rounded-full px-6 font-semibold',
            dark && 'bg-white text-slate-900',
          )}
        >
          {status === 'sending' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              {variant === 'inline'
                ? NEWSLETTER_COPY.buttonInline
                : NEWSLETTER_COPY.buttonCard}
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            id={`${fieldId}-error`}
            role="alert"
            className={cn(
              'mt-2 flex items-center gap-1.5 text-xs',
              dark ? 'text-red-300' : 'text-red-600',
            )}
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );

  if (variant === 'inline') {
    return <div className={cn('w-full', className)}>{body}</div>;
  }

  return (
    <div
      className={cn(
        'rounded-3xl border p-6',
        dark ? 'border-white/10 bg-white/5' : 'border-orange-100 bg-white/70 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            dark ? 'bg-white/10' : 'bg-gradient-to-br from-primary to-secondary',
          )}
        >
          <Mail className="h-5 w-5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn('text-lg font-bold font-script', dark ? 'text-white' : 'text-gray-800')}>
            {NEWSLETTER_COPY.heading}
          </h3>
          <p className={cn('mt-1 text-sm', dark ? 'text-slate-300' : 'text-gray-600')}>
            {NEWSLETTER_COPY.subheading}
          </p>
        </div>
      </div>

      {body}

      <p className={cn('mt-3 text-xs', dark ? 'text-white/45' : 'text-gray-500')}>
        {NEWSLETTER_COPY.note}
      </p>

    </div>
  );
}
