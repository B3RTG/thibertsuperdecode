import { useEffect, useState } from 'react';
import { formatDuration } from '../game/format.js';
import { TEXTS } from '../game/constants.js';

// Phase 3: live elapsed-time readout for the current round. Ticks while
// playing, freezes on won/lost showing the final time.
export default function Timer({ state }) {
  const { phase, roundStartedAt, lastRoundMs } = state;
  const [nowMs, setNowMs] = useState(() => perfNow());

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setNowMs(perfNow()), 200);
    return () => clearInterval(id);
  }, [phase]);

  let ms;
  if (phase === 'playing') {
    ms = roundStartedAt ? nowMs - roundStartedAt : 0;
  } else {
    ms = lastRoundMs;
  }

  return (
    <div className="level-display__item" style={{ alignItems: 'flex-end' }}>
      <span className="level-display__label">{TEXTS.board.time}</span>
      <span className="level-display__value" style={{ fontSize: '1.1rem' }}>
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
