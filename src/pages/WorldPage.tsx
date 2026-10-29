/**
 * The world round.
 *
 * The American round is the one the site opens with. This is the global
 * challenge - Formula 1, the Champions League, the rest of the world's
 * geography - one click away in the menu at the top of the game and with a
 * real address of its own so it can be linked to and found.
 */

import DailyPage from './DailyPage';

export default function WorldPage() {
  return <DailyPage region="world" />;
}