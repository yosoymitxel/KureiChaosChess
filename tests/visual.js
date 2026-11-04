import { html, render, useState } from '../src/ui/lib.js';
import { applyTheme, THEMES } from '../src/data/themes.js';
import { BoardView } from '../src/view/board-view.js';
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
document.documentElement.dataset.camera = params.get('camera') || 'tilt';
const miniDiff = Object.fromEntries(Object.keys(MINIGAMES).map(k => [k, diff]));
const settings = {
  theme: chosenTheme, miniDiff,
  helpSeen: Object.fromEntries(Object.keys(MINIGAMES).map(k => [k, true])),
  shake: false, speed: 1, sound: false, moments: true,
  fx: JSON.parse(localStorage.getItem('zugzwang.settings.v2') || '{}').fx ?? null, // tools/play.mjs lo activa; sin él, según la mesa
};
const noop = () => {};
// El nivel no va fijo: el selector del juego cambia los ajustes y Reiniciar monta una partida nueva.
function Bench() {
  const [set, setSet] = useState(settings);
  const [run, setRun] = useState(0);
  const restart = () => setRun((n) => n + 1);
  return html`<${Screen} key=${run}
    sub="Banco de pruebas · ${THEMES[chosenTheme].name}"
    onBack=${noop}
    onEnd=${restart}
    endLabel="Reiniciar"
    settings=${set}
    setSettings=${setSet}
    onRestart=${restart}
  />`;
}
render(html`<${Bench} />`, document.getElementById('root'));
document.documentElement.dataset.visualQa = id;

// Filtro de pantalla y clima del banco de pruebas (lab-preview.html): el clima se pone a cada tablero
// que se monte, porque los minijuegos rehacen el suyo.
document.documentElement.dataset.filter = params.get('filter') || 'off';
const weather = params.get('weather');
if (weather) {
  let seen = null;
  setInterval(() => { const v = BoardView.last; if (v && v !== seen && v.host.isConnected) { seen = v; v.setVfx(true); v.setWeather(weather); } }, 400);
}
