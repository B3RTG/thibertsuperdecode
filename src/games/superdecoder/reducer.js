// Game state machine (spec sections 8 & 9). Pure — no React.
import { generateCode, evaluateGuess, isSolved } from './engine.js';
import {
  DEFAULT_CONFIG,
  DEFAULT_STATS,
  paletteFor,
  resolveAllowRepeats,
  scaledColorCount,
  MODE_DEFAULTS,
} from './constants.js';

const now = () =>
  typeof performance !== 'undefined' && performance.now
    ? performance.now()
    : Date.now();

// ---- Helpers ---------------------------------------------------------------

function emptyGuess(codeLength) {
  return { pegs: new Array(codeLength).fill(null), feedback: null };
}

function makeGuesses(maxAttempts, codeLength) {
  return Array.from({ length: maxAttempts }, () => emptyGuess(codeLength));
}

function isRowComplete(guess) {
  return guess.pegs.every((p) => p !== null);
}

// Build the shared game fields for a new round. `secret` may be provided
// (2-player mode) or generated (1-player mode).
function buildRound(state, secret) {
  const { config, mode, codeLength, maxAttempts, players, level } = state;
  // Phase 3: in 1-player, grow the palette smoothly with the level.
  const effectiveColorCount =
    players === 1 && config.scaleByLevel
      ? scaledColorCount(config.colorCount, level)
      : config.colorCount;
  const palette = paletteFor(effectiveColorCount);
  // Force repeats when the palette is too small to fill the code without them.
  const allowRepeats =
    resolveAllowRepeats(mode, config) || palette.length < codeLength;
  const resolvedSecret =
    secret ?? generateCode(palette, codeLength, allowRepeats);
  return {
    palette,
    allowRepeats,
    secret: resolvedSecret,
    guesses: makeGuesses(maxAttempts, codeLength),
    activeRow: 0,
    activePeg: 0,
    roundStartedAt: now(),
    timedOut: false,
  };
}

// ---- Initial state ---------------------------------------------------------

export function createInitialState(overrides = {}) {
  const config = { ...DEFAULT_CONFIG, ...(overrides.config || {}) };
  return {
    phase: 'menu',
    mode: 'easy',
    players: 1,
    config,
    codeLength: config.codeLength,
    maxAttempts: config.maxAttempts,
    palette: paletteFor(config.colorCount),
    allowRepeats: MODE_DEFAULTS.easy.allowRepeats,
    secret: [],
    guesses: [],
    activeRow: 0,
    activePeg: 0,
    level: 1,
    codeSetter: undefined,
    stats: { ...DEFAULT_STATS },
    roundStartedAt: 0,
    lastRoundMs: null, // elapsed time of the round that just ended
    timedOut: false, // whether the last loss was by the countdown
    ...overrides,
  };
}

export const initialState = createInitialState();

// ---- Action creators -------------------------------------------------------

export const actions = {
  newGame: (players, mode) => ({ type: 'NEW_GAME', players, mode }),
  updateConfig: (patch) => ({ type: 'UPDATE_CONFIG', patch }),
  setActivePeg: (pos) => ({ type: 'SET_ACTIVE_PEG', pos }),
  cycleColor: (dir) => ({ type: 'CYCLE_COLOR', dir }),
  setColor: (pos, color) => ({ type: 'SET_COLOR', pos, color }),
  submitGuess: () => ({ type: 'SUBMIT_GUESS' }),
  confirmCode: (code) => ({ type: 'CONFIRM_CODE', code }),
  confirmHandoff: () => ({ type: 'CONFIRM_HANDOFF' }),
  nextLevel: () => ({ type: 'NEXT_LEVEL' }),
  resetLevel: () => ({ type: 'RESET_LEVEL' }),
  swapRoles: () => ({ type: 'SWAP_ROLES' }),
  timeUp: () => ({ type: 'TIME_UP' }),
  goToMenu: () => ({ type: 'GO_TO_MENU' }),
  resetStats: () => ({ type: 'RESET_STATS' }),
  hydrate: (persisted) => ({ type: 'HYDRATE', persisted }),
};

// Phase 3: fold a finished round into the stats (1-player only).
function updateStats(stats, { won, attempts, elapsedMs }) {
  const next = {
    ...stats,
    played: stats.played + 1,
    won: won ? stats.won + 1 : stats.won,
    lost: won ? stats.lost : stats.lost + 1,
    streak: won ? stats.streak + 1 : 0,
  };
  next.bestStreak = Math.max(stats.bestStreak, next.streak);
  if (won) {
    next.bestAttempts =
      stats.bestAttempts == null
        ? attempts
        : Math.min(stats.bestAttempts, attempts);
    if (elapsedMs != null) {
      next.bestTimeMs =
        stats.bestTimeMs == null
          ? elapsedMs
          : Math.min(stats.bestTimeMs, elapsedMs);
    }
  }
  return next;
}

