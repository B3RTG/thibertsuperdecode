import { useEffect } from 'react';
import { actions } from './reducer.js';

// Keyboard input adapter (spec section 7): ←/→ move peg, ↑/↓ change color,
// Enter submit. Only dispatches shared actions — no game logic.
export function useKeyboardControls(state, dispatch) {
  const { phase, activePeg, codeLength } = state;

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'settingCode') return;

    const onKey = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          dispatch(actions.setActivePeg(Math.max(0, activePeg - 1)));
          break;
        case 'ArrowRight':
          e.preventDefault();
          dispatch(actions.setActivePeg(Math.min(codeLength - 1, activePeg + 1)));
          break;
        case 'ArrowUp':
          e.preventDefault();
          dispatch(actions.cycleColor(+1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          dispatch(actions.cycleColor(-1));
          break;
        case 'Enter':
          if (phase === 'playing') {
            e.preventDefault();
            dispatch(actions.submitGuess());
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, activePeg, codeLength, dispatch]);
}
