import { useEffect, useReducer, useRef } from 'react';
import { lucesReducer, initialState, actions } from './reducer.js';
import { useSound } from '../../hooks/useSound.js';
import { useTexts } from '../../i18n/LanguageContext.jsx';
import { loadJSON, saveJSON, gameKey } from '../../app/storage.js';

const KEY = gameKey('luces');

// Lights Out: tap a cell to toggle it and its neighbors; clear the board to win.
export default function LucesGame({ onExit }) {
  const [state, dispatch] = useReducer(lucesReducer, initialState);
  const T = useTexts();
  const t = T.luces;
  const sound = useSound();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadJSON(KEY);
    if (saved) dispatch(actions.hydrate(saved));
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(KEY, { level: state.level, stats: state.stats });
  }, [state.level, state.stats]);

  useEffect(() => {
    if (state.phase === 'won') sound?.win();
  }, [state.phase, sound]);

  const press = (idx) => {
    if (state.phase !== 'playing') return;
    sound?.move();
    dispatch(actions.toggle(idx));
  };

  const won = state.phase === 'won';

  return (
    <div className="screen luces">
      <div className="reflejos__bar">
        <button className="btn btn--ghost btn--small" onClick={onExit}>
          {T.menu.toArcade}
        </button>
        <h1 className="reflejos__title">{T.games.luces.name}</h1>
      </div>

      <div className="secuencias__status" aria-live="polite">
        <span className="secuencias__round">
          {t.level} {state.level}
        </span>
        <span className="secuencias__statusText">
          {won ? t.solvedMsg : `${t.moves}: ${state.moves}`}
        </span>
      </div>

      <div
        className={`lights-grid${won ? ' lights-grid--won' : ''}`}
        style={{ '--n': state.size }}
        role="group"
        aria-label={T.games.luces.name}
      >
        {state.grid.map((on, idx) => (
          <button
            key={idx}
            className={`light-cell${on ? ' light-cell--on' : ''}`}
            aria-label={`${idx + 1}: ${on ? t.on : t.off}`}
            aria-pressed={on}
            disabled={won}
            onClick={() => press(idx)}
          />
        ))}
      </div>

      {won ? (
        <button
          className="btn btn--primary btn--block"
          onClick={() => dispatch(actions.nextLevel())}
        >
          {t.next}
        </button>
      ) : (
        <button
          className="btn btn--block"
          onClick={() => dispatch(actions.restart())}
        >
          {t.restart}
        </button>
      )}

      <div className="reflejos__stats">
        <div className="stat-cell">
          <span className="stat-cell__value">{state.stats.maxLevel}</span>
          <span className="stat-cell__label">{t.maxLevel}</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__value">{state.stats.solved}</span>
          <span className="stat-cell__label">{t.solved}</span>
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