// ---- Reducer ---------------------------------------------------------------

export function gameReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      // Only restore persisted, safe fields; never resume mid-round secret.
      const p = action.persisted || {};
      const config = { ...state.config, ...(p.config || {}) };
      return {
        ...state,
        config,
        codeLength: config.codeLength,
        maxAttempts: config.maxAttempts,
        palette: paletteFor(config.colorCount),
        level: typeof p.level === 'number' ? p.level : state.level,
        mode: p.mode || state.mode,
        stats: p.stats ? { ...DEFAULT_STATS, ...p.stats } : state.stats,
      };
    }

    case 'RESET_STATS':
      return { ...state, stats: { ...DEFAULT_STATS } };

    case 'UPDATE_CONFIG': {
      // Applies to the next game/level, not the row in progress (spec 3.1).
      const config = { ...state.config, ...action.patch };
      return {
        ...state,
        config,
        // Reflect immediately in the fields used by Settings/Menu previews.
        codeLength: config.codeLength,
        maxAttempts: config.maxAttempts,
        palette: paletteFor(config.colorCount),
      };
    }

    case 'MENU_SET': {
      // Menu-only selection of players/mode before starting a game.
      const next = { ...state };
      if (action.players != null) next.players = action.players;
      if (action.mode != null) next.mode = action.mode;
      return next;
    }

    case 'NEW_GAME': {
      const mode = action.mode || state.mode;
      const players = action.players || state.players;
      const base = {
        ...state,
        mode,
        players,
        codeLength: state.config.codeLength,
        maxAttempts: state.config.maxAttempts,
        level: 1,
        codeSetter: undefined,
      };
      if (players === 2) {
        // Player 1 will define the code next.
        return {
          ...base,
          phase: 'settingCode',
          palette: paletteFor(state.config.colorCount),
          allowRepeats: resolveAllowRepeats(mode, state.config),
          secret: [],
          guesses: makeGuesses(state.config.maxAttempts, state.config.codeLength),
          activeRow: 0,
          activePeg: 0,
        };
      }
      // 1 player: generate and go straight to playing.
      return {
        ...base,
        phase: 'playing',
        ...buildRound(base, null),
      };
    }

    case 'CONFIRM_CODE': {
      // Duo: J1 confirmed the secret → handoff.
      if (state.phase !== 'settingCode') return state;
      const code = action.code;
      if (!Array.isArray(code) || code.some((c) => c == null)) return state;
      return {
        ...state,
        phase: 'handoff',
        secret: [...code],
        codeSetter: state.codeSetter === 2 ? 2 : 1,
        // Clear the draft board so the secret is never visible to Player 2.
        guesses: makeGuesses(state.maxAttempts, state.codeLength),
        activeRow: 0,
        activePeg: 0,
      };
    }

    case 'CONFIRM_HANDOFF': {
      if (state.phase !== 'handoff') return state;
      // Start the timer when the guesser actually begins.
      return { ...state, phase: 'playing', roundStartedAt: now(), timedOut: false };
    }

    case 'SET_ACTIVE_PEG': {
      if (state.phase !== 'playing' && state.phase !== 'settingCode') return state;
      const pos = action.pos;
      if (pos < 0 || pos >= state.codeLength) return state;
      return { ...state, activePeg: pos };
    }

    case 'SET_COLOR': {
      // Palette pick → fill and auto-advance to the next peg for a fast flow.
      return applyColor(state, action.pos, action.color, true);
    }

    case 'CYCLE_COLOR': {
      // Knob/keyboard dial → change the active peg's color in place (no advance).
      const { activePeg, palette } = state;
      const current = getEditableRow(state).pegs[activePeg];
      const dir = action.dir >= 0 ? 1 : -1;
      let idx;
      if (current == null) {
        idx = dir === 1 ? 0 : palette.length - 1;
      } else {
        idx =
          (palette.indexOf(current) + dir + palette.length) % palette.length;
      }
      return applyColor(state, activePeg, palette[idx], false);
    }

    case 'SUBMIT_GUESS': {
      return submitGuess(state);
    }

    case 'NEXT_LEVEL': {
      if (state.phase !== 'won') return state;
      const level = state.level + 1;
      const base = { ...state, level, codeSetter: undefined };
      if (state.players === 2) {
        // Duo: swap is offered via GO_TO_MENU/swap; default → new setting phase.
        return {
          ...base,
          phase: 'settingCode',
          secret: [],
          guesses: makeGuesses(state.maxAttempts, state.codeLength),
          activeRow: 0,
          activePeg: 0,
        };
      }
      return { ...base, phase: 'playing', ...buildRound(base, null) };
    }

    case 'RESET_LEVEL': {
      if (state.phase !== 'lost') return state;
      // Lenient: repeat the same level. Reuse the same secret in solo; in duo
      // keep the secret the code-setter chose.
      return {
        ...state,
        phase: 'playing',
        guesses: makeGuesses(state.maxAttempts, state.codeLength),
        activeRow: 0,
        activePeg: 0,
        roundStartedAt: now(),
        timedOut: false,
      };
    }

    case 'SWAP_ROLES': {
      // Duo: after a round, the other player sets the code next (spec 6.2).
      if (state.players !== 2) return state;
      const nextSetter = state.codeSetter === 1 ? 2 : 1;
      return {
        ...state,
        phase: 'settingCode',
        codeSetter: nextSetter,
        secret: [],
        guesses: makeGuesses(state.maxAttempts, state.codeLength),
        activeRow: 0,
        activePeg: 0,
      };
    }

    case 'TIME_UP': {
      // Countdown reached 0 → lose the round (spec: modo contrarreloj).
      if (state.phase !== 'playing') return state;
      const elapsedMs = state.roundStartedAt
        ? Math.round(now() - state.roundStartedAt)
        : null;
      const trackStats = state.players === 1;
      return {
        ...state,
        phase: 'lost',
        timedOut: true,
        lastRoundMs: elapsedMs,
        stats: trackStats
          ? updateStats(state.stats, { won: false, attempts: state.maxAttempts })
          : state.stats,
      };
    }

    case 'GO_TO_MENU':
      return { ...state, phase: 'menu' };

    default:
      return state;
  }
}

