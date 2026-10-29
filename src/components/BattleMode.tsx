import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, MapLayerMouseEvent, type MapRef } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Timer, Trophy, Target, X, RotateCcw, Maximize2, Minimize2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getDailyQuestions, calculateDistance, calculateScore, formatPoints, type Question } from '@/lib/game-data';
import { scoreAnswer } from '@/lib/time-bonus';
import { roundScore } from '@/lib/numbers';
import { useGameStore } from '@/lib/game-store';
import { playSound } from '@/lib/sound';
import MapSelect from '@/components/MapSelect';
import { getMapStyleSource } from '@/lib/map-styles';
import { useMapStyle } from '@/hooks/useMapStyle';
import { useMapOptions } from '@/hooks/useMapOptions';
import { applyAtmosphere } from '@/lib/map-atmosphere';
import { placeNameAtPoint, setPlaceLabelsVisible } from '@/lib/map-places';
import { arcCoordinates, revealLine, toLineFeature, toPointFeature, frameTwoPoints, worldWidthInPixels, MARKER_CLEARANCE } from '@/lib/map-framing';
import AdSlot from '@/components/AdSlot';
import NewsletterSignup from '@/components/NewsletterSignup';

interface BattleModeProps {
  onExit?: () => void;
}

type BattlePhase = 'searching' | 'countdown' | 'playing' | 'result';

/** Emoji used in the battle HUD. */
const HINT_EMOJI = '💡';
const BATTLE_HINT = '⚡';

const MAX_ROUNDS = 3;
const ROUND_SECONDS = 30;
const OPPONENTS = [
  { name: 'Marko P.', country: '🇭🇷' },
  { name: 'Lena K.', country: '🇩🇪' },
  { name: 'Sofia R.', country: '🇪🇸' },
  { name: 'Jonas B.', country: '🇳🇱' },
  { name: 'Ana T.', country: '🇧🇷' },
];

