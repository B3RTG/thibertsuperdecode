import { useState } from 'react';
import Menu from './Menu.jsx';
import SettingsScreen from './SettingsScreen.jsx';
import StatsScreen from './StatsScreen.jsx';
import SetCodeScreen from './SetCodeScreen.jsx';
import HandoffScreen from './HandoffScreen.jsx';
import DeviceShell from './DeviceShell.jsx';
import ResultOverlay from './ResultOverlay.jsx';

// Switch over `phase` — contains no game rules (spec section 10).
export default function SuperDecoder({ state, dispatch }) {
  // Menu sub-screen: null | 'settings' | 'stats'.
  const [menuScreen, setMenuScreen] = useState(null);

  if (state.phase === 'menu') {
    if (menuScreen === 'settings') {
      return (
        <SettingsScreen
          state={state}
          dispatch={dispatch}
          onBack={() => setMenuScreen(null)}
        />
      );
    }
    if (menuScreen === 'stats') {
      return (
        <StatsScreen
          state={state}
          dispatch={dispatch}
          onBack={() => setMenuScreen(null)}
        />
      );
    }
    return (
      <Menu
        state={state}
        dispatch={dispatch}
        onOpenSettings={() => setMenuScreen('settings')}
        onOpenStats={() => setMenuScreen('stats')}
      />
    );
  }

  if (state.phase === 'settingCode') {
    return <SetCodeScreen state={state} dispatch={dispatch} />;
  }

  if (state.phase === 'handoff') {
    return <HandoffScreen state={state} dispatch={dispatch} />;
  }

  // playing | won | lost all render the device; overlay sits on top.
  return (
    <>
      <DeviceShell state={state} dispatch={dispatch} />
      {(state.phase === 'won' || state.phase === 'lost') && (
        <ResultOverlay state={state} dispatch={dispatch} />
      )}
    </>
  );
}
