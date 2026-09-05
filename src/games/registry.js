import { lazy } from 'react';
import SuperdecoderIcon from './superdecoder/Icon.jsx';

// Game registry — the single source of truth for the hub. Adding a game is
// adding an entry here; each game module is code-split (lazy) so the bundle
// only grows for games the player actually opens.
//
// Each entry:
//   id     stable id, also the persistence namespace (thibert:game:<id>)
//   Icon   React component for the hub card (or `icon` emoji as fallback)
//   accent CSS color for the card accent
//   Component  lazy-loaded default export receiving { onExit }
//   (name/description come from i18n: T.games[id].name / .desc)
export const GAMES = [
  {
    id: 'superdecoder',
    Icon: SuperdecoderIcon,
    accent: 'var(--accent)',
    Component: lazy(() => import('./superdecoder/index.jsx')),
  },
];

export function getGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}
