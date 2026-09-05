// Secuencias (Simon) — pure state machine. The system builds a growing color
// sequence; the player repeats it. Randomness lives here (like Superdecoder's
// generateCode); tests drive presses by reading state.sequence.
//
// phases: idle → showing → input → (showing … ) → gameover

// Four classic pads, mapped to existing color tokens (--c-red, etc.).
export const PADS = ['red', 'green', 'blue', 'yellow'];

const pick = () => PADS[Math.floor(Math.random() * PADS.length)];

export function createInitialState(overrides = {}) {
  return {
    phase: 'idle',
    sequence: [], // colors the player must repeat
    step: 0, // index of the next expected input
    stats: { bestRound: 0, games: 0 },
    ...overrides,
  };
}

export const initialState = createInitialState();

export const actions = {
  start: () => ({ type: 'START' }),
  played: () => ({ type: 'PLAYED' }), // playback finished → player's turn
  press: (color) => ({ type: 'PRESS', color }),
  resetStats: () => ({ type: 'RESET_STATS' }),
  hydrate: (persisted) => ({ type: 'HYDRATE', persisted }),
};

export function secuenciasReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const p = action.persisted || {};
      return {
        ...state,
        stats: p.stats ? { ...state.stats, ...p.stats } : state.stats,
      };
    }

    case 'START':
      return { ...state, sequence: [pick()], step: 0, phase: 'showing' };

    case 'PLAYED':
      if (state.phase !== 'showing') return state;
      return { ...state, phase: 'input' };

    case 'PRESS': {
      if (state.phase !== 'input') return state;
      if (action.color === state.sequence[state.step]) {
        const step = state.step + 1;
        if (step === state.sequence.length) {
          // Round cleared → extend the sequence and replay it.
          return {
            ...state,
            sequence: [...state.sequence, pick()],
            step: 0,
            phase: 'showing',
          };
        }
        return { ...state, step };
      }
      // Wrong pad → game over. Score = fully repeated rounds so far.
      const reached = state.sequence.length - 1;
      return {
        ...state,
        phase: 'gameover',
        stats: {
          games: state.stats.games + 1,
          bestRound: Math.max(state.stats.bestRound, reached),
        },
      };
    }

    case 'RESET_STATS':
      return { ...state, stats: { bestRound: 0, games: 0 } };

    default:
      return state;
  }
}
