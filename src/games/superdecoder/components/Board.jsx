import GuessRow from './GuessRow.jsx';
import { useTexts } from '../../../i18n/LanguageContext.jsx';

// The list of rows (spec section 10). Pure presentation from state.
export default function Board({ state, dispatch }) {
  const { guesses, activeRow, phase } = state;

  return (
    <div className="board" aria-label={useTexts().board.boardLabel}>
      {guesses.map((guess, i) => {
        let status = 'future';
        if (i < activeRow) status = 'past';
        else if (i === activeRow && phase === 'playing') status = 'active';
        else if (i === activeRow) status = 'past'; // won/lost: last submitted
        return (
          <GuessRow
            key={i}
            guess={guess}
            index={i}
            state={state}
            dispatch={dispatch}
            status={status}
          />
        );
      })}
    </div>
  );
}
