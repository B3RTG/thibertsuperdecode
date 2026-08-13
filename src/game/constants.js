// Central config: master palette, difficulty presets, and UI texts.

// Master palette — at least 8 colors (spec section 11). Each color maps to a
// CSS variable defined in styles/tokens.css and carries an accessible label.
export const MASTER_PALETTE = [
  { id: 'red', label: 'Rojo', cssVar: '--c-red' },
  { id: 'orange', label: 'Naranja', cssVar: '--c-orange' },
  { id: 'yellow', label: 'Amarillo', cssVar: '--c-yellow' },
  { id: 'green', label: 'Verde', cssVar: '--c-green' },
  { id: 'cyan', label: 'Cian', cssVar: '--c-cyan' },
  { id: 'blue', label: 'Azul', cssVar: '--c-blue' },
  { id: 'magenta', label: 'Magenta', cssVar: '--c-magenta' },
  { id: 'white', label: 'Blanco', cssVar: '--c-white' },
];

export const COLOR_LABELS = Object.fromEntries(
  MASTER_PALETTE.map((c) => [c.id, c.label]),
);

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

// Centralized UI texts (leaves room for future i18n — spec section 1).
export const TEXTS = {
  appTitle: 'ThiBert Superdecoder',
  menu: {
    subtitle: 'Rompe el código de 4 colores',
    onePlayer: '1 Jugador',
    twoPlayers: '2 Jugadores',
    chooseMode: 'Dificultad',
    easy: 'Fácil',
    advanced: 'Avanzado',
    start: 'Empezar',
    settings: 'Ajustes',
  },
  settings: {
    title: 'Ajustes',
    colorCount: 'Número de colores',
    maxAttempts: 'Intentos',
    codeLength: 'Longitud del código',
    allowRepeats: 'Permitir repeticiones',
    followMode: 'Según el modo',
    scaleByLevel: 'Subir dificultad por nivel',
    theme: 'Tema',
    back: 'Volver',
    note: 'Los cambios se aplican a la siguiente partida.',
  },
  stats: {
    title: 'Estadísticas',
    played: 'Partidas',
    won: 'Ganadas',
    lost: 'Perdidas',
    winRate: '% aciertos',
    streak: 'Racha',
    bestStreak: 'Mejor racha',
    bestAttempts: 'Menos intentos',
    bestTime: 'Mejor tiempo',
    none: '—',
    reset: 'Borrar estadísticas',
    back: 'Volver',
    open: 'Estadísticas',
  },
  board: {
    level: 'Nivel',
    attemptsLeft: 'Intentos',
    time: 'Tiempo',
    emptyPeg: 'Casilla vacía',
    activeRow: 'Fila activa',
  },
  setCode: {
    title: 'Jugador 1: define el código',
    hint: 'Elige 4 colores. El Jugador 2 no los verá.',
    confirm: 'Confirmar código',
    hidden: 'Oculto',
  },
  handoff: {
    title: 'Pasa el dispositivo',
    body: 'Entrega el dispositivo al Jugador 2 para que adivine.',
    ready: 'Estoy listo',
  },
  controls: {
    check: 'Comprobar',
    reset: 'Reiniciar',
    mute: 'Silencio',
    unmute: 'Sonido',
    menu: 'Menú',
    hideKnob: 'Ocultar mando',
    showKnob: 'Mostrar mando',
  },
  result: {
    won: '¡Código roto!',
    lost: 'Sin intentos',
    nextLevel: 'Siguiente nivel',
    retry: 'Reintentar nivel',
    swapRoles: 'Intercambiar roles',
    backToMenu: 'Menú principal',
  },
  hints: {
    green: 'correcta',
    white: 'presente',
    none: 'ausente',
    greensLabel: 'Verdes',
    whitesLabel: 'Blancas',
  },
};
