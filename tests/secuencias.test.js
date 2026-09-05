import { describe, it, expect } from 'vitest';
import {
  secuenciasReducer,
  createInitialState,
  actions,
  PADS,
} from '../src/games/secuencias/reducer.js';

// Play back the current sequence correctly (as the component would after PLAYED).
function repeatSequence(s) {
  s = secuenciasReducer(s, actions.played());
  for (const color of s.sequence) {
    s = secuenciasReducer(s, actions.press(color));
  }
  return s;
}

describe('secuencias reducer', () => {
  it('START creates a 1-color sequence and shows it', () => {
    const s = secuenciasReducer(createInitialState(), actions.start());
    expect(s.phase).toBe('showing');
    expect(s.sequence).toHaveLength(1);
    expect(PADS).toContain(s.sequence[0]);
  });

  it('PLAYED hands control to the player', () => {
    let s = secuenciasReducer(createInitialState(), actions.start());
    s = secuenciasReducer(s, actions.played());
    expect(s.phase).toBe('input');
  });

  it('repeating correctly extends the sequence and replays', () => {
    let s = secuenciasReducer(createInitialState(), actions.start());
    const firstLen = s.sequence.length; // 1
    s = repeatSequence(s); // repeat the single color
    expect(s.phase).toBe('showing'); // round cleared → replay
    expect(s.sequence.length).toBe(firstLen + 1); // extended
    expect(s.step).toBe(0);
  });

  it('a wrong press ends the game and records the reached round', () => {
    let s = secuenciasReducer(createInitialState(), actions.start());
    // clear round 1 → sequence length becomes 2
    s = repeatSequence(s);
    // now length 2; play back then press a wrong first color
    s = secuenciasReducer(s, actions.played());
    const wrong = PADS.find((c) => c !== s.sequence[0]);
    s = secuenciasReducer(s, actions.press(wrong));
    expect(s.phase).toBe('gameover');
    expect(s.stats.games).toBe(1);
    expect(s.stats.bestRound).toBe(1); // one round fully repeated
  });

  it('bestRound keeps the max across games', () => {
    let s = createInitialState({ stats: { bestRound: 5, games: 2 } });
    s = secuenciasReducer(s, actions.start());
    const wrong = PADS.find((c) => c !== s.sequence[0]);
    s = secuenciasReducer(s, actions.played());
    s = secuenciasReducer(s, actions.press(wrong)); // fail at round 1 → reached 0
    expect(s.stats.bestRound).toBe(5); // unchanged
    expect(s.stats.games).toBe(3);
  });

  it('presses are ignored until PLAYED', () => {
    let s = secuenciasReducer(createInitialState(), actions.start()); // showing
    const before = s;
    s = secuenciasReducer(s, actions.press(s.sequence[0]));
    expect(s).toBe(before); // no-op while showing
  });
});
