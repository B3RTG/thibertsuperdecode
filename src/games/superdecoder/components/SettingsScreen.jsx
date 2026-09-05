import { actions } from '../reducer.js';
import { CONFIG_LIMITS, resolveAllowRepeats } from '../constants.js';
import { useTexts } from '../../../i18n/LanguageContext.jsx';

// Per-game settings (spec section 3.1). Changes apply to the next game and are
// persisted. Global prefs (theme, language, sound) live in General settings.
export default function SettingsScreen({ state, dispatch, onBack }) {
  const T = useTexts();
  const t = T.settings;
  const { config, mode } = state;

  const patch = (p) => dispatch(actions.updateConfig(p));

  const stepper = (key, step = 1) => {
    const { min, max } = CONFIG_LIMITS[key];
    return (
      <div className="stepper">
        <button
          className="stepper__btn"
          aria-label={t.less(key)}
          disabled={config[key] <= min}
          onClick={() => patch({ [key]: Math.max(min, config[key] - step) })}
        >
          −
        </button>
        <span className="stepper__value" aria-live="polite">
          {config[key]}
        </span>
        <button
          className="stepper__btn"
          aria-label={t.more(key)}
          disabled={config[key] >= max}
          onClick={() => patch({ [key]: Math.min(max, config[key] + step) })}
        >
          +
        </button>
      </div>
    );
  };

  const effectiveRepeats = resolveAllowRepeats(mode, config);
  // Validation: no-repeats needs enough colors (spec section 3.1).
  const repeatsConflict =
    !effectiveRepeats && config.colorCount < config.codeLength;

  const cycleRepeats = () => {
    // null (follow mode) → true → false → null
    const order = [null, true, false];
    const idx = order.indexOf(config.allowRepeats ?? null);
    patch({ allowRepeats: order[(idx + 1) % order.length] });
  };

  const repeatsLabel =
    config.allowRepeats == null
      ? t.followMode
      : config.allowRepeats
        ? T.yes
        : T.no;

  return (
    <div className="screen menu">
      <h2 className="screen-title">{t.title}</h2>

      <div>
        <div className="settings__row">
          <span className="settings__label">{t.colorCount}</span>
          {stepper('colorCount')}
        </div>
        <div className="settings__row">
          <span className="settings__label">{t.maxAttempts}</span>
          {stepper('maxAttempts')}
        </div>
        <div className="settings__row">
          <span className="settings__label">{t.codeLength}</span>
          {stepper('codeLength')}
        </div>
        <div className="settings__row">
          <span className="settings__label">{t.allowRepeats}</span>
          <button
            className="toggle"
            aria-pressed={config.allowRepeats === true}
            onClick={cycleRepeats}
          >
            {repeatsLabel}
          </button>
        </div>
        <div className="settings__row">
          <span className="settings__label">{t.scaleByLevel}</span>
          <button
            className="toggle"
            aria-pressed={config.scaleByLevel === true}
            onClick={() => patch({ scaleByLevel: !config.scaleByLevel })}
          >
            {config.scaleByLevel ? T.yes : T.no}
          </button>
        </div>
        <div className="settings__row">
          <span className="settings__label">{t.timedMode}</span>
          <button
            className="toggle"
            aria-pressed={config.timedMode === true}
            onClick={() => patch({ timedMode: !config.timedMode })}
          >
            {config.timedMode ? T.yes : T.no}
          </button>
        </div>
        {config.timedMode && (
          <div className="settings__row">
            <span className="settings__label">{t.timeLimit}</span>
            {stepper('timeLimitSec', 15)}
          </div>
        )}
      </div>

      {repeatsConflict && (
        <p className="settings__note" style={{ color: 'var(--c-red)' }}>
          {t.repeatsConflict(config.colorCount, config.codeLength)}
        </p>
      )}

      <p className="settings__note">{t.note}</p>

      <button className="btn btn--primary btn--block" onClick={onBack}>
        {t.back}
      </button>
    </div>
  );
}
