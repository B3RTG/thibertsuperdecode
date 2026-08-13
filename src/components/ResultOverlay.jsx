import PegSlot from './PegSlot.jsx';
import { actions } from '../game/reducer.js';
import { TEXTS } from '../game/constants.js';
import { formatDuration } from '../game/format.js';

// Success / defeat overlay with the next action (spec section 10).
export default function ResultOverlay({ state, dispatch }) {
  const t = TEXTS.result;
  const won = state.phase === 'won';
  const duo = state.players === 2;

  // Phase 3: show the round time and flag a new best time (1-player win).
  const showTime = !duo && state.lastRoundMs != null;
  const isRecordTime =
    won && !duo && state.lastRoundMs != null &&
    state.stats.bestTimeMs === state.lastRoundMs;

  return (
    <div
      className={`overlay ${won ? 'overlay--won' : 'overlay--lost'}`}
      role="dialog"
      aria-modal="true"
      aria-label={won ? t.won : t.lost}
    >
      <div className="overlay__card">
        <h2 className="overlay__title">{won ? t.won : t.lost}</h2>

        {/* Reveal the secret now that the round is over */}
        <div className="overlay__secret" aria-label="Código secreto">
          {state.secret.map((color, i) => (
            <PegSlot key={i} color={color} readOnly />
          ))}
        </div>

        {showTime && (
          <p className="overlay__time">
            {TEXTS.board.time}: {formatDuration(state.lastRoundMs)}
            {isRecordTime && ' · ¡nuevo récord!'}
          </p>
        )}

        {duo ? (
          <>
            <button
              className="btn btn--primary btn--block"
              onClick={() => dispatch(actions.swapRoles())}
            >
              {t.swapRoles}
            </button>
            <button
              className="btn btn--ghost btn--block"
              onClick={() => dispatch(actions.goToMenu())}
            >
              {t.backToMenu}
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn--primary btn--block"
              onClick={() =>
                dispatch(won ? actions.nextLevel() : actions.resetLevel())
              }
            >
              {won ? t.nextLevel : t.retry}
            </button>
            <button
              className="btn btn--ghost btn--block"
              onClick={() => dispatch(actions.goToMenu())}
            >
              {t.backToMenu}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
