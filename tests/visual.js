import { html, render, useState } from '../src/ui/lib.js';
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
