import { actions } from '../game/reducer.js';
import { useTexts } from '../i18n/LanguageContext.jsx';
import { formatDuration } from '../game/format.js';

// Phase 3: 1-player statistics screen.
export default function StatsScreen({ state, dispatch, onBack }) {
  const t = useTexts().stats;
  const s = state.stats;
  const winRate = s.played ? Math.round((s.won / s.played) * 100) : 0;

  const rows = [
    [t.played, s.played],
    [t.won, s.won],
    [t.lost, s.lost],
    [t.winRate, `${winRate}%`],
    [t.streak, s.streak],
    [t.bestStreak, s.bestStreak],
    [t.bestAttempts, s.bestAttempts == null ? t.none : s.bestAttempts],
    [t.bestTime, s.bestTimeMs == null ? t.none : formatDuration(s.bestTimeMs)],
  ];

  return (
    <div className="screen menu">
      <h2 className="screen-title">{t.title}</h2>

      <div className="stats-grid">
        {rows.map(([label, value]) => (
          <div className="stat-cell" key={label}>
            <span className="stat-cell__value">{value}</span>
            <span className="stat-cell__label">{label}</span>
          </div>
        ))}
      </div>

      <button
        className="btn btn--ghost btn--block"
        onClick={() => dispatch(actions.resetStats())}
      >
        {t.reset}
      </button>
      <button className="btn btn--primary btn--block" onClick={onBack}>
        {t.back}
      </button>
    </div>
  );
}
