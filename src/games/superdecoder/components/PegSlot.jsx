import { COLOR_CSS_VARS } from '../constants.js';
import { useTexts } from '../../../i18n/LanguageContext.jsx';

// A single color slot (spec section 10). Presentation only — dispatches
// SET_ACTIVE_PEG via onClick when interactive.
export default function PegSlot({
  color,
  active = false,
  masked = false,
  readOnly = false,
  onClick,
}) {
  const T = useTexts();
  const filled = color != null;
  const style = filled && !masked ? { '--peg-color': `var(${COLOR_CSS_VARS[color]})` } : undefined;

  const label = masked
    ? T.setCode.hidden
    : filled
      ? T.colors[color]
      : T.board.emptyPeg;

  const className = [
    'peg',
    filled && !masked ? 'peg--filled' : '',
    masked ? 'peg--masked' : '',
    active ? 'peg--active' : '',
    readOnly ? 'peg--readonly' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={readOnly}
      onClick={onClick}
    />
  );
}
