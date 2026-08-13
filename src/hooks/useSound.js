import { createContext, useContext, useMemo, useRef, useEffect } from 'react';

// Isolated audio layer (spec section 12). Web Audio API beeps, created lazily
// on first use (browsers require a user gesture). Respects `muted`.
export const SoundContext = createContext(null);

export function useSoundApi(muted) {
  const ctxRef = useRef(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  return useMemo(() => {
    const getCtx = () => {
      if (mutedRef.current) return null;
      if (typeof window === 'undefined') return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctxRef.current) ctxRef.current = new AC();
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      return ctxRef.current;
    };

    // Play one beep: freq (Hz), duration (s), type, gain, delay (s).
    const beep = (freq, dur, type = 'square', gain = 0.06, delay = 0) => {
      const ctx = getCtx();
      if (!ctx) return;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    };

    return {
      select: () => beep(520, 0.06, 'square'),
      move: () => beep(340, 0.04, 'triangle', 0.04),
      check: () => beep(440, 0.08, 'sawtooth', 0.05),
      win: () => {
        // Ascending retro arpeggio.
        beep(523, 0.1, 'square', 0.06, 0);
        beep(659, 0.1, 'square', 0.06, 0.1);
        beep(784, 0.1, 'square', 0.06, 0.2);
        beep(1047, 0.18, 'square', 0.07, 0.3);
      },
      lose: () => {
        // Descending sad blip.
        beep(300, 0.14, 'square', 0.06, 0);
        beep(220, 0.22, 'square', 0.06, 0.14);
      },
    };
  }, []);
}

export function useSound() {
  return useContext(SoundContext);
}

// Watches state transitions and plays phase-based sounds (win/lose/check).
// Color-select/move sounds are fired directly by the input components.
export function useGameSound(state, sound) {
  const prev = useRef({ phase: state.phase, submitted: 0 });

  useEffect(() => {
    if (!sound) return;
    const submitted = state.guesses.filter((g) => g.feedback != null).length;
    const p = prev.current;

    if (state.phase === 'won' && p.phase !== 'won') {
      sound.win();
    } else if (state.phase === 'lost' && p.phase !== 'lost') {
      sound.lose();
    } else if (
      state.phase === 'playing' &&
      submitted > p.submitted
    ) {
      sound.check();
    }

    prev.current = { phase: state.phase, submitted };
  }, [state.phase, state.guesses, sound]);
}
