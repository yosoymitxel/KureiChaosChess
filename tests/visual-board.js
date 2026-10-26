import { html, render } from '../src/ui/lib.js';
import { applyTheme, THEMES } from '../src/data/themes.js';
import { GameScreen } from '../src/ui/screens/game.js';
import { MODIFIERS } from '../src/data/modifiers.js';

const params = new URLSearchParams(location.search);
const theme = params.get('theme') || 'walnut';
const variant = params.get('variant') || 'none';
const diff = params.get('diff') || 'normal';
const pixelTheme = Object.values(THEMES).find(t => t.art === 'pixel');
if (theme === 'pixel' && !pixelTheme) throw new Error('No hay tema pixel registrado');
const chosenTheme = THEMES[theme] ? theme : theme === 'pixel' ? pixelTheme.id : 'walnut';
if (variant !== 'boss' && !MODIFIERS[variant]) throw new Error('Variante de tablero desconocida: ' + variant);
applyTheme(chosenTheme);
const noop = () => {};
const difficulty = ['facil', 'dificil'].includes(diff) ? diff : 'normal';
const node = {
  id: 'visual-board-' + variant,
  seed: 20261021,
  floor: variant === 'boss' ? 9 : 3,
  modifier: variant === 'boss' ? 'none' : variant,
  isBoss: variant === 'boss',
  isMiniBoss: false,
};
const run = {
  seed: node.seed, tutorial: false, map: { floors: 10 },
  mutations: [], bonuses: {}, cards: [], completed: {},
};
const seats = [
  { color: 'light', kind: 'human', name: 'Jugador Marfil' },
  { color: 'dark', kind: 'bot', name: 'Bot Carmesí' },
];
const settings = {
  theme: chosenTheme, difficulty, miniDiff: {}, helpSeen: {},
  shake: false, speed: 1, sound: false, camera: 'tilt', moments: false,
};
render(html`<${GameScreen}
  node=${node} run=${run} seats=${seats} settings=${settings} setSettings=${noop}
  onExit=${noop} onMenu=${noop} onAbandon=${noop} onWin=${noop}
  onRestart=${() => location.reload()} onHowTo=${noop} onUseCard=${noop}
/>`, document.getElementById('root'));
document.documentElement.dataset.visualQa = 'board:' + variant;
