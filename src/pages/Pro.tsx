/**
 * The Pro page.
 *
 * Pro takes the advertising away, and adds the sport specific rounds: ten
 * extra questions from one sport, every day.
 *
 * The checkout is made by Lemon Squeezy. A buyer gets a licence key by mail
 * and pastes it in here, and the site checks it against the server. Nothing
 * is stored on a server about who the buyer is - the key is the licence.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Crown,
  KeyRound,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import Seo from '@/components/Seo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  clearPro,
  getProStatus,
  PRO_SPORTS,
  setProSport,
  startCheckout,
  verifyLicense,
  type ProSportId,
} from '@/lib/pro';

const BENEFITS = [
  {
    emoji: '\u{1F4A3}',
    title: 'No advertising, ever',
    body: 'The page stays clean and the round starts the moment you open it.',
  },
  {
    emoji: '\u{1F3AF}',
    title: 'A round for every sport',
    body: 'Ten extra questions a day from the sport you care about, on top of the daily challenge.',
  },
  {
    emoji: '\u{1F3C6}',
    title: 'Sport specific archives',
    body: 'Every round you have ever played, kept and sorted by the sport it came from.',
  },
  {
    emoji: '\u{1F525}',
    title: 'Keep your streak alive',
    body: 'Pro rounds count towards the streak too, so a missed day is not a lost day.',
  },
];

export default function Pro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isPro, setIsPro] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sport, setSport] = useState<ProSportId>('nfl');

  useEffect(() => {
    const status = getProStatus();
    setIsPro(status.isPro);
    setLicenseKey(status.licenseKey ?? '');

    // A key that has not been checked for a week is checked again.
    if (status.licenseKey && (!status.checkedAt || Date.now() - status.checkedAt > 604_800_000)) {
      void verifyLicense(status.licenseKey).then(setIsPro);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('welcome') === '1') {
      setMessage('Welcome to Pro. Paste the key from your receipt below to switch this device on.');
    }
  }, [searchParams]);

  async function handleCheck() {
    const key = licenseKey.trim();
    if (!key) {
      setError('Paste the key from your receipt first.');
      return;
    }
    setChecking(true);
    setError(null);
    setMessage(null);

    const active = await verifyLicense(key);
    setChecking(false);
    setIsPro(active);

    if (active) {
      setLicenseKey(key);
      setMessage('That key works. This device is Pro now.');
    } else {
      setError('That key is not active. Check it against the receipt, or write to us.');
    }
  }

  async function handleBuy() {
    setBusy(true);
    setError(null);
    const result = await startCheckout();
    setBusy(false);

    if (result.ok) {
      window.location.href = result.url;
    } else {
      setError(result.error);
    }
  }

  function handleRemove() {
    clearPro();
    setIsPro(false);
    setLicenseKey('');
    setMessage('This device is no longer Pro.');
  }

  return (
    <>
      <Seo
        title="Pro"
        description="USA GeoArena Pro removes the advertising and adds a daily round for every sport - NFL, MLB, NBA, NHL, soccer and racing."
        path="/pro"
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full hover:bg-white/60"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-script mb-1 flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                Pro
              </h1>
              <p className="text-gray-600">For the people who play every day.</p>
            </div>
          </div>
          {isPro && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-yellow-400 text-gray-900 rounded-full">
                  <Crown className="w-3 h-3 mr-1" /> Pro
                </Badge>
                <span className="text-gray-700 font-medium">
                  This device is Pro. The advertising is gone.
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Pick the sport you want your extra round from:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRO_SPORTS.map((option) => (
                  <Button
                    key={option.id}
                    size="sm"
                    variant={sport === option.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSport(option.id);
                      setProSport(option.id);
                    }}
                    className="rounded-full"
                  >
                    {option.emoji} {option.label}
                  </Button>
                ))}
              </div>
              <button
                onClick={handleRemove}
                className="mt-4 text-xs text-gray-500 underline hover:text-primary"
              >
                Remove the licence from this device
              </button>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card className="rounded-2xl h-full border-orange-100">
                  <CardContent className="p-5">
                    <div className="text-3xl mb-2">{benefit.emoji}</div>
                    <h3 className="font-bold text-gray-800 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="rounded-2xl border-2 border-primary/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-800">$2.99</span>
                <span className="text-gray-600">per month</span>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Cancel whenever you like. The advertisements come back when you do.
              </p>
              <Button
                size="lg"
                onClick={handleBuy}
                disabled={busy}
                className="rounded-full px-8 w-full sm:w-auto"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting checkout…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Pro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-gray-200">
            <CardContent className="p-6">
              <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Already bought it?
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Paste the licence key from your receipt and this device will switch on.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={licenseKey}
                  onChange={(event) => setLicenseKey(event.target.value)}
                  placeholder="Your licence key"
                  className="rounded-full flex-1"
                  aria-label="Licence key"
                />
                <Button
                  onClick={handleCheck}
                  disabled={checking}
                  className="rounded-full px-6"
                >
                  {checking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Check the key
                    </>
                  )}
                </Button>
              </div>
              {message && (
                <p className="mt-3 text-sm text-green-700 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {message}
                </p>
              )}
              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
