import { GAMES } from '../games/registry.js';
import { useTexts } from '../i18n/LanguageContext.jsx';

// Arcade home: lists games from the registry. Selecting one opens it.
export default function Hub({ onSelect, onOpenSettings }) {
  const T = useTexts();

  return (
    <div className="screen hub">
      <div>
        <h1 className="menu__title">{T.hub.title}</h1>
        <p className="menu__subtitle">{T.hub.subtitle}</p>
      </div>

      <div className="game-grid">
        {GAMES.map((g) => {
          const info = T.games[g.id] || { name: g.id, desc: '' };
          return (
            <button
              key={g.id}
              className="game-card"
              style={{ '--card-accent': g.accent }}
              onClick={() => onSelect(g.id)}
            >
              <span className="game-card__icon" aria-hidden="true">
                {g.Icon ? <g.Icon /> : g.icon}
              </span>
              <span className="game-card__name">{info.name}</span>
              <span className="game-card__desc">{info.desc}</span>
            </button>
          );
        })}
      </div>

      <button className="btn btn--ghost btn--block" onClick={onOpenSettings}>
        {T.hub.settings}
      </button>
    </div>
  );
}
