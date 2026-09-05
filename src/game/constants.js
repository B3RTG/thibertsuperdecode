// Central config: master palette and difficulty presets.
// UI texts live in src/i18n/translations.js (multi-language).

// Master palette — at least 8 colors (spec section 11). Each color maps to a
// CSS variable defined in styles/tokens.css. Human-readable labels are in i18n.
export const MASTER_PALETTE = [
  { id: 'red', cssVar: '--c-red' },
  { id: 'orange', cssVar: '--c-orange' },
  { id: 'yellow', cssVar: '--c-yellow' },
  { id: 'green', cssVar: '--c-green' },
  { id: 'cyan', cssVar: '--c-cyan' },
  { id: 'blue', cssVar: '--c-blue' },
  { id: 'magenta', cssVar: '--c-magenta' },
  { id: 'white', cssVar: '--c-white' },
];

export const COLOR_CSS_VARS = Object.fromEntries(
  MASTER_PALETTE.map((c) => [c.id, c.cssVar]),
);

// Runtime-configurable defaults (spec section 3.1).
export const DEFAULT_CONFIG = {
  colorCount: 6, // range 4–8
  maxAttempts: 7, // range 4–12
  codeLength: 4, // range 3–6 (v1 uses 4)
  // allowRepeats is derived from mode unless overridden in Settings.
  allowRepeats: null, // null = follow the mode default
  hideKnob: false, // UI preference (spec section 11.2 "ocultar mando")
  scaleByLevel: true, // Phase 3: grow palette with level in 1-player
};

// Per-mode defaults for allowRepeats (spec section 3/5).
export const MODE_DEFAULTS = {
  easy: { allowRepeats: false, minColorCount: 4 },
  advanced: { allowRepeats: true, minColorCount: 6 },
};

export const CONFIG_LIMITS = {
  colorCount: { min: 4, max: 8 },
  maxAttempts: { min: 4, max: 12 },
  codeLength: { min: 3, max: 6 },
};

// Derive the palette (first N colors) for a given colorCount.
export function paletteFor(colorCount) {
  return MASTER_PALETTE.slice(0, colorCount).map((c) => c.id);
}

// Phase 3: smooth difficulty scaling by level in 1-player (spec section 5).
// +1 color every LEVELS_PER_COLOR levels, capped at the master palette size.
export const LEVELS_PER_COLOR = 3;
export function scaledColorCount(baseCount, level) {
  const bonus = Math.floor(Math.max(0, level - 1) / LEVELS_PER_COLOR);
  return Math.min(MASTER_PALETTE.length, baseCount + bonus);
}

// Phase 3: color themes. Each overrides a small set of chassis tokens; the LED
// colors stay the same for gameplay consistency. Applied via data-theme.
export const THEMES = [
  { id: 'classic', label: 'Clásico' },
  { id: 'neon', label: 'Neón' },
  { id: 'amber', label: 'Ámbar' },
  { id: 'mint', label: 'Menta' },
];

// Phase 3: stats persisted across sessions (1-player).
export const DEFAULT_STATS = {
  played: 0,
  won: 0,
  lost: 0,
  streak: 0,
  bestStreak: 0,
  bestAttempts: null, // fewest attempts to win
  bestTimeMs: null, // fastest win
};

// Resolve whether repeats are allowed given mode + config override.
export function resolveAllowRepeats(mode, config) {
  if (config && typeof config.allowRepeats === 'boolean') {
    return config.allowRepeats;
  }
  return MODE_DEFAULTS[mode].allowRepeats;
}
