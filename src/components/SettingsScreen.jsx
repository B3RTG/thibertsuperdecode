import { actions } from '../game/reducer.js';
import { CONFIG_LIMITS, resolveAllowRepeats, THEMES } from '../game/constants.js';
import { LANGUAGES } from '../i18n/translations.js';
import { useTexts } from '../i18n/LanguageContext.jsx';

// Accent color per theme, so the swatch previews the theme (mirrors tokens.css).
const THEME_ACCENTS = {
  classic: '#FF7A1A',
  neon: '#ff2fd0',
  amber: '#ffb300',
  mint: '#2ee6a0',
};

// Runtime-configurable settings (spec section 3.1). Changes apply to the
// next game and are persisted via usePersistence.
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
        <div className="settings__row">
          <span className="settings__label">{t.theme}</span>
          <div className="theme-swatches" role="group" aria-label={t.theme}>
            {THEMES.map((th) => (
              <button
                key={th.id}
                className="theme-swatch"
                style={{ '--theme-accent': THEME_ACCENTS[th.id] }}
                aria-label={T.themes[th.id]}
                aria-pressed={state.theme === th.id}
                onClick={() => dispatch(actions.setTheme(th.id))}
              />
            ))}
          </div>
        </div>
        <div className="settings__row">
          <span className="settings__label">{t.language}</span>
          <div className="choice-group" role="group" aria-label={t.language}>
            {LANGUAGES.map((lng) => (
              <button
                key={lng.id}
                className="toggle"
                aria-pressed={state.lang === lng.id}
                onClick={() => dispatch(actions.setLang(lng.id))}
              >
                {lng.label}
              </button>
            ))}
          </div>
        </div>
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
