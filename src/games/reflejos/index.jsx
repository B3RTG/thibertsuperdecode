import { useEffect, useReducer, useRef } from 'react';
import { reflejosReducer, initialState, actions } from './reducer.js';
import { useSound } from '../../hooks/useSound.js';
import { useTexts } from '../../i18n/LanguageContext.jsx';
import { loadJSON, saveJSON, gameKey } from '../../app/storage.js';

const KEY = gameKey('reflejos');
const perfNow = () =>
  typeof performance !== 'undefined' && performance.now
    ? performance.now()
    : Date.now();

// Reaction-test game. A large tappable panel turns green after a random delay;
// the player taps as fast as possible. Best time is persisted.
export default function ReflejosGame({ onExit }) {
  const [state, dispatch] = useReducer(reflejosReducer, initialState);
  const T = useTexts();
  const t = T.reflejos;
  const sound = useSound();
  const hydrated = useRef(false);

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

  // Schedule the go signal while waiting (random 1.2–4s).
  useEffect(() => {
    if (state.phase !== 'waiting') return;
    const delay = 1200 + Math.random() * 2800;
    const id = setTimeout(() => {
      dispatch(actions.go(perfNow()));
      sound?.check();
    }, delay);
    return () => clearTimeout(id);
  }, [state.phase, sound]);

  // Sound cue on a false start.
  useEffect(() => {
    if (state.phase === 'tooSoon') sound?.lose();
  }, [state.phase, sound]);

  // Panel interaction: start a new attempt, or register a tap.
  const onPanel = () => {
    if (state.phase === 'go' || state.phase === 'waiting') {
      dispatch(actions.tap(perfNow()));
    } else {
      dispatch(actions.start());
    }
  };

  // Keyboard: Space/Enter mirrors the panel.
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onPanel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const panelClass =
    'reaction' +
    (state.phase === 'go'
      ? ' reaction--go'
      : state.phase === 'waiting'
        ? ' reaction--wait'
        : state.phase === 'tooSoon'
          ? ' reaction--bad'
          : '');

  return (
    <div className="screen reflejos">
      <div className="reflejos__bar">
        <button className="btn btn--ghost btn--small" onClick={onExit}>
          {T.menu.toArcade}
        </button>
        <h1 className="reflejos__title">{T.games.reflejos.name}</h1>
      </div>

      <button className={panelClass} onClick={onPanel} aria-live="polite">
        <PanelContent phase={state.phase} reactionMs={state.reactionMs} t={t} />
      </button>

      <div className="reflejos__stats">
        <div className="stat-cell">
          <span className="stat-cell__value">
            {state.stats.bestMs == null ? '—' : `${state.stats.bestMs}`}
          </span>
          <span className="stat-cell__label">
            {t.best} ({t.ms})
          </span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__value">{state.stats.attempts}</span>
          <span className="stat-cell__label">{t.attempts}</span>
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

function PanelContent({ phase, reactionMs, t }) {
  switch (phase) {
    case 'waiting':
      return <span className="reaction__big">{t.wait}</span>;
    case 'go':
      return <span className="reaction__big">{t.go}</span>;
    case 'tooSoon':
      return (
        <>
          <span className="reaction__big">{t.tooSoon}</span>
          <span className="reaction__hint">{t.tooSoonHint}</span>
        </>
      );
    case 'result':
      return (
        <>
          <span className="reaction__big">
            {reactionMs} {t.ms}
          </span>
          <span className="reaction__hint">{t.resultHint}</span>
        </>
      );
    default: // idle
      return (
        <>
          <span className="reaction__big">{t.tapToStart}</span>
          <span className="reaction__hint">{t.instructions}</span>
        </>
      );
  }
}
