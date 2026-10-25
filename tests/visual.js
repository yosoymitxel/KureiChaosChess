import { html, render } from '../src/ui/lib.js';
import { applyTheme, THEMES } from '../src/data/themes.js';
import { MINIGAMES } from '../src/data/minigame-catalog.js';
const params = new URLSearchParams(location.search);
const id = params.get('mini') || 'caceria';
const theme = params.get('theme') || 'walnut';
const diff = params.get('diff') || 'normal';
const Screen = MINIGAMES[id]?.Screen;
if (!Screen) throw new Error('Unknown minigame: ' + id);
const pixelTheme = Object.values(THEMES).find(t => t.art === 'pixel');
if (theme === 'pixel' && !pixelTheme) throw new Error('No hay tema pixel registrado');
const chosenTheme = THEMES[theme] ? theme : theme === 'pixel' ? pixelTheme.id : 'walnut';
applyTheme(chosenTheme);
const miniDiff = Object.fromEntries(Object.keys(MINIGAMES).map(k => [k, diff]));
const settings = {
  theme: chosenTheme, miniDiff,
  helpSeen: Object.fromEntries(Object.keys(MINIGAMES).map(k => [k, true])),
  shake: false, speed: 1, sound: false, moments: true,
};
const noop = () => {};
render(html`<${Screen}
  sub="Banco de pruebas · ${THEMES[chosenTheme].name}"
  onBack=${noop}
  onEnd=${noop}
  endLabel="Reiniciar / continuar"
  settings=${settings}
  setSettings=${noop}
  onRestart=${() => location.reload()}
  diff=${diff}
/>`, document.getElementById('root'));
document.documentElement.dataset.visualQa = id;
