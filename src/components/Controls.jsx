import { actions } from '../game/reducer.js';
import { useTexts } from '../i18n/LanguageContext.jsx';

// Action controls (spec section 10). "Comprobar" is always visible for
// reliability on mobile (spec 11.2).
export default function Controls({ state, dispatch }) {
  const t = useTexts().controls;
  const { guesses, activeRow, muted, config } = state;
  const rowComplete = guesses[activeRow]?.pegs.every((p) => p !== null);
  const toggleKnob = () =>
    dispatch(actions.updateConfig({ hideKnob: !config.hideKnob }));

  return (
    <div className="controls">
      <button
        className="btn btn--primary btn--check"
        disabled={!rowComplete}
        onClick={() => dispatch(actions.submitGuess())}
      >
        {t.check}
      </button>
      <button className="btn" onClick={() => dispatch(actions.toggleMute())}>
        {muted ? t.unmute : t.mute}
      </button>
      <button
        className="btn"
        aria-pressed={config.hideKnob}
        onClick={toggleKnob}
      >
        {config.hideKnob ? t.showKnob : t.hideKnob}
      </button>
      <button className="btn" onClick={() => dispatch(actions.goToMenu())}>
        {t.menu}
      </button>
    </div>
  );
}
