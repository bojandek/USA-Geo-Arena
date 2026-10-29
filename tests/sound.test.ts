/**
 * Tests for the sound preference and the browser audio unlock.
 *
 * Sound is an enhancement, so the important rules are that it never breaks a
 * game when audio is unavailable, and that a suspended context is resumed
 * before the first note is scheduled.
 */

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getSoundSnapshot,
  isSoundEnabled,
  playSound,
  setSoundEnabled,
  subscribeSound,
} from '../src/lib/sound.ts';

class FakeParam {
  setValueAtTime() {}
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
}

class FakeOscillator {
  frequency = new FakeParam();
  type = 'triangle';
  startedAt: number[] = [];
  onended: (() => void) | null = null;

  connect() { return this; }
  disconnect() {}
  start(at: number) { this.startedAt.push(at); }
  stop() {}
}

class FakeGain {
  gain = new FakeParam();
  connect() { return this; }
  disconnect() {}
}

class FakeAudioContext {
  static latest: FakeAudioContext | null = null;

  state = 'suspended';
  currentTime = 12;
  destination = {};
  oscillators: FakeOscillator[] = [];
  resumeCalls = 0;

  constructor() {
    FakeAudioContext.latest = this;
  }

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    return new FakeGain();
  }

  async resume() {
    this.resumeCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 0));
    this.state = 'running';
  }
}

const runtime = globalThis as unknown as {
  window?: { AudioContext?: unknown };
};

describe('sound', () => {
  afterEach(() => {
    setSoundEnabled(true);
  });

  test('the preference and the stable snapshot change together', () => {
    setSoundEnabled(false);
    assert.equal(isSoundEnabled(), false);
    assert.equal(getSoundSnapshot(), false);

    setSoundEnabled(true);
    assert.equal(isSoundEnabled(), true);
    assert.equal(getSoundSnapshot(), true);
  });

  test('listeners hear a change once, not a repeated setting', () => {
    let calls = 0;
    const unsubscribe = subscribeSound(() => { calls += 1; });

    setSoundEnabled(false);
    setSoundEnabled(false);
    assert.equal(calls, 1);

    unsubscribe();
    setSoundEnabled(true);
    assert.equal(calls, 1);
  });

  test('playing is safe when there is no browser audio', () => {
    assert.doesNotThrow(() => playSound('correct'));
    assert.doesNotThrow(() => playSound('wrong'));
    assert.doesNotThrow(() => playSound('complete'));
  });

  test('the first note waits for a suspended context to resume', async () => {
    const previousWindow = runtime.window;
    runtime.window = { AudioContext: FakeAudioContext };

    try {
      playSound('click');
      const context = FakeAudioContext.latest;
      assert.ok(context);
      assert.equal(context.resumeCalls, 1);
      // Nothing is scheduled while the context is still suspended.
      assert.equal(context.oscillators.length, 0);

      await new Promise((resolve) => setTimeout(resolve, 15));
      assert.equal(context.oscillators.length, 1);
      assert.equal(context.oscillators[0].startedAt.length, 1);
      assert.ok(context.oscillators[0].startedAt[0] > context.currentTime);
    } finally {
      runtime.window = previousWindow;
    }
  });
});
