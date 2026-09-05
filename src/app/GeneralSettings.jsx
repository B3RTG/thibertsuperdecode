import { THEMES } from '../games/superdecoder/constants.js';
import { LANGUAGES } from '../i18n/translations.js';
import { useTexts } from '../i18n/LanguageContext.jsx';
import { usePreferences } from './PreferencesContext.jsx';

// Accent color per theme so the swatch previews it (mirrors tokens.css).
const THEME_ACCENTS = {
  classic: '#FF7A1A',
  neon: '#ff2fd0',
  amber: '#ffb300',
  mint: '#2ee6a0',
  light: '#eef2f8',
};

// Global preferences shared across all games: theme, language, sound.
export default function GeneralSettings({ onBack }) {
  const T = useTexts();
  const t = T.general;
  const prefs = usePreferences();

  return (
    <div className="screen menu">
      <h2 className="screen-title">{t.title}</h2>

      <div>
        <div className="settings__row">
          <span className="settings__label">{t.theme}</span>
          <div className="theme-swatches" role="group" aria-label={t.theme}>
            {THEMES.map((th) => (
              <button
                key={th.id}
                className="theme-swatch"
                style={{ '--theme-accent': THEME_ACCENTS[th.id] }}
                aria-label={T.themes[th.id]}
                aria-pressed={prefs.theme === th.id}
                onClick={() => prefs.setTheme(th.id)}
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
                aria-pressed={prefs.lang === lng.id}
                onClick={() => prefs.setLang(lng.id)}
              >
                {lng.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings__row">
          <span className="settings__label">{t.sound}</span>
          <button
            className="toggle"
            aria-pressed={!prefs.muted}
            onClick={prefs.toggleMute}
          >
            {prefs.muted ? t.off : t.on}
          </button>
        </div>
      </div>

      <button className="btn btn--primary btn--block" onClick={onBack}>
        {t.back}
      </button>
    </div>
  );
}
