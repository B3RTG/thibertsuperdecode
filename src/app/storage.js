// Persistence helpers for the arcade. Global prefs and each game's state live
// under separate keys so games don't clobber each other. Disable-able for
// environments without localStorage (spec section 13).

export const PREFS_KEY = 'thibert:prefs';
export const gameKey = (id) => `thibert:game:${id}`;
const LEGACY_KEY = 'super-decoder:v1';

export const STORAGE_ENABLED =
  typeof window !== 'undefined' &&
  (() => {
    try {
      const k = '__thibert_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })();

export function loadJSON(key) {
  if (!STORAGE_ENABLED) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key, value) {
  if (!STORAGE_ENABLED) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// One-time migration from the pre-hub single key (`super-decoder:v1`) to the
// new split layout. Runs only if the new prefs key is absent.
export function migrateLegacy() {
  if (!STORAGE_ENABLED) return;
  if (window.localStorage.getItem(PREFS_KEY)) return; // already migrated
  const legacy = loadJSON(LEGACY_KEY);
  if (!legacy) return;

  saveJSON(PREFS_KEY, {
    theme: legacy.theme ?? 'classic',
    lang: legacy.lang ?? 'es',
    muted: legacy.muted ?? false,
  });
  saveJSON(gameKey('superdecoder'), {
    level: legacy.level ?? 1,
    mode: legacy.mode ?? 'easy',
    config: legacy.config ?? undefined,
    stats: legacy.stats ?? undefined,
  });
}
