import { useEffect, useReducer, useRef, useState } from 'react';
import {
  secuenciasReducer,
  initialState,
  actions,
  PADS,
} from './reducer.js';
import { useSound } from '../../hooks/useSound.js';
import { useTexts } from '../../i18n/LanguageContext.jsx';
import { loadJSON, saveJSON, gameKey } from '../../app/storage.js';

const KEY = gameKey('secuencias');
const CSS_VAR = {
  red: '--c-red',
  green: '--c-green',
  blue: '--c-blue',
  yellow: '--c-yellow',
};
// A pitch per pad (classic Simon-ish tones).
const FREQ = { red: 329.6, green: 415.3, blue: 246.9, yellow: 554.4 };
const LIT_MS = 420;
const GAP_MS = 180;

export default function SecuenciasGame({ onExit }) {
  const [state, dispatch] = useReducer(secuenciasReducer, initialState);
  const T = useTexts();
  const t = T.secuencias;
  const sound = useSound();
  const hydrated = useRef(false);

  // Which pad is currently lit (during playback or a press flash).
  const [lit, setLit] = useState(null);

  // Hydrate + persist stats.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadJSON(KEY);
    if (saved) dispatch(actions.hydrate(saved));
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(KEY, { stats: state.stats });
  }, [state.stats]);

  const flash = (color) => {
    setLit(color);
    sound?.tone(FREQ[color]);
  };

  // Play back the sequence, then hand control to the player.
  useEffect(() => {
    if (state.phase !== 'showing') return;
    const seq = state.sequence;
    const timers = [];
    seq.forEach((color, i) => {
      timers.push(setTimeout(() => flash(color), i * (LIT_MS + GAP_MS)));
      timers.push(
        setTimeout(() => setLit(null), i * (LIT_MS + GAP_MS) + LIT_MS),
      );
    });
    timers.push(
      setTimeout(
        () => dispatch(actions.played()),
        seq.length * (LIT_MS + GAP_MS) + 60,
      ),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.sequence]);

  // Sound cue on game over.
  useEffect(() => {
    if (state.phase === 'gameover') sound?.lose();
  }, [state.phase, sound]);

  const press = (color) => {
    if (state.phase !== 'input') return;
    flash(color);
    setTimeout(() => setLit(null), 180);
    dispatch(actions.press(color));
  };

  const isInput = state.phase === 'input';
  const round = state.sequence.length;
  const reached = Math.max(0, state.sequence.length - 1);

  const status =
    state.phase === 'showing'
      ? t.watch
      : state.phase === 'input'
        ? t.yourTurn
        : state.phase === 'gameover'
          ? t.gameover
          : t.tapToStart;

  return (
    <div className="screen secuencias">
      <div className="reflejos__bar">
        <button className="btn btn--ghost btn--small" onClick={onExit}>
          {T.menu.toArcade}
        </button>
        <h1 className="reflejos__title">{T.games.secuencias.name}</h1>
      </div>

      <div className="secuencias__status" aria-live="polite">
        <span className="secuencias__round">
          {t.round} {round || 0}
        </span>
        <span className="secuencias__statusText">{status}</span>
      </div>

      <div className="simon-grid" role="group" aria-label={T.games.secuencias.name}>
        {PADS.map((color) => (
          <button
            key={color}
            className={`simon-pad${lit === color ? ' simon-pad--lit' : ''}`}
            style={{ '--pad-color': `var(${CSS_VAR[color]})` }}
            aria-label={T.colors[color]}
            disabled={!isInput}
            onClick={() => press(color)}
          />
        ))}
      </div>

      {state.phase === 'idle' || state.phase === 'gameover' ? (
        <button
          className="btn btn--primary btn--block"
          onClick={() => dispatch(actions.start())}
        >
          {state.phase === 'gameover' ? t.again : t.start}
        </button>
      ) : (
        <div className="secuencias__spacer" />
      )}

      <div className="reflejos__stats">
        <div className="stat-cell">
          <span className="stat-cell__value">{state.stats.bestRound}</span>
          <span className="stat-cell__label">{t.best}</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__value">
            {state.phase === 'gameover' ? reached : state.stats.games}
          </span>
          <span className="stat-cell__label">
            {state.phase === 'gameover' ? t.reached : t.games}
          </span>
        </div>
      </div>

      <button
        className="btn btn--ghost btn--block"
        onClick={() => dispatch(actions.resetStats())}
      >
        {t.reset}
      </button>
    </div>
  );
}
