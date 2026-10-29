/**
 * The form for sending in a question.
 *
 * A player who knows a venue the site does not know about should be able to
 * say so, and a player who has found a wrong coordinate should be able to
 * report it. Both come through here.
 *
 * When the server is not set up the form falls back to the visitor's own mail
 * app, so a question is never simply lost.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Check, Loader2, MessageSquarePlus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_EMAIL } from '@/lib/site-content';

export default function SubmitQuestion() {
  const [searchParams] = useSearchParams();
  const [questionText, setQuestionText] = useState('');
  const [venue, setVenue] = useState('');
  const [hint, setHint] = useState('');
  const [email, setEmail] = useState('');
  const [kind, setKind] = useState<'new' | 'correction'>('new');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A report coming from a question in the game arrives with the question
  // already named, so the player does not have to type it out again.
  useEffect(() => {
    const question = searchParams.get('question');
    if (question) setQuestionText(question);
    const place = searchParams.get('venue');
    if (place) setVenue(place);
    const where = searchParams.get('hint');
    if (where) setHint(where);
    if (searchParams.get('kind') === 'correction') setKind('correction');
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (questionText.trim().length < 10) {
      setError('The question needs a little more to it.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questionText, venue, hint, email, kind }),
      });

      if (response.ok) {
        setSent(true);
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? 'The question could not be sent.');
    } catch (reason) {
      // The server may not be set up at all. In that case the question is
      // offered to the visitor's own mail app, so it is never lost.
      const message = reason instanceof Error ? reason.message : '';
      const subject = kind === 'correction' ? 'Correction' : 'New question';
      const body = [
        `Question: ${questionText}`,
        venue ? `Venue: ${venue}` : '',
        hint ? `Hint: ${hint}` : '',
        email ? `Contact: ${email}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        `${subject} - USA GeoArena`,
      )}&body=${encodeURIComponent(body)}`;

      setError(
        message
          ? `${message} Your mail app has been opened instead.`
          : 'Your mail app has been opened so you can send it directly.',
      );
    } finally {
      setSending(false);
    }
  }
  if (sent) {
    return (
      <Card className="rounded-2xl border-2 border-green-200 bg-green-50/50">
        <CardContent className="p-6 flex items-center gap-3">
          <Check className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-gray-800">Thank you - it has been sent.</p>
            <p className="text-sm text-gray-600">
              We read every one. If it makes it into a round, you will see it.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-script">
          <MessageSquarePlus className="w-6 h-6 text-primary" />
          Send in a question
        </CardTitle>
        <p className="text-sm text-gray-600">
          Know a stadium we have missed, or found a venue in the wrong place? Tell us.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            {(['new', 'correction'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setKind(option)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  kind === option
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option === 'new' ? 'A new venue' : 'A correction'}
              </button>
            ))}
          </div>

          <Textarea
            value={questionText}
            onChange={(event) => setQuestionText(event.target.value)}
            placeholder={
              kind === 'new'
                ? 'Where is the home of the Los Angeles Rams?'
                : 'The coordinate for Fenway Park looks wrong - it is about half a mile out.'
            }
            className="rounded-xl min-h-[90px]"
            aria-label="The question"
          />

          <Input
            value={venue}
            onChange={(event) => setVenue(event.target.value)}
            placeholder="Venue name (optional)"
            className="rounded-full"
            aria-label="Venue name"
          />

          <Input
            value={hint}
            onChange={(event) => setHint(event.target.value)}
            placeholder="City or state (optional)"
            className="rounded-full"
            aria-label="City or state"
          />

          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email, if you want an answer (optional)"
            className="rounded-full"
            type="email"
            aria-label="Your email"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 pt-1"
          >
            <Button type="submit" disabled={sending} className="rounded-full px-6">
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send it
                </>
              )}
            </Button>
            {error && <p className="text-sm text-amber-700">{error}</p>}
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
}
