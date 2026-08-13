import { COLOR_CSS_VARS, COLOR_LABELS, TEXTS } from '../game/constants.js';

// A single color slot (spec section 10). Presentation only — dispatches
// SET_ACTIVE_PEG via onClick when interactive.
export default function PegSlot({
  color,
  active = false,
  masked = false,
  readOnly = false,
  onClick,
}) {
  const filled = color != null;
  const style = filled && !masked ? { '--peg-color': `var(${COLOR_CSS_VARS[color]})` } : undefined;

  const label = masked
    ? TEXTS.setCode.hidden
    : filled
      ? COLOR_LABELS[color]
      : TEXTS.board.emptyPeg;

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
