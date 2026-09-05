import { actions } from '../reducer.js';
import { COLOR_CSS_VARS } from '../constants.js';
import { useSound } from '../../../hooks/useSound.js';
import { useTexts } from '../../../i18n/LanguageContext.jsx';

// Color selector input (spec section 7). Only dispatches SET_COLOR — no game
// logic. Click a color → set the active peg's color.
export default function ColorPalette({ state, dispatch }) {
  const T = useTexts();
  const sound = useSound();
  const { palette, activePeg, guesses, activeRow, phase } = state;
  const rowIndex = phase === 'settingCode' ? 0 : activeRow;
  const currentColor = guesses[rowIndex]?.pegs[activePeg];

  return (
    <div className="palette" role="group" aria-label={T.board.paletteLabel}>
      {palette.map((color) => (
        <button
          key={color}
          type="button"
          className="palette__swatch"
          style={{ '--swatch-color': `var(${COLOR_CSS_VARS[color]})` }}
          aria-label={T.colors[color]}
          aria-pressed={currentColor === color}
          onClick={() => {
            dispatch(actions.setColor(activePeg, color));
            sound?.select();
          }}
        />
      ))}
    </div>
  );
}
