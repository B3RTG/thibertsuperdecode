import { useTexts } from '../../../i18n/LanguageContext.jsx';

// Renders hints. Easy → per-position marks; advanced → aggregated counts.
// (spec section 4). Receives mode + feedback and decides its render.
export default function Feedback({ feedback, mode, codeLength }) {
  const h = useTexts().hints;
  if (!feedback) return null;

  if (mode === 'advanced') {
    return (
      <div
        className="feedback feedback--advanced"
        aria-label={`${feedback.greens} ${h.greensLabel}, ${feedback.whites} ${h.whitesLabel}`}
      >
        <span className="feedback__count">
          <span className="feedback__chip feedback__chip--green" />
          {feedback.greens}
        </span>
        <span className="feedback__count">
          <span className="feedback__chip feedback__chip--white" />
          {feedback.whites}
        </span>
      </div>
    );
  }

  // Easy: one dot per position, shown under the pegs.
  const marks = feedback.perPosition || [];
  return (
    <div
      className="feedback feedback--easy feedback--under"
      role="list"
      aria-label={h.perPositionLabel}
    >
      {Array.from({ length: codeLength }).map((_, i) => {
        const mark = marks[i] || 'none';
        const text = mark === 'green' ? h.green : mark === 'white' ? h.white : h.none;
        return (
          <span
            key={i}
            role="listitem"
            className={`feedback__dot feedback__dot--${mark}`}
            aria-label={h.positionMark(i + 1, text)}
          />
        );
      })}
    </div>
  );
}