export default function BattleMode({ onExit }: BattleModeProps) {
  const { completePractice } = useGameStore();

  const [phase, setPhase] = useState<BattlePhase>('searching');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  /** The real place, shown for the two seconds the round is on the screen. */
  const [answer, setAnswer] = useState<{ lat: number; lng: number; distance: number } | null>(null);
  /** The camera the map has to move to once the answer is shown. */
  const [camera, setCamera] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const mapRef = useRef<MapRef>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [roundScores, setRoundScores] = useState<Array<{ player: number; opponent: number }>>([]);
  const { mapStyleId } = useMapStyle();
  // A battle is a quick three-round game on the whole world. The flat map is
  // what keeps every place reachable with a quick pan, so the battle keeps it
  // whatever the daily round is drawn on.
  const projection = 'mercator';
  const { options: mapOptions } = useMapOptions();
  /** The place the player named, when they answered by clicking on a name. */
  const [namedPlace, setNamedPlace] = useState<string | null>(null);

  // The question panel floats above the map and can be collapsed.
  const [panelOpen, setPanelOpen] = useState(true);

  // Guards against a double submit scoring the round twice.
  const roundLocked = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultSaved = useRef(false);
  // When the current round started, used for the speed bonus.
  const roundStartedAt = useRef<number>(Date.now());

  const opponent = useMemo(
    () => OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)],
    [],
  );

  // The air around the map and the names written on it.
  //
  // Both are the player's choice, and both have to be put on the map again
  // every time the style is loaded: a new style comes with its own layers,
  // and the ones that draw the place names go with the old style.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const apply = () => {
      applyAtmosphere(map, mapOptions.atmosphere);
      setPlaceLabelsVisible(map, mapOptions.labels);
    };

    apply();
    map.on('style.load', apply);
    return () => {
      map.off('style.load', apply);
    };
  }, [mapOptions.atmosphere, mapOptions.labels]);

  // Clear any pending timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // Matchmaking
  useEffect(() => {
    if (phase !== 'searching') return;
    const timer = setTimeout(() => {
      setQuestions(getDailyQuestions());
      toast.success(`Opponent found: ${opponent.name}!`);
      setPhase('countdown');
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, opponent]);

  // Countdown before the match starts
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    setPhase('playing');
    setTimeLeft(ROUND_SECONDS);
    roundStartedAt.current = Date.now();
  }, [phase, countdown]);

  const advanceRound = useCallback(
    (nextPlayerScore: number, nextOpponentScore: number) => {
      setRoundScores((prev) => [
        ...prev,
        { player: roundScore(nextPlayerScore), opponent: roundScore(nextOpponentScore) },
      ]);

      if (questionIndex + 1 >= MAX_ROUNDS || questions.length === 0) {
        setPhase('result');
        return;
      }

      setQuestionIndex((idx) => idx + 1);
      setUserGuess(null);
      setNamedPlace(null);
      setAnswer(null);
      setCamera(null);
      setTimeLeft(ROUND_SECONDS);
      roundLocked.current = false;
      roundStartedAt.current = Date.now();
    },
    [questionIndex, questions.length],
  );

  // Round timer
  useEffect(() => {
    if (phase !== 'playing') return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }

    // Time is up: the opponent answers and the round advances.
    if (roundLocked.current) return;
    roundLocked.current = true;
    toast.error('Time is up!');

    const opponentDist = Math.random() * 3000;
    const opponentRoundScore = calculateScore(opponentDist);
    const nextOpponentScore = opponentScore + opponentRoundScore;

    setOpponentScore(nextOpponentScore);
    advanceTimer.current = setTimeout(
      () => advanceRound(playerScore, nextOpponentScore),
      2000,
    );
  }, [phase, timeLeft, advanceRound, playerScore, opponentScore]);

  const currentQuestion = questions[questionIndex];

  /**
   * The name of the place under the cursor, when it is the answer.
   *
   * A player who knows where they are can answer by clicking on the name of
   * the place rather than by dropping a pin on the right pixel.
   */
  const placeNameAtPointEvent = useCallback(
    (event: MapLayerMouseEvent): string | null => {
      const map = mapRef.current?.getMap();
      if (!map) return null;
      return placeNameAtPoint(map, event.point, currentQuestion);
    },
    [currentQuestion],
  );

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (phase !== 'playing' || userGuess || roundLocked.current) return;
    const named = placeNameAtPointEvent(event);
    if (named) {
      setNamedPlace(named);
      toast.success(`🏙️ ${named} — that's the one!`, { position: 'top-center' });
    }
    setUserGuess({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    playSound('click');
  };

  const handleSubmit = () => {
    if (!userGuess || !currentQuestion || roundLocked.current) return;
    roundLocked.current = true;

    const dist = calculateDistance(
      userGuess.lat,
      userGuess.lng,
      currentQuestion.lat,
      currentQuestion.lng,
    );
    const distancePoints = namedPlace ? calculateScore(0) : calculateScore(dist);

    // The same answer sounds as the daily challenge, so the game feels like
    // one game rather than two modes with different rules.
    playSound(namedPlace || dist < 25 ? 'correct' : 'wrong');

    // Same rule as the daily challenge: 90% of the points come from the
    // location and up to 10% from the speed, so speed can never outweigh
    // accuracy.
    const elapsedSeconds = (Date.now() - roundStartedAt.current) / 1000;
    const { score, timePoints } = scoreAnswer(distancePoints, elapsedSeconds);
    // Rounded on every step so the running total never drifts.
    const nextPlayerScore = roundScore(playerScore + score);

    // Simulated opponent answer.
    const opponentDist = Math.random() * 3000;
    const opponentRoundScore = calculateScore(opponentDist);
    const nextOpponentScore = roundScore(opponentScore + opponentRoundScore);

    setPlayerScore(nextPlayerScore);
    setOpponentScore(nextOpponentScore);

    // The real place is shown for the two seconds the round stays on screen,
    // and the map is framed so that both it and the guess are visible.
    setAnswer({ lat: currentQuestion.lat, lng: currentQuestion.lng, distance: dist });
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      const container = map.getContainer();
      const zoom = map.getZoom();
      const a = map.project([userGuess.lng, userGuess.lat]);
      const b = map.project([currentQuestion.lng, currentQuestion.lat]);
      const framing = frameTwoPoints({
        a,
        b,
        worldWidth: worldWidthInPixels(
          a,
          b,
          currentQuestion.lng - userGuess.lng,
          512 * Math.pow(2, zoom),
        ),
        zoom,
        width: container.clientWidth,
        height: container.clientHeight,
        padding: {
          top: 140 + MARKER_CLEARANCE.top,
          bottom: 140 + MARKER_CLEARANCE.bottom,
          left: 100 + MARKER_CLEARANCE.left,
          right: 100 + MARKER_CLEARANCE.right,
        },
      });
      const middle = map.unproject([framing.midpoint.x, framing.midpoint.y]);
      setCamera({ center: [middle.lng, middle.lat], zoom: framing.zoom });
    }

    toast.success(`+${formatPoints(score)} points!`, {
      description: timePoints > 0 ? `+${formatPoints(timePoints)} speed bonus ⚡` : undefined,
    });

    advanceTimer.current = setTimeout(
      () => advanceRound(nextPlayerScore, nextOpponentScore),
      2000,
    );
  };

  // The camera is moved once the answer is on the screen, because the map
  // puts its view back where it was as soon as anything is drawn on it.
  useEffect(() => {
    if (!camera || !mapRef.current) return;
    const map = mapRef.current.getMap();
    const target = camera;
    map.flyTo({ center: target.center, zoom: target.zoom, duration: 1500 });
    const check = () => {
      if (Math.abs(map.getZoom() - target.zoom) > 0.05) {
        map.jumpTo({ center: target.center, zoom: target.zoom });
      }
    };
    map.once('moveend', check);
    return () => {
      map.off('moveend', check);
    };
  }, [camera]);

  // The curve from the guess to the real place.
  //
  // It is worked out in the normalised Mercator square, where the whole world
  // is one unit across, so its shape comes from where the two places are and
  // not from how far the map happens to be zoomed in. That is what stops the
  // line from twitching while the camera is moving. It also keeps clear of
  // the two markers instead of running through them.
  const fullLine = useMemo(() => {
    if (!answer || !userGuess) return null;
    return arcCoordinates([userGuess.lng, userGuess.lat], [answer.lng, answer.lat]);
  }, [answer, userGuess]);

  // The line is put on the map directly rather than through the Source
  // component, and it is drawn on by hand, a piece at a time, so that it
  // grows out from the guess towards the real place.
  const lineSourceRef = useRef<GeoJSONSource | null>(null);
  const lineHeadRef = useRef<GeoJSONSource | null>(null);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const remove = (sourceId: string, layerId: string) => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };

    if (!fullLine) {
      remove('battle-line', 'battle-line-layer');
      remove('battle-line-head', 'battle-line-head-layer');
      lineSourceRef.current = null;
      lineHeadRef.current = null;
      return;
    }

    const start = fullLine.slice(0, 2);

    const existing = map.getSource('battle-line') as GeoJSONSource | undefined;
    if (existing) {
      existing.setData(toLineFeature(start));
      lineSourceRef.current = existing;
    } else {
      map.addSource('battle-line', { type: 'geojson', data: toLineFeature(start) });
      map.addLayer({
        id: 'battle-line-layer',
        type: 'line',
        source: 'battle-line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ef4444',
          'line-width': 3,
          'line-dasharray': [1.6, 1.6],
          'line-opacity': 0.9,
        },
      });
      lineSourceRef.current = map.getSource('battle-line') as GeoJSONSource;
    }

    const headExisting = map.getSource('battle-line-head') as GeoJSONSource | undefined;
    if (headExisting) {
      headExisting.setData(toPointFeature(start[0]));
      lineHeadRef.current = headExisting;
    } else {
      map.addSource('battle-line-head', {
        type: 'geojson',
        data: toPointFeature(start[0]),
      });
      map.addLayer({
        id: 'battle-line-head-layer',
        type: 'circle',
        source: 'battle-line-head',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ef4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      lineHeadRef.current = map.getSource('battle-line-head') as GeoJSONSource;
    }
  }, [fullLine]);

  // The line draws itself from the guess to the real place.
  useEffect(() => {
    if (!fullLine) return;
    const source = lineSourceRef.current;
    if (!source) return;
    const head = lineHeadRef.current;

    let frame = 0;
    const started = performance.now();
    const duration = 750;

    const draw = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const { drawn, head: tip } = revealLine(fullLine, progress);
      source.setData(toLineFeature(drawn));
      if (head) head.setData(toPointFeature(tip));
      if (progress < 1) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [fullLine]);

  const restart = () => {
    roundLocked.current = false;
    resultSaved.current = false;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setPhase('searching');
    setCountdown(3);
    setTimeLeft(ROUND_SECONDS);
    setQuestionIndex(0);
    setUserGuess(null);
    setNamedPlace(null);
    setAnswer(null);
    setCamera(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setRoundScores([]);
  };

  // Persist the final battle result once the match is over.
  useEffect(() => {
    if (phase !== 'result' || resultSaved.current) return;
    resultSaved.current = true;
    // Battles are practice-style: they never inflate daily progression.
    completePractice(playerScore);
    playSound('complete');
  }, [phase, playerScore, completePractice]);

  // Searching Screen
  if (phase === 'searching') {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 mx-auto mb-8"
          >
            <Users className="w-24 h-24 text-primary" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 font-script mb-3">
            Looking for opponent...
          </h2>
          <p className="text-lg text-gray-600">This may take a few seconds</p>
          <Button onClick={onExit} variant="ghost" className="mt-6">
            Cancel
          </Button>
        </motion.div>
      </div>
    );
  }

  // Countdown Screen
  if (phase === 'countdown') {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-white">TI</span>
              </div>
              <p className="font-semibold text-gray-800">Ti</p>
            </div>
            
            <Zap className="w-12 h-12 text-yellow-500" />
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">{opponent.country}</span>
              </div>
              <p className="font-semibold text-gray-800">{opponent.name}</p>
            </div>
          </div>

          <motion.div
            key={countdown}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-9xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            {countdown}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Result Screen
  if (phase === 'result') {
    const won = playerScore > opponentScore;
    
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className={`text-white text-center py-12 ${
              won
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-gray-500 to-gray-600'
            }`}>
              <div className="text-8xl mb-6">{won ? '🏆' : '💪'}</div>
              <CardTitle className="text-5xl md:text-6xl font-bold font-script mb-3">
                {won ? 'Victory!' : 'Defeat'}
              </CardTitle>
              <p className="text-xl md:text-2xl opacity-90">
                {won ? 'Congratulations, you won!' : 'Better luck next time!'}
              </p>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-6 rounded-2xl text-center ${
                  won ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'
                }`}>
                  <p className="text-sm text-gray-600 mb-2">Ti</p>
                  <p className="text-4xl font-bold text-gray-800">{formatPoints(playerScore)}</p>
                </div>
                <div className={`p-6 rounded-2xl text-center ${
                  !won ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                }`}>
                  <p className="text-sm text-gray-600 mb-2">{opponent.name}</p>
                  <p className="text-4xl font-bold text-gray-800">{formatPoints(opponentScore)}</p>
                </div>
              </div>

              {/* Rounds */}
              <div>
                <h3 className="font-script text-xl text-gray-700 mb-3">
                  Rounds
                </h3>
                <div className="space-y-2">
                  {roundScores.length === 0 && (
                    <p className="text-sm text-gray-500">No rounds were played.</p>
                  )}
                  {roundScores.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Round {idx + 1}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-600">You {formatPoints(result.player)}</span>
                        <span className="text-gray-300">vs</span>
                        <span className="text-sm text-gray-600">{formatPoints(result.opponent)}</span>
                        <Badge
                          variant={result.player >= result.opponent ? 'default' : 'secondary'}
                          className="rounded-full ml-1"
                        >
                          {result.player >= result.opponent ? 'Won' : 'Lost'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={onExit} size="lg" className="flex-1 rounded-full font-semibold">
                  Back
                </Button>
                <Button
                  onClick={restart}
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-full"
                >
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>

          <NewsletterSignup variant="card" source="battle-results" className="mt-4" />

          <AdSlot slot="afterGame" className="mt-4" />
        </motion.div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="h-full w-full relative overflow-hidden overflow-x-clip bg-gray-50">
      {/* ============ MAP - the base layer ============ */}
      <div className="absolute inset-0">
        <Map
          ref={mapRef}
          initialViewState={{ longitude: 15, latitude: 45, zoom: 2 }}
          projection={projection}
          // One world at a time: a repeated continent at the edge looks like
          // a rendering bug rather than a map.
          renderWorldCopies={false}
          style={{ width: '100%', height: '100%' }}
          mapStyle={getMapStyleSource(mapStyleId)}
          onClick={handleMapClick}
        >
          {userGuess && (
            <Marker longitude={userGuess.lng} latitude={userGuess.lat}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-7 h-7 bg-primary rounded-full border-[3px] border-white shadow-lg flex items-center justify-center"
              >
                <MapPin className="w-4 h-4 text-white" />
              </motion.div>
            </Marker>
          )}

          {/* The real place. It is the same pin as the guess, in green. */}
          {answer && (
            <Marker longitude={answer.lng} latitude={answer.lat}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-7 h-7 bg-green-500 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center"
              >
                <MapPin className="w-4 h-4 text-white" />
              </motion.div>
            </Marker>
          )}
        </Map>
      </div>

      {/* ============ THE TOP BAND ============ */}
      {/* The progress line sits exactly on the boundary between the site menu
          and the map. The question card hangs on it and the controls sit just
          below, so the whole top of the screen reads as one band. */}
      <div className="absolute top-0 inset-x-0 z-30 flex flex-col">
        {/* ============ THE SEAM ============ */}
        <div className="h-0.5 bg-gray-900/10 pointer-events-none order-0 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{
              width: `${((questionIndex + 1) / MAX_ROUNDS) * 100}%`,
            }}
          />
        </div>

        {/* ============ THE ROW ============ */}
        {/* On a wide screen the question sits between the two groups of
            controls. On a narrow one it wraps onto its own line. */}
        <div className="pointer-events-auto mx-auto max-w-6xl px-3 pt-2 flex flex-wrap items-start gap-2 order-1">
          <div className="order-1 flex items-center gap-1.5 shrink-0">
            {/* Timer */}
            <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md shrink-0">
              <Timer className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-xs font-bold text-gray-800">{timeLeft}s</span>
            </span>

            {/* Round */}
            <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md shrink-0">
              <Target className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">
                {questionIndex + 1}/{MAX_ROUNDS}
              </span>
            </span>
          </div>

          <div className="order-2 xl:order-3 ml-auto xl:ml-0 flex items-center gap-1 shrink-0 min-w-0">
            {/* Scores */}
            <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-2.5 py-1.5 shadow-md shrink-0">
              <span className="text-xs font-bold text-gray-800">{formatPoints(playerScore)}</span>
              <span className="text-sm">⚔️</span>
              <span className="text-xs font-bold text-gray-700">{formatPoints(opponentScore)}</span>
            </span>

            <MapSelect
              className="bg-white/90 backdrop-blur shadow-md"
              projection={projection}
            />

            <Button
              onClick={onExit}
              variant="secondary"
              size="icon"
              aria-label="Leave the battle"
              className="rounded-full shadow-md bg-white/90 text-gray-700 hover:bg-white shrink-0 h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={() => setPanelOpen((open) => !open)}
              aria-label={panelOpen ? 'Hide the question and focus the map' : 'Show the question'}
              title={panelOpen ? 'Focus the map' : 'Show the question'}
              className="rounded-full shadow-md bg-white/90 text-gray-700 hover:bg-white h-9 w-9"
            >
              {panelOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key="question-panel"
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="order-3 xl:order-2 basis-full xl:basis-auto xl:flex-1 min-w-0 pointer-events-none"
          >
            <div className="pointer-events-auto mx-auto max-w-3xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-2 border-purple-200 shadow-xl rounded-2xl bg-white/95 backdrop-blur max-h-[45vh] overflow-y-auto overscroll-contain">
                    <CardContent className="p-4">
                      {/* The question may break anywhere, so a long one can
                          never push the card off the screen. */}
                      <p className="text-lg sm:text-xl font-bold text-gray-800 leading-snug min-w-0 break-words">
                        {currentQuestion.text}
                      </p>
                      {currentQuestion.hint && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                          {HINT_EMOJI} {currentQuestion.hint}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>

      {/* Hint */}
      {!userGuess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-[5rem] inset-x-0 z-10 px-3 pointer-events-none"
        >
          <p className="mx-auto w-fit text-xs font-medium text-gray-700 bg-white/85 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
            {BATTLE_HINT} Click on the map before the time runs out
          </p>
        </motion.div>
      )}

      {/* ============ BOTTOM ACTION BAR ============ */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-3">
        <div className="mx-auto max-w-3xl">
          <Button
            onClick={handleSubmit}
            disabled={!userGuess}
            size="lg"
            className="w-full rounded-full shadow-2xl font-bold h-12 bg-gradient-to-r from-blue-500 to-purple-500"
          >
            <Zap className="w-5 w-5 mr-2" />
            Submit Answer
          </Button>
        </div>
      </div>
    </div>
  );
}
