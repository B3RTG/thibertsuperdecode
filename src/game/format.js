// Small formatting helpers (pure).

// Format milliseconds as m:ss (or s.d for sub-minute).
export function formatDuration(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—';
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
