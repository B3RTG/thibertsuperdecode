import { useEffect, useRef, useState } from 'react';
import { formatDuration } from '../game/format.js';
import { actions } from '../game/reducer.js';
import { useTexts } from '../i18n/LanguageContext.jsx';

// Phase 3: round timer. Counts UP (elapsed) normally, or DOWN (remaining) in
// timed mode, firing TIME_UP when the countdown reaches 0. Freezes on won/lost.
const LOW_TIME_MS = 10000; // highlight the countdown under 10s

export default function Timer({ state, dispatch }) {
  const t = useTexts().board;
  const { phase, roundStartedAt, lastRoundMs, config } = state;
  const timed = !!config.timedMode;
  const limitMs = (config.timeLimitSec || 60) * 1000;

  const [nowMs, setNowMs] = useState(() => perfNow());
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const t2 = perfNow();
      setNowMs(t2);
      if (
        timed &&
        !firedRef.current &&
        roundStartedAt &&
        t2 - roundStartedAt >= limitMs
      ) {
        firedRef.current = true;
        dispatch(actions.timeUp());
      }
    }, 200);
    return () => clearInterval(id);
    // roundStartedAt changes each new round → restart the ticker.
  }, [phase, roundStartedAt, timed, limitMs, dispatch]);

  // Value to display.
  let ms;
  if (timed) {
    const elapsed = phase === 'playing' ? nowMs - roundStartedAt : lastRoundMs || 0;
    ms = Math.max(0, limitMs - elapsed); // remaining
  } else if (phase === 'playing') {
    ms = roundStartedAt ? nowMs - roundStartedAt : 0;
  } else {
    ms = lastRoundMs;
  }

  const low = timed && phase === 'playing' && ms <= LOW_TIME_MS;

  return (
    <div className="level-display__item" style={{ alignItems: 'flex-end' }}>
      <span className="level-display__label">{timed ? t.timeLeft : t.time}</span>
      <span
        className={`level-display__value${low ? ' level-display__value--low' : ''}`}
        style={{ fontSize: '1.1rem' }}
      >
        {formatDuration(ms)}
      </span>
    </div>
  );
}

function perfNow() {
  return typeof performance !== 'undefined' && performance.now
    ? performance.now()
    : Date.now();
}
