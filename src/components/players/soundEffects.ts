/**
 * Tiny synthesized sound effects (Web Audio) — no audio files, nothing downloaded.
 * Silently does nothing where Web Audio is unavailable (tests, old browsers).
 */
export type SoundEffect = 'correct' | 'wrong' | 'win' | 'tap';

interface Tone {
  frequency: number;
  duration: number;
  delay: number;
}

const EFFECTS: Record<SoundEffect, readonly Tone[]> = {
  correct: [
    { frequency: 660, duration: 0.12, delay: 0 },
    { frequency: 880, duration: 0.16, delay: 0.1 },
  ],
  wrong: [{ frequency: 220, duration: 0.2, delay: 0 }],
  win: [
    { frequency: 523, duration: 0.14, delay: 0 },
    { frequency: 659, duration: 0.14, delay: 0.14 },
    { frequency: 784, duration: 0.24, delay: 0.28 },
  ],
  tap: [{ frequency: 440, duration: 0.05, delay: 0 }],
};

const VOLUME = 0.08;

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  context ??= new AudioContext();
  return context;
}

export function playSoundEffect(effect: SoundEffect): void {
  const audio = getContext();
  if (!audio) return;
  for (const tone of EFFECTS[effect]) {
    const start = audio.currentTime + tone.delay;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = tone.frequency;
    gain.gain.setValueAtTime(VOLUME, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + tone.duration);
  }
}
