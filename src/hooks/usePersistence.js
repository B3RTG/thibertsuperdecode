import { useEffect, useRef } from 'react';
import { actions } from '../game/reducer.js';

const STORAGE_KEY = 'super-decoder:v1';

// Flag to disable persistence (spec section 13) — e.g. in artifacts where
// localStorage is unavailable.
const ENABLED =
  typeof window !== 'undefined' &&
  (() => {
    try {
      const k = '__sd_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })();

// Persists level, mode, muted and config; hydrates once on mount.
export function usePersistence(state, dispatch) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (!ENABLED || hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch(actions.hydrate(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ENABLED || !hydrated.current) return;
    const snapshot = {
      level: state.level,
      mode: state.mode,
      muted: state.muted,
      config: state.config,
      theme: state.theme,
      lang: state.lang,
      stats: state.stats,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* ignore */
    }
  }, [
    state.level,
    state.mode,
    state.muted,
    state.config,
    state.theme,
    state.lang,
    state.stats,
  ]);
}
