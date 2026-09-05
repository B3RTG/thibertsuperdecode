import PegSlot from './PegSlot.jsx';
import { actions } from '../reducer.js';
import { useTexts } from '../../../i18n/LanguageContext.jsx';
import { formatDuration } from '../format.js';

// Success / defeat overlay with the next action (spec section 10).
export default function ResultOverlay({ state, dispatch }) {
  const T = useTexts();
  const t = T.result;
  const won = state.phase === 'won';
  const duo = state.players === 2;
  // Timed mode: distinguish a countdown loss from running out of attempts.
  const lostTitle = state.timedOut ? t.timeUp : t.lost;

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
      aria-label={won ? t.won : lostTitle}
    >
      <div className="overlay__card">
        <h2 className="overlay__title">{won ? t.won : lostTitle}</h2>

        {/* Reveal the secret now that the round is over */}
        <div className="overlay__secret" aria-label={t.secretLabel}>
          {state.secret.map((color, i) => (
            <PegSlot key={i} color={color} readOnly />
          ))}
        </div>

        {showTime && (
          <p className="overlay__time">
            {T.board.time}: {formatDuration(state.lastRoundMs)}
            {isRecordTime && ` · ${t.newRecord}`}
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
