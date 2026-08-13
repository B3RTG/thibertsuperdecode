import PegSlot from './PegSlot.jsx';
import ColorPalette from './ColorPalette.jsx';
import { actions } from '../game/reducer.js';
import { TEXTS } from '../game/constants.js';

// Duo: Player 1 defines the secret in a masked entry (spec section 6.2).
// The pegs never reveal their color to keep it hidden from Player 2.
export default function SetCodeScreen({ state, dispatch }) {
  const t = TEXTS.setCode;
  const { codeLength, activePeg } = state;
  const draft = state.guesses[0];
  const pegs = draft?.pegs ?? new Array(codeLength).fill(null);
  const complete = pegs.every((p) => p !== null);

  const confirm = () => {
    if (complete) dispatch(actions.confirmCode(pegs));
  };

  return (
    <div className="screen centered-screen">
      <h2 className="screen-title">{t.title}</h2>
      <p className="screen-hint">{t.hint}</p>

      <div className="row__pegs" style={{ justifyContent: 'center' }}>
        {pegs.map((color, pos) => (
          <PegSlot
            key={pos}
            color={color}
            masked={color != null}
            active={activePeg === pos}
            onClick={() => dispatch(actions.setActivePeg(pos))}
          />
        ))}
      </div>

      <ColorPalette state={state} dispatch={dispatch} />

      <button
        className="btn btn--primary btn--block"
        disabled={!complete}
        onClick={confirm}
      >
        {t.confirm}
      </button>
    </div>
  );
}
