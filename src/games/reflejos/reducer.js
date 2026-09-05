// Reflejos (reaction test) — pure state machine. Timestamps are passed in via
// action payloads so the logic is deterministic and testable.
//
// phases: idle → waiting → go → result   (waiting + early tap → tooSoon)

export function createInitialState(overrides = {}) {
  return {
    phase: 'idle',
    goAt: null, // timestamp when the go signal fired
    reactionMs: null, // last measured reaction
    stats: { attempts: 0, bestMs: null, lastMs: null },
    ...overrides,
  };
}

export const initialState = createInitialState();

export const actions = {
  start: () => ({ type: 'START' }),
  go: (now) => ({ type: 'GO', now }),
  tap: (now) => ({ type: 'TAP', now }),
  resetStats: () => ({ type: 'RESET_STATS' }),
  hydrate: (persisted) => ({ type: 'HYDRATE', persisted }),
};

export function reflejosReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const p = action.persisted || {};
      return {
        ...state,
        stats: p.stats ? { ...state.stats, ...p.stats } : state.stats,
      };
    }

    case 'START':
      // Begin an attempt: wait for the (component-scheduled) go signal.
      return { ...state, phase: 'waiting', goAt: null, reactionMs: null };

    case 'GO':
      // Only arm the signal if we're still waiting (guards late timers).
      if (state.phase !== 'waiting') return state;
      return { ...state, phase: 'go', goAt: action.now };

    case 'TAP': {
      if (state.phase === 'waiting') {
        // Tapped before the signal → false start.
        return { ...state, phase: 'tooSoon' };
      }
      if (state.phase === 'go') {
        const reactionMs = Math.max(0, Math.round(action.now - state.goAt));
        const s = state.stats;
        return {
          ...state,
          phase: 'result',
          reactionMs,
          stats: {
            attempts: s.attempts + 1,
            lastMs: reactionMs,
            bestMs: s.bestMs == null ? reactionMs : Math.min(s.bestMs, reactionMs),
          },
        };
      }
      return state; // taps in idle/result/tooSoon are handled by the UI (start)
    }

    case 'RESET_STATS':
      return { ...state, stats: { attempts: 0, bestMs: null, lastMs: null } };

    default:
      return state;
  }
}
