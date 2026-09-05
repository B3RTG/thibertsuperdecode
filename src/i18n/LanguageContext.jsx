import { createContext, useContext } from 'react';
import { getTexts, DEFAULT_LANG } from './translations.js';

// Provides the resolved text dictionary for the current language.
export const LanguageContext = createContext(getTexts(DEFAULT_LANG));

export function LanguageProvider({ lang, children }) {
  return (
    <LanguageContext.Provider value={getTexts(lang)}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook: returns the current language's texts (the whole dictionary).
export function useTexts() {
  return useContext(LanguageContext);
}
