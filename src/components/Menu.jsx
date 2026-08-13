import { actions } from '../game/reducer.js';
import { TEXTS } from '../game/constants.js';

// Choose 1/2 players and difficulty, then start (spec section 6).
export default function Menu({ state, dispatch, onOpenSettings, onOpenStats }) {
  const t = TEXTS.menu;
  const { players, mode } = state;

  const choosePlayers = (p) => dispatch({ type: 'MENU_SET', players: p });
  const chooseMode = (m) => dispatch({ type: 'MENU_SET', mode: m });
  const start = () => dispatch(actions.newGame(players, mode));

  return (
    <div className="screen menu">
      <div>
        <h1 className="menu__title">{TEXTS.appTitle}</h1>
        <p className="menu__subtitle">{t.subtitle}</p>
      </div>

      <div>
        <div className="menu__section-label">Jugadores</div>
        <div className="choice-group">
          <button
            className="choice"
            aria-pressed={players === 1}
            onClick={() => choosePlayers(1)}
          >
            {t.onePlayer}
          </button>
          <button
            className="choice"
            aria-pressed={players === 2}
            onClick={() => choosePlayers(2)}
          >
            {t.twoPlayers}
          </button>
        </div>
      </div>

      <div>
        <div className="menu__section-label">{t.chooseMode}</div>
        <div className="choice-group">
          <button
            className="choice"
            aria-pressed={mode === 'easy'}
            onClick={() => chooseMode('easy')}
          >
            {t.easy}
          </button>
          <button
            className="choice"
            aria-pressed={mode === 'advanced'}
            onClick={() => chooseMode('advanced')}
          >
            {t.advanced}
          </button>
        </div>
      </div>

      <button className="btn btn--primary btn--block" onClick={start}>
        {t.start}
      </button>
      <button className="btn btn--ghost btn--block" onClick={onOpenSettings}>
        {t.settings}
      </button>
      <button className="btn btn--ghost btn--block" onClick={onOpenStats}>
        {TEXTS.stats.open}
      </button>
    </div>
  );
}
