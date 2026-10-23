import { html, render } from '../src/ui/lib.js';
import { MiniIntro } from '../src/ui/components.js';
import { applyTheme, THEMES } from '../src/data/themes.js';
import { MINIGAMES } from '../src/data/minigame-catalog.js';
import { MODIFIERS } from '../src/data/modifiers.js';
import { SCENARIOS } from '../src/data/scenarios.js';

const params = new URLSearchParams(location.search);
const id = params.get('mini') || 'caceria';
const theme = params.get('theme') || 'walnut';
const diff = params.get('diff') || 'normal';
const game = MINIGAMES[id];
const Screen = game?.Screen;
if (!Screen) throw new Error('Unknown minigame: ' + id);

const scenario = SCENARIOS[id];
const modifier = MODIFIERS[id];
const intro = {
  title: scenario?.name || modifier?.name || game.name || 'Minijuego',
  description: scenario?.goal || (modifier?.desc || '').replace(/^Minijuego: /, '').replace(/ Premio: mutación o pieza\.$/, '.'),
  icon: scenario?.icon || modifier?.icon || 'flag',
};

const pixelTheme = Object.values(THEMES).find(t => t.art === 'pixel');
if (theme === 'pixel' && !pixelTheme) throw new Error('No hay tema pixel registrado');
const chosenTheme = THEMES[theme] ? theme : theme === 'pixel' ? pixelTheme.id : 'walnut';
applyTheme(chosenTheme);
const miniDiff = Object.fromEntries(Object.keys(MINIGAMES).map(k => [k, diff]));
const settings = {
  theme: chosenTheme, miniDiff,
  helpSeen: Object.fromEntries(Object.keys(MINIGAMES).map(k => [k, true])),
  shake: false, speed: 1, sound: false,
};
const noop = () => {};
render(html`<${MiniIntro} intro=${intro}>
  <${Screen}
    sub="Banco de pruebas · ${THEMES[chosenTheme].name}"
    onBack=${noop}
    onEnd=${noop}
    endLabel="Reiniciar / continuar"
    settings=${settings}
    setSettings=${noop}
    onRestart=${() => location.reload()}
    diff=${diff}
  />
<//>`, document.getElementById('root'));
document.documentElement.dataset.visualQa = id;
