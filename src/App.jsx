import { Suspense, useState } from 'react';
import { PreferencesProvider, usePreferences } from './app/PreferencesContext.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import { SoundContext, useSoundApi } from './hooks/useSound.js';
import Hub from './app/Hub.jsx';
import GeneralSettings from './app/GeneralSettings.jsx';
import { getGame } from './games/registry.js';

// <App> — the ThiBert Arcade shell: provides global preferences, wires the
// shared sound + i18n layers to them, and routes between the hub and a game.
export default function App() {
  return (
    <PreferencesProvider>
      <Shell />
    </PreferencesProvider>
  );
}

function Shell() {
  const prefs = usePreferences();
  const sound = useSoundApi(prefs.muted);

  // Minimal router by state: { screen: 'hub' | 'settings' | 'game', gameId? }.
  const [route, setRoute] = useState({ screen: 'hub' });
  const goHub = () => setRoute({ screen: 'hub' });

  return (
    <LanguageProvider lang={prefs.lang}>
      <SoundContext.Provider value={sound}>
        <div className="app-root">
          {route.screen === 'hub' && (
            <Hub
              onSelect={(gameId) => setRoute({ screen: 'game', gameId })}
              onOpenSettings={() => setRoute({ screen: 'settings' })}
            />
          )}
          {route.screen === 'settings' && <GeneralSettings onBack={goHub} />}
          {route.screen === 'game' && (
            <GameHost gameId={route.gameId} onExit={goHub} />
          )}
        </div>
      </SoundContext.Provider>
    </LanguageProvider>
  );
}

function GameHost({ gameId, onExit }) {
  const game = getGame(gameId);
  if (!game) return null;
  const GameComponent = game.Component;
  return (
    <Suspense fallback={<div className="screen loading" aria-busy="true" />}>
      <GameComponent onExit={onExit} />
    </Suspense>
  );
}
