import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PREFS_KEY, loadJSON, saveJSON, migrateLegacy } from './storage.js';

// Global, cross-game user preferences: theme, language, sound (spec: these are
// user prefs, not game rules — see the hub analysis).
const DEFAULT_PREFS = { theme: 'classic', lang: 'es', muted: false };

export const PreferencesContext = createContext(null);

export function usePreferences() {
  return useContext(PreferencesContext);
}

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    migrateLegacy();
    return { ...DEFAULT_PREFS, ...(loadJSON(PREFS_KEY) || {}) };
  });

  // Persist on change.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    saveJSON(PREFS_KEY, prefs);
  }, [prefs]);

  // Reflect theme + language on the document root.
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme || 'classic';
  }, [prefs.theme]);
  useEffect(() => {
    document.documentElement.lang = prefs.lang || 'es';
  }, [prefs.lang]);

  const value = {
    ...prefs,
    setTheme: (theme) => setPrefs((p) => ({ ...p, theme })),
    setLang: (lang) => setPrefs((p) => ({ ...p, lang })),
    toggleMute: () => setPrefs((p) => ({ ...p, muted: !p.muted })),
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
