import { html, render } from '../src/ui/lib.js';
import { applyTheme, THEMES } from '../src/data/themes.js';
import { CaceriaScreen } from '../src/ui/screens/caceria.js';
import { EscapeScreen } from '../src/ui/screens/escape.js';
import { BodyguardScreen } from '../src/ui/screens/bodyguard.js';
import { GiantHuntScreen } from '../src/ui/screens/giant-hunt.js';
import { MinefieldScreen } from '../src/ui/screens/minefield.js';
import { ContrabandScreen } from '../src/ui/screens/contraband.js';
import { LaboratoryScreen } from '../src/ui/screens/laboratory.js';
import { CollapsingFloorScreen } from '../src/ui/screens/collapsing-floor.js';
import { KingImpostorScreen } from '../src/ui/screens/king-impostor.js';

const screens = {
  caceria: CaceriaScreen, escape: EscapeScreen, bodyguard: BodyguardScreen,
  giantHunt: GiantHuntScreen, minefield: MinefieldScreen, contraband: ContrabandScreen,
  laboratory: LaboratoryScreen, collapsingFloor: CollapsingFloorScreen, kingImpostor: KingImpostorScreen,
};
const params = new URLSearchParams(location.search);
const id = params.get('mini') || 'caceria';
const theme = params.get('theme') || 'normal';
const Screen = screens[id];
if (!Screen) throw new Error('Unknown minigame: ' + id);
const pixelTheme = Object.values(THEMES).find(t => t.art === 'pixel');
if (theme === 'pixel' && !pixelTheme) throw new Error('No hay tema pixel registrado');
applyTheme(theme === 'pixel' ? pixelTheme.id : 'walnut');
const miniDiff = Object.fromEntries(Object.keys(screens).map(k => [k, 'normal']));
const settings = { theme: 'walnut', miniDiff, helpSeen: Object.fromEntries(Object.keys(screens).map(k => [k, true])), shake: false };
const noop = () => {};
render(html`<${Screen}
  sub="Prueba visual · ${theme}"
  onBack=${noop}
  onEnd=${noop}
  endLabel="Continuar"
  settings=${settings}
  setSettings=${noop}
  onRestart=${noop}
  diff="normal"
/>`, document.getElementById('root'));
document.documentElement.dataset.visualQa = id;