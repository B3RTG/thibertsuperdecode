import { describe, it, expect } from 'vitest';
import {
  gameReducer,
  createInitialState,
  actions,
} from '../src/games/superdecoder/reducer.js';

// Deterministic helper: fill the active row with a specific set of colors.
function fillRow(state, colors) {
  let s = state;
  colors.forEach((c, pos) => {
    s = gameReducer(s, actions.setColor(pos, c));
  });
  return s;
}

describe('state machine — 1 player', () => {
  it('NEW_GAME(1p) goes straight to playing with a secret', () => {
    const s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    expect(s.phase).toBe('playing');
    expect(s.secret).toHaveLength(s.codeLength);
    expect(s.guesses).toHaveLength(s.maxAttempts);
  });

  it('SUBMIT is ignored while the row is incomplete', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = gameReducer(s, actions.setColor(0, s.palette[0]));
    const before = s.activeRow;
    s = gameReducer(s, actions.submitGuess());
    expect(s.activeRow).toBe(before);
    expect(s.phase).toBe('playing');
  });

  it('guessing the secret → won', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = fillRow(s, s.secret);
    s = gameReducer(s, actions.submitGuess());
    expect(s.phase).toBe('won');
    expect(s.guesses[0].feedback.greens).toBe(s.codeLength);
  });

  it('exhausting attempts → lost, RESET_LEVEL repeats same secret', () => {
    // Force a tiny game via config for a fast loss.
    let s = createInitialState();
    s = gameReducer(s, actions.updateConfig({ maxAttempts: 4, colorCount: 6 }));
    s = gameReducer(s, actions.newGame(1, 'easy'));
    const secret = s.secret;
    // Build a wrong guess guaranteed to differ from the secret.
    const wrong = secret.map((c) =>
      s.palette.find((p) => p !== c),
    );
    for (let i = 0; i < s.maxAttempts; i++) {
      s = fillRow(s, wrong);
      s = gameReducer(s, actions.submitGuess());
    }
    expect(s.phase).toBe('lost');
    s = gameReducer(s, actions.resetLevel());
    expect(s.phase).toBe('playing');
    expect(s.secret).toEqual(secret); // lenient: same level
    expect(s.activeRow).toBe(0);
  });

  it('NEXT_LEVEL increments level and makes a new secret', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = fillRow(s, s.secret);
    s = gameReducer(s, actions.submitGuess());
    const lvl = s.level;
    s = gameReducer(s, actions.nextLevel());
    expect(s.phase).toBe('playing');
    expect(s.level).toBe(lvl + 1);
  });
});

describe('state machine — 2 players', () => {
  it('flows settingCode → handoff → playing without leaking the secret early', () => {
    let s = gameReducer(createInitialState(), actions.newGame(2, 'advanced'));
    expect(s.phase).toBe('settingCode');

    const code = s.palette.slice(0, s.codeLength);
    s = fillRow(s, code); // fills guesses[0] as the draft
    s = gameReducer(s, actions.confirmCode(s.guesses[0].pegs));
    expect(s.phase).toBe('handoff');
    expect(s.secret).toEqual(code);
    expect(s.codeSetter).toBe(1);

    s = gameReducer(s, actions.confirmHandoff());
    expect(s.phase).toBe('playing');
    // Guessing board is fresh (secret not shown in a row)
    expect(s.guesses.every((g) => g.pegs.every((p) => p === null))).toBe(true);
  });

  it('SWAP_ROLES gives the other player the code-setter role', () => {
    let s = gameReducer(createInitialState(), actions.newGame(2, 'easy'));
    const code = s.palette.slice(0, s.codeLength);
    s = fillRow(s, code);
    s = gameReducer(s, actions.confirmCode(s.guesses[0].pegs));
    s = gameReducer(s, actions.confirmHandoff());
    s = fillRow(s, s.secret);
    s = gameReducer(s, actions.submitGuess());
    expect(s.phase).toBe('won');
    s = gameReducer(s, actions.swapRoles());
    expect(s.phase).toBe('settingCode');
    expect(s.codeSetter).toBe(2);
  });
});

describe('input actions', () => {
  it('SET_COLOR (palette) advances the active peg', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = gameReducer(s, actions.setColor(0, s.palette[0]));
    expect(s.guesses[0].pegs[0]).toBe(s.palette[0]);
    expect(s.activePeg).toBe(1);
  });

  it('CYCLE_COLOR (knob/keyboard) dials in place without advancing', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = gameReducer(s, actions.cycleColor(+1));
    expect(s.activePeg).toBe(0);
    expect(s.guesses[0].pegs[0]).toBe(s.palette[0]);
    s = gameReducer(s, actions.cycleColor(+1));
    expect(s.activePeg).toBe(0); // still on peg 0
    expect(s.guesses[0].pegs[0]).toBe(s.palette[1]); // dialed to next color
  });
});

