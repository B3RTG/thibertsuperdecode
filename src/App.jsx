import { useReducer, useEffect } from 'react';
import { gameReducer, initialState } from './game/reducer.js';
import { usePersistence } from './hooks/usePersistence.js';
import { useKeyboardControls } from './hooks/useKeyboardControls.js';
import {
  SoundContext,
  useSoundApi,
  useGameSound,
} from './hooks/useSound.js';
import SuperDecoder from './components/SuperDecoder.jsx';

// <App> — provides the reducer state and global hooks (spec section 10).
export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  usePersistence(state, dispatch);
  useKeyboardControls(state, dispatch);

  const sound = useSoundApi(state.muted);
  useGameSound(state, sound);

  // Phase 3: apply the selected color theme to the document root.
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme || 'classic';
  }, [state.theme]);

  return (
    <SoundContext.Provider value={sound}>
      <div className="app-root">
        <SuperDecoder state={state} dispatch={dispatch} />
      </div>
    </SoundContext.Provider>
  );
}
