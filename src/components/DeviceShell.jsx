import LevelDisplay from './LevelDisplay.jsx';
import Timer from './Timer.jsx';
import Board from './Board.jsx';
import ColorPalette from './ColorPalette.jsx';
import Knob from './Knob.jsx';
import Controls from './Controls.jsx';
import { TEXTS } from '../game/constants.js';

// Retro-modern chassis wrapping the play surface (spec section 10).
export default function DeviceShell({ state, dispatch }) {
  const modeLabel =
    state.mode === 'easy' ? TEXTS.menu.easy : TEXTS.menu.advanced;

  return (
    <div className="device">
      <div className="device__topbar">
        <LevelDisplay state={state} />
        <Timer state={state} />
        <div className="level-display__item" style={{ alignItems: 'flex-end' }}>
          <span className="level-display__label">Modo</span>
          <span className="level-display__value" style={{ fontSize: '1rem' }}>
            {modeLabel}
          </span>
        </div>
      </div>

      <Board state={state} dispatch={dispatch} />

      {!state.config.hideKnob && <Knob state={state} dispatch={dispatch} />}
      <ColorPalette state={state} dispatch={dispatch} />
      <Controls state={state} dispatch={dispatch} />
    </div>
  );
}
