import { useEffect, useReducer, useRef } from 'react';
import { gameReducer, initialState, actions } from './reducer.js';
import { useKeyboardControls } from './useKeyboardControls.js';
import { useSound, useGameSound } from '../../hooks/useSound.js';
import { loadJSON, saveJSON, gameKey } from '../../app/storage.js';
import SuperDecoder from './components/SuperDecoder.jsx';

const KEY = gameKey('superdecoder');

// Self-contained game module: owns its reducer and persistence, wires the
// shared keyboard/sound layers, and renders its screens. Receives onExit to
// return to the arcade hub.
export default function SuperdecoderGame({ onExit }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const sound = useSound();

  // Hydrate this game's saved slice once on mount.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadJSON(KEY);
    if (saved) dispatch(actions.hydrate(saved));
  }, []);

  // Persist the durable game fields on change.
  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(KEY, {
      level: state.level,
      mode: state.mode,
      config: state.config,
      stats: state.stats,
    });
  }, [state.level, state.mode, state.config, state.stats]);

  useKeyboardControls(state, dispatch);
  useGameSound(state, sound);

  return <SuperDecoder state={state} dispatch={dispatch} onExit={onExit} />;
}