describe('stats (Phase 3)', () => {
  it('records a win: played/won/streak and best attempts', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = fillRow(s, s.secret);
    s = gameReducer(s, actions.submitGuess());
    expect(s.phase).toBe('won');
    expect(s.stats.played).toBe(1);
    expect(s.stats.won).toBe(1);
    expect(s.stats.streak).toBe(1);
    expect(s.stats.bestAttempts).toBe(1);
  });

  it('records a loss and resets the streak', () => {
    let s = createInitialState();
    s = gameReducer(s, actions.updateConfig({ maxAttempts: 4 }));
    s = gameReducer(s, actions.newGame(1, 'easy'));
    const wrong = s.secret.map((c) => s.palette.find((p) => p !== c));
    for (let i = 0; i < s.maxAttempts; i++) {
      s = fillRow(s, wrong);
      s = gameReducer(s, actions.submitGuess());
    }
    expect(s.phase).toBe('lost');
    expect(s.stats.lost).toBe(1);
    expect(s.stats.streak).toBe(0);
  });

  it('does not track stats in 2-player', () => {
    let s = gameReducer(createInitialState(), actions.newGame(2, 'easy'));
    const code = s.palette.slice(0, s.codeLength);
    s = fillRow(s, code);
    s = gameReducer(s, actions.confirmCode(s.guesses[0].pegs));
    s = gameReducer(s, actions.confirmHandoff());
    s = fillRow(s, s.secret);
    s = gameReducer(s, actions.submitGuess());
    expect(s.phase).toBe('won');
    expect(s.stats.played).toBe(0);
  });

  it('TIME_UP loses the round and flags timedOut (1-player stats counted)', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    expect(s.timedOut).toBe(false);
    s = gameReducer(s, actions.timeUp());
    expect(s.phase).toBe('lost');
    expect(s.timedOut).toBe(true);
    expect(s.stats.lost).toBe(1);
  });

  it('TIME_UP is ignored when not playing', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = fillRow(s, s.secret);
    s = gameReducer(s, actions.submitGuess()); // won
    const before = s;
    s = gameReducer(s, actions.timeUp());
    expect(s).toBe(before); // no-op
  });

  it('starting a new round clears timedOut', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = gameReducer(s, actions.timeUp()); // lost, timedOut true
    s = gameReducer(s, actions.resetLevel());
    expect(s.phase).toBe('playing');
    expect(s.timedOut).toBe(false);
  });

  it('RESET_STATS clears everything', () => {
    let s = gameReducer(createInitialState(), actions.newGame(1, 'easy'));
    s = fillRow(s, s.secret);
    s = gameReducer(s, actions.submitGuess());
    s = gameReducer(s, actions.resetStats());
    expect(s.stats.played).toBe(0);
    expect(s.stats.won).toBe(0);
  });
});

describe('config', () => {
  it('UPDATE_CONFIG applies to the next game, persist-relevant fields update', () => {
    let s = createInitialState();
    s = gameReducer(s, actions.updateConfig({ colorCount: 8, maxAttempts: 10 }));
    expect(s.palette).toHaveLength(8);
    s = gameReducer(s, actions.newGame(1, 'advanced'));
    expect(s.maxAttempts).toBe(10);
    expect(s.palette).toHaveLength(8);
  });

  // Win the active round and advance to the next level.
  const winAndAdvance = (s) => {
    s = fillRow(s, s.secret);
    s = gameReducer(s, actions.submitGuess());
    return gameReducer(s, actions.nextLevel());
  };

  it('scales the palette with the level in 1-player when enabled', () => {
    let s = createInitialState();
    s = gameReducer(s, actions.updateConfig({ colorCount: 6, scaleByLevel: true }));
    s = gameReducer(s, actions.newGame(1, 'advanced'));
    expect(s.palette).toHaveLength(6); // level 1
    // base 6 colors, +1 every 3 levels → level 4 should give 7
    s = winAndAdvance(s); // → level 2
    s = winAndAdvance(s); // → level 3
    s = winAndAdvance(s); // → level 4
    expect(s.level).toBe(4);
    expect(s.palette).toHaveLength(7);
  });

  it('does not scale when scaleByLevel is off', () => {
    let s = createInitialState();
    s = gameReducer(s, actions.updateConfig({ colorCount: 6, scaleByLevel: false }));
    s = gameReducer(s, actions.newGame(1, 'advanced'));
    s = winAndAdvance(s);
    s = winAndAdvance(s);
    s = winAndAdvance(s);
    expect(s.level).toBe(4);
    expect(s.palette).toHaveLength(6);
  });

  it('forces repeats when palette is smaller than the code length', () => {
    let s = createInitialState();
    // colorCount 4, codeLength 6, no-repeats mode → must force repeats
    s = gameReducer(s, actions.updateConfig({ colorCount: 4, codeLength: 6 }));
    s = gameReducer(s, actions.newGame(1, 'easy'));
    expect(s.secret).toHaveLength(6);
    expect(s.allowRepeats).toBe(true);
  });
});
