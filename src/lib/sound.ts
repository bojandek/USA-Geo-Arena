/**
 * The sounds the game makes.
 *
 * They are made with the Web Audio API rather than shipped as audio files:
 * there is nothing to download, nothing to cache, and the whole set is a few
 * hundred bytes of code. The tones are short and quiet on purpose - a game
 * that shouts is a game people mute.
 */

export type SoundName = 'correct' | 'wrong' | 'click' | 'streak' | 'complete';

const STORAGE_KEY = 'geoarena-sound';

/* ------------------------------------------------------------------ *
 * The preference
 * ------------------------------------------------------------------ */

let soundEnabled = true;
const listeners = new Set<() => void>();

function readPreference(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'on';
  } catch {
    return true;
  }
}

soundEnabled = readPreference();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** True when the game is allowed to make a noise. */
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/** Stable snapshot, as `useSyncExternalStore` requires. */
export function getSoundSnapshot(): boolean {
  return soundEnabled;
}

/** Registers a listener; returns the unsubscribe function. */
export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Turns the sound on or off and remembers the choice. */
export function setSoundEnabled(enabled: boolean): void {
  if (soundEnabled === enabled) return;
  soundEnabled = enabled;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    } catch {
      // Storage may be unavailable - the app still works.
    }
  }
  notify();
}

/* ------------------------------------------------------------------ *
 * The sound
 * ------------------------------------------------------------------ */

let context: AudioContext | null = null;

/**
 * Returns a running audio context, or null when audio is unavailable.
 *
 * Browsers keep the context suspended until the visitor interacts. Resuming
 * it is asynchronous, so the caller must wait before scheduling the first
 * note - scheduling immediately after `resume()` is why the first sound was
 * sometimes lost.
 */
async function audioContext(): Promise<AudioContext | null> {
  if (typeof window === 'undefined') return null;

  if (context?.state === 'closed') context = null;

  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
    } catch {
      return null;
    }
  }

  if (context.state !== 'running') {
    try {
      // This also covers Safari's interrupted state, not only the initial
      // suspended one.
      await context.resume();
    } catch {
      // A browser may still refuse playback. The next interaction can retry.
      return null;
    }
  }

  return context.state === 'running' ? context : null;
}

interface Note {
  /** Frequency in hertz. */
  frequency: number;
  /** When the note starts, in seconds from the start of the sound. */
  at: number;
  /** How long the note lasts, in seconds. */
  duration: number;
  /** The shape of the wave. */
  wave: OscillatorType;
  /** How loud the note is, from 0 to 1. */
  gain: number;
}

/** The tune for each sound. */
const TUNES: Record<SoundName, Note[]> = {
  // Two quick notes that go up: something right.
  correct: [
    { frequency: 784, at: 0, duration: 0.12, wave: 'triangle', gain: 0.12 },
    { frequency: 1047, at: 0.09, duration: 0.18, wave: 'triangle', gain: 0.1 },
  ],
  // One note that goes down and is not very bright.
  wrong: [
    { frequency: 300, at: 0, duration: 0.22, wave: 'sine', gain: 0.1 },
    { frequency: 220, at: 0.12, duration: 0.26, wave: 'sine', gain: 0.08 },
  ],
  // A very short, soft blip for a tap. A triangle is much less harsh than the
  // old square wave, especially on phone speakers.
  click: [{ frequency: 720, at: 0, duration: 0.06, wave: 'triangle', gain: 0.035 }],
  // Three notes climbing, for a streak.
  streak: [
    { frequency: 659, at: 0, duration: 0.11, wave: 'triangle', gain: 0.1 },
    { frequency: 784, at: 0.1, duration: 0.11, wave: 'triangle', gain: 0.1 },
    { frequency: 1047, at: 0.2, duration: 0.22, wave: 'triangle', gain: 0.12 },
  ],
  // A short run of notes for finishing a round.
  complete: [
    { frequency: 523, at: 0, duration: 0.13, wave: 'triangle', gain: 0.1 },
    { frequency: 659, at: 0.11, duration: 0.13, wave: 'triangle', gain: 0.1 },
    { frequency: 784, at: 0.22, duration: 0.13, wave: 'triangle', gain: 0.1 },
    { frequency: 1047, at: 0.33, duration: 0.32, wave: 'triangle', gain: 0.12 },
  ],
};

/**
 * Plays one of the sounds.
 *
 * It does nothing when the sound is turned off, or when there is no browser
 * to play it in, so it is safe to call from anywhere. Playback is scheduled
 * after the context has actually resumed; failures stay out of the game.
 */
export function playSound(name: SoundName): void {
  if (!soundEnabled) return;
  void scheduleSound(name);
}

async function scheduleSound(name: SoundName): Promise<void> {
  try {
    const ctx = await audioContext();
    // The preference may have changed while the context was resuming.
    if (!ctx || !soundEnabled) return;

    const notes = TUNES[name];
    // A small offset avoids scheduling a note in the past on slower devices.
    const start = ctx.currentTime + 0.005;

    for (const note of notes) {
      const oscillator = ctx.createOscillator();
      const amplifier = ctx.createGain();
      const at = start + note.at;
      const end = at + note.duration;
      const attackEnd = at + Math.min(0.012, note.duration * 0.25);

      oscillator.type = note.wave;
      oscillator.frequency.setValueAtTime(note.frequency, at);

      // A short fade in and out, so the note does not click. Never ramp
      // exponentially from exactly zero: zero is not a valid exponential
      // target and some browsers handle it differently.
      amplifier.gain.setValueAtTime(0.0001, at);
      amplifier.gain.linearRampToValueAtTime(note.gain, attackEnd);
      amplifier.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(amplifier);
      amplifier.connect(ctx.destination);
      oscillator.start(at);
      oscillator.stop(end + 0.02);
      oscillator.onended = () => {
        oscillator.disconnect();
        amplifier.disconnect();
      };
    }
  } catch {
    // Audio is an enhancement. A browser or device refusing it must never
    // interrupt an answer, a round, or a click on the map.
  }
}