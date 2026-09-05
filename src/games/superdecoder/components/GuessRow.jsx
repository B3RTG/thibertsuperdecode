import PegSlot from './PegSlot.jsx';
import Feedback from './Feedback.jsx';
import { actions } from '../reducer.js';

// A single board row: active, historic, or future (spec section 10).
export default function GuessRow({
  guess,
  index,
  state,
  dispatch,
  status, // 'active' | 'past' | 'future'
}) {
  const isActive = status === 'active';
  const { mode, codeLength, activePeg } = state;
  const easy = mode === 'easy';

  const rowClass = [
    'row',
    status === 'active' ? 'row--active' : '',
    status === 'past' ? 'row--past' : '',
    status === 'future' ? 'row--future' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <div className={rowClass}>
        <span className="row__index">{index + 1}</span>
        <div className="row__pegs">
          {guess.pegs.map((color, pos) => (
            <PegSlot
              key={pos}
              color={color}
              active={isActive && activePeg === pos}
              readOnly={!isActive}
              onClick={
                isActive ? () => dispatch(actions.setActivePeg(pos)) : undefined
              }
            />
          ))}
        </div>
        {/* Advanced counts sit to the right of the row */}
        {!easy && (
          <Feedback feedback={guess.feedback} mode={mode} codeLength={codeLength} />
        )}
      </div>
      {/* Easy per-position marks align under the pegs */}
      {easy && guess.feedback && (
        <div className="row__feedback-under">
          <Feedback feedback={guess.feedback} mode={mode} codeLength={codeLength} />
        </div>
      )}
    </div>
  );
}
