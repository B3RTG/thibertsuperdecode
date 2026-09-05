import { useRef } from 'react';
import { actions } from '../reducer.js';
import { COLOR_CSS_VARS } from '../constants.js';
import { useSound } from '../../../hooks/useSound.js';
import { useTexts } from '../../../i18n/LanguageContext.jsx';

// Rotary controller input (spec sections 7 & 11.2). Unifies mouse/touch/pen
// via Pointer Events. Only dispatches shared actions — no game logic.
//   drag / wheel  → CYCLE_COLOR (change the active peg's color)
//   ± buttons     → CYCLE_COLOR (mobile-friendly color change)
//   short tap     → SET_ACTIVE_PEG next (advance to the next casilla)
//   long press    → SUBMIT_GUESS
// This lets a whole row be completed with the knob cluster alone.
const STEP_DEG = 28; // angular threshold per color step
const TAP_MAX_MOVE = 10; // px total movement still counted as a tap
const LONG_PRESS_MS = 550;

export default function Knob({ state, dispatch }) {
  const T = useTexts();
  const sound = useSound();
  const knobRef = useRef(null);
  const drag = useRef(null);
  const longPressTimer = useRef(null);

  const { palette, activePeg, guesses, activeRow, phase } = state;
  const rowIndex = phase === 'settingCode' ? 0 : activeRow;
  const currentColor = guesses[rowIndex]?.pegs[activePeg] ?? null;
  const colorIndex = currentColor == null ? -1 : palette.indexOf(currentColor);
  // Rotate the notch to reflect the selected color (real rotation, spec 11).
  const rotation = colorIndex < 0 ? 0 : (colorIndex / palette.length) * 360;

  const cycle = (dir) => {
    dispatch(actions.cycleColor(dir));
    sound?.move();
  };

  // Tap → advance to the next peg (wraps around), so a whole row can be
  // completed with the knob alone (spec section 7: clic corto = avanzar casilla).
  const advancePeg = () => {
    dispatch(actions.setActivePeg((activePeg + 1) % state.codeLength));
    sound?.select();
  };

  const angleFromCenter = (clientX, clientY) => {
    const el = knobRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return (
      (Math.atan2(clientY - (r.top + r.height / 2), clientX - (r.left + r.width / 2)) *
        180) /
      Math.PI
    );
  };

  const shortestDelta = (from, to) => {
    let d = to - from;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastAngle: angleFromCenter(e.clientX, e.clientY),
      accum: 0,
      moved: 0,
      startTime: Date.now(),
      isDrag: false,
    };
    // Long-press → submit (only while playing).
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      if (drag.current && !drag.current.isDrag && phase === 'playing') {
        dispatch(actions.submitGuess());
        drag.current.consumed = true;
      }
    }, LONG_PRESS_MS);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    d.moved += Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY);
    const angle = angleFromCenter(e.clientX, e.clientY);
    const delta = shortestDelta(d.lastAngle, angle);
    d.lastAngle = angle;
    d.accum += delta;
    if (Math.abs(d.accum) >= STEP_DEG) {
      d.isDrag = true;
      clearTimeout(longPressTimer.current);
      const dir = d.accum > 0 ? 1 : -1;
      cycle(dir);
      d.accum -= dir * STEP_DEG;
    }
  };

  const onPointerUp = (e) => {
    clearTimeout(longPressTimer.current);
    const d = drag.current;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!d || d.consumed || d.isDrag) return;
    // Short tap with little movement → advance to the next peg.
    if (
      Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) <=
      TAP_MAX_MOVE
    ) {
      advancePeg();
    }
  };

  const onWheel = (e) => {
    cycle(e.deltaY > 0 ? 1 : -1);
  };

  const notchColor =
    currentColor != null ? `var(${COLOR_CSS_VARS[currentColor]})` : 'var(--muted)';
  const label = currentColor != null ? T.colors[currentColor] : T.knob.empty;

  return (
    <div className="knob-wrap">
      <button
        className="knob-arrow"
        aria-label={T.knob.prev}
        onClick={() => cycle(-1)}
      >
        −
      </button>

      <div
        ref={knobRef}
        className="knob"
        role="slider"
        aria-label={T.knob.dialLabel(label)}
        aria-valuetext={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div className="knob__dial" style={{ transform: `rotate(${rotation}deg)` }}>
          <span className="knob__notch" style={{ background: notchColor }} />
        </div>
        <span className="knob__hint">{T.knob.hint}</span>
      </div>

      <button
        className="knob-arrow"
        aria-label={T.knob.next}
        onClick={() => cycle(1)}
      >
        +
      </button>
    </div>
  );
}
