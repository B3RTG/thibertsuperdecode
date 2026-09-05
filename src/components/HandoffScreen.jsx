import { actions } from '../game/reducer.js';
import { useTexts } from '../i18n/LanguageContext.jsx';

// Duo: "pass the device" screen (spec section 6.2). Secret stays hidden.
export default function HandoffScreen({ dispatch }) {
  const t = useTexts().handoff;
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
