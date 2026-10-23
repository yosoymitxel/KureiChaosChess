// Minijuegos de ajedrez (src/data/scenarios.js) sobre el tablero de la partida: GameScreen hace
// todo; aquí solo se adapta la entrada y la salida de un minijuego.
import { html, useState } from '../lib.js';
import { MiniTools } from '../components.js';
import { GameScreen } from './game.js';
import { SCENARIOS, LEVELS, buildScenario } from '../../data/scenarios.js';

const RUN = { seed: 'mini', map: { floors: 1 }, mutations: [], bonuses: {}, cards: [] };
const noop = () => {};

function ScenarioScreen({ id, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [game] = useState(() => ({ ...buildScenario(id, diff || settings.miniDiff?.[id]), endLabel }));
  return html`<${GameScreen} node=${{ id: 'mini-' + id, seed: 0, floor: 0, modifier: 'none' }} run=${RUN} seats=${game.seats} scenario=${game}
    settings=${settings} setSettings=${setSettings} onWin=${() => onEnd(true)} onExit=${() => onEnd(false)} onMenu=${onBack} onAbandon=${onBack}
    onRestart=${onRestart} onHowTo=${noop} onUseCard=${noop}
    tools=${html`<${MiniTools} mini=${id} diffs=${LEVELS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${SCENARIOS[id].goal}<//>`} />`;
}

const screen = (id) => (props) => html`<${ScenarioScreen} id=${id} ...${props} />`;
export const CaceriaScreen = screen('caceria');
export const BodyguardScreen = screen('bodyguard');
export const GiantHuntScreen = screen('giantHunt');
export const MinefieldScreen = screen('minefield');
export const KingImpostorScreen = screen('kingImpostor');
