import { describe, it, expect } from 'vitest';
import {
  generateCode,
  evaluateGuess,
  isSolved,
} from '../src/games/superdecoder/engine.js';

// Helper: assert the section 9.1 invariant that aggregated greens/whites
// always match the per-position marks.
function assertConsistent(feedback) {
  const greenMarks = feedback.perPosition.filter((m) => m === 'green').length;
  const whiteMarks = feedback.perPosition.filter((m) => m === 'white').length;
  expect(greenMarks).toBe(feedback.greens);
  expect(whiteMarks).toBe(feedback.whites);
}

describe('evaluateGuess — no repeats', () => {
  it('all correct → 4 greens', () => {
    const fb = evaluateGuess(
      ['red', 'green', 'blue', 'yellow'],
      ['red', 'green', 'blue', 'yellow'],
    );
    expect(fb.greens).toBe(4);
    expect(fb.whites).toBe(0);
    expect(fb.perPosition).toEqual(['green', 'green', 'green', 'green']);
    assertConsistent(fb);
  });

  it('all present but misplaced → 0 greens, 4 whites', () => {
    const fb = evaluateGuess(
      ['yellow', 'blue', 'green', 'red'],
      ['red', 'green', 'blue', 'yellow'],
    );
    expect(fb.greens).toBe(0);
    expect(fb.whites).toBe(4);
    assertConsistent(fb);
  });

  it('none present → all none', () => {
    const fb = evaluateGuess(
      ['cyan', 'cyan', 'cyan', 'cyan'],
      ['red', 'green', 'blue', 'yellow'],
    );
    expect(fb.greens).toBe(0);
    expect(fb.whites).toBe(0);
    expect(fb.perPosition).toEqual(['none', 'none', 'none', 'none']);
    assertConsistent(fb);
  });

  it('mix of greens and whites', () => {
    const fb = evaluateGuess(
      ['red', 'blue', 'green', 'cyan'],
      ['red', 'green', 'blue', 'yellow'],
    );
    // red@0 green; blue present (misplaced); green present (misplaced); cyan absent
    expect(fb.greens).toBe(1);
    expect(fb.whites).toBe(2);
    assertConsistent(fb);
  });
});

describe('evaluateGuess — with repeats (critical cases)', () => {
  it('guess has more of a color than code counts min correctly', () => {
    // code has one red; guess has three reds, one at correct position
    const fb = evaluateGuess(
      ['red', 'red', 'red', 'blue'],
      ['red', 'green', 'green', 'blue'],
    );
    // red@0 green, blue@3 green; extra reds should NOT produce whites (code has 1 red)
    expect(fb.greens).toBe(2);
    expect(fb.whites).toBe(0);
    assertConsistent(fb);
  });

  it('code has repeats, guess partially matches', () => {
    const fb = evaluateGuess(
      ['red', 'blue', 'red', 'yellow'],
      ['red', 'red', 'green', 'blue'],
    );
    // pos0 red=red green. code remaining: red@1, green@2, blue@3
    // guess blue@1 → white (blue@3), red@2 → white (red@1), yellow@3 → none
    expect(fb.greens).toBe(1);
    expect(fb.whites).toBe(2);
    assertConsistent(fb);
  });

  it('both code and guess full of the same color', () => {
    const fb = evaluateGuess(
      ['red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red'],
    );
    expect(fb.greens).toBe(4);
    expect(fb.whites).toBe(0);
    assertConsistent(fb);
  });

  it('two whites capped by code count', () => {
    const fb = evaluateGuess(
      ['blue', 'blue', 'blue', 'red'],
      ['green', 'blue', 'yellow', 'blue'],
    );
    // blue@1 green. code remaining blue@3. guess blue@0 white, blue@2 → no blue left → none, red none
    expect(fb.greens).toBe(1);
    expect(fb.whites).toBe(1);
    assertConsistent(fb);
  });
});

describe('isSolved', () => {
  it('true when greens === codeLength', () => {
    expect(isSolved({ greens: 4, whites: 0, perPosition: [] }, 4)).toBe(true);
  });
  it('false otherwise', () => {
    expect(isSolved({ greens: 3, whites: 1, perPosition: [] }, 4)).toBe(false);
    expect(isSolved(null, 4)).toBe(false);
  });
});

describe('generateCode', () => {
  const palette = ['red', 'green', 'blue', 'yellow', 'cyan', 'orange'];

  it('produces a code of the requested length from the palette', () => {
    const code = generateCode(palette, 4, true);
    expect(code).toHaveLength(4);
    for (const c of code) expect(palette).toContain(c);
  });

  it('no repeats → all colors distinct', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateCode(palette, 4, false);
      expect(new Set(code).size).toBe(4);
    }
  });

  it('throws when allowRepeats=false and palette too small', () => {
    expect(() => generateCode(['red', 'green'], 4, false)).toThrow();
  });

  it('respects an injected RNG deterministically', () => {
    const seq = [0, 0, 0, 0];
    let i = 0;
    const rng = () => seq[i++];
    const code = generateCode(palette, 4, true, rng);
    expect(code).toEqual(['red', 'red', 'red', 'red']);
  });
});
