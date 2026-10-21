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
import { Connect4Screen } from '../src/ui/screens/connect4.js';
import { BomberScreen } from '../src/ui/screens/bomber.js';
import { BarrierScreen } from '../src/ui/screens/barrier.js';
import { IZombieScreen } from '../src/ui/screens/izombie.js';
import { BowlingScreen } from '../src/ui/screens/bowling.js';
import { LastStandScreen } from '../src/ui/screens/laststand.js';
import { MatesScreen } from '../src/ui/screens/mates.js';
import { KnightScreen } from '../src/ui/screens/knight.js';
import { QueensScreen } from '../src/ui/screens/queens.js';
import { MarcianosScreen } from '../src/ui/screens/marcianos.js';
import { CheckersScreen } from '../src/ui/screens/checkers.js';
import { FusionScreen } from '../src/ui/screens/fusion.js';
import { DuelScreen } from '../src/ui/screens/duel.js';
import { HockeyScreen } from '../src/ui/screens/hockey.js';

const screens = {
  caceria: CaceriaScreen, escape: EscapeScreen, bodyguard: BodyguardScreen,
  giantHunt: GiantHuntScreen, minefield: MinefieldScreen, contraband: ContrabandScreen,
  laboratory: LaboratoryScreen, collapsingFloor: CollapsingFloorScreen, kingImpostor: KingImpostorScreen,
  connect4: Connect4Screen, bomber: BomberScreen, barrier: BarrierScreen, izombie: IZombieScreen,
  bowling: BowlingScreen, laststand: LastStandScreen, mates: MatesScreen, knight: KnightScreen,
  queens: QueensScreen, marcianos: MarcianosScreen, checkers: CheckersScreen, fusion: FusionScreen,
  duel: DuelScreen, hockey: HockeyScreen,
};
const params = new URLSearchParams(location.search);
const id = params.get('mini') || 'caceria';
const theme = params.get('theme') || 'walnut';
const diff = params.get('diff') || 'normal';
const Screen = screens[id];
if (!Screen) throw new Error('Unknown minigame: ' + id);
const pixelTheme = Object.values(THEMES).find(t => t.art === 'pixel');
if (theme === 'pixel' && !pixelTheme) throw new Error('No hay tema pixel registrado');
const chosenTheme = THEMES[theme] ? theme : theme === 'pixel' ? pixelTheme.id : 'walnut';
applyTheme(chosenTheme);
const miniDiff = Object.fromEntries(Object.keys(screens).map(k => [k, diff]));
const settings = {
  theme: chosenTheme, miniDiff,
  helpSeen: Object.fromEntries(Object.keys(screens).map(k => [k, true])),
  shake: false, speed: 1, sound: false,
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
