import { actions } from '../game/reducer.js';
import { TEXTS } from '../game/constants.js';

// Duo: "pass the device" screen (spec section 6.2). Secret stays hidden.
export default function HandoffScreen({ dispatch }) {
  const t = TEXTS.handoff;
  return (
    <div className="screen centered-screen">
      <h2 className="screen-title">{t.title}</h2>
      <p className="screen-hint">{t.body}</p>
      <button
        className="btn btn--primary btn--block"
        onClick={() => dispatch(actions.confirmHandoff())}
      >
        {t.ready}
      </button>
    </div>
  );
}
