import { useTexts } from '../i18n/LanguageContext.jsx';

// Segmented-style display of level and remaining attempts (spec section 10).
export default function LevelDisplay({ state }) {
  const { level, maxAttempts, activeRow, phase } = state;
  const used = phase === 'playing' ? activeRow : activeRow + 1;
  const left = Math.max(0, maxAttempts - used);
  const t = useTexts().board;

  return (
    <div className="level-display" aria-live="polite">
      <div className="level-display__item">
        <span className="level-display__label">{t.level}</span>
        <span className="level-display__value">
          {String(level).padStart(2, '0')}
        </span>
      </div>
      <div className="level-display__item">
        <span className="level-display__label">{t.attemptsLeft}</span>
        <span className="level-display__value">
          {String(left).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
