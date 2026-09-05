// Pure game logic — no React, fully testable.
// See spec sections 9 and 9.1.

/**
 * Generate a secret code by picking `length` colors from `palette`.
 * @param {string[]} palette - available color ids this level
 * @param {number} length - code length
 * @param {boolean} allowRepeats - whether the same color may repeat
 * @param {() => number} [rng] - injectable RNG (defaults to Math.random) for testing
 * @returns {string[]} the secret code
 */
export function generateCode(palette, length, allowRepeats, rng = Math.random) {
  if (!Array.isArray(palette) || palette.length === 0) {
    throw new Error('generateCode: palette must be a non-empty array');
  }
  if (length < 1) {
    throw new Error('generateCode: length must be >= 1');
  }

  if (allowRepeats) {
    const code = [];
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(rng() * palette.length);
      code.push(palette[idx]);
    }
    return code;
  }

  // No repeats: require enough colors, then draw without replacement.
  if (palette.length < length) {
    throw new Error(
      'generateCode: palette smaller than code length while allowRepeats=false',
    );
  }
  const pool = [...palette];
  const code = [];
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(rng() * pool.length);
    code.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return code;
}

/**
 * Evaluate a guess against the secret code.
 * Returns aggregated greens/whites (advanced mode) AND per-position marks
 * (easy mode). The two representations are guaranteed consistent:
 * count of 'green' in perPosition === greens, count of 'white' === whites.
 *
 * @param {string[]} guess
 * @param {string[]} code
 * @returns {{ greens: number, whites: number, perPosition: ('green'|'white'|'none')[] }}
 */
export function evaluateGuess(guess, code) {
  const n = code.length;
  if (guess.length !== n) {
    throw new Error('evaluateGuess: guess and code must have equal length');
  }

  // --- Aggregated greens ---
  let greens = 0;
  for (let i = 0; i < n; i++) {
    if (guess[i] === code[i]) greens++;
  }

  // --- Aggregated whites (correct with repeats) ---
  const countBy = (arr) => {
    const m = new Map();
    for (const c of arr) m.set(c, (m.get(c) || 0) + 1);
    return m;
  };
  const guessCounts = countBy(guess);
  const codeCounts = countBy(code);
  let matches = 0;
  for (const [color, gCount] of guessCounts) {
    const cCount = codeCounts.get(color) || 0;
    matches += Math.min(gCount, cCount);
  }
  const whites = matches - greens;

  // --- Per-position marks (deterministic, two passes) ---
  const perPosition = new Array(n).fill('none');
  const codeUsed = new Array(n).fill(false);

  // Pass 1 — greens
  for (let i = 0; i < n; i++) {
    if (guess[i] === code[i]) {
      perPosition[i] = 'green';
      codeUsed[i] = true;
    }
  }

  // Pass 2 — whites, left to right
  for (let i = 0; i < n; i++) {
    if (perPosition[i] === 'green') continue;
    for (let j = 0; j < n; j++) {
      if (!codeUsed[j] && code[j] === guess[i]) {
        perPosition[i] = 'white';
        codeUsed[j] = true;
        break;
      }
    }
  }

  return { greens, whites, perPosition };
}

/**
 * @param {{ greens: number }} feedback
 * @param {number} codeLength
 * @returns {boolean} true when the whole code is guessed
 */
export function isSolved(feedback, codeLength) {
  return !!feedback && feedback.greens === codeLength;
}