// ---- Sub-reducers ----------------------------------------------------------

// During settingCode the "editable row" is a virtual single row backing the
// secret; during playing it's the active guess row.
function getEditableRow(state) {
  if (state.phase === 'settingCode') {
    return state.guesses[0] || { pegs: new Array(state.codeLength).fill(null) };
  }
  return state.guesses[state.activeRow];
}

function applyColor(state, pos, color, advance) {
  if (state.phase !== 'playing' && state.phase !== 'settingCode') return state;
  if (pos < 0 || pos >= state.codeLength) return state;
  if (color != null && !state.palette.includes(color)) return state;

  const rowIndex = state.phase === 'settingCode' ? 0 : state.activeRow;
  const guesses = state.guesses.map((g, i) => {
    if (i !== rowIndex) return g;
    const pegs = [...g.pegs];
    pegs[pos] = color;
    return { ...g, pegs };
  });

  // Palette picks advance to the next slot; knob/keyboard dial stays in place.
  const activePeg = advance ? Math.min(pos + 1, state.codeLength - 1) : pos;
  return { ...state, guesses, activePeg };
}

function submitGuess(state) {
  if (state.phase !== 'playing') return state;
  const row = state.guesses[state.activeRow];
  if (!row || !isRowComplete(row)) return state; // ignore incomplete rows

  const feedback = evaluateGuess(row.pegs, state.secret);
  const guesses = state.guesses.map((g, i) =>
    i === state.activeRow ? { ...g, feedback } : g,
  );

  const elapsedMs = state.roundStartedAt
    ? Math.round(now() - state.roundStartedAt)
    : null;
  // Phase 3: stats are only meaningful in 1-player (solo skill).
  const trackStats = state.players === 1;

  if (isSolved(feedback, state.codeLength)) {
    const attempts = state.activeRow + 1;
    return {
      ...state,
      guesses,
      phase: 'won',
      lastRoundMs: elapsedMs,
      stats: trackStats
        ? updateStats(state.stats, { won: true, attempts, elapsedMs })
        : state.stats,
    };
  }

  const nextRow = state.activeRow + 1;
  if (nextRow >= state.maxAttempts) {
    return {
      ...state,
      guesses,
      phase: 'lost',
      lastRoundMs: elapsedMs,
      stats: trackStats
        ? updateStats(state.stats, { won: false, attempts: state.maxAttempts })
        : state.stats,
    };
  }

  return { ...state, guesses, activeRow: nextRow, activePeg: 0 };
}
